import { SocialPlatform } from '@prisma/client';
import { SocialAccountProfileDto } from '../dto/social-account-profile.dto';

export interface ISocialProvider {
  getPlatform(): SocialPlatform;

  getAuthUrl(redirectUri: string, state: string, codeChallenge?: string): string;

  exchangeCodeAndGetAccounts(
    code: string,
    redirectUri: string,
    codeVerifier?: string,
  ): Promise<SocialAccountProfileDto[]>;

}
