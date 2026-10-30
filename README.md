# אתר צלמת: מירי לבל

אתר תדמית וקטלוג לצלמת, עם אזור אישי ללקוחות ואזור ניהול. פרויקט גמר בקורס React.

## קישורים

- **האתר החי:** https://photographer-frontend-393a.onrender.com/
- **השרת (API):** https://photographer-backend-f0vm.onrender.com
- **תיעוד ה־API (Swagger):** https://photographer-backend-f0vm.onrender.com/api-docs
- **קוד המקור:** https://github.com/dvori5280/photographer-site

> **שימו לב:** האתר והשרת רצים על חבילה חינמית של Render. אחרי 15 דקות בלי פעילות השרת "נרדם", והבקשה הראשונה אחרי כן יכולה לקחת עד דקה. האתר מציג הודעה בזמן ההמתנה.

## מה באתר

**מבקרת:**
- דף בית, אודות, גלריית תמונות עם סינון לפי קטגוריה
- חבילות צילום עם סינון ומיון לפי מחיר, ודף פרטים לכל חבילה
- טופס יצירת קשר

**לקוחה (אחרי הרשמה והתחברות):**
- שליחת בקשת הזמנה לחבילה (המחיר נשמר ברגע הבקשה)
- "ההזמנות שלי": מעקב אחרי הבקשות והסטטוס שלהן

**מנהלת:**
- ניהול בקשות הזמנה: סינון לפי סטטוס וסוג אירוע, צפייה בפרטי הלקוחה, ושינוי סטטוס
- ניהול הודעות יצירת קשר: סימון הודעה כטופלה
- ניהול קטגוריות, חבילות ותמונות: הוספה, עריכה ומחיקה (חבילה שיש עליה בקשות מושבתת במקום להימחק)

**פרטי כניסה לבדיקה (מנהלת):** נשלח בנפרד

## טכנולוגיות

**אתר (frontend):** React, TypeScript, Vite, React Router, React Hook Form, React Query (TanStack), Context API (ניהול התחברות), Tailwind CSS

**שרת (backend):** Node.js, Express, TypeScript, Prisma

**מסד נתונים:** PostgreSQL (Supabase)

**פריסה:** Render (שרת ואתר סטטי), GitHub

## מבנה הפרויקט

```
photographer-site/
├── backend/          שרת Express + Prisma (28 נתיבי API)
└── frontend/
    └── src/
        ├── api/          קריאות לשרת (client.ts)
        ├── components/   רכיבים משותפים (Layout, FormField, טפסים ועוד)
        ├── context/      AuthContext: מצב התחברות
        ├── hooks/        React Query hooks
        ├── pages/        דפי האתר
        │   └── admin/    דפי אזור הניהול
        ├── types/        טיפוסים
        └── utils/        עיצוב ערכים ותרגומים
```

## הרצה מקומית

דרישות: Node.js, וקובץ `.env` בכל אחת מהתיקיות (לא נשמרים ב־GitHub).

**שרת:**
```
cd backend
npm install
npm run dev
```
רץ על פורט 3000.

**אתר:**
```
cd frontend
npm install
npm run dev
```
רץ על פורט 5173. בקובץ `.env` של האתר צריך: `VITE_API_URL=http://localhost:3000`

**בנייה לפריסה:** `npm run build` בתיקיית `frontend`.

## הערות

- התמונות באתר הן כתובות (URL) בלבד, אין העלאת קבצים.
- ההרשאות נבדקות בשרת: מנהלת רואה ומנהלת הכול, לקוחה רואה רק את הבקשות שלה.
- התקשורת עם השרת: הצלחה מחזירה `{ "data": ... }`, ושגיאה מחזירה `{ "error": { code, message } }`.