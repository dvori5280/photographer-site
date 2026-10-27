import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app, bearer, makeAdmin, makeCustomer, resetDb } from './helpers';

const ID = '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90';

// כל נתיב שמיועד למנהלת בלבד
const adminOnly: Array<[string, string]> = [
  ['post', '/api/categories'],
  ['put', `/api/categories/${ID}`],
  ['delete', `/api/categories/${ID}`],
  ['post', '/api/photos'],
  ['put', `/api/photos/${ID}`],
  ['delete', `/api/photos/${ID}`],
  ['get', '/api/admin/photos'],
  ['post', '/api/packages'],
  ['put', `/api/packages/${ID}`],
  ['delete', `/api/packages/${ID}`],
  ['get', '/api/admin/packages'],
  ['get', '/api/admin/bookings'],
  ['patch', `/api/admin/bookings/${ID}/status`],
  ['get', '/api/admin/messages'],
  ['patch', `/api/admin/messages/${ID}/status`],
];

// נתיבים ללקוחה מחוברת בלבד
const customerOnly: Array<[string, string]> = [
  ['post', '/api/bookings'],
  ['get', '/api/bookings/my'],
  ['get', `/api/bookings/my/${ID}`],
];

const send = (token: string | null, method: string, url: string) => {
  const req = (request(app) as unknown as Record<string, (u: string) => request.Test>)[method]!(url);
  return token ? req.set(bearer(token)).send({}) : req.send({});
};

beforeEach(resetDb);

describe('נתיבי מנהלת', () => {
  it.each(adminOnly)('%s %s: בלי Token מחזיר 401', async (method, url) => {
    expect((await send(null, method, url)).status).toBe(401);
  });

  it.each(adminOnly)('%s %s: לקוחה מקבלת 403', async (method, url) => {
    const { token } = await makeCustomer();
    expect((await send(token, method, url)).status).toBe(403);
  });

  it.each(adminOnly)('%s %s: מנהלת עוברת את בדיקת ההרשאה', async (method, url) => {
    const { token } = await makeAdmin();
    const status = (await send(token, method, url)).status;
    expect([401, 403]).not.toContain(status);
  });
});

describe('נתיבי לקוחה', () => {
  it.each(customerOnly)('%s %s: בלי Token מחזיר 401', async (method, url) => {
    expect((await send(null, method, url)).status).toBe(401);
  });

  it.each(customerOnly)('%s %s: מנהלת מקבלת 403', async (method, url) => {
    const { token } = await makeAdmin();
    expect((await send(token, method, url)).status).toBe(403);
  });
});

describe('נתיבים ציבוריים', () => {
  it.each(['/api/health', '/api/categories', '/api/photos', '/api/packages'])('%s פתוח בלי Token', async (url) => {
    expect((await request(app).get(url)).status).toBe(200);
  });
});
