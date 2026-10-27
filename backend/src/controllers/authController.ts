import type { Request, Response } from 'express';
import { serializeUser } from '../lib/serializers';
import * as authService from '../services/authService';
import { loginSchema, registerSchema } from '../validation/auth';

export async function register(req: Request, res: Response) {
  const result = await authService.register(registerSchema.parse(req.body));
  res.status(201).json({ data: result });
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(loginSchema.parse(req.body));
  res.status(200).json({ data: result });
}

export function me(req: Request, res: Response) {
  // authenticate כבר טען את המשתמשת מהטוקן
  res.status(200).json({ data: { user: serializeUser(req.user!) } });
}
