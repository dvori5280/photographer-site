import { execSync } from 'node:child_process';

export const TEST_DB_URL =
  process.env['TEST_DATABASE_URL'] ?? 'postgresql://app:app@localhost:5432/photog_test?schema=public';

// רץ פעם אחת לפני כל הבדיקות: מקים את מבנה הטבלאות במסד הבדיקות מתוך ה-migrations האמיתיים
export default function setup() {
  execSync('npx prisma migrate deploy', {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
  });
}
