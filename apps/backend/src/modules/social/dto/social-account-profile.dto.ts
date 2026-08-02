import { SocialPlatform } from '@prisma/client';

export class SocialAccountProfileDto {
  platform: SocialPlatform;
  platformUserId: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}
