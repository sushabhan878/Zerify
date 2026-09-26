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
  return d.status === 'VERIFIED' || (d.status === 'APPROVED' && !rulesOf(d.requirements).requiresPublication);
}

/** Parse only: never fetch arbitrary URLs or claim remote ownership verification. */
export function normalizeSocialUrl(value: string, platform?: string | null, contentType = '') {
  let url: URL;
  try { url = new URL(value); } catch { throw new BadRequestException('Enter a valid social post URL'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) {
    throw new BadRequestException('Use an HTTPS social post URL without credentials or a custom port');
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const path = url.pathname.replace(/\/+$/, '');
  let detected: string | undefined;
  let canonical = `https://${host}${path}`;
  if (host === 'instagram.com' && /^\/(p|reel|reels|stories)\/[\w.-]+(?:\/\d+)?$/.test(path)) detected = 'INSTAGRAM';
  if (host === 'youtube.com' && (/^\/shorts\/[\w-]+$/.test(path) || (path === '/watch' && /^[\w-]+$/.test(url.searchParams.get('v') || '')))) {
    detected = 'YOUTUBE';
    if (path === '/watch') canonical += `?v=${url.searchParams.get('v')}`;
  }
  if (host === 'youtu.be' && /^\/[\w-]+$/.test(path)) { detected = 'YOUTUBE'; canonical = `https://youtube.com/watch?v=${path.slice(1)}`; }
  if (host === 'tiktok.com' && /^\/@[\w.-]+\/video\/\d+$/.test(path)) detected = 'TIKTOK';
  if (['x.com', 'twitter.com'].includes(host) && /^\/[\w]+\/status\/\d+$/.test(path)) { detected = 'X'; canonical = `https://x.com${path}`; }
  if (host === 'linkedin.com' && /^\/(posts\/[^/]+|feed\/update\/urn:li:activity:\d+)$/.test(path)) detected = 'LINKEDIN';
  const expected = (platform || contentType.split(' ')[0]).toUpperCase().replace('TWITTER', 'X');
  if (!detected) throw new BadRequestException('Use a supported public post URL, not a profile or shortened link');
  if (['INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'X', 'LINKEDIN'].includes(expected) && detected !== expected) {
    throw new BadRequestException(`This deliverable requires a ${expected} post`);
  }
  return { url: canonical, platform: detected, verificationStatus: 'MANUAL_REVIEW_REQUIRED' };
}

export function detectMediaType(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) return 'image/jpeg';
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buffer.toString('ascii', 4, 8) === 'ftyp') return buffer.toString('ascii', 8, 12) === 'qt  ' ? 'video/quicktime' : 'video/mp4';
  return null;
}
