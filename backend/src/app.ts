import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { buildOpenApiDocument } from './docs/openapi';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { createApiRouter, type RateLimitConfig } from './routes';

export interface AppOptions {
  corsOrigins?: string;
  rateLimits?: Partial<RateLimitConfig>;
}

export function createApp(options: AppOptions = {}): Express {
  const app = express();

  // מאחורי ה-Proxy של Render כתובת ה-IP האמיתית מגיעה בכותרת
  if (env.NODE_ENV === 'production') app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // זהו שרת JSON, ולכן לא מפעילים CSP שמפריע לממשק Swagger
  app.use(helmet({ contentSecurityPolicy: false }));

  const origins = (options.corsOrigins ?? env.CORS_ORIGINS)
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.use(cors({ origin: origins.includes('*') ? true : origins }));

  app.use(express.json({ limit: '100kb' }));
  if (env.NODE_ENV !== 'test') app.use(requestLogger);

  const limits: RateLimitConfig = {
    contactMax: env.CONTACT_RATE_LIMIT_MAX,
    contactWindowMinutes: env.CONTACT_RATE_LIMIT_WINDOW_MINUTES,
    authMax: env.AUTH_RATE_LIMIT_MAX,
    authWindowMinutes: env.AUTH_RATE_LIMIT_WINDOW_MINUTES,
    ...options.rateLimits,
  };
  app.use('/api', createApiRouter(limits));

  // תיעוד Swagger
  const doc = buildOpenApiDocument();
  app.get('/openapi.json', (_req, res) => {
    res.json(doc);
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(doc, { customSiteTitle: 'API – אתר צלמת' }));

  app.get('/', (_req, res) => {
    res.json({ data: { name: 'photographer-backend', docs: '/api-docs', health: '/api/health' } });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
