import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialPlatform } from '@prisma/client';
import { ISocialProvider } from '../social-provider.interface';
import { SocialAccountProfileDto } from '../../dto/social-account-profile.dto';

@Injectable()
export class TwitterProvider implements ISocialProvider {
  private readonly logger = new Logger(TwitterProvider.name);

  constructor(private readonly configService: ConfigService) {}

  getPlatform(): SocialPlatform {
    return SocialPlatform.TWITTER;
  }

  private getClientId(): string {
    return this.configService.get<string>('TWITTER_CLIENT_ID') || 'mock_twitter_client_id';
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const clientId = this.getClientId();
    const scopes = encodeURIComponent('tweet.read users.read follows.read offline.access');

    return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&scope=${scopes}&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
  }

  async exchangeCodeAndGetAccounts(
    code: string,
    redirectUri: string,
  ): Promise<SocialAccountProfileDto[]> {
    this.logger.log(`Exchanging Twitter / X code for redirectUri: ${redirectUri}`);

    return [
      {
        platform: SocialPlatform.TWITTER,
        platformUserId: `tw_${Date.now()}`,
        username: 'TwitterCreator',
        displayName: 'X (Twitter) Handle',
        avatar: 'https://images.unsplash.com/photo-1611605698323-b1e992d3777f?w=150&auto=format&fit=crop',
        followerCount: 24500,
        accessToken: `tw_access_token_${code.substring(0, 10)}`,
        expiresAt: new Date(Date.now() + 7200 * 1000),
      },
    ];
  }
}
