import { Prisma, type PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/security';

export interface SeedOptions {
  isProduction: boolean;
  adminEmail?: string | undefined;
  adminPassword?: string | undefined;
  adminName?: string | undefined;
  demoData: boolean;
  demoCustomerPassword?: string | undefined;
  log?: (msg: string) => void;
}

const DEV_ADMIN_PASSWORD = 'Admin12345!';
const DEV_CUSTOMER_PASSWORD = 'Customer12345!';

export async function seed(prisma: PrismaClient, opts: SeedOptions): Promise<void> {
  const log = opts.log ?? (() => undefined);

  // 1. המנהלת
  const adminEmail = (opts.adminEmail ?? 'admin@example.com').trim().toLowerCase();
  const adminPassword = opts.adminPassword || (opts.isProduction ? undefined : DEV_ADMIN_PASSWORD);
  if (!adminPassword) {
    throw new Error('בפרודקשן חובה להגדיר SEED_ADMIN_PASSWORD (סיסמה חזקה שרק את מכירה)');
  }
  if (opts.isProduction && adminPassword.length < 10) {
    throw new Error('SEED_ADMIN_PASSWORD קצרה מדי. בפרודקשן נדרשות לפחות 10 תווים');
  }
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: opts.adminName ?? 'מנהלת האתר',
        email: adminEmail,
        passwordHash: await hashPassword(adminPassword),
        role: 'ADMIN',
      },
    });
    log(`נוצרה מנהלת: ${adminEmail}`);
  } else {
    log(`המנהלת ${adminEmail} כבר קיימת, לא שונתה`);
  }

  if (!opts.demoData) return;

  // 2. נתוני הדגמה. מומצאים בלבד, ולא נוצרים שוב אם כבר יש תוכן
  if ((await prisma.photo.count()) > 0 || (await prisma.package.count()) > 0) {
    log('כבר יש תמונות או חבילות, לא מוסיפה נתוני הדגמה');
    return;
  }

  const names = ['חתונות', 'אירועים משפחתיים', 'בר/בת מצווה', 'פורטרט'];
  const cats: Record<string, string> = {};
  for (const name of names) {
    const c = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, description: `קטגוריית ${name}` },
    });
    cats[name] = c.id;
  }
  const cat = (n: string): string => cats[n] as string;
  const img = (seedName: string) => `https://picsum.photos/seed/${seedName}/800/600`;

  const photos: Array<[string, string, string, string, boolean]> = [
    ['חופה בשקיעה', 'חתונות', 'chuppah', '2026-06-10', true],
    ['ריקוד ראשון', 'חתונות', 'dance', '2026-06-10', true],
    ['שולחן החתן והכלה', 'חתונות', 'table', '2026-07-02', true],
    ['שבת חתן', 'אירועים משפחתיים', 'shabbat', '2026-05-21', true],
    ['ארוחת חג משפחתית', 'אירועים משפחתיים', 'family', '2026-04-05', true],
    ['אלבום בת מצווה', 'בר/בת מצווה', 'album', '2026-03-18', true],
    ['פורטרט בגן', 'פורטרט', 'garden', '2026-08-09', true],
    ['תמונה בטיוטה', 'פורטרט', 'draft', '2026-09-01', false],
  ];
  for (const [title, c, s, day, published] of photos) {
    await prisma.photo.create({
      data: {
        title,
        description: `${title} (תמונה לדוגמה)`,
        imageUrl: img(s),
        takenAt: new Date(`${day}T00:00:00.000Z`),
        isPublished: published,
        categoryId: cat(c),
      },
    });
  }

  const packages: Array<[string, string, string, number, number, string[], boolean]> = [
    ['חתונה מלאה', 'חתונות', 'ליווי מלא מההכנות ועד הריקודים', 6500, 480, ['500 תמונות ערוכות', 'אלבום דיגיטלי', 'גלריה אונליין'], true],
    ['חתונה מצומצמת', 'חתונות', 'צילום החופה והאירוע המרכזי', 3800, 240, ['250 תמונות ערוכות', 'גלריה אונליין'], true],
    ['אירוע משפחתי', 'אירועים משפחתיים', 'צילום אירוע משפחתי עד 3 שעות', 1500, 180, ['120 תמונות ערוכות'], true],
    ['אלבום בת מצווה', 'בר/בת מצווה', 'סשן צילום ואלבום מעוצב', 2200, 120, ['60 תמונות ערוכות', 'אלבום מודפס'], true],
    ['צילומי פורטרט', 'פורטרט', 'סשן פורטרט קצר בחוץ', 600, 60, ['30 תמונות ערוכות'], true],
    ['חבילה ישנה', 'פורטרט', 'חבילה שהושבתה', 450, 45, ['20 תמונות ערוכות'], false],
  ];
  const createdPackages: Record<string, string> = {};
  for (const [name, c, description, price, minutes, items, active] of packages) {
    const p = await prisma.package.create({
      data: {
        name,
        description,
        categoryId: cat(c),
        basePrice: new Prisma.Decimal(price),
        durationMinutes: minutes,
        includedItems: items,
        imageUrl: img(name.replace(/\s/g, '')),
        isActive: active,
      },
    });
    createdPackages[name] = p.id;
  }

  const customerPassword = opts.demoCustomerPassword || (opts.isProduction ? undefined : DEV_CUSTOMER_PASSWORD);
  if (customerPassword) {
    const customer = await prisma.user.upsert({
      where: { email: 'customer@example.com' },
      update: {},
      create: {
        name: 'לקוחה לדוגמה',
        email: 'customer@example.com',
        passwordHash: await hashPassword(customerPassword),
        role: 'CUSTOMER',
      },
    });
    const future = (days: number) => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() + days);
      return new Date(`${d.toISOString().slice(0, 10)}T00:00:00.000Z`);
    };
    await prisma.bookingRequest.createMany({
      data: [
        {
          userId: customer.id,
          packageId: createdPackages['חתונה מלאה'] as string,
          requestedDate: future(120),
          eventType: 'FAMILY',
          location: 'ירושלים',
          phone: '050-1234567',
          notes: 'בקשה לדוגמה',
          status: 'NEW',
          priceAtRequest: new Prisma.Decimal(6500),
        },
        {
          userId: customer.id,
          packageId: createdPackages['אלבום בת מצווה'] as string,
          requestedDate: future(60),
          eventType: 'CHALLAH_PHOTOSHOOT',
          location: 'בני ברק',
          phone: '052-7654321',
          status: 'IN_PROGRESS',
          priceAtRequest: new Prisma.Decimal(2200),
        },
      ],
    });
    log('נוצרה לקוחה לדוגמה: customer@example.com');
  } else {
    log('לא הוגדרה SEED_DEMO_CUSTOMER_PASSWORD, לא נוצרה לקוחה לדוגמה');
  }

  await prisma.contactMessage.createMany({
    data: [
      { name: 'דינה לוי', email: 'dina@example.com', phone: '052-7654321', subject: 'שאלה על מחירים', message: 'שלום, אשמח לקבל פרטים על צילומי חלאקה.' },
      { name: 'רחל כהן', email: 'rachel@example.com', subject: 'זמינות בחודש הבא', message: 'האם יש מקום פנוי לצילום משפחתי בחודש הבא?', status: 'HANDLED' },
    ],
  });
  log('נוספו נתוני הדגמה');
}
