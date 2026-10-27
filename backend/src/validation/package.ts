import { z } from 'zod';
import { boolQuery, httpUrl, idSchema, moneySchema, trimmed } from './common';

export const packageSchema = z.object({
  name: trimmed(2, 80, 'שם החבילה'),
  description: trimmed(2, 1000, 'תיאור'),
  categoryId: idSchema,
  basePrice: moneySchema,
  durationMinutes: z
    .number({ error: 'משך הצילום חייב להיות מספר' })
    .int('משך הצילום חייב להיות מספר שלם')
    .min(1, 'משך הצילום חייב להיות גדול מאפס')
    .max(1440, 'משך הצילום לא יכול לעבור 1440 דקות'),
  includedItems: z
    .array(trimmed(1, 100, 'פריט'), { error: 'includedItems חייב להיות מערך' })
    .min(1, 'יש להוסיף לפחות פריט אחד לחבילה')
    .max(30, 'אפשר להוסיף עד 30 פריטים'),
  imageUrl: httpUrl('כתובת התמונה').nullish(),
  isActive: z.boolean({ error: 'isActive חייב להיות true או false' }).optional(),
});

export const publicPackagesQuery = z.object({
  categoryId: idSchema.optional(),
  sort: z.enum(['price_asc', 'price_desc']).optional(),
});

export const adminPackagesQuery = z.object({
  categoryId: idSchema.optional(),
  isActive: boolQuery.optional(),
});

export type PackageInput = z.infer<typeof packageSchema>;
