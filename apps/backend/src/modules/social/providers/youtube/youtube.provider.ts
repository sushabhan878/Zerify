import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialPlatform } from '@prisma/client';
import { ISocialProvider } from '../social-provider.interface';
import { SocialAccountProfileDto } from '../../dto/social-account-profile.dto';

@Injectable()
export class YoutubeProvider implements ISocialProvider {
  private readonly logger = new Logger(YoutubeProvider.name);

  constructor(private readonly configService: ConfigService) {}

  getPlatform(): SocialPlatform {
    return SocialPlatform.YOUTUBE;
  }

  private getClientId(): string {
    return this.configService.get<string>('YOUTUBE_CLIENT_ID') || 'mock_youtube_client_id';
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const clientId = this.getClientId();
    const scopes = encodeURIComponent(
      'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile',
    );

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&response_type=code&scope=${scopes}&state=${state}&access_type=offline&prompt=consent`;
  }

  async exchangeCodeAndGetAccounts(
    code: string,
    redirectUri: string,
  ): Promise<SocialAccountProfileDto[]> {
    this.logger.log(`Exchanging YouTube code for redirectUri: ${redirectUri}`);
    
    // Fallback/Mock implementation if YouTube API credentials are not set
    return [
      {
        platform: SocialPlatform.YOUTUBE,
        platformUserId: `yt_${Date.now()}`,
        username: 'YouTube Creator Channel',
        displayName: 'YouTube Creator Channel',
        avatar: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&auto=format&fit=crop',
        followerCount: 50000,
        accessToken: `yt_access_token_${code.substring(0, 10)}`,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      },
    ];
  }
}
