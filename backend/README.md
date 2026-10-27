# Backend – אתר תדמית וקטלוג לצלמת

שרת API לאתר תדמית וקטלוג של צלמת: גלריית תמונות, חבילות צילום, בקשות הזמנה והודעות יצירת קשר.
כולל התחברות עם JWT, שני תפקידים (לקוחה ומנהלת), מסד נתונים PostgreSQL, תיעוד Swagger ובדיקות אוטומטיות.

> **רוצה להעלות לאינטרנט?** פתחי את **[START-HERE.md](START-HERE.md)**. ההוראות שם מיועדות למי שמעולם לא העלתה שרת.
> **כותבת את ה-React?** פתחי את **[docs/FRONTEND-API-GUIDE.md](docs/FRONTEND-API-GUIDE.md)**.

## טכנולוגיות

Node.js 22 (LTS), Express 5, TypeScript במצב strict, PostgreSQL, Prisma ORM 6, Zod 4 (ולידציה), JWT (jsonwebtoken), bcryptjs (גיבוב סיסמאות, אלגוריתם bcrypt), Swagger UI (OpenAPI 3.1), Vitest + Supertest, npm.

## מבנה התיקיות

```
src/
  config/        קריאה ובדיקה של משתני סביבה
  routes/        הגדרת הנתיבים וההרשאות לכל נתיב
  controllers/   קבלת בקשה, ולידציה, החזרת תגובה
  services/      הלוגיקה העסקית והגישה למסד
  validation/    סכמות Zod
  middleware/    אימות טוקן, הרשאות, שגיאות, הגבלת קצב
  lib/           Prisma, JWT והצפנה, שגיאות, מעצבי תגובה
  docs/          מסמך OpenAPI (Swagger)
  seed/          נתוני פתיחה
  app.ts         הרכבת האפליקציה
  server.ts      הפעלת השרת
prisma/          schema.prisma ו-migrations
tests/           בדיקות אוטומטיות
docs/            openapi.json, מדריך ל-React
```

## הרצה מקומית

דרישות: Node.js 20 ומעלה (מומלץ 22 LTS) ומסד PostgreSQL. הכי פשוט להשתמש במסד חינמי בענן (ראי START-HERE.md, חלק ב׳), בלי להתקין PostgreSQL במחשב.

```bash
npm install
cp .env.example .env      # ב-Windows: copy .env.example .env
# ערכי את .env: לפחות DATABASE_URL ו-JWT_SECRET
npx prisma generate       # מכין את החיבור למסד (גם רץ אוטומטית אחרי npm install)
npx prisma migrate deploy # יוצר את הטבלאות
npm run seed              # מנהלת ונתוני הדגמה
npm run dev               # השרת על http://localhost:3000
```

- בריאות: http://localhost:3000/api/health
- Swagger: http://localhost:3000/api-docs

### משתמשות לדוגמה (פיתוח מקומי בלבד)

כש-`NODE_ENV` אינו `production` ולא הוגדרו סיסמאות ב-`.env`:

| תפקיד | אימייל | סיסמה |
| --- | --- | --- |
| מנהלת | admin@example.com | Admin12345! |
| לקוחה | customer@example.com | Customer12345! |

בפרודקשן אין סיסמאות קבועות. הסיסמה של המנהלת חייבת להיות מוגדרת במשתנה סביבה (`SEED_ADMIN_PASSWORD`), אחרת ההפעלה נעצרת.

## משתני סביבה

| משתנה | חובה | תיאור |
| --- | --- | --- |
| `DATABASE_URL` | כן | כתובת החיבור ל-PostgreSQL |
| `JWT_SECRET` | כן | מפתח לחתימת טוקנים. בפרודקשן לפחות 32 תווים |
| `JWT_EXPIRES_IN` | לא | תוקף טוקן. ברירת מחדל `7d` |
| `CORS_ORIGINS` | לא | כתובות ה-React המורשות, מופרדות בפסיק (`*` לפיתוח בלבד) |
| `PORT` | לא | ברירת מחדל 3000. בענן נקבע אוטומטית |
| `NODE_ENV` | לא | `development`, `test` או `production` |
| `CONTACT_RATE_LIMIT_MAX` / `_WINDOW_MINUTES` | לא | מגבלת הודעות יצירת קשר ל-IP. ברירת מחדל 5 לשעה |
| `AUTH_RATE_LIMIT_MAX` / `_WINDOW_MINUTES` | לא | מגבלת התחברות והרשמה ל-IP. ברירת מחדל 30 ל-15 דקות |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` | בפרודקשן: הסיסמה | פרטי המנהלת שנוצרת בהפעלה |
| `SEED_DEMO_DATA` | לא | `true` ליצירת קטגוריות, תמונות וחבילות לדוגמה |
| `SEED_DEMO_CUSTOMER_PASSWORD` | לא | סיסמת הלקוחה לדוגמה. בפרודקשן בלעדיה היא לא נוצרת |

## פקודות

| פקודה | מה היא עושה |
| --- | --- |
| `npm run dev` | שרת פיתוח עם הפעלה מחדש אוטומטית |
| `npm run build` | `prisma generate` ואז קומפילציה לתיקיית `dist` |
| `npm start` | מפעיל את `dist` (אחרי build) |
| `npm run start:prod` | migrations, seed ואז הפעלה. זה מה שרץ בענן |
| `npm run typecheck` | בדיקת טיפוסים |
| `npm test` | הרצת הבדיקות |
| `npm run seed` | נתוני פתיחה |
| `npm run openapi:export` | כותב `docs/openapi.json` |

## בדיקות

הבדיקות רצות מול מסד PostgreSQL **נפרד** ומנקות אותו בין בדיקה לבדיקה, ולכן לעולם אל תפני אותן למסד האמיתי.
הגדירי מסד בדיקות ריק במשתנה `TEST_DATABASE_URL` (ברירת המחדל: `postgresql://app:app@localhost:5432/photog_test`).
לפני הרצה הן מקימות את הטבלאות באמצעות `prisma migrate deploy`.

```bash
TEST_DATABASE_URL="postgresql://..." npm test
```

הבדיקות מכסות: הרשמה והתחברות, טוקן חסר, משובש, פג תוקף או מזויף, הרשאות מנהלת ולקוחה לכל נתיב, CRUD, ולידציה, חיפוש וסינון, מניעת גישה לבקשות של לקוחה אחרת, שמירת מחיר בעת בקשה, הגבלת קצב, CORS, Seed, תיעוד Swagger ותקינות סכמת Prisma מול ה-migrations.

## אבטחה

- סיסמאות נשמרות רק כ-Hash (bcrypt). Hash וסיסמאות לעולם לא חוזרים ב-API.
- הלקוחה מזוהה לפי הטוקן בלבד. `userId` ומחיר הבקשה נקבעים בשרת.
- התפקיד נקרא בכל בקשה ממסד הנתונים. הרשמה ציבורית יוצרת רק CUSTOMER.
- כל קלט מאומת עם Zod בצד השרת.
- בקשה של לקוחה אחרת מחזירה 404, כדי לא לחשוף שהיא קיימת.
- הגבלת קצב להתחברות, הרשמה וטופס יצירת קשר.
- אין סודות בקוד. ‏`.env` לא נכלל ב-Git.
