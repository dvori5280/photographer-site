import type { Request, Response } from 'express';
import { idParams } from '../validation/common';
import {
  adminBookingsQuery,
  createBookingSchema,
  myBookingsQuery,
  updateBookingStatusSchema,
} from '../validation/booking';
import * as service from '../services/bookingService';

export async function create(req: Request, res: Response) {
  const input = createBookingSchema.parse(req.body);
  res.status(201).json({ data: await service.createBooking(req.user!.id, input) });
}

export async function listMine(req: Request, res: Response) {
  res.json({ data: await service.listMyBookings(req.user!.id, myBookingsQuery.parse(req.query)) });
}

export async function getMine(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  res.json({ data: await service.getMyBooking(req.user!.id, id) });
}

export async function listAdmin(req: Request, res: Response) {
  res.json({ data: await service.listAdminBookings(adminBookingsQuery.parse(req.query)) });
}

export async function updateStatus(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const { status } = updateBookingStatusSchema.parse(req.body);
  res.json({ data: await service.updateBookingStatus(id, status) });
}
