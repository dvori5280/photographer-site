// מסמך OpenAPI 3 של כל ה-API. ממנו נבנים ממשק Swagger (/api-docs) והקובץ openapi.json
type Obj = Record<string, unknown>;

const ref = (name: string): Obj => ({ $ref: `#/components/schemas/${name}` });
const data = (schema: Obj): Obj => ({
  type: 'object',
  required: ['data'],
  properties: { data: schema },
});
const list = (name: string): Obj => data({ type: 'array', items: ref(name) });
const one = (name: string): Obj => data(ref(name));

const json = (schema: Obj, example?: unknown): Obj => ({
  'application/json': { schema, ...(example !== undefined ? { example } : {}) },
});
const body = (schemaName: string, example: unknown): Obj => ({
  required: true,
  content: json(ref(schemaName), example),
});
const ok = (description: string, schema: Obj, example?: unknown): Obj => ({
  description,
  content: json(schema, example),
});
const errorRef = (name: string): Obj => ({ $ref: `#/components/responses/${name}` });

const secured = [{ bearerAuth: [] }];
const idParam: Obj = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'מזהה (UUID)',
  schema: { type: 'string', format: 'uuid' },
  example: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
};
const query = (name: string, description: string, schema: Obj, example?: unknown): Obj => ({
  name,
  in: 'query',
  required: false,
  description,
  schema,
  ...(example !== undefined ? { example } : {}),
});

const EX_ID = '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90';
const EX_ID2 = '8b1d6f20-2c4e-4a77-b3d1-6a9e0c5f1e42';
const EX_DATE = '2027-03-14';
const EX_TS = '2026-10-26T20:00:00.000Z';

const exUser = { id: EX_ID, name: 'שרה כהן', email: 'sara@example.com', role: 'CUSTOMER', createdAt: EX_TS };
const exCategory = { id: EX_ID, name: 'חתונות', description: 'צילומי חתונות ואירועים גדולים' };
const exPhoto = {
  id: EX_ID,
  title: 'חופה בשקיעה',
  description: 'חופה בגינה בשעת השקיעה',
  imageUrl: 'https://picsum.photos/seed/chuppah/800/600',
  takenAt: '2026-06-10',
  isPublished: true,
  category: { id: EX_ID2, name: 'חתונות' },
  createdAt: EX_TS,
  updatedAt: EX_TS,
};
const exPackage = {
  id: EX_ID,
  name: 'חבילת חתונה מלאה',
  description: 'ליווי מלא מההכנות ועד הריקודים',
  basePrice: 6500,
  durationMinutes: 480,
  includedItems: ['500 תמונות ערוכות', 'אלבום דיגיטלי', 'גלריה אונליין'],
  imageUrl: 'https://picsum.photos/seed/wedding/800/600',
  isActive: true,
  category: { id: EX_ID2, name: 'חתונות' },
  createdAt: EX_TS,
  updatedAt: EX_TS,
};
const exBooking = {
  id: EX_ID,
  requestedDate: EX_DATE,
  eventType: 'FAMILY',
  location: 'גן אירועים, ירושלים',
  phone: '050-1234567',
  notes: 'מבקשת צילום גם בהכנות',
  status: 'NEW',
  priceAtRequest: 6500,
  package: { id: EX_ID2, name: 'חבילת חתונה מלאה' },
  createdAt: EX_TS,
  updatedAt: EX_TS,
};
const exMessage = {
  id: EX_ID,
  name: 'דינה לוי',
  email: 'dina@example.com',
  phone: '052-7654321',
  subject: 'שאלה על מחירים',
  message: 'שלום, אשמח לקבל פרטים על צילומי חלאקה.',
  status: 'NEW',
  createdAt: EX_TS,
};

const EVENT_TYPES = ['NEWBORN', 'SMASH_CAKE', 'CHALLAH_PHOTOSHOOT', 'FAMILY'];
const BOOKING_STATUSES = ['NEW', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'CANCELLED'];

const str = (extra: Obj = {}): Obj => ({ type: 'string', ...extra });

const schemas: Record<string, Obj> = {
  Error: {
    type: 'object',
    required: ['error'],
    properties: {
      error: {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: str({ example: 'VALIDATION_ERROR' }),
          message: str({ example: 'הנתונים שנשלחו אינם תקינים' }),
          details: {
            type: 'array',
            description: 'מופיע בשגיאות ולידציה בלבד',
            items: {
              type: 'object',
              properties: { field: str({ example: 'email' }), message: str({ example: 'כתובת אימייל לא תקינה' }) },
            },
          },
        },
      },
    },
  },
  User: {
    type: 'object',
    properties: {
      id: str({ format: 'uuid' }),
      name: str(),
      email: str({ format: 'email' }),
      role: str({ enum: ['CUSTOMER', 'ADMIN'] }),
      createdAt: str({ format: 'date-time' }),
    },
  },
  AuthResult: {
    type: 'object',
    properties: {
      user: ref('User'),
      accessToken: str({ description: 'JWT. נשלח בכותרת Authorization: Bearer <token>' }),
    },
  },
  RegisterInput: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: str({ minLength: 2, maxLength: 80 }),
      email: str({ format: 'email' }),
      password: str({ minLength: 8, maxLength: 64 }),
    },
  },
  LoginInput: {
    type: 'object',
    required: ['email', 'password'],
    properties: { email: str({ format: 'email' }), password: str() },
  },
  Category: {
    type: 'object',
    properties: { id: str({ format: 'uuid' }), name: str(), description: { type: ['string', 'null'] } },
  },
  CategoryInput: {
    type: 'object',
    required: ['name'],
    properties: { name: str({ minLength: 2, maxLength: 60 }), description: { type: ['string', 'null'], maxLength: 300 } },
  },
  CategoryRef: {
    type: 'object',
    properties: { id: str({ format: 'uuid' }), name: str() },
  },
  Photo: {
    type: 'object',
    properties: {
      id: str({ format: 'uuid' }),
      title: str(),
      description: { type: ['string', 'null'] },
      imageUrl: str({ format: 'uri' }),
      takenAt: { type: ['string', 'null'], format: 'date' },
      isPublished: { type: 'boolean' },
      category: ref('CategoryRef'),
      createdAt: str({ format: 'date-time' }),
      updatedAt: str({ format: 'date-time' }),
    },
  },
  PhotoInput: {
    type: 'object',
    required: ['title', 'imageUrl', 'categoryId'],
    properties: {
      title: str({ minLength: 2, maxLength: 80 }),
      description: { type: ['string', 'null'], maxLength: 500 },
      imageUrl: str({ format: 'uri', description: 'כתובת http או https של התמונה' }),
      takenAt: { type: ['string', 'null'], format: 'date', description: 'YYYY-MM-DD' },
      isPublished: { type: 'boolean', default: true },
      categoryId: str({ format: 'uuid' }),
    },
  },
  Package: {
    type: 'object',
    properties: {
      id: str({ format: 'uuid' }),
      name: str(),
      description: str(),
      basePrice: { type: 'number', description: 'מחיר בסיס בשקלים' },
      durationMinutes: { type: 'integer' },
      includedItems: { type: 'array', items: str() },
      imageUrl: { type: ['string', 'null'] },
      isActive: { type: 'boolean' },
      category: ref('CategoryRef'),
      createdAt: str({ format: 'date-time' }),
      updatedAt: str({ format: 'date-time' }),
    },
  },
  PackageInput: {
    type: 'object',
    required: ['name', 'description', 'categoryId', 'basePrice', 'durationMinutes', 'includedItems'],
    properties: {
      name: str({ minLength: 2, maxLength: 80 }),
      description: str({ minLength: 2, maxLength: 1000 }),
      categoryId: str({ format: 'uuid' }),
      basePrice: { type: 'number', exclusiveMinimum: 0, maximum: 1000000, description: 'עד שתי ספרות אחרי הנקודה' },
      durationMinutes: { type: 'integer', minimum: 1, maximum: 1440 },
      includedItems: { type: 'array', minItems: 1, maxItems: 30, items: str({ maxLength: 100 }) },
      imageUrl: { type: ['string', 'null'], format: 'uri' },
      isActive: { type: 'boolean', default: true },
    },
  },
  BookingInput: {
    type: 'object',
    required: ['packageId', 'requestedDate', 'eventType', 'location', 'phone'],
    properties: {
      packageId: str({ format: 'uuid' }),
      requestedDate: str({ format: 'date', description: 'YYYY-MM-DD. היום או בעתיד' }),
      eventType: str({ enum: EVENT_TYPES }),
      location: str({ minLength: 2, maxLength: 120 }),
      phone: str({ description: 'טלפון ישראלי, למשל 050-1234567' }),
      notes: { type: ['string', 'null'], maxLength: 1000 },
    },
  },
  Booking: {
    type: 'object',
    properties: {
      id: str({ format: 'uuid' }),
      requestedDate: str({ format: 'date' }),
      eventType: str({ enum: EVENT_TYPES }),
      location: str(),
      phone: str(),
      notes: { type: ['string', 'null'] },
      status: str({ enum: BOOKING_STATUSES }),
      priceAtRequest: { type: 'number', description: 'מחיר החבילה ברגע שליחת הבקשה' },
      package: ref('CategoryRef'),
      customer: {
        type: 'object',
        description: 'מופיע בתגובות המנהלת בלבד',
        properties: { id: str({ format: 'uuid' }), name: str(), email: str() },
      },
      createdAt: str({ format: 'date-time' }),
      updatedAt: str({ format: 'date-time' }),
    },
  },
  BookingStatusInput: {
    type: 'object',
    required: ['status'],
    properties: { status: str({ enum: BOOKING_STATUSES }) },
  },
  ContactInput: {
    type: 'object',
    required: ['name', 'email', 'subject', 'message'],
    properties: {
      name: str({ minLength: 2, maxLength: 80 }),
      email: str({ format: 'email' }),
      phone: { type: ['string', 'null'] },
      subject: str({ minLength: 2, maxLength: 100 }),
      message: str({ minLength: 10, maxLength: 2000 }),
    },
  },
  ContactCreated: {
    type: 'object',
    properties: { id: str({ format: 'uuid' }), createdAt: str({ format: 'date-time' }) },
  },
  ContactMessage: {
    type: 'object',
    properties: {
      id: str({ format: 'uuid' }),
      name: str(),
      email: str(),
      phone: { type: ['string', 'null'] },
      subject: str(),
      message: str(),
      status: str({ enum: ['NEW', 'HANDLED'] }),
      createdAt: str({ format: 'date-time' }),
    },
  },
  MessageStatusInput: {
    type: 'object',
    required: ['status'],
    properties: { status: str({ enum: ['NEW', 'HANDLED'] }) },
  },
};

const errorExample = (code: string, message: string): Obj => ({
  content: json(ref('Error'), { error: { code, message } }),
});

const responses: Record<string, Obj> = {
  BadRequest: {
    description: '400 – הנתונים שנשלחו אינם תקינים',
    content: json(ref('Error'), {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'הנתונים שנשלחו אינם תקינים',
        details: [{ field: 'email', message: 'כתובת אימייל לא תקינה' }],
      },
    }),
  },
  Unauthorized: { description: '401 – אין Token תקין', ...errorExample('TOKEN_MISSING', 'נדרשת התחברות') },
  Forbidden: { description: '403 – אין הרשאה לפעולה', ...errorExample('FORBIDDEN', 'אין לך הרשאה לבצע פעולה זו') },
  NotFound: { description: '404 – לא נמצא', ...errorExample('NOT_FOUND', 'הרשומה לא נמצאה') },
  Conflict: { description: '409 – התנגשות', ...errorExample('CATEGORY_IN_USE', 'לא ניתן למחוק קטגוריה שיש בה תמונות או חבילות') },
  TooManyRequests: {
    description: '429 – יותר מדי בקשות',
    ...errorExample('TOO_MANY_REQUESTS', 'נשלחו יותר מדי הודעות. נסי שוב מאוחר יותר'),
  },
};

const r = (...names: string[]): Obj => Object.fromEntries(names.map((n) => [codeOf(n), errorRef(n)]));
function codeOf(name: string): string {
  return {
    BadRequest: '400',
    Unauthorized: '401',
    Forbidden: '403',
    NotFound: '404',
    Conflict: '409',
    TooManyRequests: '429',
  }[name]!;
}

export function buildOpenApiDocument(): Obj {
  const adminErrors = ['Unauthorized', 'Forbidden'];

  const paths: Record<string, Obj> = {
    '/api/health': {
      get: {
        tags: ['מערכת'],
        summary: 'בדיקת בריאות השרת',
        description: 'בודק שהשרת פעיל ושהחיבור למסד הנתונים תקין. פתוח לכולם.',
        responses: {
          '200': ok('השרת והמסד תקינים', data({ type: 'object' }), {
            data: { status: 'ok', database: 'up', time: EX_TS },
          }),
          '503': ok('אין חיבור למסד הנתונים', data({ type: 'object' }), {
            data: { status: 'error', database: 'down', time: EX_TS },
          }),
        },
      },
    },

    '/api/auth/register': {
      post: {
        tags: ['התחברות'],
        summary: 'הרשמת לקוחה חדשה',
        description: 'יוצרת חשבון עם תפקיד CUSTOMER תמיד, גם אם נשלח תפקיד אחר. מחזירה Token כדי שאפשר יהיה להמשיך ישר.',
        requestBody: body('RegisterInput', { name: 'שרה כהן', email: 'sara@example.com', password: 'Passw0rd!' }),
        responses: {
          '201': ok('החשבון נוצר', one('AuthResult'), { data: { user: exUser, accessToken: 'eyJhbGciOiJIUzI1NiIs...' } }),
          ...r('BadRequest'),
          '409': { description: '409 – האימייל כבר רשום', ...errorExample('EMAIL_TAKEN', 'כתובת האימייל כבר רשומה במערכת') },
          ...r('TooManyRequests'),
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['התחברות'],
        summary: 'התחברות',
        description: 'מחזירה JWT. אחר כך לוחצים Authorize למעלה ומדביקים את ה-accessToken.',
        requestBody: body('LoginInput', { email: 'sara@example.com', password: 'Passw0rd!' }),
        responses: {
          '200': ok('התחברות הצליחה', one('AuthResult'), { data: { user: exUser, accessToken: 'eyJhbGciOiJIUzI1NiIs...' } }),
          ...r('BadRequest'),
          '401': { description: '401 – אימייל או סיסמה שגויים', ...errorExample('INVALID_CREDENTIALS', 'אימייל או סיסמה שגויים') },
          ...r('TooManyRequests'),
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['התחברות'],
        summary: 'פרטי המשתמשת המחוברת',
        security: secured,
        responses: {
          '200': ok('הפרטים', data({ type: 'object', properties: { user: ref('User') } }), { data: { user: exUser } }),
          ...r('Unauthorized'),
        },
      },
    },

    '/api/categories': {
      get: {
        tags: ['קטגוריות'],
        summary: 'רשימת קטגוריות',
        description: 'פתוח לכולם. הרשימה משותפת לגלריה ולחבילות.',
        responses: { '200': ok('רשימה ממוינת לפי שם', list('Category'), { data: [exCategory] }) },
      },
      post: {
        tags: ['קטגוריות'],
        summary: 'יצירת קטגוריה (מנהלת)',
        security: secured,
        requestBody: body('CategoryInput', { name: 'חתונות', description: 'צילומי חתונות ואירועים גדולים' }),
        responses: {
          '201': ok('נוצרה', one('Category'), { data: exCategory }),
          ...r('BadRequest', ...adminErrors),
          '409': { description: '409 – השם כבר קיים', ...errorExample('NAME_TAKEN', 'כבר קיימת קטגוריה בשם הזה') },
        },
      },
    },
    '/api/categories/{id}': {
      put: {
        tags: ['קטגוריות'],
        summary: 'עריכת קטגוריה (מנהלת)',
        security: secured,
        parameters: [idParam],
        requestBody: body('CategoryInput', { name: 'חתונות ואירועים', description: null }),
        responses: {
          '200': ok('עודכנה', one('Category'), { data: exCategory }),
          ...r('BadRequest', ...adminErrors, 'NotFound', 'Conflict'),
        },
      },
      delete: {
        tags: ['קטגוריות'],
        summary: 'מחיקת קטגוריה ריקה (מנהלת)',
        description: 'אי אפשר למחוק קטגוריה שיש בה תמונות או חבילות (409).',
        security: secured,
        parameters: [idParam],
        responses: { '204': { description: 'נמחקה, ללא תוכן' }, ...r('BadRequest', ...adminErrors, 'NotFound', 'Conflict') },
      },
    },

    '/api/photos': {
      get: {
        tags: ['גלריה'],
        summary: 'תמונות מפורסמות',
        description: 'פתוח לכולם. מחזיר רק תמונות עם isPublished=true.',
        parameters: [query('categoryId', 'סינון לפי קטגוריה', { type: 'string', format: 'uuid' })],
        responses: { '200': ok('רשימה', list('Photo'), { data: [exPhoto] }), ...r('BadRequest') },
      },
      post: {
        tags: ['גלריה'],
        summary: 'הוספת תמונה (מנהלת)',
        security: secured,
        requestBody: body('PhotoInput', {
          title: 'חופה בשקיעה',
          description: 'חופה בגינה',
          imageUrl: 'https://picsum.photos/seed/chuppah/800/600',
          takenAt: '2026-06-10',
          isPublished: true,
          categoryId: EX_ID2,
        }),
        responses: { '201': ok('נוצרה', one('Photo'), { data: exPhoto }), ...r('BadRequest', ...adminErrors) },
      },
    },
    '/api/photos/{id}': {
      get: {
        tags: ['גלריה'],
        summary: 'תמונה מפורסמת אחת',
        description: 'תמונה שאינה מפורסמת מחזירה 404.',
        parameters: [idParam],
        responses: { '200': ok('התמונה', one('Photo'), { data: exPhoto }), ...r('BadRequest', 'NotFound') },
      },
      put: {
        tags: ['גלריה'],
        summary: 'עריכת תמונה, כולל הסתרה ופרסום (מנהלת)',
        description: 'שולחים את כל השדות החובה. isPublished=false מסתיר את התמונה מהציבור.',
        security: secured,
        parameters: [idParam],
        requestBody: body('PhotoInput', {
          title: 'חופה בשקיעה',
          imageUrl: 'https://picsum.photos/seed/chuppah/800/600',
          isPublished: false,
          categoryId: EX_ID2,
        }),
        responses: { '200': ok('עודכנה', one('Photo'), { data: exPhoto }), ...r('BadRequest', ...adminErrors, 'NotFound') },
      },
      delete: {
        tags: ['גלריה'],
        summary: 'מחיקת תמונה (מנהלת)',
        security: secured,
        parameters: [idParam],
        responses: { '204': { description: 'נמחקה, ללא תוכן' }, ...r('BadRequest', ...adminErrors, 'NotFound') },
      },
    },
    '/api/admin/photos': {
      get: {
        tags: ['גלריה'],
        summary: 'כל התמונות, כולל לא מפורסמות (מנהלת)',
        security: secured,
        parameters: [
          query('categoryId', 'סינון לפי קטגוריה', { type: 'string', format: 'uuid' }),
          query('isPublished', 'סינון לפי פרסום', { type: 'string', enum: ['true', 'false'] }),
        ],
        responses: { '200': ok('רשימה', list('Photo'), { data: [exPhoto] }), ...r('BadRequest', ...adminErrors) },
      },
    },

    '/api/packages': {
      get: {
        tags: ['חבילות'],
        summary: 'חבילות פעילות',
        description: 'פתוח לכולם. מחזיר רק חבילות עם isActive=true.',
        parameters: [
          query('categoryId', 'סינון לפי קטגוריה', { type: 'string', format: 'uuid' }),
          query('sort', 'מיון לפי מחיר', { type: 'string', enum: ['price_asc', 'price_desc'] }, 'price_asc'),
        ],
        responses: { '200': ok('רשימה', list('Package'), { data: [exPackage] }), ...r('BadRequest') },
      },
      post: {
        tags: ['חבילות'],
        summary: 'יצירת חבילה (מנהלת)',
        security: secured,
        requestBody: body('PackageInput', {
          name: 'חבילת חתונה מלאה',
          description: 'ליווי מלא מההכנות ועד הריקודים',
          categoryId: EX_ID2,
          basePrice: 6500,
          durationMinutes: 480,
          includedItems: ['500 תמונות ערוכות', 'אלבום דיגיטלי'],
          imageUrl: 'https://picsum.photos/seed/wedding/800/600',
          isActive: true,
        }),
        responses: { '201': ok('נוצרה', one('Package'), { data: exPackage }), ...r('BadRequest', ...adminErrors) },
      },
    },
    '/api/packages/{id}': {
      get: {
        tags: ['חבילות'],
        summary: 'חבילה פעילה אחת',
        description: 'חבילה לא פעילה מחזירה 404.',
        parameters: [idParam],
        responses: { '200': ok('החבילה', one('Package'), { data: exPackage }), ...r('BadRequest', 'NotFound') },
      },
      put: {
        tags: ['חבילות'],
        summary: 'עריכת חבילה, כולל הפעלה והשבתה (מנהלת)',
        description: 'שינוי basePrice לא משנה בקשות הזמנה קיימות, כי בכל בקשה נשמר המחיר של רגע השליחה.',
        security: secured,
        parameters: [idParam],
        requestBody: body('PackageInput', {
          name: 'חבילת חתונה מלאה',
          description: 'ליווי מלא',
          categoryId: EX_ID2,
          basePrice: 7000,
          durationMinutes: 480,
          includedItems: ['500 תמונות ערוכות'],
          isActive: false,
        }),
        responses: { '200': ok('עודכנה', one('Package'), { data: exPackage }), ...r('BadRequest', ...adminErrors, 'NotFound') },
      },
      delete: {
        tags: ['חבילות'],
        summary: 'מחיקת חבילה (מנהלת)',
        description: 'חבילה שיש עליה בקשות הזמנה לא נמחקת (409). אפשר להשבית אותה עם isActive=false.',
        security: secured,
        parameters: [idParam],
        responses: { '204': { description: 'נמחקה, ללא תוכן' }, ...r('BadRequest', ...adminErrors, 'NotFound', 'Conflict') },
      },
    },
    '/api/admin/packages': {
      get: {
        tags: ['חבילות'],
        summary: 'כל החבילות, כולל לא פעילות (מנהלת)',
        security: secured,
        parameters: [
          query('categoryId', 'סינון לפי קטגוריה', { type: 'string', format: 'uuid' }),
          query('isActive', 'סינון לפי פעילות', { type: 'string', enum: ['true', 'false'] }),
        ],
        responses: { '200': ok('רשימה', list('Package'), { data: [exPackage] }), ...r('BadRequest', ...adminErrors) },
      },
    },

    '/api/bookings': {
      post: {
        tags: ['בקשות הזמנה'],
        summary: 'שליחת בקשת הזמנה (לקוחה)',
        description:
          'הלקוחה מזוהה לפי ה-Token. המחיר נקבע בשרת לפי מחיר החבילה ברגע השליחה, והסטטוס מתחיל ב-NEW. זו בקשה בלבד, לא אישור הזמנה. מנהלת מקבלת 403.',
        security: secured,
        requestBody: body('BookingInput', {
          packageId: EX_ID2,
          requestedDate: EX_DATE,
          eventType: 'FAMILY',
          location: 'גן אירועים, ירושלים',
          phone: '050-1234567',
          notes: 'מבקשת צילום גם בהכנות',
        }),
        responses: {
          '201': ok('הבקשה נשלחה', one('Booking'), { data: exBooking }),
          ...r('BadRequest', ...adminErrors),
          '404': { description: '404 – החבילה לא קיימת או לא פעילה', ...errorExample('PACKAGE_NOT_FOUND', 'החבילה שנבחרה לא קיימת או אינה פעילה') },
        },
      },
    },
    '/api/bookings/my': {
      get: {
        tags: ['בקשות הזמנה'],
        summary: 'הבקשות שלי (לקוחה)',
        description: 'מחזיר רק בקשות של הלקוחה המחוברת.',
        security: secured,
        parameters: [query('status', 'סינון לפי סטטוס', { type: 'string', enum: BOOKING_STATUSES })],
        responses: { '200': ok('רשימה', list('Booking'), { data: [exBooking] }), ...r('BadRequest', ...adminErrors) },
      },
    },
    '/api/bookings/my/{id}': {
      get: {
        tags: ['בקשות הזמנה'],
        summary: 'בקשה אחת שלי (לקוחה)',
        description: 'בקשה של לקוחה אחרת מחזירה 404.',
        security: secured,
        parameters: [idParam],
        responses: { '200': ok('הבקשה', one('Booking'), { data: exBooking }), ...r('BadRequest', ...adminErrors, 'NotFound') },
      },
    },
    '/api/admin/bookings': {
      get: {
        tags: ['בקשות הזמנה'],
        summary: 'כל בקשות ההזמנה (מנהלת)',
        security: secured,
        parameters: [
          query('status', 'סינון לפי סטטוס', { type: 'string', enum: BOOKING_STATUSES }),
          query('eventType', 'סינון לפי סוג אירוע', { type: 'string', enum: EVENT_TYPES }),
        ],
        responses: {
          '200': ok('רשימה, עם פרטי הלקוחה', list('Booking'), {
            data: [{ ...exBooking, customer: { id: EX_ID2, name: 'שרה כהן', email: 'sara@example.com' } }],
          }),
          ...r('BadRequest', ...adminErrors),
        },
      },
    },
    '/api/admin/bookings/{id}/status': {
      patch: {
        tags: ['בקשות הזמנה'],
        summary: 'עדכון סטטוס בקשה (מנהלת)',
        security: secured,
        parameters: [idParam],
        requestBody: body('BookingStatusInput', { status: 'APPROVED' }),
        responses: { '200': ok('עודכן', one('Booking'), { data: { ...exBooking, status: 'APPROVED' } }), ...r('BadRequest', ...adminErrors, 'NotFound') },
      },
    },

    '/api/contact': {
      post: {
        tags: ['יצירת קשר'],
        summary: 'שליחת הודעת יצירת קשר',
        description: 'פתוח לכולם, בלי התחברות. מוגבל במספר הבקשות לכל כתובת IP (429 כשחורגים).',
        requestBody: body('ContactInput', {
          name: 'דינה לוי',
          email: 'dina@example.com',
          phone: '052-7654321',
          subject: 'שאלה על מחירים',
          message: 'שלום, אשמח לקבל פרטים על צילומי חלאקה.',
        }),
        responses: {
          '201': ok('ההודעה התקבלה', one('ContactCreated'), { data: { id: EX_ID, createdAt: EX_TS } }),
          ...r('BadRequest', 'TooManyRequests'),
        },
      },
    },
    '/api/admin/messages': {
      get: {
        tags: ['יצירת קשר'],
        summary: 'הודעות יצירת קשר (מנהלת)',
        security: secured,
        parameters: [query('status', 'סינון לפי סטטוס', { type: 'string', enum: ['NEW', 'HANDLED'] })],
        responses: { '200': ok('רשימה, החדשות ראשונות', list('ContactMessage'), { data: [exMessage] }), ...r('BadRequest', ...adminErrors) },
      },
    },
    '/api/admin/messages/{id}/status': {
      patch: {
        tags: ['יצירת קשר'],
        summary: 'עדכון סטטוס הודעה (מנהלת)',
        security: secured,
        parameters: [idParam],
        requestBody: body('MessageStatusInput', { status: 'HANDLED' }),
        responses: { '200': ok('עודכן', one('ContactMessage'), { data: { ...exMessage, status: 'HANDLED' } }), ...r('BadRequest', ...adminErrors, 'NotFound') },
      },
    },
  };

  return {
    openapi: '3.1.0',
    info: {
      title: 'API – אתר תדמית וקטלוג לצלמת',
      version: '1.0.0',
      description:
        'כל התגובות המוצלחות עטופות ב-{ "data": ... }. שגיאות מגיעות כ-{ "error": { "code", "message", "details?" } }.\n\n' +
        'איך משתמשים בנתיבים מוגנים: מבצעים POST /api/auth/login, מעתיקים את accessToken, לוחצים על Authorize ומדביקים אותו (בלי המילה Bearer).',
    },
    servers: [{ url: '/', description: 'השרת הנוכחי' }],
    tags: [
      { name: 'מערכת' },
      { name: 'התחברות' },
      { name: 'קטגוריות' },
      { name: 'גלריה' },
      { name: 'חבילות' },
      { name: 'בקשות הזמנה' },
      { name: 'יצירת קשר' },
    ],
    paths,
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Token שמתקבל מ-/api/auth/login' },
      },
      schemas,
      responses,
    },
  };
}
