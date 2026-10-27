import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL חסר'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET חייב להיות באורך 16 תווים לפחות'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000'),
  CONTACT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  CONTACT_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().positive().default(60),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  AUTH_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().positive().default(15),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`);
    throw new Error(`משתני סביבה לא תקינים:\n${lines.join('\n')}`);
  }
  if (parsed.data.NODE_ENV === 'production' && parsed.data.JWT_SECRET.length < 32) {
    throw new Error('בפרודקשן JWT_SECRET חייב להיות באורך 32 תווים לפחות');
  }
  return parsed.data;
}

export const env: Env = loadEnv();
