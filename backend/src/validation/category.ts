import { z } from 'zod';
import { trimmed } from './common';

export const categorySchema = z.object({
  name: trimmed(2, 60, 'שם הקטגוריה'),
  description: z.string().trim().max(300, 'התיאור יכול להכיל עד 300 תווים').nullish(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
