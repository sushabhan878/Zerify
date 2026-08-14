import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialPlatform } from '@prisma/client';
import { ISocialProvider } from '../social-provider.interface';
import { SocialAccountProfileDto } from '../../dto/social-account-profile.dto';

@Injectable()
export class TiktokProvider implements ISocialProvider {
  private readonly logger = new Logger(TiktokProvider.name);

  constructor(private readonly configService: ConfigService) {}

  getPlatform(): SocialPlatform {
    return SocialPlatform.TIKTOK;
  }

  private getClientKey(): string {
    return this.configService.get<string>('TIKTOK_CLIENT_KEY') || 'mock_tiktok_client_key';
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const clientKey = this.getClientKey();
    const scopes = encodeURIComponent('user.info.basic,video.list');

    return `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&response_type=code&scope=${scopes}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&state=${state}`;
  }

  async exchangeCodeAndGetAccounts(
    code: string,
    redirectUri: string,
  ): Promise<SocialAccountProfileDto[]> {
    this.logger.log(`Exchanging TikTok code for redirectUri: ${redirectUri}`);

    return [
      {
        platform: SocialPlatform.TIKTOK,
        platformUserId: `tt_${Date.now()}`,
        username: 'TikTok Creator',
        displayName: 'TikTok Creator',
        avatar: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=150&auto=format&fit=crop',
        followerCount: 120000,
        accessToken: `tt_access_token_${code.substring(0, 10)}`,
        expiresAt: new Date(Date.now() + 86400 * 1000),
      },
    ];
  }
}
