import { z } from 'zod';
import { emailSchema, trimmed } from './common';

export const registerSchema = z.object({
  name: trimmed(2, 80, 'שם'),
  email: emailSchema,
  password: z
    .string({ error: 'סיסמה היא שדה חובה' })
    .min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים')
    .max(64, 'הסיסמה יכולה להכיל עד 64 תווים'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: 'סיסמה היא שדה חובה' }).min(1, 'סיסמה היא שדה חובה').max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
