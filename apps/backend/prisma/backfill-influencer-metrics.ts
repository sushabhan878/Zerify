import { PrismaClient, SocialAccountStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Influencer Metrics Backfill ---');
  const profiles = await prisma.influencerProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  console.log(`Found ${profiles.length} influencer profiles to process.`);

  let updatedCount = 0;

  for (const profile of profiles) {
    const socialAccounts = await prisma.socialAccount.findMany({
      where: {
        userId: profile.userId,
        status: SocialAccountStatus.CONNECTED,
      },
      include: {
        performance: {
          orderBy: { recordedAt: 'desc' },
          take: 5,
        },
        contents: {
          orderBy: { publishedAt: 'desc' },
          take: 30,
        },
      },
    });

    let totalFollowers = 0;
    let totalER = 0;
    let erCount = 0;
    let totalReach = 0;

    for (const acc of socialAccounts) {
      const followers = acc.followerCount || 0;
      totalFollowers += followers;

      if (acc.engagementRate && acc.engagementRate > 0) {
        totalER += acc.engagementRate;
        erCount++;
      }

      if (acc.performance && acc.performance.length > 0) {
        const perf = acc.performance[0];
        totalReach += perf.reach || perf.impressions || 0;
      }

      if (acc.contents && acc.contents.length > 0) {
        const contentReach = acc.contents.reduce((sum, c) => sum + (c.reach || 0), 0);
        if (totalReach === 0) {
          totalReach += contentReach;
        }
      }
    }

    if (totalFollowers > 0 && totalReach === 0) {
      totalReach = Math.round(totalFollowers * 2.4);
    }

    const avgEngagementRate = erCount > 0 ? Number((totalER / erCount).toFixed(2)) : 0.0;

    await prisma.influencerProfile.update({
      where: { id: profile.id },
      data: {
        totalFollowers,
        totalReach,
        avgEngagementRate,
      },
    });

    console.log(
      `Updated profile ${profile.handle || profile.user?.name || profile.id}: Followers=${totalFollowers}, Reach=${totalReach}, AvgER=${avgEngagementRate}% (across ${socialAccounts.length} connected accounts)`
    );
    updatedCount++;
  }

  console.log(`--- Finished! Successfully backfilled ${updatedCount} influencer profiles ---`);
}

main()
  .catch((e) => {
    console.error('Error backfilling influencer metrics:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
