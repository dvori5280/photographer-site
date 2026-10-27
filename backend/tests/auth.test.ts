import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app, bearer, createUser, PASSWORD, prisma, resetDb, tokenFor } from './helpers';

const SECRET = process.env['JWT_SECRET'] as string;

beforeEach(resetDb);

describe('הרשמה', () => {
  it('נרשמת בהצלחה ומקבלת Token ותפקיד CUSTOMER', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'שרה כהן', email: 'Sara@Example.com', password: PASSWORD });
    expect(res.status).toBe(201);
    expect(res.body.data.user).toMatchObject({ name: 'שרה כהן', email: 'sara@example.com', role: 'CUSTOMER' });
    expect(typeof res.body.data.accessToken).toBe('string');
  });

  it('לא חושפת סיסמה או Hash בתגובה', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'שרה כהן', email: 'sara@example.com', password: PASSWORD });
    const text = JSON.stringify(res.body);
    expect(text).not.toContain('passwordHash');
    expect(text).not.toContain(PASSWORD);
    expect(text).not.toContain('$2');
  });

  it('שומרת את הסיסמה כ-Hash ולא כטקסט גלוי', async () => {
    await request(app).post('/api/auth/register').send({ name: 'שרה', email: 'sara@example.com', password: PASSWORD });
    const user = await prisma.user.findUniqueOrThrow({ where: { email: 'sara@example.com' } });
    expect(user.passwordHash).not.toBe(PASSWORD);
    expect(user.passwordHash.startsWith('$2')).toBe(true);
  });

  it('מתעלמת מ-role שנשלח ומקצה CUSTOMER בלבד (אין הרשמה כמנהלת)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'האקרית', email: 'hacker@example.com', password: PASSWORD, role: 'ADMIN' });
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('CUSTOMER');
    const user = await prisma.user.findUniqueOrThrow({ where: { email: 'hacker@example.com' } });
    expect(user.role).toBe('CUSTOMER');
  });

  it('דוחה אימייל שכבר קיים (409), גם באותיות שונות', async () => {
    await createUser('CUSTOMER', 'sara@example.com');
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'שרה', email: 'SARA@example.com', password: PASSWORD });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it.each([
    ['אימייל לא תקין', { name: 'שרה', email: 'not-an-email', password: PASSWORD }, 'email'],
    ['סיסמה קצרה', { name: 'שרה', email: 'a@b.com', password: '123' }, 'password'],
    ['שם קצר', { name: 'ש', email: 'a@b.com', password: PASSWORD }, 'name'],
    ['שדות חסרים', {}, 'email'],
  ])('ולידציה: %s', async (_label, payload, field) => {
    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.map((d: { field: string }) => d.field)).toContain(field);
  });
});

describe('התחברות', () => {
  it('Login תקין מחזיר Token ופרטי משתמשת', async () => {
    await createUser('CUSTOMER', 'sara@example.com');
    const res = await request(app).post('/api/auth/login').send({ email: 'sara@example.com', password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('sara@example.com');
    const decoded = jwt.verify(res.body.data.accessToken, SECRET) as jwt.JwtPayload;
    expect(decoded.sub).toBe(res.body.data.user.id);
    expect(decoded.exp).toBeGreaterThan(decoded.iat as number); // יש תוקף מוגבל
  });

  it('סיסמה שגויה מחזירה 401', async () => {
    await createUser('CUSTOMER', 'sara@example.com');
    const res = await request(app).post('/api/auth/login').send({ email: 'sara@example.com', password: 'wrong-pass' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('אימייל לא קיים מחזיר אותה הודעה כמו סיסמה שגויה', async () => {
    await createUser('CUSTOMER', 'sara@example.com');
    const wrongPass = await request(app).post('/api/auth/login').send({ email: 'sara@example.com', password: 'x' });
    const noUser = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'x' });
    expect(noUser.status).toBe(401);
    expect(noUser.body).toEqual(wrongPass.body);
  });

  it('ולידציה: חסרה סיסמה', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });
});

describe('Token ו-/api/auth/me', () => {
  it('בלי Token: 401 TOKEN_MISSING', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_MISSING');
  });

  it('Token תקין מחזיר את המשתמשת', async () => {
    await createUser('CUSTOMER', 'sara@example.com');
    const token = await tokenFor('sara@example.com');
    const res = await request(app).get('/api/auth/me').set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('sara@example.com');
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
  });

  it('Token משובש: 401 TOKEN_INVALID', async () => {
    const res = await request(app).get('/api/auth/me').set(bearer('not.a.token'));
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_INVALID');
  });

  it('Token שפג תוקפו: 401 TOKEN_EXPIRED', async () => {
    const user = await createUser('CUSTOMER', 'sara@example.com');
    const expired = jwt.sign({ role: 'CUSTOMER' }, SECRET, { subject: user.id, expiresIn: -10 });
    const res = await request(app).get('/api/auth/me').set(bearer(expired));
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  it('Token שנחתם במפתח אחר: 401', async () => {
    const user = await createUser('CUSTOMER', 'sara@example.com');
    const forged = jwt.sign({ role: 'ADMIN' }, 'another-secret-another-secret-123456', { subject: user.id });
    const res = await request(app).get('/api/auth/me').set(bearer(forged));
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_INVALID');
  });

  it('Token בלי חתימה (alg none): 401', async () => {
    const user = await createUser('CUSTOMER', 'sara@example.com');
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ sub: user.id, role: 'ADMIN' })).toString('base64url');
    const res = await request(app).get('/api/auth/me').set(bearer(`${header}.${payload}.`));
    expect(res.status).toBe(401);
  });

  it('כותרת בלי המילה Bearer: 401', async () => {
    await createUser('CUSTOMER', 'sara@example.com');
    const token = await tokenFor('sara@example.com');
    const res = await request(app).get('/api/auth/me').set('Authorization', token);
    expect(res.status).toBe(401);
  });

  it('Token של משתמשת שנמחקה: 401', async () => {
    const user = await createUser('CUSTOMER', 'sara@example.com');
    const token = await tokenFor('sara@example.com');
    await prisma.user.delete({ where: { id: user.id } });
    const res = await request(app).get('/api/auth/me').set(bearer(token));
    expect(res.status).toBe(401);
  });

  it('התפקיד נקבע לפי מסד הנתונים ולא לפי מה שכתוב בטוקן', async () => {
    const user = await createUser('CUSTOMER', 'sara@example.com');
    // טוקן חתום כהלכה אבל עם role=ADMIN בלבד בתוכן
    const lying = jwt.sign({ role: 'ADMIN' }, SECRET, { subject: user.id, expiresIn: '1h' });
    const res = await request(app).post('/api/categories').set(bearer(lying)).send({ name: 'חתונות' });
    expect(res.status).toBe(403);
  });
});
