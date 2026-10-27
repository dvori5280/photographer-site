import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app, bearer, futureDate, makeAdmin, makeCategory, makeCustomer, makePackage, pastDate, prisma, resetDb } from './helpers';

beforeEach(resetDb);

async function setup() {
  const cat = await makeCategory();
  const pkg = await makePackage(cat.id, { basePrice: 2500 });
  return { cat, pkg };
}

const bookingBody = (packageId: string, extra: Record<string, unknown> = {}) => ({
  packageId,
  requestedDate: futureDate(30),
  eventType: 'FAMILY',
  location: 'ירושלים',
  phone: '050-1234567',
  notes: 'הערה',
  ...extra,
});

describe('יצירת בקשת הזמנה', () => {
  it('לקוחה שולחת בקשה: סטטוס NEW ומחיר נשמר מהחבילה', async () => {
    const { pkg } = await setup();
    const { user, token } = await makeCustomer();
    const res = await request(app).post('/api/bookings').set(bearer(token)).send(bookingBody(pkg.id));
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      status: 'NEW',
      priceAtRequest: 2500,
      eventType: 'FAMILY',
      package: { id: pkg.id, name: 'חבילה לבדיקה' },
    });
    const row = await prisma.bookingRequest.findUniqueOrThrow({ where: { id: res.body.data.id } });
    expect(row.userId).toBe(user.id);
  });

  it('שינוי מחיר החבילה אחר כך לא משנה בקשה קיימת', async () => {
    const { pkg } = await setup();
    const { token } = await makeCustomer();
    const created = await request(app).post('/api/bookings').set(bearer(token)).send(bookingBody(pkg.id));
    await prisma.package.update({ where: { id: pkg.id }, data: { basePrice: 9999 } });
    const res = await request(app).get(`/api/bookings/my/${created.body.data.id}`).set(bearer(token));
    expect(res.body.data.priceAtRequest).toBe(2500);
  });

  it('מתעלמת מ-userId, priceAtRequest ו-status שנשלחו מהלקוחה', async () => {
    const { pkg } = await setup();
    const other = await makeCustomer('other@test.com');
    const { user, token } = await makeCustomer();
    const res = await request(app)
      .post('/api/bookings')
      .set(bearer(token))
      .send(bookingBody(pkg.id, { userId: other.user.id, priceAtRequest: 1, status: 'APPROVED' }));
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('NEW');
    expect(res.body.data.priceAtRequest).toBe(2500);
    const row = await prisma.bookingRequest.findUniqueOrThrow({ where: { id: res.body.data.id } });
    expect(row.userId).toBe(user.id);
  });

  it('חבילה לא פעילה או לא קיימת: 404', async () => {
    const { cat } = await setup();
    const inactive = await makePackage(cat.id, { isActive: false });
    const { token } = await makeCustomer();
    const r1 = await request(app).post('/api/bookings').set(bearer(token)).send(bookingBody(inactive.id));
    expect(r1.status).toBe(404);
    const r2 = await request(app).post('/api/bookings').set(bearer(token)).send(bookingBody('3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90'));
    expect(r2.status).toBe(404);
    expect(r2.body.error.code).toBe('PACKAGE_NOT_FOUND');
  });

  it('מנהלת לא יכולה לשלוח בקשה (403), ומבקר בלי Token מקבל 401', async () => {
    const { pkg } = await setup();
    const admin = await makeAdmin();
    expect((await request(app).post('/api/bookings').set(bearer(admin.token)).send(bookingBody(pkg.id))).status).toBe(403);
    expect((await request(app).post('/api/bookings').send(bookingBody(pkg.id))).status).toBe(401);
  });

  it.each([
    ['תאריך בעבר', () => ({ requestedDate: pastDate(3) })],
    ['תאריך לא קיים', () => ({ requestedDate: '2030-13-45' })],
    ['סוג אירוע לא מהרשימה', () => ({ eventType: 'PARTY' })],
    ['מיקום חסר', () => ({ location: '' })],
    ['טלפון לא תקין', () => ({ phone: '123' })],
    ['הערות ארוכות מדי', () => ({ notes: 'א'.repeat(1001) })],
    ['packageId לא תקין', () => ({ packageId: 'abc' })],
  ])('ולידציה: %s', async (_label, extra) => {
    const { pkg } = await setup();
    const { token } = await makeCustomer();
    const res = await request(app).post('/api/bookings').set(bearer(token)).send(bookingBody(pkg.id, extra()));
    expect(res.status).toBe(400);
  });

  it('מקבלת את כל סוגי האירוע, תאריך של היום וטלפון בפורמטים שונים', async () => {
    const { pkg } = await setup();
    const { token } = await makeCustomer();
    const types = ['NEWBORN', 'SMASH_CAKE', 'CHALLAH_PHOTOSHOOT', 'FAMILY'];
    for (const eventType of types) {
      const res = await request(app).post('/api/bookings').set(bearer(token)).send(bookingBody(pkg.id, { eventType, requestedDate: futureDate(0) }));
      expect(res.status, eventType).toBe(201);
    }
    for (const phone of ['0501234567', '+972501234567', '02-5551234']) {
      const res = await request(app).post('/api/bookings').set(bearer(token)).send(bookingBody(pkg.id, { phone }));
      expect(res.status, phone).toBe(201);
    }
  });
});

describe('צפייה בבקשות', () => {
  it('לקוחה רואה רק את הבקשות שלה', async () => {
    const { pkg } = await setup();
    const a = await makeCustomer('a@test.com');
    const b = await makeCustomer('b@test.com');
    await request(app).post('/api/bookings').set(bearer(a.token)).send(bookingBody(pkg.id));
    await request(app).post('/api/bookings').set(bearer(a.token)).send(bookingBody(pkg.id));
    await request(app).post('/api/bookings').set(bearer(b.token)).send(bookingBody(pkg.id));

    expect((await request(app).get('/api/bookings/my').set(bearer(a.token))).body.data).toHaveLength(2);
    expect((await request(app).get('/api/bookings/my').set(bearer(b.token))).body.data).toHaveLength(1);
  });

  it('בקשה של לקוחה אחרת מחזירה 404', async () => {
    const { pkg } = await setup();
    const a = await makeCustomer('a@test.com');
    const b = await makeCustomer('b@test.com');
    const created = await request(app).post('/api/bookings').set(bearer(a.token)).send(bookingBody(pkg.id));
    const res = await request(app).get(`/api/bookings/my/${created.body.data.id}`).set(bearer(b.token));
    expect(res.status).toBe(404);
    expect((await request(app).get(`/api/bookings/my/${created.body.data.id}`).set(bearer(a.token))).status).toBe(200);
  });

  it('לקוחה לא יכולה לגשת לנתיבי מנהלת', async () => {
    const { token } = await makeCustomer();
    expect((await request(app).get('/api/admin/bookings').set(bearer(token))).status).toBe(403);
  });

  it('מנהלת רואה את כל הבקשות עם פרטי הלקוחה, ומסננת לפי סטטוס וסוג אירוע', async () => {
    const { pkg } = await setup();
    const a = await makeCustomer('a@test.com');
    const b = await makeCustomer('b@test.com');
    const admin = await makeAdmin();
    await request(app).post('/api/bookings').set(bearer(a.token)).send(bookingBody(pkg.id, { eventType: 'NEWBORN' }));
    const second = await request(app).post('/api/bookings').set(bearer(b.token)).send(bookingBody(pkg.id, { eventType: 'FAMILY' }));

    const all = await request(app).get('/api/admin/bookings').set(bearer(admin.token));
    expect(all.body.data).toHaveLength(2);
    expect(all.body.data[0].customer).toMatchObject({ email: expect.any(String) });
    expect(JSON.stringify(all.body)).not.toContain('passwordHash');

    await request(app).patch(`/api/admin/bookings/${second.body.data.id}/status`).set(bearer(admin.token)).send({ status: 'APPROVED' });
    const byStatus = await request(app).get('/api/admin/bookings?status=APPROVED').set(bearer(admin.token));
    expect(byStatus.body.data.map((x: { id: string }) => x.id)).toEqual([second.body.data.id]);
    const byType = await request(app).get('/api/admin/bookings?eventType=NEWBORN').set(bearer(admin.token));
    expect(byType.body.data).toHaveLength(1);
    expect((await request(app).get('/api/admin/bookings?status=WHATEVER').set(bearer(admin.token))).status).toBe(400);
  });

  it('סינון הבקשות של הלקוחה לפי סטטוס', async () => {
    const { pkg } = await setup();
    const a = await makeCustomer('a@test.com');
    const admin = await makeAdmin();
    const created = await request(app).post('/api/bookings').set(bearer(a.token)).send(bookingBody(pkg.id));
    await request(app).post('/api/bookings').set(bearer(a.token)).send(bookingBody(pkg.id));
    await request(app).patch(`/api/admin/bookings/${created.body.data.id}/status`).set(bearer(admin.token)).send({ status: 'IN_PROGRESS' });
    const res = await request(app).get('/api/bookings/my?status=IN_PROGRESS').set(bearer(a.token));
    expect(res.body.data).toHaveLength(1);
  });
});

describe('עדכון סטטוס', () => {
  it('מנהלת מעדכנת סטטוס, והלקוחה רואה אותו', async () => {
    const { pkg } = await setup();
    const a = await makeCustomer('a@test.com');
    const admin = await makeAdmin();
    const created = await request(app).post('/api/bookings').set(bearer(a.token)).send(bookingBody(pkg.id));
    const id = created.body.data.id as string;

    for (const status of ['IN_PROGRESS', 'APPROVED', 'REJECTED', 'CANCELLED']) {
      const res = await request(app).patch(`/api/admin/bookings/${id}/status`).set(bearer(admin.token)).send({ status });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(status);
    }
    expect((await request(app).get(`/api/bookings/my/${id}`).set(bearer(a.token))).body.data.status).toBe('CANCELLED');
  });

  it('לקוחה לא יכולה לשנות סטטוס (403)', async () => {
    const { pkg } = await setup();
    const a = await makeCustomer('a@test.com');
    const created = await request(app).post('/api/bookings').set(bearer(a.token)).send(bookingBody(pkg.id));
    const res = await request(app).patch(`/api/admin/bookings/${created.body.data.id}/status`).set(bearer(a.token)).send({ status: 'APPROVED' });
    expect(res.status).toBe(403);
  });

  it('סטטוס לא תקין (400) ובקשה שלא קיימת (404)', async () => {
    const { pkg } = await setup();
    const a = await makeCustomer('a@test.com');
    const admin = await makeAdmin();
    const created = await request(app).post('/api/bookings').set(bearer(a.token)).send(bookingBody(pkg.id));
    expect((await request(app).patch(`/api/admin/bookings/${created.body.data.id}/status`).set(bearer(admin.token)).send({ status: 'DONE' })).status).toBe(400);
    expect((await request(app).patch('/api/admin/bookings/3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90/status').set(bearer(admin.token)).send({ status: 'NEW' })).status).toBe(404);
  });
});
