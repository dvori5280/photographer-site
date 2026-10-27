import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { seed } from '../src/seed/seed';
import { app, prisma, resetDb } from './helpers';

beforeEach(resetDb);

describe('Seed', () => {
  it('יוצר מנהלת ונתוני הדגמה, והמנהלת יכולה להתחבר', async () => {
    await seed(prisma, {
      isProduction: false,
      adminEmail: 'admin@example.com',
      adminPassword: 'Admin12345!',
      demoData: true,
    });
    expect(await prisma.category.count()).toBe(4);
    expect(await prisma.photo.count()).toBeGreaterThanOrEqual(5);
    expect(await prisma.package.count()).toBeGreaterThanOrEqual(4);
    expect(await prisma.bookingRequest.count()).toBeGreaterThanOrEqual(1);
    expect(await prisma.contactMessage.count()).toBeGreaterThanOrEqual(1);

    const login = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'Admin12345!' });
    expect(login.status).toBe(200);
    expect(login.body.data.user.role).toBe('ADMIN');

    // יש גם נתונים לבדיקת הרשאות: תמונה מוסתרת וחבילה מושבתת
    expect(await prisma.photo.count({ where: { isPublished: false } })).toBeGreaterThan(0);
    expect(await prisma.package.count({ where: { isActive: false } })).toBeGreaterThan(0);
    const pub = await request(app).get('/api/photos');
    expect(pub.body.data.length).toBe((await prisma.photo.count()) - (await prisma.photo.count({ where: { isPublished: false } })));
  });

  it('הרצה חוזרת לא יוצרת כפילויות', async () => {
    const opts = { isProduction: false, adminEmail: 'admin@example.com', adminPassword: 'Admin12345!', demoData: true };
    await seed(prisma, opts);
    const counts = async () => [await prisma.user.count(), await prisma.category.count(), await prisma.photo.count(), await prisma.package.count(), await prisma.bookingRequest.count()];
    const before = await counts();
    await seed(prisma, opts);
    expect(await counts()).toEqual(before);
  });

  it('לא דורס סיסמה של מנהלת קיימת', async () => {
    const opts = { isProduction: false, adminEmail: 'admin@example.com', demoData: false };
    await seed(prisma, { ...opts, adminPassword: 'FirstPassword1!' });
    await seed(prisma, { ...opts, adminPassword: 'SecondPassword2!' });
    const ok = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'FirstPassword1!' });
    expect(ok.status).toBe(200);
  });

  it('בפרודקשן בלי סיסמת מנהלת: נכשל ולא יוצר חשבון עם סיסמה ידועה', async () => {
    await expect(seed(prisma, { isProduction: true, demoData: false })).rejects.toThrow(/SEED_ADMIN_PASSWORD/);
    expect(await prisma.user.count()).toBe(0);
  });

  it('בפרודקשן סיסמה קצרה נדחית', async () => {
    await expect(seed(prisma, { isProduction: true, adminPassword: '123', demoData: false })).rejects.toThrow();
  });

  it('בפרודקשן בלי סיסמת לקוחה לדוגמה: לא נוצרת לקוחה עם סיסמה קבועה', async () => {
    await seed(prisma, { isProduction: true, adminEmail: 'boss@example.com', adminPassword: 'LongSecretPass1!', demoData: true });
    expect(await prisma.user.count({ where: { role: 'CUSTOMER' } })).toBe(0);
    expect(await prisma.package.count()).toBeGreaterThan(0);
    const bad = await request(app).post('/api/auth/login').send({ email: 'customer@example.com', password: 'Customer12345!' });
    expect(bad.status).toBe(401);
  });
});
