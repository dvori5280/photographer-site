import type { BookingStatus, EventType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { notFound } from '../lib/errors';
import { serializeBooking } from '../lib/serializers';
import { toDate } from '../validation/common';
import type { CreateBookingInput } from '../validation/booking';

const packageRef = { select: { id: true, name: true } } as const;
const customerInclude = { package: packageRef } as const;
const adminInclude = { package: packageRef, user: { select: { id: true, name: true, email: true } } } as const;

export async function createBooking(userId: string, input: CreateBookingInput) {
  const pkg = await prisma.package.findFirst({ where: { id: input.packageId, isActive: true } });
  if (!pkg) throw notFound('PACKAGE_NOT_FOUND', 'החבילה שנבחרה לא קיימת או אינה פעילה');

  const row = await prisma.bookingRequest.create({
    data: {
      userId, // נקבע מהטוקן, לא מהלקוחה
      packageId: pkg.id,
      requestedDate: toDate(input.requestedDate),
      eventType: input.eventType,
      location: input.location,
      phone: input.phone,
      notes: input.notes ?? null,
      status: 'NEW',
      priceAtRequest: pkg.basePrice, // נשמר המחיר של רגע השליחה
    },
    include: customerInclude,
  });
  return serializeBooking(row);
}

export async function listMyBookings(userId: string, filter: { status?: BookingStatus | undefined }) {
  const rows = await prisma.bookingRequest.findMany({
    where: { userId, ...(filter.status ? { status: filter.status } : {}) },
    include: customerInclude,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(serializeBooking);
}

export async function getMyBooking(userId: string, id: string) {
  // בקשה של לקוחה אחרת מחזירה 404 ולא 403, כדי לא לחשוף שהיא קיימת
  const row = await prisma.bookingRequest.findFirst({ where: { id, userId }, include: customerInclude });
  if (!row) throw notFound('BOOKING_NOT_FOUND', 'בקשת ההזמנה לא נמצאה');
  return serializeBooking(row);
}

export async function listAdminBookings(filter: {
  status?: BookingStatus | undefined;
  eventType?: EventType | undefined;
}) {
  const rows = await prisma.bookingRequest.findMany({
    where: {
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.eventType ? { eventType: filter.eventType } : {}),
    },
    include: adminInclude,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(serializeBooking);
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const existing = await prisma.bookingRequest.findUnique({ where: { id } });
  if (!existing) throw notFound('BOOKING_NOT_FOUND', 'בקשת ההזמנה לא נמצאה');
  const row = await prisma.bookingRequest.update({ where: { id }, data: { status }, include: adminInclude });
  return serializeBooking(row);
}
