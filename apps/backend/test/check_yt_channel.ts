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
  const acc = await prisma.socialAccount.findFirst({
    where: { platform: 'YOUTUBE', platformUserId: 'UC1DBM2suXSzKf6XQN-isPeg' },
    include: {
      metadata: true,
      performance: true,
      contents: true,
    },
  });

  if (!acc) return console.log('Account not found');

  console.log('Account full details:');
  console.log('ID:', acc.id);
  console.log('Username:', acc.username);
  console.log('Handle:', acc.handle);
  console.log('FollowerCount:', acc.followerCount);
  console.log('EngagementRate:', acc.engagementRate);
  console.log('Status:', acc.status);
  console.log('ConnectedAt:', acc.connectedAt);
  console.log('UpdatedAt:', acc.updatedAt);
  console.log('ExpiresAt:', acc.expiresAt);
  console.log('RefreshToken exists?', !!acc.refreshToken);
  console.log('Metadata:', acc.metadata);
  console.log('Performance records:', acc.performance.length);
  console.log('Contents count:', acc.contents.length);

  // If refresh token exists, try refreshing
  if (acc.refreshToken) {
    try {
      const rawRefresh = decryptToken(acc.refreshToken);
      console.log('Refresh token decrypted successfully! Length:', rawRefresh.length);

      const clientId = process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET;

      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId || '',
          client_secret: clientSecret || '',
          refresh_token: rawRefresh,
          grant_type: 'refresh_token',
        }),
      });

      console.log('Refresh status:', refreshRes.status);
      const refreshJson = await refreshRes.json();
      console.log('Refresh JSON:', JSON.stringify(refreshJson, null, 2));

      if (refreshJson.access_token) {
        const channelRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true', {
          headers: { Authorization: `Bearer ${refreshJson.access_token}` },
        });
        const chData = await channelRes.json();
        console.log('Live Channel Data:', JSON.stringify(chData, null, 2));
      }
    } catch (err: any) {
      console.error('Refresh error:', err.message);
    }
  }
}

run().finally(() => prisma.$disconnect());
