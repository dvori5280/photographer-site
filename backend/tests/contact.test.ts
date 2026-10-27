import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { app, bearer, makeAdmin, makeCustomer, prisma, resetDb } from './helpers';

beforeEach(resetDb);

const msg = (extra: Record<string, unknown> = {}) => ({
  name: 'דינה לוי',
  email: 'dina@example.com',
  phone: '052-7654321',
  subject: 'שאלה על מחירים',
  message: 'שלום, אשמח לקבל פרטים על הצילומים.',
  ...extra,
});

describe('הודעות יצירת קשר', () => {
  it('מבקר שולח הודעה בלי התחברות ונשמרת במסד', async () => {
    const res = await request(app).post('/api/contact').send(msg());
    expect(res.status).toBe(201);
    expect(Object.keys(res.body.data).sort()).toEqual(['createdAt', 'id']);
    const row = await prisma.contactMessage.findUniqueOrThrow({ where: { id: res.body.data.id } });
    expect(row).toMatchObject({ name: 'דינה לוי', status: 'NEW', subject: 'שאלה על מחירים' });
  });

  it('טלפון הוא אופציונלי, כולל מחרוזת ריקה', async () => {
    expect((await request(app).post('/api/contact').send(msg({ phone: undefined }))).status).toBe(201);
    expect((await request(app).post('/api/contact').send(msg({ phone: '' }))).status).toBe(201);
    expect((await request(app).post('/api/contact').send(msg({ phone: null }))).status).toBe(201);
  });

  it.each([
    ['אימייל לא תקין', { email: 'abc' }],
    ['הודעה קצרה מדי', { message: 'קצר' }],
    ['הודעה ארוכה מדי', { message: 'א'.repeat(2001) }],
    ['נושא חסר', { subject: '' }],
    ['טלפון לא תקין', { phone: '12' }],
    ['שם חסר', { name: undefined }],
  ])('ולידציה: %s', async (_label, extra) => {
    const res = await request(app).post('/api/contact').send(msg(extra));
    expect(res.status).toBe(400);
    expect(await prisma.contactMessage.count()).toBe(0);
  });

  it('JSON שבור מחזיר 400 מסודר', async () => {
    const res = await request(app).post('/api/contact').set('Content-Type', 'application/json').send('{"name": ');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });

  it('הגבלת קצב: אחרי המכסה מתקבל 429', async () => {
    const limited = createApp({ rateLimits: { contactMax: 2, contactWindowMinutes: 60 } });
    expect((await request(limited).post('/api/contact').send(msg())).status).toBe(201);
    expect((await request(limited).post('/api/contact').send(msg())).status).toBe(201);
    const third = await request(limited).post('/api/contact').send(msg());
    expect(third.status).toBe(429);
    expect(third.body.error.code).toBe('TOO_MANY_REQUESTS');
  });

  it('מנהלת רואה הודעות, מסננת ומעדכנת סטטוס', async () => {
    const admin = await makeAdmin();
    const first = await request(app).post('/api/contact').send(msg({ subject: 'ראשונה' }));
    await request(app).post('/api/contact').send(msg({ subject: 'שנייה' }));

    const all = await request(app).get('/api/admin/messages').set(bearer(admin.token));
    expect(all.body.data).toHaveLength(2);
    expect(all.body.data[0].subject).toBe('שנייה'); // החדשה ראשונה

    const upd = await request(app).patch(`/api/admin/messages/${first.body.data.id}/status`).set(bearer(admin.token)).send({ status: 'HANDLED' });
    expect(upd.status).toBe(200);
    expect(upd.body.data.status).toBe('HANDLED');

    const handled = await request(app).get('/api/admin/messages?status=HANDLED').set(bearer(admin.token));
    expect(handled.body.data.map((m: { subject: string }) => m.subject)).toEqual(['ראשונה']);
    const fresh = await request(app).get('/api/admin/messages?status=NEW').set(bearer(admin.token));
    expect(fresh.body.data).toHaveLength(1);

    expect((await request(app).patch(`/api/admin/messages/${first.body.data.id}/status`).set(bearer(admin.token)).send({ status: 'X' })).status).toBe(400);
    expect((await request(app).patch('/api/admin/messages/3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90/status').set(bearer(admin.token)).send({ status: 'NEW' })).status).toBe(404);
  });

  it('לקוחה ומבקר לא רואים הודעות', async () => {
    const customer = await makeCustomer();
    expect((await request(app).get('/api/admin/messages').set(bearer(customer.token))).status).toBe(403);
    expect((await request(app).get('/api/admin/messages')).status).toBe(401);
  });
});
