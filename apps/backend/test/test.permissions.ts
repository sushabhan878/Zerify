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

async function testPermissions() {
  const acc = await prisma.socialAccount.findFirst({ where: { username: 'sushabhan_878_' } });
  if (!acc) {
    console.log('Account sushabhan_878_ not found in database.');
    return;
  }

  const token = decryptToken(acc.accessToken);
  console.log(`\n======================================================`);
  console.log(`ACCOUNT: ${acc.platform} | ${acc.username} (${acc.id})`);
  console.log(`PlatformUserId: ${acc.platformUserId}`);
  console.log(`======================================================\n`);

  // 1. Query Instagram Account Basic Profile & Type
  const profileUrl = `https://graph.instagram.com/v26.0/me?fields=id,username,name,account_type,media_count,followers_count,follows_count,biography&access_token=${token}`;
  const profileRes = await fetch(profileUrl);
  console.log('1. IG ME PROFILE STATUS:', profileRes.status);
  console.log('1. IG ME PROFILE BODY:', await profileRes.text());

  // 2. Test Reel Insights (Combined valid metrics)
  console.log('\n--- 2. TESTING REEL INSIGHTS ---');
  const reelUrl = `https://graph.instagram.com/v26.0/18045933502810670/insights?metric=views,reach,ig_reels_video_view_total_time,ig_reels_avg_watch_time,total_interactions,shares,saved&access_token=${token}`;
  const reelRes = await fetch(reelUrl);
  console.log('REEL INSIGHTS STATUS:', reelRes.status);
  console.log('REEL INSIGHTS BODY:', await reelRes.text());

  // 3. Test Photo Insights
  console.log('\n--- 3. TESTING PHOTO INSIGHTS ---');
  const photoUrl = `https://graph.instagram.com/v26.0/17892387021176403/insights?metric=reach,saved,total_interactions,shares&access_token=${token}`;
  const photoRes = await fetch(photoUrl);
  console.log('PHOTO INSIGHTS STATUS:', photoRes.status);
  console.log('PHOTO INSIGHTS BODY:', await photoRes.text());

  // 4. Test Demographics
  console.log('\n--- 4. TESTING DEMOGRAPHICS ---');
  const demoUrl = `https://graph.instagram.com/v26.0/me/insights?metric=reached_audience_demographics&period=lifetime&metric_type=total_value&access_token=${token}`;
  const demoRes = await fetch(demoUrl);
  console.log('DEMOGRAPHICS STATUS:', demoRes.status);
  console.log('DEMOGRAPHICS BODY:', await demoRes.text());
}

testPermissions().then(() => prisma.$disconnect());
