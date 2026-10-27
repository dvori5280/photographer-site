# מדריך חיבור ה־React לשרת

המדריך מיועד לך, שכותבת את ה־React בעצמה. הוא מסביר **מה לשלוח ומה מתקבל** בכל נתיב. הוא לא מכיל קוד React: את הקומפוננטות, ה־Hooks, הטפסים והניתוב את כותבת בעצמך.

התיעוד המלא והניתן לניסוי נמצא בשרת עצמו: `<BASE_URL>/api-docs`.

---

## 1. כתובת השרת (Base URL)

| סביבה | כתובת |
| --- | --- |
| פיתוח מקומי | `http://localhost:3000` |
| ענן (Render) | `https://<השם-שלך>.onrender.com` (מופיעה בראש עמוד השירות ב־Render) |

כל הנתיבים מתחילים ב־`/api`, למשל `GET <BASE_URL>/api/photos`.

**מומלץ:** שמרי את הכתובת במשתנה סביבה של פרויקט ה־React (ב־Vite: `VITE_API_URL`), כדי שלא תצטרכי לשנות קוד כשעוברים מפיתוח לענן.

**CORS:** השרת מקבל בקשות רק מכתובות שמוגדרות ב־`CORS_ORIGINS`. ב־Vite הכתובת המקומית הרגילה היא `http://localhost:5173`, והיא מוגדרת כברירת מחדל. כשהאתר עולה לענן, יש להוסיף את כתובתו (START-HERE.md, חלק ה׳).

**שרת רדום:** בשרת חינמי בענן הבקשה הראשונה אחרי הפסקה ארוכה יכולה לקחת כדקה. הציגי מצב טעינה ואל תציגי שגיאה מיד.

---

## 2. פורמט התגובות

**הצלחה:** תמיד עטיפה בשם `data`:
```json
{ "data": { ... } }
```
(מחיקה מחזירה 204 בלי גוף.)

**שגיאה:** תמיד בפורמט הזה:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "הנתונים שנשלחו אינם תקינים",
    "details": [{ "field": "email", "message": "כתובת אימייל לא תקינה" }]
  }
}
```
- `message` תמיד בעברית ואפשר להציג אותו למשתמשת.
- `code` הוא מזהה קבוע באנגלית שאפשר להשוות אליו בקוד.
- `details` מופיע רק בשגיאות ולידציה (400). `field` הוא שם השדה בטופס, ואפשר להציג את `message` ליד השדה המתאים.

### קודי סטטוס

| קוד | משמעות | מה לעשות בצד הלקוח |
| --- | --- | --- |
| 200 | הצלחה | להציג את `data` |
| 201 | נוצר | להציג הודעת הצלחה |
| 204 | נמחק, בלי תוכן | לרענן את הרשימה |
| 400 | קלט לא תקין | להציג את `details` ליד השדות |
| 401 | אין טוקן, או שהוא לא תקין או שפג תוקפו | למחוק את הטוקן השמור ולהעביר להתחברות |
| 403 | אין הרשאה | להציג "אין לך הרשאה" |
| 404 | לא נמצא | להציג "לא נמצא" |
| 409 | התנגשות (אימייל קיים, קטגוריה בשימוש וכו׳) | להציג את `message` |
| 429 | יותר מדי בקשות | להציג "נסי שוב מאוחר יותר" |
| 500 | תקלה בשרת | להציג הודעה כללית |

### קודי שגיאה (`error.code`) שכדאי להכיר

`VALIDATION_ERROR`, `INVALID_JSON`, `TOKEN_MISSING`, `TOKEN_INVALID`, `TOKEN_EXPIRED`, `INVALID_CREDENTIALS`, `FORBIDDEN`, `EMAIL_TAKEN`, `NAME_TAKEN`, `CATEGORY_NOT_FOUND`, `CATEGORY_IN_USE`, `PHOTO_NOT_FOUND`, `PACKAGE_NOT_FOUND`, `PACKAGE_HAS_BOOKINGS`, `BOOKING_NOT_FOUND`, `MESSAGE_NOT_FOUND`, `TOO_MANY_REQUESTS`, `NOT_FOUND`, `INTERNAL_ERROR`.

---

## 3. התחברות (Authentication)

1. הלקוחה נרשמת (`POST /api/auth/register`) או מתחברת (`POST /api/auth/login`).
2. בתגובה היא מקבלת `accessToken` (JWT) שתקף ל־**7 ימים**.
3. בכל בקשה לנתיב מוגן שולחים כותרת:
   ```
   Authorization: Bearer <accessToken>
   ```
4. כשהשרת מחזיר 401 צריך למחוק את הטוקן ולהעביר את המשתמשת להתחברות.

**איפה לשמור את הטוקן?** האפשרות הפשוטה היא `localStorage`, והיא מספיקה לפרויקט לימודי (אבל היא חשופה אם יש באתר פרצת XSS). ב־React Query או ב־Context תוכלי לשמור את מצב ההתחברות כדי שיעדכן את הממשק.

**איך יודעים אם המשתמשת מנהלת או לקוחה?** בשדה `user.role` שבתגובת ה־Login וה־`/api/auth/me`: הערך הוא `CUSTOMER` או `ADMIN`. אפשר להשתמש בו כדי להציג או להסתיר חלקים בממשק, אבל **ההרשאה האמיתית נבדקת בשרת** וה־React לא יכול לעקוף אותה.

**שחזור התחברות אחרי רענון דף:** אם יש טוקן שמור, אפשר לקרוא ל־`GET /api/auth/me` כדי לקבל את פרטי המשתמשת, ואם מתקבל 401 לנקות את הטוקן.

---

## 4. טבלת כל הנתיבים

| Method | URL | מי רשאית | תיאור |
| --- | --- | --- | --- |
| GET | `/api/health` | כולם | בדיקת פעילות |
| POST | `/api/auth/register` | כולם | הרשמת לקוחה |
| POST | `/api/auth/login` | כולם | התחברות |
| GET | `/api/auth/me` | מחוברת | פרטי המשתמשת |
| GET | `/api/categories` | כולם | רשימת קטגוריות |
| POST | `/api/categories` | מנהלת | הוספה |
| PUT | `/api/categories/:id` | מנהלת | עריכה |
| DELETE | `/api/categories/:id` | מנהלת | מחיקה (רק קטגוריה ריקה) |
| GET | `/api/photos?categoryId=` | כולם | תמונות מפורסמות |
| GET | `/api/photos/:id` | כולם | תמונה מפורסמת אחת |
| GET | `/api/admin/photos?categoryId=&isPublished=` | מנהלת | כל התמונות |
| POST | `/api/photos` | מנהלת | הוספה |
| PUT | `/api/photos/:id` | מנהלת | עריכה, הסתרה ופרסום |
| DELETE | `/api/photos/:id` | מנהלת | מחיקה |
| GET | `/api/packages?categoryId=&sort=` | כולם | חבילות פעילות |
| GET | `/api/packages/:id` | כולם | חבילה פעילה אחת |
| GET | `/api/admin/packages?categoryId=&isActive=` | מנהלת | כל החבילות |
| POST | `/api/packages` | מנהלת | הוספה |
| PUT | `/api/packages/:id` | מנהלת | עריכה, הפעלה והשבתה |
| DELETE | `/api/packages/:id` | מנהלת | מחיקה (רק אם אין בקשות) |
| POST | `/api/bookings` | לקוחה | שליחת בקשת הזמנה |
| GET | `/api/bookings/my?status=` | לקוחה | הבקשות שלי |
| GET | `/api/bookings/my/:id` | לקוחה | בקשה אחת שלי |
| GET | `/api/admin/bookings?status=&eventType=` | מנהלת | כל הבקשות |
| PATCH | `/api/admin/bookings/:id/status` | מנהלת | עדכון סטטוס |
| POST | `/api/contact` | כולם | שליחת הודעת יצירת קשר |
| GET | `/api/admin/messages?status=` | מנהלת | הודעות שהתקבלו |
| PATCH | `/api/admin/messages/:id/status` | מנהלת | עדכון סטטוס הודעה |

**הערות:**
- כל `:id` הוא מזהה UUID, מחרוזת כמו `3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90`.
- נתיב מנהלת שנשלח בלי טוקן מחזיר 401, ועם טוקן של לקוחה מחזיר 403.
- ב־`PUT` שולחים **את כל השדות החובה** (כמו ביצירה), לא רק את מה שהשתנה. זה מתאים לטופס עריכה שמתמלא מראש בערכים הקיימים.
- ב־`PUT` שדה אופציונלי שלא נשלח **נשאר כפי שהיה**. כדי לרוקן שדה אופציונלי שולחים `null`.

---

## 5. מבני הנתונים

### משתמשת (`user`)
| שדה | טיפוס | הערה |
| --- | --- | --- |
| `id` | מחרוזת (UUID) | |
| `name` | מחרוזת | |
| `email` | מחרוזת | |
| `role` | `"CUSTOMER"` או `"ADMIN"` | |
| `createdAt` | מחרוזת תאריך ISO | |

### קטגוריה (`category`)
| שדה | טיפוס |
| --- | --- |
| `id` | מחרוזת (UUID) |
| `name` | מחרוזת |
| `description` | מחרוזת או `null` |

### תמונה (`photo`)
| שדה | טיפוס | הערה |
| --- | --- | --- |
| `id` | מחרוזת | |
| `title` | מחרוזת | |
| `description` | מחרוזת או `null` | |
| `imageUrl` | מחרוזת | כתובת התמונה להצגה ב־`img` |
| `takenAt` | `"YYYY-MM-DD"` או `null` | תאריך הצילום |
| `isPublished` | בוליאני | |
| `category` | `{ id, name }` | |
| `createdAt`, `updatedAt` | מחרוזת תאריך ISO | |

### חבילה (`package`)
| שדה | טיפוס | הערה |
| --- | --- | --- |
| `id` | מחרוזת | |
| `name` | מחרוזת | |
| `description` | מחרוזת | |
| `basePrice` | **מספר** | מחיר בשקלים, למשל `6500` או `1234.5` |
| `durationMinutes` | מספר שלם | משך הצילום בדקות. אפשר להציג כשעות |
| `includedItems` | מערך של מחרוזות | מה כלול בחבילה |
| `imageUrl` | מחרוזת או `null` | |
| `isActive` | בוליאני | |
| `category` | `{ id, name }` | |
| `createdAt`, `updatedAt` | מחרוזת תאריך ISO | |

### בקשת הזמנה (`booking`)
| שדה | טיפוס | הערה |
| --- | --- | --- |
| `id` | מחרוזת | |
| `requestedDate` | `"YYYY-MM-DD"` | |
| `eventType` | ראי טבלת סוגי אירוע | |
| `location` | מחרוזת | |
| `phone` | מחרוזת | |
| `notes` | מחרוזת או `null` | |
| `status` | ראי טבלת סטטוסים | |
| `priceAtRequest` | **מספר** | המחיר שנקבע ברגע השליחה. לא משתנה אם מחיר החבילה משתנה אחר כך |
| `package` | `{ id, name }` | |
| `customer` | `{ id, name, email }` | **רק בתגובות של מנהלת** (`/api/admin/bookings`) |
| `createdAt`, `updatedAt` | מחרוזת תאריך ISO | |

### הודעת יצירת קשר (`message`, למנהלת)
`id`, `name`, `email`, `phone` (או `null`), `subject`, `message`, `status` (`"NEW"` או `"HANDLED"`), `createdAt`.

### ערכים קבועים והתרגום המוצע לעברית

**סוגי אירוע (`eventType`)**

| ערך לשליחה | להצגה |
| --- | --- |
| `NEWBORN` | צילומי ניו בורן |
| `SMASH_CAKE` | סמאש קייק |
| `CHALLAH_PHOTOSHOOT` | צילומי חלאקה |
| `FAMILY` | צילומי משפחות |

**סטטוסי בקשת הזמנה (`status`)**

| ערך | להצגה |
| --- | --- |
| `NEW` | חדשה |
| `IN_PROGRESS` | בטיפול |
| `APPROVED` | אושרה |
| `REJECTED` | נדחתה |
| `CANCELLED` | בוטלה |

**סטטוסי הודעה:** `NEW` = חדשה, `HANDLED` = טופלה.

---

## 6. הנתיבים לכל מסך

### מסכים ציבוריים

| מסך | נתיבים | הערות |
| --- | --- | --- |
| דף בית | `GET /api/photos` (להציג כמה ראשונות), `GET /api/packages?sort=price_asc` | אפשר לחתוך את הרשימה בצד הלקוח |
| אודות | אין נתיב | תוכן סטטי שאת כותבת |
| גלריה | `GET /api/categories` (לכפתורי הסינון), `GET /api/photos`, `GET /api/photos?categoryId=<id>` | הסינון מתבצע בשרת |
| חבילות | `GET /api/categories`, `GET /api/packages?categoryId=<id>&sort=price_asc` או `price_desc` | מיון לפי מחיר |
| פרטי חבילה | `GET /api/packages/:id` | 404 אם החבילה לא פעילה |
| צור קשר | `POST /api/contact` | פתוח בלי התחברות |

### מסכי משתמשת

| מסך | נתיבים |
| --- | --- |
| הרשמה | `POST /api/auth/register` (מחזיר גם טוקן, כך שאפשר להתחבר ישר) |
| התחברות | `POST /api/auth/login` |
| שליחת בקשת הזמנה | `GET /api/packages` (לבחירת חבילה), `POST /api/bookings` |
| אזור אישי | `GET /api/bookings/my`, אפשר `?status=` לסינון |
| פרטי בקשה | `GET /api/bookings/my/:id` |

### מסכי ניהול (מנהלת)

| מסך | נתיבים |
| --- | --- |
| ניהול קטגוריות | `GET /api/categories`, `POST`, `PUT /:id`, `DELETE /:id` |
| ניהול גלריה | `GET /api/admin/photos` (כולל לא מפורסמות), `POST /api/photos`, `PUT /api/photos/:id`, `DELETE /api/photos/:id` |
| ניהול חבילות | `GET /api/admin/packages`, `POST /api/packages`, `PUT /api/packages/:id`, `DELETE /api/packages/:id` |
| בקשות הזמנה | `GET /api/admin/bookings?status=&eventType=`, `PATCH /api/admin/bookings/:id/status` |
| הודעות | `GET /api/admin/messages?status=`, `PATCH /api/admin/messages/:id/status` |

---

## 7. טפסים: שדות, חובה והגבלות

השרת בודק הכול. כדאי לבדוק את אותם כללים גם ב־React (למשל ב־React Hook Form) כדי לתת משוב מהיר, אבל גם כשהבדיקה בצד הלקוח עוברת, השרת רשאי לדחות.

### הרשמה: `POST /api/auth/register`
| שדה | חובה | כללים |
| --- | --- | --- |
| `name` | כן | 2 עד 80 תווים |
| `email` | כן | כתובת אימייל תקינה. נשמרת באותיות קטנות |
| `password` | כן | 8 עד 64 תווים |

```json
{ "name": "שרה כהן", "email": "sara@example.com", "password": "Passw0rd!" }
```
הצלחה (201):
```json
{ "data": { "user": { "id": "…", "name": "שרה כהן", "email": "sara@example.com", "role": "CUSTOMER", "createdAt": "…" }, "accessToken": "eyJhbGciOi…" } }
```
שגיאות: 409 `EMAIL_TAKEN` אם האימייל כבר רשום.
שימי לב: אי אפשר להירשם כמנהלת. אם תשלחי `role`, השרת יתעלם ממנו.

### התחברות: `POST /api/auth/login`
| שדה | חובה |
| --- | --- |
| `email` | כן |
| `password` | כן |

הצלחה (200): אותה תגובה כמו בהרשמה. שגיאה: 401 `INVALID_CREDENTIALS` ("אימייל או סיסמה שגויים"). אחרי יותר מדי ניסיונות (30 ב־15 דקות מאותה כתובת) מתקבל 429.

### בקשת הזמנה: `POST /api/bookings` (לקוחה מחוברת)
| שדה | חובה | כללים |
| --- | --- | --- |
| `packageId` | כן | UUID של חבילה פעילה |
| `requestedDate` | כן | `"YYYY-MM-DD"`, היום או בעתיד |
| `eventType` | כן | אחד מהערכים בטבלת סוגי האירוע |
| `location` | כן | 2 עד 120 תווים |
| `phone` | כן | טלפון ישראלי: `0501234567`, `050-1234567`, `02-5551234` או `+972501234567` |
| `notes` | לא | עד 1000 תווים |

```json
{
  "packageId": "8b1d6f20-2c4e-4a77-b3d1-6a9e0c5f1e42",
  "requestedDate": "2027-03-14",
  "eventType": "FAMILY",
  "location": "גן אירועים, ירושלים",
  "phone": "050-1234567",
  "notes": "מבקשת צילום גם בהכנות"
}
```
הצלחה (201): `booking` עם `status: "NEW"` ו־`priceAtRequest`. **אין צורך** לשלוח `userId`, מחיר או סטטוס. השרת קובע אותם, ושליחתם לא תשפיע.
שגיאות: 404 `PACKAGE_NOT_FOUND` (חבילה לא קיימת או לא פעילה), 403 אם מחוברת מנהלת, 401 אם לא מחוברת.
**חשוב להסביר למשתמשת:** זו **בקשה** ולא הזמנה מאושרת. הצלמת תחזור אליה, והסטטוס יתעדכן.

### יצירת קשר: `POST /api/contact` (פתוח לכולם)
| שדה | חובה | כללים |
| --- | --- | --- |
| `name` | כן | 2 עד 80 תווים |
| `email` | כן | כתובת תקינה |
| `phone` | לא | טלפון ישראלי. מחרוזת ריקה או `null` נחשבים כלא נשלח |
| `subject` | כן | 2 עד 100 תווים |
| `message` | כן | 10 עד 2000 תווים |

הצלחה (201): `{ "data": { "id": "…", "createdAt": "…" } }`. מגבלה: 5 הודעות לשעה מכל כתובת, ואחריהן 429.

### קטגוריה: `POST` ו־`PUT /api/categories`
| שדה | חובה | כללים |
| --- | --- | --- |
| `name` | כן | 2 עד 60 תווים, ייחודי |
| `description` | לא | עד 300 תווים |

שגיאות: 409 `NAME_TAKEN`. מחיקה: 409 `CATEGORY_IN_USE` אם יש בקטגוריה תמונות או חבילות.

### תמונה: `POST` ו־`PUT /api/photos`
| שדה | חובה | כללים |
| --- | --- | --- |
| `title` | כן | 2 עד 80 תווים |
| `description` | לא | עד 500 תווים |
| `imageUrl` | כן | כתובת `http` או `https` תקינה. השרת **לא** מקבל קבצים, רק כתובת |
| `takenAt` | לא | `"YYYY-MM-DD"` |
| `isPublished` | לא | `true` או `false`. ברירת מחדל `true` ביצירה |
| `categoryId` | כן | UUID של קטגוריה קיימת (400 `CATEGORY_NOT_FOUND` אם לא קיימת) |

```json
{
  "title": "חופה בשקיעה",
  "description": "חופה בגינה",
  "imageUrl": "https://picsum.photos/seed/chuppah/800/600",
  "takenAt": "2026-06-10",
  "isPublished": true,
  "categoryId": "8b1d6f20-2c4e-4a77-b3d1-6a9e0c5f1e42"
}
```
**הסתרת תמונה:** `PUT` עם `isPublished: false`. אחרי זה היא נעלמת מהגלריה הציבורית ונשארת ברשימת המנהלת.

### חבילה: `POST` ו־`PUT /api/packages`
| שדה | חובה | כללים |
| --- | --- | --- |
| `name` | כן | 2 עד 80 תווים |
| `description` | כן | 2 עד 1000 תווים |
| `categoryId` | כן | UUID של קטגוריה קיימת |
| `basePrice` | כן | **מספר** (לא מחרוזת) גדול מאפס, עד שתי ספרות אחרי הנקודה |
| `durationMinutes` | כן | מספר שלם בין 1 ל־1440 |
| `includedItems` | כן | מערך של 1 עד 30 מחרוזות (עד 100 תווים כל אחת) |
| `imageUrl` | לא | כתובת `http` או `https` |
| `isActive` | לא | `true` או `false`. ברירת מחדל `true` |

```json
{
  "name": "חבילת חתונה מלאה",
  "description": "ליווי מלא מההכנות ועד הריקודים",
  "categoryId": "8b1d6f20-2c4e-4a77-b3d1-6a9e0c5f1e42",
  "basePrice": 6500,
  "durationMinutes": 480,
  "includedItems": ["500 תמונות ערוכות", "אלבום דיגיטלי"],
  "isActive": true
}
```
מחיקה: 409 `PACKAGE_HAS_BOOKINGS` אם יש בקשות על החבילה. במקרה כזה משביתים אותה עם `PUT` ו־`isActive: false`.

### עדכון סטטוס: `PATCH /api/admin/bookings/:id/status` ו־`PATCH /api/admin/messages/:id/status`
גוף הבקשה: `{ "status": "APPROVED" }` (בהודעות: `"NEW"` או `"HANDLED"`). התגובה היא הרשומה המעודכנת.

---

## 8. דוגמאות תגובה

**רשימת חבילות** `GET /api/packages?sort=price_asc` (200):
```json
{
  "data": [
    {
      "id": "3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90",
      "name": "חתונה מלאה",
      "description": "ליווי מלא מההכנות ועד הריקודים",
      "basePrice": 6500,
      "durationMinutes": 480,
      "includedItems": ["500 תמונות ערוכות", "אלבום דיגיטלי"],
      "imageUrl": "https://picsum.photos/seed/wedding/800/600",
      "isActive": true,
      "category": { "id": "8b1d6f20-2c4e-4a77-b3d1-6a9e0c5f1e42", "name": "חתונות" },
      "createdAt": "2026-10-26T20:00:00.000Z",
      "updatedAt": "2026-10-26T20:00:00.000Z"
    }
  ]
}
```

**הבקשות שלי** `GET /api/bookings/my` (200):
```json
{
  "data": [
    {
      "id": "3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90",
      "requestedDate": "2027-03-14",
      "eventType": "FAMILY",
      "location": "גן אירועים, ירושלים",
      "phone": "050-1234567",
      "notes": null,
      "status": "NEW",
      "priceAtRequest": 6500,
      "package": { "id": "8b1d6f20-2c4e-4a77-b3d1-6a9e0c5f1e42", "name": "חתונה מלאה" },
      "createdAt": "2026-10-26T20:00:00.000Z",
      "updatedAt": "2026-10-26T20:00:00.000Z"
    }
  ]
}
```

**שגיאת ולידציה** (400):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "הנתונים שנשלחו אינם תקינים",
    "details": [
      { "field": "phone", "message": "מספר טלפון לא תקין" },
      { "field": "requestedDate", "message": "התאריך המבוקש לא יכול להיות בעבר" }
    ]
  }
}
```

**אין הרשאה** (403): `{ "error": { "code": "FORBIDDEN", "message": "אין לך הרשאה לבצע פעולה זו" } }`

---

## 9. הרשאות בקצרה

| פעולה | מבקר | לקוחה | מנהלת |
| --- | --- | --- | --- |
| לראות קטגוריות, תמונות מפורסמות וחבילות פעילות | כן | כן | כן |
| לשלוח הודעת יצירת קשר | כן | כן | כן |
| לשלוח בקשת הזמנה | לא (401) | כן | לא (403) |
| לראות בקשות הזמנה | לא | רק שלה | את כולן |
| לנהל קטגוריות, תמונות, חבילות, סטטוסים והודעות | לא | לא (403) | כן |

---

## 10. רשימת בדיקה לפני שאת מחברת מסך

1. פתחי את `/api-docs` ונסי את הנתיב במסך Swagger (עם Authorize כשצריך), וראי את התגובה האמיתית.
2. ודאי ששמות השדות ב־React זהים לשמות במדריך (באנגלית ובאותיות קטנות/גדולות כמו כאן).
3. שלחי `basePrice` כמספר ולא כמחרוזת, ותאריכים בפורמט `YYYY-MM-DD`.
4. טפלי בארבעה מצבים בכל מסך: טוען, שגיאה, ריק והצלחה.
5. על 401 תמיד נקי טוקן והעבירי להתחברות.
6. הציגי את `error.message` של השרת, ואת `details` ליד השדות בטפסים.
