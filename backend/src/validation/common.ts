import { z } from 'zod';

export const idSchema = z.uuid({ message: 'מזהה לא תקין' });
export const idParams = z.object({ id: idSchema });

export const trimmed = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} הוא שדה חובה` })
    .trim()
    .min(min, `${label} חייב להכיל לפחות ${min} תווים`)
    .max(max, `${label} יכול להכיל עד ${max} תווים`);

export const emailSchema = z
  .string({ error: 'אימייל הוא שדה חובה' })
  .trim()
  .toLowerCase()
  .max(254, 'האימייל ארוך מדי')
  .pipe(z.email('כתובת אימייל לא תקינה'));

export const httpUrl = (label: string) =>
  z
    .string({ error: `${label} הוא שדה חובה` })
    .trim()
    .max(2000, `${label} ארוך מדי`)
    .refine((v) => {
      try {
        const u = new URL(v);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        return false;
      }
    }, `${label} חייב להיות כתובת http או https תקינה`);

// תאריך בפורמט YYYY-MM-DD שהוא תאריך אמיתי בלוח
export const dateString = (label: string) =>
  z
    .string({ error: `${label} הוא שדה חובה` })
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} חייב להיות בפורמט YYYY-MM-DD`)
    .refine((v) => {
      const d = new Date(`${v}T00:00:00.000Z`);
      return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
    }, `${label} אינו תאריך תקין`);

export const todayInIsrael = (): string =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });

export const toDate = (v: string): Date => new Date(`${v}T00:00:00.000Z`);

// טלפון ישראלי: 0501234567, 050-1234567, 02-1234567, +972501234567
export const phoneSchema = z
  .string({ error: 'טלפון הוא שדה חובה' })
  .trim()
  .max(20, 'מספר הטלפון ארוך מדי')
  .refine((v) => /^(0|\+972)\d{8,9}$/.test(v.replace(/[-\s]/g, '')), 'מספר טלפון לא תקין');

export const boolQuery = z.enum(['true', 'false']).transform((v) => v === 'true');

// מחיר עד שתי ספרות אחרי הנקודה
export const moneySchema = z
  .number({ error: 'מחיר חייב להיות מספר' })
  .positive('המחיר חייב להיות גדול מאפס')
  .max(1_000_000, 'המחיר גבוה מדי')
  .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, 'המחיר יכול לכלול עד שתי ספרות אחרי הנקודה');
