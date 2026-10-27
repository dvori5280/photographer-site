import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Role } from '@prisma/client';
import { TokenExpiredError } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { forbidden, unauthorized } from '../lib/errors';
import { verifyAccessToken } from '../lib/security';
import { idSchema } from '../validation/common';

// מזהה את המשתמשת לפי ה-Token בלבד (Authorization: Bearer ...).
// התפקיד נקרא מחדש ממסד הנתונים, כך ששינוי תפקיד או מחיקת משתמשת נכנסים לתוקף מיד.
export const authenticate: RequestHandler = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw unauthorized('TOKEN_MISSING', 'נדרשת התחברות');
  }
  const token = header.slice('Bearer '.length).trim();

  let sub: string;
  try {
    sub = verifyAccessToken(token).sub;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw unauthorized('TOKEN_EXPIRED', 'תוקף ההתחברות פג, יש להתחבר מחדש');
    }
    throw unauthorized('TOKEN_INVALID', 'ההתחברות אינה תקינה');
  }

  if (!idSchema.safeParse(sub).success) {
    throw unauthorized('TOKEN_INVALID', 'ההתחברות אינה תקינה');
  }
  const user = await prisma.user.findUnique({
    where: { id: sub },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) {
    throw unauthorized('TOKEN_INVALID', 'ההתחברות אינה תקינה');
  }
  req.user = user;
  next();
};

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) throw unauthorized('TOKEN_MISSING', 'נדרשת התחברות');
    if (!roles.includes(req.user.role)) throw forbidden();
    next();
  };

export const requireAdmin = requireRole('ADMIN');
export const requireCustomer = requireRole('CUSTOMER');
