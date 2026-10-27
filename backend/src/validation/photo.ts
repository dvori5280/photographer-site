import { z } from 'zod';
import { boolQuery, dateString, httpUrl, idSchema, trimmed } from './common';

export const photoSchema = z.object({
  title: trimmed(2, 80, 'כותרת'),
  description: z.string().trim().max(500, 'התיאור יכול להכיל עד 500 תווים').nullish(),
  imageUrl: httpUrl('כתובת התמונה'),
  takenAt: dateString('תאריך הצילום').nullish(),
  isPublished: z.boolean({ error: 'isPublished חייב להיות true או false' }).optional(),
  categoryId: idSchema,
});

export const publicPhotosQuery = z.object({ categoryId: idSchema.optional() });

export const adminPhotosQuery = z.object({
  categoryId: idSchema.optional(),
  isPublished: boolQuery.optional(),
});

export type PhotoInput = z.infer<typeof photoSchema>;
