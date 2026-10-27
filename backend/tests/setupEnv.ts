// נטען לפני כל קובץ בדיקה. כך הבדיקות לעולם לא נוגעות במסד הפיתוח
process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] =
  process.env['TEST_DATABASE_URL'] ?? 'postgresql://app:app@localhost:5432/photog_test?schema=public';
process.env['JWT_SECRET'] = 'test-secret-test-secret-test-secret-123456';
process.env['JWT_EXPIRES_IN'] = '1h';
process.env['CORS_ORIGINS'] = 'http://localhost:5173';
