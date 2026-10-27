import { prisma } from '../lib/prisma';
import { conflict, unauthorized } from '../lib/errors';
import { DUMMY_HASH, hashPassword, signAccessToken, verifyPassword } from '../lib/security';
import { serializeUser } from '../lib/serializers';
import type { LoginInput, RegisterInput } from '../validation/auth';

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw conflict('EMAIL_TAKEN', 'כתובת האימייל כבר רשומה במערכת');

  // תפקיד ההרשמה הציבורית הוא תמיד CUSTOMER, בלי קשר למה שנשלח
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: 'CUSTOMER',
    },
  });
  return { user: serializeUser(user), accessToken: signAccessToken(user.id, user.role) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const ok = await verifyPassword(input.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw unauthorized('INVALID_CREDENTIALS', 'אימייל או סיסמה שגויים');
  return { user: serializeUser(user), accessToken: signAccessToken(user.id, user.role) };
}
