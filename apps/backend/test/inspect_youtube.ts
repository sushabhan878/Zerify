import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function getSecretKey(): Buffer {
  const secret =
    process.env.SOCIAL_ENCRYPTION_SECRET ||
    process.env.JWT_SECRET ||
    'zerify-social-encryption-secret-default-key-32b';
  return crypto.createHash('sha256').update(secret).digest();
}

function decryptToken(encryptedText: string): string {
  if (!encryptedText) return '';
  const parts = encryptedText.split(':');
  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getSecretKey();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]).toString('utf8');
}

async function run() {
  const accounts = await prisma.socialAccount.findMany({
    where: { platform: 'YOUTUBE' },
    select: {
      id: true,
      userId: true,
      platformUserId: true,
      username: true,
      handle: true,
      followerCount: true,
      engagementRate: true,
      status: true,
      connectedAt: true,
      updatedAt: true,
      accessToken: true,
      refreshToken: true,
      customData: true,
    },
  });

  console.log(`Found ${accounts.length} YouTube accounts:`);
  for (const a of accounts) {
    console.log(`\n================================`);
    console.log(`ID: ${a.id} | User: ${a.userId} | Username: ${a.username}`);
    console.log(`PlatformUserId (Channel ID): ${a.platformUserId}`);
    console.log(`Followers (Subscribers): ${a.followerCount} | ER: ${a.engagementRate} | Status: ${a.status}`);
    console.log(`Custom Data:`, JSON.stringify(a.customData));

    if (a.accessToken) {
      try {
        const rawToken = decryptToken(a.accessToken);
        console.log('Access token length:', rawToken.length);

        // Fetch channel details directly from YouTube Data API v3
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true`;
        const res = await fetch(channelUrl, {
          headers: { Authorization: `Bearer ${rawToken}` },
        });
        console.log('Channels endpoint status:', res.status);
        const data = await res.json();
        console.log('Channel Data:', JSON.stringify(data, null, 2));
      } catch (err: any) {
        console.error('Error checking YouTube token:', err.message);
      }
    }
  }
}

run().finally(() => prisma.$disconnect());
