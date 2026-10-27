import { BadRequestException } from '@nestjs/common';

export interface DeliverableRules {
  requiresPreApproval: boolean;
  requiresPublication: boolean;
  allowLateSubmission: boolean;
  publicationDeadline?: string;
  maxFileSizeMb: number;
  allowedMimeTypes: string[];
  mandatoryHashtags?: string[];
  mandatoryMentions?: string[];
  requiredCta?: string;
  instructions?: string;
}

export const DEFAULT_RULES: DeliverableRules = {
  requiresPreApproval: true, requiresPublication: true, allowLateSubmission: true,
  maxFileSizeMb: 100,
  allowedMimeTypes: ['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp'],
};

export function rulesOf(snapshot: unknown): DeliverableRules {
  return { ...DEFAULT_RULES, ...(snapshot && typeof snapshot === 'object' ? snapshot : {}) };
}

export function isDeliverableComplete(d: { status: string; requirements: unknown }) {
  return ['VERIFIED', 'PUBLISHED'].includes(d.status) || (d.status === 'APPROVED' && !rulesOf(d.requirements).requiresPublication);
}

/** Parse and strictly validate published social URLs according to platform and content type. */
export function normalizeSocialUrl(value: string, platform?: string | null, contentType = '') {
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new BadRequestException('Enter a valid social post URL'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) {
    throw new BadRequestException('Use an HTTPS social post URL without credentials or a custom port');
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '').replace(/^web\./, '');
  const path = url.pathname.replace(/\/+$/, '');
  let detected: string | undefined;
  let detectedType: string | undefined;
  let canonical = `https://${host}${path}`;

  // 1. Instagram
  if (host === 'instagram.com') {
    if (/^\/(reel|reels)\/[\w.-]+/.test(path)) {
      detected = 'INSTAGRAM';
      detectedType = 'REEL';
    } else if (/^\/p\/[\w.-]+/.test(path)) {
      detected = 'INSTAGRAM';
      detectedType = 'POST';
    } else if (/^\/stories\/[\w.-]+/.test(path)) {
      detected = 'INSTAGRAM';
      detectedType = 'STORY';
    }
  }

  // 2. Facebook
  if (host === 'facebook.com' || host === 'fb.watch') {
    detected = 'FACEBOOK';
    if (/^\/(reel|reels)\/[\w.-]+/.test(path)) {
      detectedType = 'REEL';
    } else {
      detectedType = 'POST';
    }
    if (url.searchParams.has('v')) {
      canonical += `?v=${url.searchParams.get('v')}`;
    }
  }

  // 3. YouTube
  if (host === 'youtube.com') {
    if (/^\/shorts\/[\w-]+/.test(path)) {
      detected = 'YOUTUBE';
      detectedType = 'SHORT';
    } else if (path === '/watch' && /^[\w-]+$/.test(url.searchParams.get('v') || '')) {
      detected = 'YOUTUBE';
      detectedType = 'VIDEO';
      canonical += `?v=${url.searchParams.get('v')}`;
    }
  }
  if (host === 'youtu.be' && /^\/[\w-]+$/.test(path)) {
    detected = 'YOUTUBE';
    detectedType = 'VIDEO';
    canonical = `https://youtube.com/watch?v=${path.slice(1)}`;
  }

  // 4. TikTok
  if (host === 'tiktok.com' || host === 'vm.tiktok.com') {
    if (/^\/@[\w.-]+\/video\/\d+/.test(path) || /^\/[\w.-]+/.test(path)) {
      detected = 'TIKTOK';
      detectedType = 'VIDEO';
    }
  }

  // 5. Twitter / X
  if (['x.com', 'twitter.com'].includes(host) && /^\/[\w]+\/status\/\d+/.test(path)) {
    detected = 'X';
    detectedType = 'POST';
    canonical = `https://x.com${path}`;
  }

  // 6. LinkedIn
  if (host === 'linkedin.com' && /^\/(posts\/[^/]+|feed\/update\/urn:li:activity:\d+)/.test(path)) {
    detected = 'LINKEDIN';
    detectedType = 'POST';
  }

  if (!detected) {
    throw new BadRequestException('Use a supported public post URL, not a profile or cloud storage link (e.g. Google Drive, Dropbox)');
  }

  const expectedPlatform = (platform || contentType.split(' ')[0]).toUpperCase().replace('TWITTER', 'X');
  if (['INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'X', 'LINKEDIN', 'FACEBOOK'].includes(expectedPlatform) && detected !== expectedPlatform) {
    throw new BadRequestException(`This deliverable requires a ${expectedPlatform} post link, but you provided a ${detected} URL.`);
  }

  // Enforce content format constraints
  const lowerType = (contentType || '').toLowerCase();
  if (detected === 'INSTAGRAM') {
    if (/reel/i.test(lowerType) && detectedType !== 'REEL') {
      throw new BadRequestException('This deliverable is an Instagram Reel. Please provide an Instagram Reel URL (e.g. https://www.instagram.com/reel/...). Feed posts are not accepted.');
    }
    if (/stor(y|ies)/i.test(lowerType) && detectedType !== 'STORY') {
      throw new BadRequestException('This deliverable is an Instagram Story. Please provide an Instagram Story URL (e.g. https://www.instagram.com/stories/...).');
    }
  }

  if (detected === 'YOUTUBE') {
    if (/shorts?/i.test(lowerType) && detectedType !== 'SHORT') {
      throw new BadRequestException('This deliverable is a YouTube Short. Please provide a YouTube Shorts URL (e.g. https://www.youtube.com/shorts/...).');
    }
  }

  return { url: canonical, platform: detected, contentType: detectedType, verificationStatus: 'MANUAL_REVIEW_REQUIRED' };
}

export function detectMediaType(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) return 'image/jpeg';
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buffer.toString('ascii', 4, 8) === 'ftyp') return buffer.toString('ascii', 8, 12) === 'qt  ' ? 'video/quicktime' : 'video/mp4';
  return null;
}
