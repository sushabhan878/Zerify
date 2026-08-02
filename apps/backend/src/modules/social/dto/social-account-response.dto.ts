import { SocialPlatform, SocialAccountStatus } from '@prisma/client';

export class SocialAccountResponseDto {
  id: string;
  userId: string;
  platform: SocialPlatform;
  platformUserId: string;
  username?: string | null;
  displayName?: string | null;
  avatar?: string | null;
  followerCount?: number | null;
  expiresAt?: Date | null;
  status: SocialAccountStatus;
  connectedAt: Date;
  updatedAt: Date;
}
