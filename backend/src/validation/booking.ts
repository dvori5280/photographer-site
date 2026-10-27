import { BookingStatus, EventType } from '@prisma/client';
import { z } from 'zod';
import { dateString, idSchema, phoneSchema, todayInIsrael, trimmed } from './common';

export const createBookingSchema = z.object({
  packageId: idSchema,
  requestedDate: dateString('התאריך המבוקש').refine(
    (v) => v >= todayInIsrael(),
    'התאריך המבוקש לא יכול להיות בעבר',
  ),
  eventType: z.enum(EventType, { error: 'סוג האירוע לא תקין' }),
  location: trimmed(2, 120, 'מיקום'),
  phone: phoneSchema,
  notes: z.string().trim().max(1000, 'ההערות יכולות להכיל עד 1000 תווים').nullish(),
});

export const myBookingsQuery = z.object({
  status: z.enum(BookingStatus, { error: 'סטטוס לא תקין' }).optional(),
});

export const adminBookingsQuery = z.object({
  status: z.enum(BookingStatus, { error: 'סטטוס לא תקין' }).optional(),
  eventType: z.enum(EventType, { error: 'סוג האירוע לא תקין' }).optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(BookingStatus, { error: 'סטטוס לא תקין' }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
