import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seed } from './seed';

async function main() {
  const prisma = new PrismaClient();
  const isProduction = process.env['NODE_ENV'] === 'production';
  try {
    await seed(prisma, {
      isProduction,
      adminEmail: process.env['SEED_ADMIN_EMAIL'],
      adminPassword: process.env['SEED_ADMIN_PASSWORD'],
      adminName: process.env['SEED_ADMIN_NAME'],
      demoData: (process.env['SEED_DEMO_DATA'] ?? (isProduction ? 'false' : 'true')) === 'true',
      demoCustomerPassword: process.env['SEED_DEMO_CUSTOMER_PASSWORD'],
      log: (m) => console.log(`[seed] ${m}`),
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[seed] נכשל:', err instanceof Error ? err.message : err);
  process.exit(1);
});
