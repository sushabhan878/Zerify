import { PrismaClient, ReviewType } from '@prisma/client';

const prisma = new PrismaClient();

const brandToInfluencerQuestions = [
  { text: 'How would you rate the influencer\'s communication and responsiveness throughout the campaign?', category: 'communication', order: 0 },
  { text: 'How well did the influencer meet the content quality expectations?', category: 'quality', order: 1 },
  { text: 'How timely was the influencer in delivering content by deadlines?', category: 'timeliness', order: 2 },
  { text: 'How well did the influencer understand and follow the campaign brief and guidelines?', category: 'professionalism', order: 3 },
  { text: 'How satisfied are you with the overall campaign results and ROI?', category: 'satisfaction', order: 4 },
  { text: 'Would you work with this influencer again in future campaigns?', category: 'recommendation', order: 5 },
];

const influencerToBrandQuestions = [
  { text: 'How clear and responsive was the brand during the campaign?', category: 'communication', order: 0 },
  { text: 'Were the campaign brief and expectations clearly communicated?', category: 'clarity', order: 1 },
  { text: 'How timely was the brand in providing feedback and approvals?', category: 'timeliness', order: 2 },
  { text: 'Was the payment process smooth and on time?', category: 'payment', order: 3 },
  { text: 'How professional and easy was it to work with this brand?', category: 'professionalism', order: 4 },
  { text: 'Would you collaborate with this brand again?', category: 'recommendation', order: 5 },
];

async function main() {
  console.log('Seeding review questions...');

  for (let i = 0; i < brandToInfluencerQuestions.length; i++) {
    const q = brandToInfluencerQuestions[i];
    await prisma.reviewQuestion.upsert({
      where: { id: `brand-to-influencer-${i}` },
      update: {},
      create: {
        id: `brand-to-influencer-${i}`,
        text: q.text,
        category: q.category,
        reviewType: ReviewType.BRAND_TO_INFLUENCER,
        order: q.order,
        isActive: true,
      },
    });
  }

  for (let i = 0; i < influencerToBrandQuestions.length; i++) {
    const q = influencerToBrandQuestions[i];
    await prisma.reviewQuestion.upsert({
      where: { id: `influencer-to-brand-${i}` },
      update: {},
      create: {
        id: `influencer-to-brand-${i}`,
        text: q.text,
        category: q.category,
        reviewType: ReviewType.INFLUENCER_TO_BRAND,
        order: q.order,
        isActive: true,
      },
    });
  }

  console.log('Review questions seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
