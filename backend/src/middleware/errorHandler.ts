import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'הנתיב המבוקש לא נמצא' } });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'הנתונים שנשלחו אינם תקינים',
        details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      },
    });
    return;
  }

  // JSON שבור בגוף הבקשה
  if (typeof err === 'object' && err !== null && (err as { type?: string }).type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'INVALID_JSON', message: 'גוף הבקשה אינו JSON תקין' } });
    return;
  }
  if (typeof err === 'object' && err !== null && (err as { type?: string }).type === 'entity.too.large') {
    res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'גוף הבקשה גדול מדי' } });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'הרשומה לא נמצאה' } });
      return;
    }
    if (err.code === 'P2002') {
      res.status(409).json({ error: { code: 'ALREADY_EXISTS', message: 'כבר קיימת רשומה עם ערך זהה' } });
      return;
    }
    if (err.code === 'P2003') {
      res.status(409).json({
        error: { code: 'RELATED_RECORDS', message: 'לא ניתן לבצע את הפעולה בגלל רשומות קשורות' },
      });
      return;
    }
  }

  if (process.env['NODE_ENV'] !== 'test') {
    console.error('שגיאה לא צפויה:', err);
  }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'אירעה שגיאה בשרת' } });
};
