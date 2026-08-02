import { SocialPlatform } from '@prisma/client';
import { SocialAccountProfileDto } from '../dto/social-account-profile.dto';

export interface ISocialProvider {
  getPlatform(): SocialPlatform;

  getAuthUrl(redirectUri: string, state: string): string;

  exchangeCodeAndGetAccounts(
    code: string,
    redirectUri: string,
  ): Promise<SocialAccountProfileDto[]>;
}
