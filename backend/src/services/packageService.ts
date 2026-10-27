import { prisma } from '../lib/prisma';
import { badRequest, conflict, notFound } from '../lib/errors';
import { serializePackage } from '../lib/serializers';
import type { PackageInput } from '../validation/package';

const include = { category: { select: { id: true, name: true } } } as const;

async function assertCategory(categoryId: string) {
  const cat = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!cat) throw badRequest('CATEGORY_NOT_FOUND', 'הקטגוריה שנבחרה לא קיימת');
}

export async function listPublicPackages(filter: {
  categoryId?: string | undefined;
  sort?: 'price_asc' | 'price_desc' | undefined;
}) {
  const rows = await prisma.package.findMany({
    where: { isActive: true, ...(filter.categoryId ? { categoryId: filter.categoryId } : {}) },
    include,
    orderBy:
      filter.sort === 'price_asc'
        ? { basePrice: 'asc' }
        : filter.sort === 'price_desc'
          ? { basePrice: 'desc' }
          : { createdAt: 'desc' },
  });
  return rows.map(serializePackage);
}

export async function getPublicPackage(id: string) {
  const row = await prisma.package.findFirst({ where: { id, isActive: true }, include });
  if (!row) throw notFound('PACKAGE_NOT_FOUND', 'החבילה לא נמצאה');
  return serializePackage(row);
}

export async function listAdminPackages(filter: {
  categoryId?: string | undefined;
  isActive?: boolean | undefined;
}) {
  const rows = await prisma.package.findMany({
    where: {
      ...(filter.categoryId ? { categoryId: filter.categoryId } : {}),
      ...(filter.isActive !== undefined ? { isActive: filter.isActive } : {}),
    },
    include,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(serializePackage);
}

export async function createPackage(input: PackageInput) {
  await assertCategory(input.categoryId);
  const row = await prisma.package.create({
    data: {
      name: input.name,
      description: input.description,
      categoryId: input.categoryId,
      basePrice: input.basePrice,
      durationMinutes: input.durationMinutes,
      includedItems: input.includedItems,
      imageUrl: input.imageUrl ?? null,
      isActive: input.isActive ?? true,
    },
    include,
  });
  return serializePackage(row);
}

export async function updatePackage(id: string, input: PackageInput) {
  const existing = await prisma.package.findUnique({ where: { id } });
  if (!existing) throw notFound('PACKAGE_NOT_FOUND', 'החבילה לא נמצאה');
  await assertCategory(input.categoryId);
  const row = await prisma.package.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      categoryId: input.categoryId,
      basePrice: input.basePrice,
      durationMinutes: input.durationMinutes,
      includedItems: input.includedItems,
      imageUrl: input.imageUrl,
      isActive: input.isActive,
    },
    include,
  });
  return serializePackage(row);
}

export async function deletePackage(id: string) {
  const existing = await prisma.package.findUnique({
    where: { id },
    include: { _count: { select: { bookings: true } } },
  });
  if (!existing) throw notFound('PACKAGE_NOT_FOUND', 'החבילה לא נמצאה');
  if (existing._count.bookings > 0) {
    throw conflict('PACKAGE_HAS_BOOKINGS', 'לא ניתן למחוק חבילה שיש עליה בקשות הזמנה. אפשר להשבית אותה במקום');
  }
  await prisma.package.delete({ where: { id } });
}
