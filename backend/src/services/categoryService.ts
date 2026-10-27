import { prisma } from '../lib/prisma';
import { conflict, notFound } from '../lib/errors';
import { serializeCategory } from '../lib/serializers';
import type { CategoryInput } from '../validation/category';

async function assertNameFree(name: string, exceptId?: string) {
  const dup = await prisma.category.findUnique({ where: { name } });
  if (dup && dup.id !== exceptId) throw conflict('NAME_TAKEN', 'כבר קיימת קטגוריה בשם הזה');
}

export async function listCategories() {
  const rows = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return rows.map(serializeCategory);
}

export async function createCategory(input: CategoryInput) {
  await assertNameFree(input.name);
  const row = await prisma.category.create({
    data: { name: input.name, description: input.description ?? null },
  });
  return serializeCategory(row);
}

export async function updateCategory(id: string, input: CategoryInput) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw notFound('CATEGORY_NOT_FOUND', 'הקטגוריה לא נמצאה');
  await assertNameFree(input.name, id);
  const row = await prisma.category.update({
    where: { id },
    data: { name: input.name, description: input.description },
  });
  return serializeCategory(row);
}

export async function deleteCategory(id: string) {
  const existing = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { photos: true, packages: true } } },
  });
  if (!existing) throw notFound('CATEGORY_NOT_FOUND', 'הקטגוריה לא נמצאה');
  if (existing._count.photos > 0 || existing._count.packages > 0) {
    throw conflict('CATEGORY_IN_USE', 'לא ניתן למחוק קטגוריה שיש בה תמונות או חבילות');
  }
  await prisma.category.delete({ where: { id } });
}
