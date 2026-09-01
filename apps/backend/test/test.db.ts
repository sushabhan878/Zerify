import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDb() {
  const accounts = await prisma.socialAccount.findMany({
    include: {
      metadata: true,
      performance: true,
      contents: true,
      demographics: true,
      syncStates: true,
    },
  });

  console.log(`\n======================================================`);
  console.log(`FOUND ${accounts.length} SOCIAL ACCOUNTS IN DATABASE`);
  console.log(`======================================================\n`);

  for (const acc of accounts) {
    console.log(`---> ACCOUNT: ${acc.platform} | ${acc.username} (${acc.id})`);
    console.log(`  Followers: ${acc.followerCount} | Status: ${acc.status}`);
    console.log(`  Metadata:`, acc.metadata ? `${acc.metadata.displayName} (${acc.metadata.bio})` : 'None');
    console.log(`  Contents (Posts/Reels): ${acc.contents.length} items`);

    const reelsWithViews = acc.contents.filter((c) => c.playCount > 0);
    console.log(`  Reels with Play/Watch Metrics: ${reelsWithViews.length} items`);

    for (const r of reelsWithViews) {
      console.log(
        `    - Reel ${r.platformMediaId}: Views=${r.playCount}, Reach=${r.reach}, TotalWatchTime=${r.videoViewTotalTime}ms, AvgWatchTime=${r.avgWatchTime}ms, Likes=${r.likeCount}, Comments=${r.commentCount}`,
      );
    }
  }
}

checkDb().then(() => prisma.$disconnect());
