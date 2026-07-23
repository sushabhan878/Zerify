import { PrismaClient, UserRole, VipType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed VIP Access Waitlist entries
  const vipEntries = [
    { email: 'sarah.fashion@example.com', type: VipType.INFLUENCER },
    { email: 'glow.skincare@brand.com', type: VipType.BRAND },
    { email: 'alex.tech@example.com', type: VipType.INFLUENCER },
    { email: 'horizon.apparel@brand.com', type: VipType.BRAND },
  ];

  for (const entry of vipEntries) {
    await prisma.vipAccess.upsert({
      where: { email: entry.email },
      update: {},
      create: {
        email: entry.email,
        type: entry.type,
      },
    });
  }

  console.log(`✅ Seeded ${vipEntries.length} VIP Access entries.`);

  // 2. Seed Mock Brand User & Profile
  const brandUser = await prisma.user.upsert({
    where: { email: 'demo.brand@zerify.com' },
    update: {},
    create: {
      email: 'demo.brand@zerify.com',
      role: UserRole.BRAND,
      brandProfile: {
        create: {
          companyName: 'Lumina Skincare Co.',
          website: 'https://luminaskincare.com',
        },
      },
    },
  });

  console.log(`✅ Seeded Brand User: ${brandUser.email}`);

  // 3. Seed Mock Influencer User & Profile
  const creatorUser = await prisma.user.upsert({
    where: { email: 'demo.creator@zerify.com' },
    update: {},
    create: {
      email: 'demo.creator@zerify.com',
      role: UserRole.INFLUENCER,
      influencer: {
        create: {
          handle: '@elena_ugc',
          platform: 'TikTok',
          bio: 'Beauty & Lifestyle UGC Content Creator',
        },
      },
    },
  });

  console.log(`✅ Seeded Creator User: ${creatorUser.email}`);
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
