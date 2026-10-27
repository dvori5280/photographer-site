import rateLimit from 'express-rate-limit';

export function createLimiter(options: { windowMinutes: number; max: number; message: string }) {
  return rateLimit({
    windowMs: options.windowMinutes * 60 * 1000,
    limit: options.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ error: { code: 'TOO_MANY_REQUESTS', message: options.message } });
    },
  });
}
