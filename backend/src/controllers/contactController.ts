import type { Request, Response } from 'express';
import { idParams } from '../validation/common';
import { adminMessagesQuery, contactSchema, updateMessageStatusSchema } from '../validation/contact';
import * as service from '../services/contactService';

export async function create(req: Request, res: Response) {
  res.status(201).json({ data: await service.createMessage(contactSchema.parse(req.body)) });
}

export async function listAdmin(req: Request, res: Response) {
  res.json({ data: await service.listMessages(adminMessagesQuery.parse(req.query)) });
}

export async function updateStatus(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const { status } = updateMessageStatusSchema.parse(req.body);
  res.json({ data: await service.updateMessageStatus(id, status) });
}
