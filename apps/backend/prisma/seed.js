"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    const vipEntries = [
        { email: 'sarah.fashion@example.com', type: client_1.VipType.INFLUENCER },
        { email: 'glow.skincare@brand.com', type: client_1.VipType.BRAND },
        { email: 'alex.tech@example.com', type: client_1.VipType.INFLUENCER },
        { email: 'horizon.apparel@brand.com', type: client_1.VipType.BRAND },
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
    const brandUser = await prisma.user.upsert({
        where: { email: 'demo.brand@zerify.com' },
        update: {},
        create: {
            email: 'demo.brand@zerify.com',
            role: client_1.UserRole.BRAND,
            brandProfile: {
                create: {
                    companyName: 'Lumina Skincare Co.',
                    website: 'https://luminaskincare.com',
                },
            },
        },
    });
    console.log(`✅ Seeded Brand User: ${brandUser.email}`);
    const creatorUser = await prisma.user.upsert({
        where: { email: 'demo.creator@zerify.com' },
        update: {},
        create: {
            email: 'demo.creator@zerify.com',
            role: client_1.UserRole.INFLUENCER,
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
//# sourceMappingURL=seed.js.map