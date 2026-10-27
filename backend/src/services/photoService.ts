import { prisma } from '../lib/prisma';
import { badRequest, notFound } from '../lib/errors';
import { serializePhoto } from '../lib/serializers';
import { toDate } from '../validation/common';
import type { PhotoInput } from '../validation/photo';

const include = { category: { select: { id: true, name: true } } } as const;
const order = [{ takenAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }] as const;

async function assertCategory(categoryId: string) {
  const cat = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!cat) throw badRequest('CATEGORY_NOT_FOUND', 'הקטגוריה שנבחרה לא קיימת');
}

export async function listPublicPhotos(filter: { categoryId?: string | undefined }) {
  const rows = await prisma.photo.findMany({
    where: { isPublished: true, ...(filter.categoryId ? { categoryId: filter.categoryId } : {}) },
    include,
    orderBy: [...order],
  });
  return rows.map(serializePhoto);
}

export async function getPublicPhoto(id: string) {
  const row = await prisma.photo.findFirst({ where: { id, isPublished: true }, include });
  if (!row) throw notFound('PHOTO_NOT_FOUND', 'התמונה לא נמצאה');
  return serializePhoto(row);
}

export async function listAdminPhotos(filter: {
  categoryId?: string | undefined;
  isPublished?: boolean | undefined;
}) {
  const rows = await prisma.photo.findMany({
    where: {
      ...(filter.categoryId ? { categoryId: filter.categoryId } : {}),
      ...(filter.isPublished !== undefined ? { isPublished: filter.isPublished } : {}),
    },
    include,
    orderBy: [...order],
  });
  return rows.map(serializePhoto);
}

export async function createPhoto(input: PhotoInput) {
  await assertCategory(input.categoryId);
  const row = await prisma.photo.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      imageUrl: input.imageUrl,
      takenAt: input.takenAt ? toDate(input.takenAt) : null,
      isPublished: input.isPublished ?? true,
      categoryId: input.categoryId,
    },
    include,
  });
  return serializePhoto(row);
}

export async function updatePhoto(id: string, input: PhotoInput) {
  const existing = await prisma.photo.findUnique({ where: { id } });
  if (!existing) throw notFound('PHOTO_NOT_FOUND', 'התמונה לא נמצאה');
  await assertCategory(input.categoryId);
  const row = await prisma.photo.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      takenAt: input.takenAt === undefined ? undefined : input.takenAt ? toDate(input.takenAt) : null,
      isPublished: input.isPublished,
      categoryId: input.categoryId,
    },
    include,
  });
  return serializePhoto(row);
}

export async function deletePhoto(id: string) {
  const existing = await prisma.photo.findUnique({ where: { id } });
  if (!existing) throw notFound('PHOTO_NOT_FOUND', 'התמונה לא נמצאה');
  await prisma.photo.delete({ where: { id } });
}
