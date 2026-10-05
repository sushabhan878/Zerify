const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

function getSecretKey() {
    const secret = process.env.SOCIAL_ENCRYPTION_SECRET || process.env.JWT_SECRET || 'zerify-social-encryption-secret-default-key-32b';
    return crypto.createHash('sha256').update(secret).digest();
}

function decryptToken(encryptedText) {
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

async function testFetch() {
    const acc = await prisma.socialAccount.findFirst({ where: { username: 'sushabhan_878_' } });
    const token = decryptToken(acc.accessToken);

    const testUrls = [
        `https://graph.instagram.com/v26.0/17892387021176403/insights?metric=impressions,shares,comments,likes,saved,total_interactions,reach,views&access_token=${token}`,
        `https://graph.instagram.com/v26.0/18045933502810670/insights?metric=impressions,shares,comments,likes,saved,total_interactions,reach,views,ig_reels_video_view_total_time,ig_reels_avg_watch_time&access_token=${token}`,
        `https://graph.instagram.com/v26.0/me/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&access_token=${token}`,
        `https://graph.instagram.com/v26.0/me/insights?metric=engaged_audience_demographics&period=lifetime&metric_type=total_value&access_token=${token}`,
        `https://graph.instagram.com/v26.0/me/insights?metric=reach,follower_count,website_clicks,profile_views,accounts_engaged,total_interactions,views&period=day&access_token=${token}`
    ];

    for (const url of testUrls) {
        const res = await fetch(url);
        const text = await res.text();
        console.log('\n----------------------------------------');
        console.log('URL:', url.replace(token, 'REDACTED'));
        console.log('STATUS:', res.status);
        console.log('BODY:', text);
    }
}

testFetch().then(() => prisma.$disconnect());
