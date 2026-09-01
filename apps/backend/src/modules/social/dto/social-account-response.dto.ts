import { SocialPlatform, SocialAccountStatus } from '@prisma/client';

export class SocialAccountResponseDto {
  id: string;
  userId: string;
  platform: SocialPlatform;
  platformUserId: string;
  username?: string | null;
  handle?: string | null;
  avatar?: string | null;
  followerCount?: number | null;
  engagementRate?: number | null;
  profileUrl?: string | null;
  isVerified?: boolean;
  expiresAt?: Date | null;
  status: SocialAccountStatus;
  connectedAt: Date;
  updatedAt: Date;
}
