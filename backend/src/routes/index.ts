import { Router } from 'express';
import * as auth from '../controllers/authController';
import * as booking from '../controllers/bookingController';
import * as category from '../controllers/categoryController';
import * as contact from '../controllers/contactController';
import { health } from '../controllers/healthController';
import * as pkg from '../controllers/packageController';
import * as photo from '../controllers/photoController';
import { authenticate, requireAdmin, requireCustomer } from '../middleware/auth';
import { createLimiter } from '../middleware/rateLimit';

export interface RateLimitConfig {
  contactMax: number;
  contactWindowMinutes: number;
  authMax: number;
  authWindowMinutes: number;
}

export function createApiRouter(limits: RateLimitConfig): Router {
  const r = Router();

  const contactLimiter = createLimiter({
    max: limits.contactMax,
    windowMinutes: limits.contactWindowMinutes,
    message: 'נשלחו יותר מדי הודעות. נסי שוב מאוחר יותר',
  });
  const authLimiter = createLimiter({
    max: limits.authMax,
    windowMinutes: limits.authWindowMinutes,
    message: 'יותר מדי ניסיונות התחברות. נסי שוב מאוחר יותר',
  });

  // בריאות
  r.get('/health', health);

  // התחברות
  r.post('/auth/register', authLimiter, auth.register);
  r.post('/auth/login', authLimiter, auth.login);
  r.get('/auth/me', authenticate, auth.me);

  // קטגוריות
  r.get('/categories', category.list);
  r.post('/categories', authenticate, requireAdmin, category.create);
  r.put('/categories/:id', authenticate, requireAdmin, category.update);
  r.delete('/categories/:id', authenticate, requireAdmin, category.remove);

  // גלריה
  r.get('/photos', photo.listPublic);
  r.get('/photos/:id', photo.getPublic);
  r.post('/photos', authenticate, requireAdmin, photo.create);
  r.put('/photos/:id', authenticate, requireAdmin, photo.update);
  r.delete('/photos/:id', authenticate, requireAdmin, photo.remove);
  r.get('/admin/photos', authenticate, requireAdmin, photo.listAdmin);

  // חבילות
  r.get('/packages', pkg.listPublic);
  r.get('/packages/:id', pkg.getPublic);
  r.post('/packages', authenticate, requireAdmin, pkg.create);
  r.put('/packages/:id', authenticate, requireAdmin, pkg.update);
  r.delete('/packages/:id', authenticate, requireAdmin, pkg.remove);
  r.get('/admin/packages', authenticate, requireAdmin, pkg.listAdmin);

  // בקשות הזמנה
  r.post('/bookings', authenticate, requireCustomer, booking.create);
  r.get('/bookings/my', authenticate, requireCustomer, booking.listMine);
  r.get('/bookings/my/:id', authenticate, requireCustomer, booking.getMine);
  r.get('/admin/bookings', authenticate, requireAdmin, booking.listAdmin);
  r.patch('/admin/bookings/:id/status', authenticate, requireAdmin, booking.updateStatus);

  // יצירת קשר
  r.post('/contact', contactLimiter, contact.create);
  r.get('/admin/messages', authenticate, requireAdmin, contact.listAdmin);
  r.patch('/admin/messages/:id/status', authenticate, requireAdmin, contact.updateStatus);

  return r;
}
