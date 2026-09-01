import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialPlatform } from '@prisma/client';
import { ISocialProvider } from '../social-provider.interface';
import { SocialAccountProfileDto } from '../../dto/social-account-profile.dto';

interface InstagramTokenResponse {
  access_token: string;
  user_id: string | number;
  error_type?: string;
  code?: number;
  error_message?: string;
}

interface InstagramProfileResponse {
  id: string;
  username?: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  error?: any;
}

@Injectable()
export class InstagramProvider implements ISocialProvider {
  private readonly logger = new Logger(InstagramProvider.name);

  constructor(private readonly configService: ConfigService) {}

  getPlatform(): SocialPlatform {
    return SocialPlatform.INSTAGRAM;
  }

  private getAppId(): string {
    const appId = this.configService.get<string>('INSTAGRAM_APP_ID');
    if (!appId) {
      throw new InternalServerErrorException('INSTAGRAM_APP_ID environment variable is missing');
    }
    return appId;
  }

  private getAppSecret(): string {
    const appSecret = this.configService.get<string>('INSTAGRAM_APP_SECRET');
    if (!appSecret) {
      throw new InternalServerErrorException('INSTAGRAM_APP_SECRET environment variable is missing');
    }
    return appSecret;
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const appId = this.getAppId();
    const scopes =
      'instagram_business_basic,instagram_business_manage_insights,instagram_business_manage_comments,instagram_business_manage_messages,instagram_business_content_publish';

    const url = new URL('https://www.instagram.com/oauth/authorize');
    url.searchParams.append('client_id', appId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', scopes);
    url.searchParams.append('state', state);

    return url.toString();
  }


  private getGraphApiUrl(): string {
    const apiVersion = this.configService.get<string>('META_API_VERSION') || 'v26.0';
    const graphUrl =
      this.configService.get<string>('INSTAGRAM_GRAPH_URL') || `https://graph.instagram.com/${apiVersion}`;
    return graphUrl.replace(/\/+$/, '');
  }

  async exchangeCodeAndGetAccounts(
    code: string,
    redirectUri: string,
  ): Promise<SocialAccountProfileDto[]> {
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();

    // Step 6 — Exchange code for access token via https://api.instagram.com/oauth/access_token
    const tokenUrl = 'https://api.instagram.com/oauth/access_token';

    const formData = new URLSearchParams();
    formData.append('client_id', appId);
    formData.append('client_secret', appSecret);
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', redirectUri);
    formData.append('code', code);

    this.logger.log(`Exchanging Instagram authorization code at ${tokenUrl}...`);

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const tokenData = (await tokenRes.json()) as InstagramTokenResponse;

    if (!tokenRes.ok || tokenData.error_message || !tokenData.access_token) {
      this.logger.error('Instagram OAuth access token exchange failed:', tokenData);
      throw new BadRequestException(
        tokenData.error_message || 'Failed to exchange Instagram authorization code',
      );
    }

    const shortToken = tokenData.access_token;
    const userId = String(tokenData.user_id);
    let accessToken = shortToken;
    let expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days default

    // Attempt to exchange for long-lived access token via graph.instagram.com
    try {
      const longTokenUrl = `${this.getGraphApiUrl()}/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortToken}`;
      const longTokenRes = await fetch(longTokenUrl);
      if (longTokenRes.ok) {
        const longTokenData = (await longTokenRes.json()) as { access_token?: string; expires_in?: number };
        if (longTokenData.access_token) {
          accessToken = longTokenData.access_token;
          if (longTokenData.expires_in) {
            expiresAt = new Date(Date.now() + longTokenData.expires_in * 1000);
          }
        }
      }
    } catch (longTokenErr) {
      this.logger.warn('Could not exchange for long-lived Instagram token, falling back to short token:', longTokenErr);
    }

    // Step 7 — Immediately test/fetch the Instagram Graph API profile info (v26.0)
    const profileUrl = `${this.getGraphApiUrl()}/me?fields=id,username,name,profile_picture_url,followers_count&access_token=${accessToken}`;
    this.logger.log(`Testing Instagram Graph API endpoint: ${profileUrl.replace(accessToken, 'REDACTED')}`);


    const profileRes = await fetch(profileUrl);
    let profileData: InstagramProfileResponse = { id: userId };

    if (profileRes.ok) {
      profileData = (await profileRes.json()) as InstagramProfileResponse;
      this.logger.log(`Instagram API Profile response: ${JSON.stringify(profileData, null, 2)}`);
    } else {
      // Fallback without version prefix if needed
      try {
        const fallbackUrl = `https://graph.instagram.com/me?fields=id,username,name,profile_picture_url,followers_count&access_token=${accessToken}`;
        const fallbackRes = await fetch(fallbackUrl);
        if (fallbackRes.ok) {
          profileData = (await fallbackRes.json()) as InstagramProfileResponse;
          this.logger.log(`Instagram API Profile fallback response: ${JSON.stringify(profileData, null, 2)}`);
        } else {
          const errText = await profileRes.text();
          this.logger.warn(`Instagram Graph API request returned status ${profileRes.status}: ${errText}`);
        }
      } catch (err) {
        this.logger.warn('Error querying fallback Instagram Graph API:', err);
      }
    }

    const platformUserId = profileData.id || userId;
    const username = profileData.username || profileData.name || `ig_${platformUserId}`;
    const displayName = profileData.name || profileData.username || 'Instagram Account';

    return [
      {
        platform: SocialPlatform.INSTAGRAM,
        platformUserId,
        username,
        displayName,
        avatar: profileData.profile_picture_url,
        followerCount: profileData.followers_count,
        accessToken,
        expiresAt,
      },
    ];
  }
}
