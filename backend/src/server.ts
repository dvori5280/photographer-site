import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`השרת פועל על פורט ${env.PORT}`);
  console.log(`תיעוד Swagger: /api-docs`);
});

async function shutdown(signal: string) {
  console.log(`התקבל ${signal}, סוגר את השרת...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
