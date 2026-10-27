import type { ContactStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { notFound } from '../lib/errors';
import { serializeMessage } from '../lib/serializers';
import type { ContactInput } from '../validation/contact';

export async function createMessage(input: ContactInput) {
  const row = await prisma.contactMessage.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      subject: input.subject,
      message: input.message,
    },
  });
  // לא מחזירים את כל ההודעה לשולח אלמוני
  return { id: row.id, createdAt: row.createdAt };
}

export async function listMessages(filter: { status?: ContactStatus | undefined }) {
  const rows = await prisma.contactMessage.findMany({
    where: filter.status ? { status: filter.status } : {},
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(serializeMessage);
}

export async function updateMessageStatus(id: string, status: ContactStatus) {
  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) throw notFound('MESSAGE_NOT_FOUND', 'ההודעה לא נמצאה');
  const row = await prisma.contactMessage.update({ where: { id }, data: { status } });
  return serializeMessage(row);
}
