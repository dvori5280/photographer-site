import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app, bearer, makeAdmin, makeCategory, makePackage, makeCustomer, prisma, resetDb } from './helpers';

beforeEach(resetDb);

describe('קטגוריות', () => {
  it('CRUD מלא של מנהלת', async () => {
    const { token } = await makeAdmin();
    const created = await request(app).post('/api/categories').set(bearer(token)).send({ name: 'חתונות', description: 'תיאור' });
    expect(created.status).toBe(201);
    const id = created.body.data.id as string;

    const list = await request(app).get('/api/categories');
    expect(list.body.data).toHaveLength(1);

    const updated = await request(app).put(`/api/categories/${id}`).set(bearer(token)).send({ name: 'חתונות 2', description: null });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ name: 'חתונות 2', description: null });

    const del = await request(app).delete(`/api/categories/${id}`).set(bearer(token));
    expect(del.status).toBe(204);
    expect((await request(app).get('/api/categories')).body.data).toHaveLength(0);
  });

  it('שם כפול נדחה (409)', async () => {
    const { token } = await makeAdmin();
    await makeCategory('חתונות');
    const res = await request(app).post('/api/categories').set(bearer(token)).send({ name: 'חתונות' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('NAME_TAKEN');
  });

  it('אי אפשר למחוק קטגוריה שיש בה תמונות או חבילות (409)', async () => {
    const { token } = await makeAdmin();
    const withPhoto = await makeCategory('עם תמונה');
    const withPackage = await makeCategory('עם חבילה');
    await prisma.photo.create({ data: { title: 'תמונה', imageUrl: 'https://x.com/a.jpg', categoryId: withPhoto.id } });
    await makePackage(withPackage.id);
    for (const c of [withPhoto, withPackage]) {
      const res = await request(app).delete(`/api/categories/${c.id}`).set(bearer(token));
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CATEGORY_IN_USE');
    }
  });

  it('קטגוריה שלא קיימת: 404', async () => {
    const { token } = await makeAdmin();
    const res = await request(app)
      .put('/api/categories/3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90')
      .set(bearer(token))
      .send({ name: 'משהו' });
    expect(res.status).toBe(404);
  });

  it('ולידציה: שם קצר ומזהה לא תקין', async () => {
    const { token } = await makeAdmin();
    expect((await request(app).post('/api/categories').set(bearer(token)).send({ name: 'א' })).status).toBe(400);
    expect((await request(app).delete('/api/categories/not-a-uuid').set(bearer(token))).status).toBe(400);
  });
});

describe('גלריה', () => {
  const photoBody = (categoryId: string, extra: Record<string, unknown> = {}) => ({
    title: 'חופה בשקיעה',
    description: 'חופה בגינה',
    imageUrl: 'https://picsum.photos/seed/a/800/600',
    takenAt: '2026-06-10',
    categoryId,
    ...extra,
  });

  it('CRUD מלא ושדות נכונים', async () => {
    const { token } = await makeAdmin();
    const cat = await makeCategory();
    const created = await request(app).post('/api/photos').set(bearer(token)).send(photoBody(cat.id));
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({
      title: 'חופה בשקיעה',
      takenAt: '2026-06-10',
      isPublished: true,
      category: { id: cat.id, name: 'חתונות' },
    });
    const id = created.body.data.id as string;

    const updated = await request(app).put(`/api/photos/${id}`).set(bearer(token)).send(photoBody(cat.id, { title: 'כותרת חדשה' }));
    expect(updated.status).toBe(200);
    expect(updated.body.data.title).toBe('כותרת חדשה');

    expect((await request(app).delete(`/api/photos/${id}`).set(bearer(token))).status).toBe(204);
    expect((await request(app).get(`/api/photos/${id}`)).status).toBe(404);
  });

  it('מבקר רואה רק תמונות מפורסמות; מנהלת רואה הכול', async () => {
    const { token } = await makeAdmin();
    const cat = await makeCategory();
    await request(app).post('/api/photos').set(bearer(token)).send(photoBody(cat.id, { title: 'מפורסמת' }));
    const hidden = await request(app).post('/api/photos').set(bearer(token)).send(photoBody(cat.id, { title: 'מוסתרת', isPublished: false }));

    const pub = await request(app).get('/api/photos');
    expect(pub.body.data.map((p: { title: string }) => p.title)).toEqual(['מפורסמת']);

    const single = await request(app).get(`/api/photos/${hidden.body.data.id}`);
    expect(single.status).toBe(404);

    const admin = await request(app).get('/api/admin/photos').set(bearer(token));
    expect(admin.body.data).toHaveLength(2);
    const onlyHidden = await request(app).get('/api/admin/photos?isPublished=false').set(bearer(token));
    expect(onlyHidden.body.data.map((p: { title: string }) => p.title)).toEqual(['מוסתרת']);
  });

  it('הסתרה ופרסום דרך PUT', async () => {
    const { token } = await makeAdmin();
    const cat = await makeCategory();
    const created = await request(app).post('/api/photos').set(bearer(token)).send(photoBody(cat.id));
    const id = created.body.data.id as string;
    await request(app).put(`/api/photos/${id}`).set(bearer(token)).send(photoBody(cat.id, { isPublished: false }));
    expect((await request(app).get('/api/photos')).body.data).toHaveLength(0);
    await request(app).put(`/api/photos/${id}`).set(bearer(token)).send(photoBody(cat.id, { isPublished: true }));
    expect((await request(app).get('/api/photos')).body.data).toHaveLength(1);
  });

  it('סינון לפי קטגוריה', async () => {
    const { token } = await makeAdmin();
    const a = await makeCategory('א קטגוריה');
    const b = await makeCategory('ב קטגוריה');
    await request(app).post('/api/photos').set(bearer(token)).send(photoBody(a.id, { title: 'באלף' }));
    await request(app).post('/api/photos').set(bearer(token)).send(photoBody(b.id, { title: 'בבית' }));
    const res = await request(app).get(`/api/photos?categoryId=${b.id}`);
    expect(res.body.data.map((p: { title: string }) => p.title)).toEqual(['בבית']);
    expect((await request(app).get('/api/photos?categoryId=bad')).status).toBe(400);
  });

  it.each([
    ['כתובת עם javascript:', { imageUrl: 'javascript:alert(1)' }],
    ['כתובת לא תקינה', { imageUrl: 'not a url' }],
    ['כותרת קצרה', { title: 'א' }],
    ['תאריך לא קיים', { takenAt: '2026-02-31' }],
    ['תאריך בפורמט שגוי', { takenAt: '10/06/2026' }],
    ['isPublished לא בוליאני', { isPublished: 'yes' }],
  ])('ולידציה: %s', async (_label, extra) => {
    const { token } = await makeAdmin();
    const cat = await makeCategory();
    const res = await request(app).post('/api/photos').set(bearer(token)).send(photoBody(cat.id, extra));
    expect(res.status).toBe(400);
  });

  it('קטגוריה שלא קיימת נדחית (400)', async () => {
    const { token } = await makeAdmin();
    const res = await request(app)
      .post('/api/photos')
      .set(bearer(token))
      .send(photoBody('3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90'));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
  });
});

describe('חבילות', () => {
  const pkgBody = (categoryId: string, extra: Record<string, unknown> = {}) => ({
    name: 'חתונה מלאה',
    description: 'ליווי מלא',
    categoryId,
    basePrice: 6500,
    durationMinutes: 480,
    includedItems: ['500 תמונות', 'אלבום'],
    ...extra,
  });

  it('CRUD מלא והחזרת basePrice כמספר', async () => {
    const { token } = await makeAdmin();
    const cat = await makeCategory();
    const created = await request(app).post('/api/packages').set(bearer(token)).send(pkgBody(cat.id, { basePrice: 1234.5 }));
    expect(created.status).toBe(201);
    expect(created.body.data.basePrice).toBe(1234.5);
    expect(created.body.data.isActive).toBe(true);
    expect(created.body.data.includedItems).toEqual(['500 תמונות', 'אלבום']);
    const id = created.body.data.id as string;

    const updated = await request(app).put(`/api/packages/${id}`).set(bearer(token)).send(pkgBody(cat.id, { name: 'שם חדש' }));
    expect(updated.body.data.name).toBe('שם חדש');
    expect((await request(app).delete(`/api/packages/${id}`).set(bearer(token))).status).toBe(204);
  });

  it('מבקר רואה רק חבילות פעילות; השבתה והפעלה דרך PUT', async () => {
    const { token } = await makeAdmin();
    const cat = await makeCategory();
    const active = await makePackage(cat.id, { name: 'פעילה' });
    const inactive = await makePackage(cat.id, { name: 'לא פעילה', isActive: false });

    expect((await request(app).get('/api/packages')).body.data.map((p: { name: string }) => p.name)).toEqual(['פעילה']);
    expect((await request(app).get(`/api/packages/${inactive.id}`)).status).toBe(404);
    expect((await request(app).get(`/api/admin/packages`).set(bearer(token))).body.data).toHaveLength(2);
    expect((await request(app).get(`/api/admin/packages?isActive=false`).set(bearer(token))).body.data).toHaveLength(1);

    await request(app).put(`/api/packages/${active.id}`).set(bearer(token)).send(pkgBody(cat.id, { isActive: false }));
    expect((await request(app).get('/api/packages')).body.data).toHaveLength(0);
  });

  it('מיון לפי מחיר וסינון לפי קטגוריה', async () => {
    const a = await makeCategory('א');
    const b = await makeCategory('ב');
    await makePackage(a.id, { name: 'יקרה', basePrice: 900 });
    await makePackage(a.id, { name: 'זולה', basePrice: 100 });
    await makePackage(b.id, { name: 'אחרת', basePrice: 500 });

    const asc = await request(app).get('/api/packages?sort=price_asc');
    expect(asc.body.data.map((p: { name: string }) => p.name)).toEqual(['זולה', 'אחרת', 'יקרה']);
    const desc = await request(app).get('/api/packages?sort=price_desc');
    expect(desc.body.data.map((p: { name: string }) => p.name)).toEqual(['יקרה', 'אחרת', 'זולה']);
    const filtered = await request(app).get(`/api/packages?categoryId=${b.id}`);
    expect(filtered.body.data.map((p: { name: string }) => p.name)).toEqual(['אחרת']);
    expect((await request(app).get('/api/packages?sort=cheapest')).status).toBe(400);
  });

  it.each([
    ['מחיר שלילי', { basePrice: -5 }],
    ['מחיר אפס', { basePrice: 0 }],
    ['מחיר כמחרוזת', { basePrice: '100' }],
    ['מחיר עם שלוש ספרות אחרי הנקודה', { basePrice: 10.123 }],
    ['משך אפס', { durationMinutes: 0 }],
    ['משך לא שלם', { durationMinutes: 30.5 }],
    ['רשימת פריטים ריקה', { includedItems: [] }],
    ['פריטים לא מערך', { includedItems: 'הכול' }],
    ['שם חסר', { name: '' }],
  ])('ולידציה: %s', async (_label, extra) => {
    const { token } = await makeAdmin();
    const cat = await makeCategory();
    const res = await request(app).post('/api/packages').set(bearer(token)).send(pkgBody(cat.id, extra));
    expect(res.status).toBe(400);
  });

  it('אי אפשר למחוק חבילה שיש עליה בקשות הזמנה (409)', async () => {
    const { token } = await makeAdmin();
    const { user } = await makeCustomer();
    const cat = await makeCategory();
    const pkg = await makePackage(cat.id);
    await prisma.bookingRequest.create({
      data: {
        userId: user.id,
        packageId: pkg.id,
        requestedDate: new Date('2030-01-01T00:00:00Z'),
        eventType: 'FAMILY',
        location: 'ירושלים',
        phone: '0501234567',
        priceAtRequest: 1500,
      },
    });
    const res = await request(app).delete(`/api/packages/${pkg.id}`).set(bearer(token));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('PACKAGE_HAS_BOOKINGS');
  });
});
