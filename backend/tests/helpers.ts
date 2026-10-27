import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/security';

export { prisma };

// אפליקציה עם מגבלות גבוהות כדי שבדיקות רגילות לא ייתקלו ב-429
export const app: Express = createApp({
  rateLimits: { contactMax: 1000, authMax: 1000 },
});

export async function resetDb() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "BookingRequest","Photo","Package","Category","ContactMessage","User" RESTART IDENTITY CASCADE',
  );
}

export const PASSWORD = 'Passw0rd!';

export async function createUser(role: 'CUSTOMER' | 'ADMIN', email: string, name = 'משתמשת בדיקה') {
  return prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(PASSWORD), role },
  });
}

export async function tokenFor(email: string): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password: PASSWORD });
  if (res.status !== 200) throw new Error(`login נכשל בבדיקה: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.data.accessToken as string;
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function makeAdmin(email = 'admin@test.com') {
  const user = await createUser('ADMIN', email, 'מנהלת');
  return { user, token: await tokenFor(email) };
}

export async function makeCustomer(email = 'customer@test.com') {
  const user = await createUser('CUSTOMER', email, 'לקוחה');
  return { user, token: await tokenFor(email) };
}

export async function makeCategory(name = 'חתונות') {
  return prisma.category.create({ data: { name } });
}

export async function makePackage(categoryId: string, overrides: Record<string, unknown> = {}) {
  return prisma.package.create({
    data: {
      name: 'חבילה לבדיקה',
      description: 'תיאור חבילה',
      categoryId,
      basePrice: 1500,
      durationMinutes: 120,
      includedItems: ['100 תמונות'],
      ...overrides,
    },
  });
}

export function futureDate(days = 30): string {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
  const d = new Date(`${today}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function pastDate(days = 3): string {
  return futureDate(-days);
}
