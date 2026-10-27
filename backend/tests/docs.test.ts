import { execSync } from 'node:child_process';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './helpers';

// כל ה-Endpoints שהוגדרו באפיון
const ENDPOINTS: Array<[string, string]> = [
  ['get', '/api/health'],
  ['post', '/api/auth/register'],
  ['post', '/api/auth/login'],
  ['get', '/api/auth/me'],
  ['get', '/api/categories'],
  ['post', '/api/categories'],
  ['put', '/api/categories/{id}'],
  ['delete', '/api/categories/{id}'],
  ['get', '/api/photos'],
  ['get', '/api/photos/{id}'],
  ['post', '/api/photos'],
  ['put', '/api/photos/{id}'],
  ['delete', '/api/photos/{id}'],
  ['get', '/api/admin/photos'],
  ['get', '/api/packages'],
  ['get', '/api/packages/{id}'],
  ['post', '/api/packages'],
  ['put', '/api/packages/{id}'],
  ['delete', '/api/packages/{id}'],
  ['get', '/api/admin/packages'],
  ['post', '/api/bookings'],
  ['get', '/api/bookings/my'],
  ['get', '/api/bookings/my/{id}'],
  ['get', '/api/admin/bookings'],
  ['patch', '/api/admin/bookings/{id}/status'],
  ['post', '/api/contact'],
  ['get', '/api/admin/messages'],
  ['patch', '/api/admin/messages/{id}/status'],
];

const PUBLIC = new Set(['get /api/health', 'post /api/auth/register', 'post /api/auth/login', 'get /api/categories', 'get /api/photos', 'get /api/photos/{id}', 'get /api/packages', 'get /api/packages/{id}', 'post /api/contact']);

type Doc = {
  openapi: string;
  paths: Record<string, Record<string, { security?: unknown[]; responses: Record<string, unknown>; summary?: string; requestBody?: unknown }>>;
  components: { securitySchemes: Record<string, { type: string; scheme: string; bearerFormat: string }>; schemas: Record<string, unknown> };
};

async function loadDoc(): Promise<Doc> {
  return (await request(app).get('/openapi.json')).body as Doc;
}

describe('Swagger / OpenAPI', () => {
  it('מסמך OpenAPI 3 עם Bearer JWT', async () => {
    const doc = await loadDoc();
    expect(doc.openapi).toMatch(/^3\./);
    expect(doc.components.securitySchemes['bearerAuth']).toMatchObject({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' });
  });

  it.each(ENDPOINTS)('%s %s מתועד', async (method, path) => {
    const doc = await loadDoc();
    const op = doc.paths[path]?.[method];
    expect(op, `חסר תיעוד ל-${method} ${path}`).toBeDefined();
    expect(op?.summary).toBeTruthy();
    expect(Object.keys(op!.responses).length).toBeGreaterThan(0);
  });

  it('אין בתיעוד נתיבים שלא קיימים ברשימת ה-Endpoints', async () => {
    const doc = await loadDoc();
    const documented = Object.entries(doc.paths).flatMap(([p, ops]) => Object.keys(ops).map((m) => `${m} ${p}`));
    const expected = ENDPOINTS.map(([m, p]) => `${m} ${p}`);
    expect(documented.sort()).toEqual(expected.sort());
  });

  it('נתיבים מוגנים דורשים Token ומתועדים עם 401, ונתיבים ציבוריים לא', async () => {
    const doc = await loadDoc();
    for (const [method, path] of ENDPOINTS) {
      const op = doc.paths[path]![method]!;
      const key = `${method} ${path}`;
      if (PUBLIC.has(key)) {
        expect(op.security, key).toBeUndefined();
      } else {
        expect(op.security, key).toBeDefined();
        expect(op.responses['401'], key).toBeDefined();
      }
    }
  });

  it('נתיבי מנהלת מתועדים עם 403 ונתיבים עם גוף בקשה כוללים דוגמה', async () => {
    const doc = await loadDoc();
    for (const [method, path] of ENDPOINTS) {
      const op = doc.paths[path]![method]!;
      if (path.includes('/admin/') || (method !== 'get' && !path.includes('/auth') && !path.includes('/contact') && !path.includes('/bookings'))) {
        expect(op.responses['403'], `${method} ${path}`).toBeDefined();
      }
      if (op.requestBody) {
        expect(JSON.stringify(op.requestBody), `${method} ${path}`).toContain('"example"');
      }
    }
  });

  it('כל ה-$ref במסמך מצביעים על סכמה קיימת', async () => {
    const doc = await loadDoc();
    const text = JSON.stringify(doc);
    const refs = [...text.matchAll(/#\/components\/(schemas|responses)\/(\w+)/g)];
    expect(refs.length).toBeGreaterThan(10);
    const components = doc.components as unknown as Record<string, Record<string, unknown>>;
    for (const [, kind, name] of refs) {
      expect(components[kind!]![name!], `${kind}/${name}`).toBeDefined();
    }
  });

  it('ממשק Swagger UI נטען ב-/api-docs', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.text.toLowerCase()).toContain('swagger');
  });
});

describe('תקינות כללית', () => {
  it('/api/health מדווח שהמסד פעיל', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('נתיב לא קיים מחזיר 404 בפורמט אחיד', async () => {
    const res = await request(app).get('/api/nothing-here');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('CORS: כתובת מורשית מקבלת כותרת, כתובת זרה לא', async () => {
    const ok = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
    expect(ok.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    const bad = await request(app).get('/api/health').set('Origin', 'http://evil.example');
    expect(bad.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('סכמת Prisma תקינה ומסונכרנת עם ה-migrations (אין drift)', () => {
    const url = process.env['DATABASE_URL'] as string;
    execSync('npx prisma validate', { stdio: 'pipe', env: { ...process.env } });
    // יוצא בקוד 0 רק כשאין הבדל בין מבנה המסד (אחרי migrate deploy) לבין schema.prisma
    execSync(`npx prisma migrate diff --from-url "${url}" --to-schema-datamodel prisma/schema.prisma --exit-code`, {
      stdio: 'pipe',
      env: { ...process.env },
    });
  });
});
