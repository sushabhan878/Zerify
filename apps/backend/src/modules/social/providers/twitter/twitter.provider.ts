import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialPlatform } from '@prisma/client';
import { ISocialProvider } from '../social-provider.interface';
import { SocialAccountProfileDto } from '../../dto/social-account-profile.dto';

export interface XPublicMetrics {
  followers_count?: number;
  following_count?: number;
  tweet_count?: number;
  listed_count?: number;
}

export interface XUserResponse {
  id: string;
  name: string;
  username: string;
  description?: string;
  profile_image_url?: string;
  verified?: boolean;
  verified_type?: string;
  public_metrics?: XPublicMetrics;
}

export interface XTweetMetrics {
  retweet_count?: number;
  reply_count?: number;
  like_count?: number;
  quote_count?: number;
  bookmark_count?: number;
  impression_count?: number;
}

export interface XTweetResponse {
  id: string;
  text: string;
  created_at?: string;
  public_metrics?: XTweetMetrics;
}

@Injectable()
export class TwitterProvider implements ISocialProvider {
  private readonly logger = new Logger(TwitterProvider.name);

  constructor(private readonly configService: ConfigService) {}

  getPlatform(): SocialPlatform {
    return SocialPlatform.TWITTER;
  }

  private getClientId(): string {
    return (
      this.configService.get<string>('X_CLIENT_ID') ||
      this.configService.get<string>('TWITTER_CLIENT_ID') ||
      ''
    );
  }

  private getClientSecret(): string {
    return (
      this.configService.get<string>('X_CLIENT_SECRET') ||
      this.configService.get<string>('TWITTER_CLIENT_SECRET') ||
      ''
    );
  }

  private getAuthUrlBase(): string {
    return (
      this.configService.get<string>('X_AUTH_URL') ||
      'https://x.com/i/oauth2/authorize'
    );
  }

  private getTokenUrl(): string {
    return (
      this.configService.get<string>('X_TOKEN_URL') ||
      'https://api.x.com/2/oauth2/token'
    );
  }

  private getApiBaseUrl(): string {
    return (
      this.configService.get<string>('X_API_BASE_URL') ||
      'https://api.x.com/2'
    );
  }

  private getScopes(): string {
    return (
      this.configService.get<string>('X_SCOPES') ||
      'tweet.read users.read offline.access'
    );
  }

  /**
   * Generates the X OAuth 2.0 authorization URL with PKCE.
   */
  getAuthUrl(redirectUri: string, state: string, codeChallenge?: string): string {
    const clientId = this.getClientId();
    const scopes = encodeURIComponent(this.getScopes());
    const authBase = this.getAuthUrlBase();
    const challenge = codeChallenge || 'challenge';

    return (
      `${authBase}?response_type=code` +
      `&client_id=${encodeURIComponent(clientId || 'mock_x_client_id')}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${scopes}` +
      `&state=${encodeURIComponent(state)}` +
      `&code_challenge=${encodeURIComponent(challenge)}` +
      `&code_challenge_method=S256`
    );
  }

  /**
   * Exchanges authorization code for access and refresh tokens and returns normalized profile DTO.
   */
  async exchangeCodeAndGetAccounts(
    code: string,
    redirectUri: string,
    codeVerifier?: string,
  ): Promise<SocialAccountProfileDto[]> {
    this.logger.log(`Exchanging X / Twitter OAuth code for redirectUri: ${redirectUri}`);

    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();

    // Development / Mock fallback when client credentials are not configured or in unit test mock mode
    if (!clientId || !clientSecret || code.startsWith('mock_')) {
      this.logger.warn('X / Twitter client credentials not fully configured or mock code used; using mock account.');
      return [
        {
          platform: SocialPlatform.TWITTER,
          platformUserId: `x_${Date.now()}`,
          username: 'ZerifyCreatorX',
          displayName: 'Zerify Creator (X)',
          avatar: 'https://images.unsplash.com/photo-1611605698323-b1e992d3777f?w=150&auto=format&fit=crop',
          followerCount: 18400,
          profileUrl: 'https://x.com/ZerifyCreatorX',
          accessToken: `x_access_token_${code.substring(0, 10)}`,
          refreshToken: `x_refresh_token_${Date.now()}`,
          expiresAt: new Date(Date.now() + 7200 * 1000),
          rawData: {
            id: `x_${Date.now()}`,
            username: 'ZerifyCreatorX',
            name: 'Zerify Creator (X)',
            description: 'Creator on X sharing content with Zerify ecosystem',
            public_metrics: {
              followers_count: 18400,
              following_count: 520,
              tweet_count: 850,
            },
            verified_type: 'blue',
          },
        },
      ];
    }

    try {
      const tokenUrl = this.getTokenUrl();
      const body = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier || '',
        client_id: clientId,
      });

      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      if (clientSecret) {
        const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        headers['Authorization'] = `Basic ${basicAuth}`;
      }

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers,
        body: body.toString(),
      });

      if (!res.ok) {
        const errText = await res.text();
        this.logger.error(`X Token exchange error: ${res.status} - ${errText}`);
        throw new BadRequestException(`Failed to exchange code with X: ${res.statusText}`);
      }

      const tokenData = await res.json();
      const accessToken = tokenData.access_token;
      const refreshToken = tokenData.refresh_token;
      const expiresIn = tokenData.expires_in || 7200;
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Fetch user profile info
      const userInfo = await this.fetchUserInfo(accessToken);

      return [
        {
          platform: SocialPlatform.TWITTER,
          platformUserId: userInfo.id,
          username: userInfo.username,
          displayName: userInfo.name,
          avatar: userInfo.profile_image_url,
          followerCount: userInfo.public_metrics?.followers_count || 0,
          profileUrl: `https://x.com/${userInfo.username}`,
          accessToken,
          refreshToken,
          expiresAt,
          rawData: userInfo,
        },
      ];
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error('Error exchanging X code:', err?.stack || err);
      throw new InternalServerErrorException(err?.message || 'Failed to exchange authorization code with X');
    }
  }

  /**
   * Fetches the authenticated user's profile from X API v2.
   */
  async fetchUserInfo(accessToken: string): Promise<XUserResponse> {
    const baseUrl = this.getApiBaseUrl();
    const url = `${baseUrl}/users/me?user.fields=id,name,username,profile_image_url,description,public_metrics,verified,verified_type`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      this.logger.error(`Failed to fetch X user info: ${res.status} - ${errText}`);
      throw new BadRequestException('Failed to fetch authenticated X user profile');
    }

    const json = await res.json();
    if (!json?.data?.id) {
      throw new BadRequestException('Invalid user profile response from X API');
    }

    return json.data as XUserResponse;
  }

  /**
   * Fetches recent tweets for an X user ID.
   */
  async fetchUserTweets(
    userId: string,
    accessToken: string,
    maxResults = 10,
  ): Promise<XTweetResponse[]> {
    const baseUrl = this.getApiBaseUrl();
    const url = `${baseUrl}/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics,text`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      this.logger.warn(`Failed to fetch X user tweets (${res.status}): ${await res.text()}`);
      return [];
    }

    const json = await res.json();
    return (json?.data || []) as XTweetResponse[];
  }

  /**
   * Refreshes an expired X access token using the refresh token.
   */
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken?: string; expiresAt: Date }> {
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();
    const tokenUrl = this.getTokenUrl();

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (clientSecret) {
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      headers['Authorization'] = `Basic ${basicAuth}`;
    }

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers,
      body: body.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      this.logger.error(`Failed to refresh X access token: ${res.status} - ${errText}`);
      throw new BadRequestException('Failed to refresh X access token');
    }

    const tokenData = await res.json();
    const expiresIn = tokenData.expires_in || 7200;
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  }
}

