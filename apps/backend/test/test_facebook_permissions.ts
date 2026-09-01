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
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

async function testFacebookPageToken() {
  const acc = await prisma.socialAccount.findFirst({ where: { username: 'Inovaux' } });
  if (!acc) return console.log('Inovaux account not found in DB');

  const userToken = decryptToken(acc.accessToken);
  console.log(`\n======================================================`);
  console.log(`PAGE: ${acc.username} (${acc.id}) | PlatformUserId: ${acc.platformUserId}`);
  console.log(`======================================================`);

  // 1. Fetch /me/accounts with userToken to get page_access_token
  const meAccountsUrl = `https://graph.facebook.com/v26.0/me/accounts?fields=id,name,access_token,fan_count,followers_count,picture{url},about,link,website,category&access_token=${userToken}`;
  const meAccountsRes = await fetch(meAccountsUrl);
  console.log('1. ME ACCOUNTS STATUS:', meAccountsRes.status);
  const meAccountsData = await meAccountsRes.json();
  console.log('1. ME ACCOUNTS DATA:', JSON.stringify(meAccountsData, null, 2));

  const page = meAccountsData.data?.[0];
  const pageToken = page?.access_token || userToken;

  // 2. Query Page details with pageToken
  const pageUrl = `https://graph.facebook.com/v26.0/${acc.platformUserId}?fields=id,name,fan_count,followers_count,picture{url},about,link,website,category&access_token=${pageToken}`;
  const pageRes = await fetch(pageUrl);
  console.log('\n2. PAGE DETAILS STATUS WITH PAGE TOKEN:', pageRes.status);
  console.log('2. PAGE DETAILS BODY:', await pageRes.text());

  // 3. Query Feed with pageToken
  const feedUrl = `https://graph.facebook.com/v26.0/${acc.platformUserId}/feed?fields=id,message,story,created_time,full_picture,permalink_url,shares,reactions.summary(true),comments.summary(true)&limit=10&access_token=${pageToken}`;
  const feedRes = await fetch(feedUrl);
  console.log('\n3. PAGE FEED STATUS WITH PAGE TOKEN:', feedRes.status);
  console.log('3. PAGE FEED BODY:', await feedRes.text());

  // 4. Query Page Insights with pageToken
  const pageMetrics = ['page_post_engagements', 'page_views_total', 'page_daily_follows', 'page_video_views'];
  for (const m of pageMetrics) {
    const insUrl = `https://graph.facebook.com/v26.0/${acc.platformUserId}/insights?metric=${m}&period=day&access_token=${pageToken}`;
    const insRes = await fetch(insUrl);
    console.log(`Page Metric '${m}' -> STATUS ${insRes.status} | BODY: ${await insRes.text()}`);
  }
}

testFacebookPageToken().then(() => prisma.$disconnect());
