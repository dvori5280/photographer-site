# START-HERE: איך מעלים את השרת לאינטרנט

מדריך לצעד־אחר־צעד, למי שמעולם לא העלתה שרת. אין צורך לדעת תכנות כדי לבצע אותו.

**מה נעשה:**
1. נעלה את הקבצים ל־**GitHub** (מקום לשמור את הקוד).
2. ניצור **מסד נתונים** חינמי ב־**Supabase** (המקום ששומר את המידע).
3. נפעיל את השרת ב־**Render**, שמריץ אותו באינטרנט.
4. נבדוק שהכול עובד.

> **הערה על כפתורים ושמות:** אתרי GitHub, Supabase ו־Render משנים את העיצוב מדי פעם. השמות שכתבתי כאן הם מה שהיה נכון בזמן הכתיבה (בדקתי את התיעוד של Render ושל Supabase, לא את הממשק עצמו). אם כפתור נראה קצת אחרת, חפשי כפתור בעל שם דומה. הערכים שצריך להקליד (פקודות, שמות משתנים) מדויקים לפרויקט הזה.

> **חשוב לדעת על המסלול החינמי:** שרת חינמי ב־Render **נרדם** אחרי 15 דקות בלי בקשות, והבקשה הראשונה אחרי השינה לוקחת כדקה. זה תקין. באתר ה־React כדאי להציג הודעת "טוען...". אין גישה לטרמינל בשרת החינמי, ולכן הפרויקט מריץ את יצירת הטבלאות ואת נתוני הפתיחה אוטומטית בכל הפעלה. זמינות והגבלות של מסלולים חינמיים משתנות, ובדקי את הדף של כל שירות לפני שאת מסתמכת עליהם.

---

## חלק 0: להריץ את השרת במחשב שלך (לפיתוח ה־React)

כדי לכתוב את ה־React צריך שרת שרץ. אפשר להשתמש בשרת שבענן (אחרי חלקים א׳–ג׳), או להריץ אותו אצלך:

1. התקיני **Node.js** גרסת **LTS** מ־nodejs.org (בחרי את הגרסה המסומנת LTS).
2. פתחי טרמינל בתיקיית הפרויקט (אחרי חילוץ ה־ZIP). ב־Windows: לחצי כפתור ימני בתיקייה ← "Open in Terminal".
3. הריצי:
   ```
   npm install
   ```
4. העתיקי את `.env.example` לקובץ חדש בשם `.env`. (Windows: `copy .env.example .env`. Mac: `cp .env.example .env`).
5. פתחי את `.env` בעורך טקסט ומלאי:
   - `DATABASE_URL`: את הכתובת ממסד הנתונים (חלק ב׳ למטה).
   - `JWT_SECRET`: מחרוזת ארוכה אקראית. אפשר ליצור אחת עם הפקודה:
     ```
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
6. הריצי **אחת אחרי השנייה** (עברי לבאה רק אם הקודמת הצליחה):
   ```
   npx prisma generate
   npx prisma migrate deploy
   npm run seed
   npm run dev
   ```
   (`prisma generate` מכין את החיבור למסד, `migrate deploy` יוצר את הטבלאות, `seed` מוסיף נתוני הדגמה, ו־`dev` מפעיל את השרת. אל תסגרי את הטרמינל כשהשרת רץ.)

   > ב־Windows, אם PowerShell מציג `running scripts is disabled`, הקלידי `cmd` ולחצי Enter כדי לעבור ל־Command Prompt, והריצי שם את הפקודות.
7. פתחי בדפדפן: http://localhost:3000/api-docs
   - במצב פיתוח נוצרות שתי משתמשות לדוגמה: מנהלת `admin@example.com` / `Admin12345!` ולקוחה `customer@example.com` / `Customer12345!`.
   - הכתובת של השרת עבור ה־React היא `http://localhost:3000`.

---

## חלק א׳: GitHub

### 1. לפתוח חשבון
1. היכנסי ל־**github.com** ולחצי **Sign up**.
2. הכניסי אימייל, סיסמה ושם משתמש, ואשרי את האימייל בקוד שיגיע אלייך.

### 2. ליצור Repository (תיקייה בענן)
1. אחרי ההתחברות, לחצי על **+** בפינה העליונה ובחרי **New repository**.
2. **Repository name:** `photographer-backend`
3. בחרי **Private** (פרטי). Render יוכל לגשת אליו אחרי שתתני לו הרשאה.
4. **אל תסמני** "Add a README file", "Add .gitignore" או "Choose a license". אנחנו רוצות Repository ריק.
5. לחצי **Create repository**.

### 3. לחלץ את ה־ZIP
- Windows: לחצי כפתור ימני על הקובץ ← **Extract All**.
- Mac: לחיצה כפולה על הקובץ.

בתוך התיקייה תראי: `src`, `prisma`, `tests`, `docs`, `scripts`, `package.json`, `package-lock.json`, `render.yaml`, `README.md`, `START-HERE.md` ועוד.

> **קבצים נסתרים:** הקבצים `.gitignore`, `.env.example` ו־`.node-version` מתחילים בנקודה, ולפעמים הם לא מוצגים. ב־Windows: בסייר הקבצים ← **View** ← סמני **Hidden items**. ב־Mac: לחצי `Command + Shift + .`. הם חשובים, ולכן ודאי שהם עולים.

### 4. להעלות את הקבצים דרך הדפדפן
1. בעמוד של ה־Repository הריק, לחצי על הקישור **uploading an existing file**.
2. פתחי את תיקיית הפרויקט, סמני **את כל מה שנמצא בתוכה** (`Ctrl + A`) וגררי לחלון בדפדפן. גררי את התוכן, לא את התיקייה עצמה.
3. חכי שההעלאה תסתיים. GitHub מגביל העלאה דרך הדפדפן לכ־100 קבצים בכל פעם. אם הוא מתלונן, העלי קודם את `src`, ואחר כך את השאר, כל אחד בנפרד.
4. בתחתית לחצי **Commit changes**.

> **לא להעלות:** `node_modules` ואת `.env`. הם לא נמצאים ב־ZIP, וגם אם יצרת אותם בעצמך, אל תעלי אותם. ב־`.env` יש סיסמאות.

### 5. לבדוק שהקבצים עלו
בעמוד ה־Repository ודאי שאת רואה את התיקיות `src`, `prisma`, `tests`, `docs`, ואת הקבצים `package.json`, `render.yaml`. פתחי את `src` ווודאי שיש בו תיקיות כמו `routes` ו־`services`. ודאי שאין קובץ בשם `.env`.

---

## חלק ב׳: מסד נתונים (Supabase)

Render מציע גם מסד חינמי, אבל לפי התיעוד שלו הוא **נמחק אחרי 30 יום**. לכן אני ממליץ על Supabase. (Neon הוא חלופה דומה. התהליך דומה, והקפידי להעתיק את כתובת החיבור הרגילה.)

### 1. לפתוח חשבון
היכנסי ל־**supabase.com** ← **Start your project** והירשמי (אפשר עם חשבון GitHub).

### 2. ליצור Database
1. לחצי **New project**.
2. **Name:** `photographer`.
3. **Database Password:** בחרי סיסמה חזקה והעדיפי **אותיות ומספרים בלבד** (בלי תווים מיוחדים כמו `@ : / ? #`, שמסבכים את כתובת החיבור). **שמרי אותה**, כי לא תוכלי לראות אותה שוב.
4. **Region:** בחרי אזור קרוב אלייך, למשל Frankfurt.
5. לחצי **Create new project** וחכי כמה דקות עד שהפרויקט מוכן.

### 3. לקבל את Connection String
1. בראש הפרויקט לחצי **Connect**.
2. בחרי את החיבור מסוג **Session pooler**. הכתובת שלו מסתיימת בפורט **5432**. לפי התיעוד של Supabase, זו הכתובת המומלצת לשרת רגיל, גם להרצת ה־migrations וגם לאפליקציה, והיא עובדת גם בלי IPv6.
3. העתיקי את הכתובת. היא נראית בערך כך:
   ```
   postgresql://postgres.xxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```
4. החליפי את `[YOUR-PASSWORD]` (כולל הסוגריים המרובעים) בסיסמה שבחרת.

### 4. לשמור בבטחה
- שמרי את הכתובת במקום פרטי (מנהל סיסמאות או פתק פרטי).
- **אסור** להכניס אותה לקוד, ל־GitHub או לצ׳אט.
- היא תוזן רק ב־Render (חלק ג׳) ובקובץ `.env` במחשב שלך.

### 5. לקשר לשרת
את הכתובת תדביקי בהמשך ב־Render בשדה `DATABASE_URL`. אין עוד מה לעשות כאן: הטבלאות נוצרות אוטומטית בהפעלה הראשונה של השרת.

> אם בהמשך יופיעה שגיאת SSL, הוסיפי לסוף הכתובת `?sslmode=require`. אם הכתובת כבר מכילה `?`, הוסיפי `&sslmode=require`.

---

## חלק ג׳: Render

### 1. לפתוח חשבון
היכנסי ל־**render.com** ← **Get Started** והירשמי עם **GitHub** (הכי פשוט, כי זה גם מחבר את GitHub).

### 2. לחבר את GitHub
אם Render מבקש הרשאה לגשת ל־GitHub, אשרי ובחרי לתת גישה ל־Repository `photographer-backend` (אפשר רק אליו).

### 3. אפשרות א׳ (מומלצת): Blueprint
1. בלוח הבקרה לחצי **New +** ← **Blueprint**.
2. בחרי את ה־Repository `photographer-backend` ולחצי **Connect**.
3. Render קורא את הקובץ `render.yaml`, ומציג שירות בשם `photographer-backend`.
4. Render ישאל אותך על ערכים של משתני סביבה. מלאי:

| משתנה | מה להכניס |
| --- | --- |
| `DATABASE_URL` | הכתובת מ־Supabase (עם הסיסמה שלך) |
| `CORS_ORIGINS` | כתובת אתר ה־React. עדיין אין? הקלידי `*` לעת עתה, ותחליפי בחלק ה׳ |
| `SEED_ADMIN_EMAIL` | האימייל שבו תתחברי כמנהלת |
| `SEED_ADMIN_PASSWORD` | סיסמה חזקה למנהלת (לפחות 10 תווים). **רק את מכירה אותה** |
| `SEED_DEMO_CUSTOMER_PASSWORD` | סיסמה ללקוחה לדוגמה (customer@example.com). אפשר להשאיר ריק, ואז היא לא תיווצר |

5. לחצי **Apply** (או **Deploy Blueprint**).

### 3. אפשרות ב׳: ידנית (אם אפשרות א׳ לא עובדת, או ביקשה פרטי תשלום)
1. **New +** ← **Web Service** ← בחרי את ה־Repository.
2. מלאי:
   - **Name:** `photographer-backend`
   - **Region:** Frankfurt
   - **Branch:** `main`
   - **Runtime / Language:** Node
   - **Build Command:** `npm ci --include=dev && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Instance Type:** Free
3. תחת **Environment Variables** (או "Advanced") הוסיפי:

| Key | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `22` |
| `DATABASE_URL` | הכתובת מ־Supabase |
| `JWT_SECRET` | מחרוזת אקראית של 32 תווים ומעלה. ראי את הפקודה בחלק 0, שלב 5 |
| `CORS_ORIGINS` | כתובת אתר ה־React, או `*` זמנית |
| `SEED_ADMIN_EMAIL` | האימייל שלך כמנהלת |
| `SEED_ADMIN_PASSWORD` | סיסמה חזקה, לפחות 10 תווים |
| `SEED_DEMO_DATA` | `true` |
| `SEED_DEMO_CUSTOMER_PASSWORD` | סיסמה ללקוחה לדוגמה, או השאירי ריק |

4. תחת **Health Check Path** הכניסי `/api/health`.
5. לחצי **Create Web Service**.

### 4. מה קורה בפריסה (Deploy)
Render מתקין, בונה ומפעיל. זה לוקח כמה דקות. בלשונית **Logs** אמורות להופיע, בין היתר, השורות:
```
[seed] נוצרה מנהלת: ...
השרת פועל על פורט ...
```
כשהסטטוס למעלה הופך ל־**Live**, השרת פעיל. הכתובת שלו מופיעה בראש העמוד, בערך `https://photographer-backend-xxxx.onrender.com`.

**מה מתבצע אוטומטית בכל הפעלה** (הפקודה `npm run start:prod`): הרצת ה־migrations שיוצרים את הטבלאות, יצירת המנהלת ונתוני ההדגמה אם חסרים (בלי ליצור כפילויות), והפעלת השרת על ה־PORT ש־Render קובע.

---

## חלק ד׳: בדיקה שהכול עובד

החליפי `YOUR-URL` בכתובת השרת שלך.

1. **בריאות:** פתחי `https://YOUR-URL/api/health`. צריך לראות `"status":"ok"` ו־`"database":"up"`. (אם השרת היה רדום, זה ייקח כדקה.)
2. **תיעוד:** פתחי `https://YOUR-URL/api-docs`. תראי את ממשק Swagger עם כל הנתיבים.
3. **התחברות מתוך Swagger:** לחצי על `POST /api/auth/login` ← **Try it out**, והכניסי:
   ```json
   { "email": "האימייל שהגדרת ב-SEED_ADMIN_EMAIL", "password": "הסיסמה שהגדרת ב-SEED_ADMIN_PASSWORD" }
   ```
   לחצי **Execute**.
4. **קבלת JWT:** בתגובה (קוד 200) העתיקי את הערך של `accessToken`, בלי המרכאות.
5. **Authorize:** לחצי על הכפתור **Authorize** בראש העמוד, הדביקי את הטוקן ולחצי **Authorize** ואז **Close**. אין צורך לכתוב `Bearer`.
6. **קריאה לנתיב מוגן:** נסי `GET /api/auth/me` ← **Execute**. צריך לראות את פרטי המנהלת. בלי Authorize תקבלי 401.
7. **הוספת רשומה:** `POST /api/categories` ← **Try it out** עם `{ "name": "קטגוריה חדשה" }` ← **Execute**. צריך לקבל 201.
8. **שליפה מהמסד:** `GET /api/categories` ← **Execute**. הקטגוריה שהוספת מופיעה ברשימה. זה מוכיח שהמידע נשמר במסד. (אפשר גם לראות אותו ב־Supabase, באזור של ה־Table Editor.)

---

## חלק ה׳: אחרי שאתר ה־React עלה

כשיש לאתר ה־React כתובת באינטרנט:
1. ב־Render פתחי את השירות ← **Environment**.
2. שני את `CORS_ORIGINS` לכתובת האתר, **בלי לוכסן בסוף**, למשל `https://my-site.netlify.app`. אפשר לכתוב כמה כתובות מופרדות בפסיק, למשל גם `http://localhost:5173` לפיתוח.
3. שמרי. Render יפעיל מחדש את השרת.

---

## חלק ו׳: פתרון תקלות

| תקלה | סיבה אפשרית | מה לעשות |
| --- | --- | --- |
| **Build Failed** | חסר קובץ ב־GitHub, או פקודת Build שגויה | בדקי ב־Logs מה השורה האדומה. ודאי ש־`package.json` ו־`package-lock.json` עלו, ושה־Build Command הוא `npm ci --include=dev && npm run build` |
| השרת עולה ונופל מיד, ב־Logs: `משתני סביבה לא תקינים` | חסר משתנה | הוסיפי את המשתנה שהשורה מציינת (למשל `JWT_SECRET`) ב־Environment |
| `בפרודקשן חובה להגדיר SEED_ADMIN_PASSWORD` | לא הוגדרה סיסמת מנהלת | הוסיפי `SEED_ADMIN_PASSWORD` (לפחות 10 תווים) |
| `JWT_SECRET` חסר או קצר | המפתח ריק או קצר מ־32 תווים | צרי מפתח חדש (חלק 0, שלב 5) והדביקי ב־Environment |
| **DATABASE_URL שגוי**: `P1001 Can't reach database server` או `P1000 Authentication failed` | כתובת שגויה, סיסמה שגויה, או נשארה `[YOUR-PASSWORD]` | פתחי שוב את Connect ב־Supabase, וודאי שבחרת **Session pooler** (פורט 5432) והחלפת את הסיסמה. סיסמה עם תווים מיוחדים: שני אותה לאותיות ומספרים ב־Supabase |
| **בעיית Prisma**: `P3009` או `P3018` ב־migrate | מסד ששימש בעבר לדבר אחר, או migration שנכשל באמצע | השתמשי במסד ריק. הכי פשוט ליצור פרויקט חדש ב־Supabase ולעדכן את `DATABASE_URL` |
| שגיאת Prisma על binary או `Query engine library` | התקנה לא מלאה | ב־Render לחצי **Manual Deploy** ← **Clear build cache & deploy** |
| **שגיאת CORS** בדפדפן: `blocked by CORS policy` | כתובת ה־React לא ב־`CORS_ORIGINS` | הוסיפי אותה בדיוק כפי שהיא מופיעה בדפדפן (כולל `https://`, בלי `/` בסוף) |
| **401** | אין טוקן, טוקן שגוי או שפג תוקפו (7 ימים) | התחברי שוב וקחי טוקן חדש. ב־Swagger ודאי שלחצת Authorize |
| **403** | המשתמשת מחוברת אבל לא מורשית. לדוגמה לקוחה שמנסה פעולת מנהלת | התחברי עם חשבון המנהלת |
| **429** | יותר מדי בקשות מאותה כתובת | חכי כמה דקות |
| **Swagger לא נפתח** | הכתובת חסרה `/api-docs`, או שהשרת רדום | פתחי `https://YOUR-URL/api-docs/` וחכי עד דקה. ודאי ש־`/api/health` עונה |
| **השרת לא עולה / "Application failed to respond"** | השרת לא מאזין ל־PORT של Render, או שנכשל בהפעלה | אל תשני את `src/server.ts`. פתחי Logs ובדקי את השגיאה הראשונה שמופיעה |
| בקשה ראשונה איטית מאוד | המסלול החינמי נרדם אחרי 15 דקות | זה תקין. הציגי באתר "טוען..." |
| `Swagger` מציג `Failed to fetch` | הכתובת ב־Servers לא תואמת | רענני את הדף. המסמך משתמש בכתובת של השרת עצמו |
| מסד Supabase חינמי לא מגיב | פרויקט חינמי עלול להיות מושהה בחוסר פעילות | היכנסי ל־Supabase ובדקי אם יש כפתור להפעלה מחדש (Restore / Resume) |

אם משהו אחר קרה, העתיקי את השורה האדומה הראשונה מה־Logs ושלחי אותה אליי, **בלי להעתיק סיסמאות או את DATABASE_URL**.
