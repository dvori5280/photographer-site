import type {
  BookingRequest,
  Category,
  ContactMessage,
  Package,
  Photo,
  Prisma,
  User,
} from '@prisma/client';

const toDay = (d: Date | null): string | null => (d ? d.toISOString().slice(0, 10) : null);
const toNum = (d: Prisma.Decimal): number => d.toNumber();

export const serializeUser = (u: Pick<User, 'id' | 'name' | 'email' | 'role' | 'createdAt'>) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  createdAt: u.createdAt,
});

export const serializeCategory = (c: Category) => ({
  id: c.id,
  name: c.name,
  description: c.description,
});

type CatRef = { id: string; name: string };

export const serializePhoto = (p: Photo & { category: CatRef }) => ({
  id: p.id,
  title: p.title,
  description: p.description,
  imageUrl: p.imageUrl,
  takenAt: toDay(p.takenAt),
  isPublished: p.isPublished,
  category: { id: p.category.id, name: p.category.name },
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

export const serializePackage = (p: Package & { category: CatRef }) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  basePrice: toNum(p.basePrice),
  durationMinutes: p.durationMinutes,
  includedItems: p.includedItems,
  imageUrl: p.imageUrl,
  isActive: p.isActive,
  category: { id: p.category.id, name: p.category.name },
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

type BookingWithRelations = BookingRequest & {
  package: { id: string; name: string };
  user?: { id: string; name: string; email: string };
};

export const serializeBooking = (b: BookingWithRelations) => ({
  id: b.id,
  requestedDate: toDay(b.requestedDate),
  eventType: b.eventType,
  location: b.location,
  phone: b.phone,
  notes: b.notes,
  status: b.status,
  priceAtRequest: toNum(b.priceAtRequest),
  package: { id: b.package.id, name: b.package.name },
  ...(b.user ? { customer: { id: b.user.id, name: b.user.name, email: b.user.email } } : {}),
  createdAt: b.createdAt,
  updatedAt: b.updatedAt,
});

export const serializeMessage = (m: ContactMessage) => ({
  id: m.id,
  name: m.name,
  email: m.email,
  phone: m.phone,
  subject: m.subject,
  message: m.message,
  status: m.status,
  createdAt: m.createdAt,
});
