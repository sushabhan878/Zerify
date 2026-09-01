import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialPlatform } from '@prisma/client';
import { ISocialProvider } from '../social-provider.interface';
import { SocialAccountProfileDto } from '../../dto/social-account-profile.dto';

@Injectable()
export class LinkedinProvider implements ISocialProvider {
  private readonly logger = new Logger(LinkedinProvider.name);

  constructor(private readonly configService: ConfigService) {}

  getPlatform(): SocialPlatform {
    return SocialPlatform.LINKEDIN;
  }

  private getClientId(): string {
    return this.configService.get<string>('LINKEDIN_CLIENT_ID') || 'mock_linkedin_client_id';
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const clientId = this.getClientId();
    const scopes = encodeURIComponent('openid profile email');

    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&state=${state}&scope=${scopes}`;
  }

  async exchangeCodeAndGetAccounts(
    code: string,
    redirectUri: string,
  ): Promise<SocialAccountProfileDto[]> {
    this.logger.log(`Exchanging LinkedIn code for redirectUri: ${redirectUri}`);

    return [
      {
        platform: SocialPlatform.LINKEDIN,
        platformUserId: `li_${Date.now()}`,
        username: 'LinkedIn Professional',
        displayName: 'LinkedIn Professional Profile',
        avatar: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=150&auto=format&fit=crop',
        followerCount: 8500,
        accessToken: `li_access_token_${code.substring(0, 10)}`,
        expiresAt: new Date(Date.now() + 60 * 86400 * 1000),
      },
    ];
  }
}
