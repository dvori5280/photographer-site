import { ContactStatus } from '@prisma/client';
import { z } from 'zod';
import { emailSchema, phoneSchema, trimmed } from './common';

export const contactSchema = z.object({
  name: trimmed(2, 80, 'שם'),
  email: emailSchema,
  // מחרוזת ריקה נחשבת כאילו לא נשלח טלפון
  phone: z.preprocess((v) => (v === '' ? undefined : v), phoneSchema.nullish()),
  subject: trimmed(2, 100, 'נושא'),
  message: trimmed(10, 2000, 'ההודעה'),
});

export const adminMessagesQuery = z.object({
  status: z.enum(ContactStatus, { error: 'סטטוס לא תקין' }).optional(),
});

export const updateMessageStatusSchema = z.object({
  status: z.enum(ContactStatus, { error: 'סטטוס לא תקין' }),
});

export type ContactInput = z.infer<typeof contactSchema>;
