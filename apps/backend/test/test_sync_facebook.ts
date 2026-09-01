import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setConnected() {
  const acc = await prisma.socialAccount.findFirst({ where: { username: 'Inovaux' } });
  if (acc) {
    await prisma.socialAccount.update({
      where: { id: acc.id },
      data: { status: 'CONNECTED' },
    });
    console.log(`Account Inovaux (${acc.id}) set to CONNECTED.`);
  }
}

setConnected().then(() => prisma.$disconnect());
