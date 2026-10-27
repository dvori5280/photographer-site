import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function health(_req: Request, res: Response) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ data: { status: 'ok', database: 'up', time: new Date().toISOString() } });
  } catch {
    res.status(503).json({ data: { status: 'error', database: 'down', time: new Date().toISOString() } });
  }
}
