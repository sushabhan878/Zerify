import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialPlatform } from '@prisma/client';
import { ISocialProvider } from '../social-provider.interface';
import { SocialAccountProfileDto } from '../../dto/social-account-profile.dto';

export interface ThreadsUserProfile {
  id: string;
  username: string;
  name?: string;
  threads_profile_picture_url?: string;
  threads_biography?: string;
}

export interface ThreadsPostItem {
  id: string;
  media_product_type?: string;
  media_type?: string;
  text?: string;
  permalink?: string;
  timestamp?: string;
  shortcode?: string;
  is_quote_post?: boolean;
  has_replies?: boolean;
}

@Injectable()
export class ThreadsProvider implements ISocialProvider {
  private readonly logger = new Logger(ThreadsProvider.name);

  constructor(private readonly configService: ConfigService) {}

  getPlatform(): SocialPlatform {
    return SocialPlatform.THREADS;
  }

  private getClientId(): string {
    return (
      this.configService.get<string>('THREADS_CLIENT_ID') ||
      this.configService.get<string>('META_THREADS_CLIENT_ID') ||
      ''
    );
  }

  private getClientSecret(): string {
    return (
      this.configService.get<string>('THREADS_CLIENT_SECRET') ||
      this.configService.get<string>('META_THREADS_CLIENT_SECRET') ||
      ''
    );
  }

  private getAuthUrlBase(): string {
    return (
      this.configService.get<string>('THREADS_AUTH_URL') ||
      'https://threads.net/oauth/authorize'
    );
  }

  private getTokenUrl(): string {
    return (
      this.configService.get<string>('THREADS_TOKEN_URL') ||
      'https://graph.threads.net/oauth/access_token'
    );
  }

  private getApiBaseUrl(): string {
    return (
      this.configService.get<string>('THREADS_API_BASE_URL') ||
      'https://graph.threads.net'
    );
  }

  private getScopes(): string {
    return (
      this.configService.get<string>('THREADS_SCOPES') ||
      'threads_basic,threads_read_replies,threads_manage_insights'
    );
  }

  /**
   * Generates the Meta Threads OAuth 2.0 authorization URL.
   */
  getAuthUrl(redirectUri: string, state: string): string {
    const clientId = this.getClientId();
    const scopes = this.getScopes();

    if (!clientId) {
      this.logger.error('THREADS_CLIENT_ID or META_THREADS_CLIENT_ID is not configured in backend/.env');
      throw new InternalServerErrorException(
        'Meta Threads Client ID is missing. Please set THREADS_CLIENT_ID in apps/backend/.env',
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: 'code',
      state,
    });

    return `${this.getAuthUrlBase()}?${params.toString()}`;
  }

  /**
   * Exchanges an authorization code for an access token and retrieves profile details.
   * Exchanges short-lived token for a 60-day long-lived token.
   */
  async exchangeCodeAndGetAccounts(
    code: string,
    redirectUri: string,
  ): Promise<SocialAccountProfileDto[]> {
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();

    // Development Mock Fallback if credentials are unconfigured or code is mock
    if ((!clientId || !clientSecret) || code.startsWith('mock_') || code === 'dev_threads_code') {
      this.logger.warn(
        'THREADS_CLIENT_ID or THREADS_CLIENT_SECRET not configured or mock code received. Generating simulated Threads profile for local development.',
      );
      const mockId = `th_${Math.floor(100000000 + Math.random() * 900000000)}`;
      return [
        {
          platform: SocialPlatform.THREADS,
          platformUserId: mockId,
          username: 'threads_creator',
          displayName: 'Threads Creator',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
          followerCount: 24500,
          profileUrl: 'https://threads.net/@threads_creator',
          accessToken: `th_mock_access_token_${Date.now()}`,
          refreshToken: `th_mock_refresh_token_${Date.now()}`,
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          rawData: {
            id: mockId,
            username: 'threads_creator',
            name: 'Threads Creator',
            threads_profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
            threads_biography: 'Creator, storyteller & digital enthusiast 🧵',
            followersCount: 24500,
            followingCount: 380,
            postCount: 142,
          },
        },
      ];
    }

    try {
      // Step 1: Exchange code for short-lived access token (POST /oauth/access_token)
      const tokenUrl = this.getTokenUrl();
      const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      });

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!res.ok) {
        const errText = await res.text();
        this.logger.error(`Threads short-lived token exchange error: ${res.status} - ${errText}`);
        throw new BadRequestException(`Failed to exchange authorization code with Threads: ${res.statusText}`);
      }

      const tokenData = await res.json();
      const shortLivedToken = tokenData.access_token;
      const threadsUserId = String(tokenData.user_id || '');

      // Step 2: Exchange short-lived token for 60-day long-lived access token
      let accessToken = shortLivedToken;
      let expiresIn = 60 * 24 * 60 * 60; // 60 days default in seconds
      try {
        const longLivedUrl = `${this.getApiBaseUrl()}/access_token?grant_type=th_exchange_token&client_secret=${encodeURIComponent(clientSecret)}&access_token=${encodeURIComponent(shortLivedToken)}`;
        const longLivedRes = await fetch(longLivedUrl, { method: 'GET' });
        if (longLivedRes.ok) {
          const longLivedData = await longLivedRes.json();
          if (longLivedData.access_token) {
            accessToken = longLivedData.access_token;
            expiresIn = longLivedData.expires_in || expiresIn;
          }
        }
      } catch (longLivedErr) {
        this.logger.warn('Could not exchange short-lived Threads token for long-lived token, falling back to short-lived:', longLivedErr);
      }

      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Step 3: Fetch User Profile (/me) and follower count via Threads Insights
      const profile = await this.fetchUserProfile(accessToken, threadsUserId);
      const followerCount = await this.fetchFollowerCount(accessToken);

      return [
        {
          platform: SocialPlatform.THREADS,
          platformUserId: profile.id || threadsUserId,
          username: profile.username || 'threads_user',
          displayName: profile.name || profile.username || 'Threads User',
          avatar: profile.threads_profile_picture_url,
          followerCount,
          profileUrl: profile.username ? `https://threads.net/@${profile.username}` : undefined,
          accessToken,
          refreshToken: accessToken, // Threads uses the long-lived token itself for refresh
          expiresAt,
          rawData: {
            ...profile,
            followerCount,
          },
        },
      ];
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error('Error in Threads exchangeCodeAndGetAccounts:', err?.stack || err);
      throw new InternalServerErrorException(err?.message || 'Failed to exchange authorization code with Threads');
    }
  }

  /**
   * Fetches the user's follower count from Threads Insights API.
   * Conforms to Meta Threads Insights API: total_value { value } or values[0] { value }.
   */
  async fetchFollowerCount(accessToken: string): Promise<number> {
    try {
      const endpoint = `${this.getApiBaseUrl()}/v1.0/me/threads_insights?metric=followers_count&access_token=${encodeURIComponent(accessToken)}`;
      const res = await fetch(endpoint, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        const item = data?.data?.[0];
        const count =
          item?.total_value?.value ??
          item?.values?.[0]?.value ??
          item?.value;
        if (typeof count === 'number') {
          return count;
        }
      } else {
        const errText = await res.text();
        this.logger.warn(`Could not fetch Threads followers count (${res.status}): ${errText}`);
      }
    } catch (e) {
      this.logger.warn('Could not fetch Threads followers count from insights endpoint:', e);
    }
    return 0;
  }

  /**
   * Refreshes an unexpired long-lived Threads access token (extends another 60 days).
   */
  async refreshAccessToken(longLivedToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
    try {
      const refreshUrl = `${this.getApiBaseUrl()}/refresh_access_token?grant_type=th_refresh_token&access_token=${encodeURIComponent(longLivedToken)}`;
      const res = await fetch(refreshUrl, { method: 'GET' });
      if (!res.ok) {
        const errText = await res.text();
        this.logger.error(`Threads refresh token error: ${res.status} - ${errText}`);
        throw new BadRequestException('Failed to refresh Threads access token');
      }
      const data = await res.json();
      const accessToken = data.access_token || longLivedToken;
      const expiresIn = data.expires_in || 60 * 24 * 60 * 60;
      return {
        accessToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      };
    } catch (err: any) {
      this.logger.error('Threads token refresh failed:', err);
      throw err;
    }
  }

  /**
   * Fetches the authenticated user's profile from Threads Graph API.
   */
  async fetchUserProfile(accessToken: string, userId?: string): Promise<ThreadsUserProfile> {
    const endpoint = `${this.getApiBaseUrl()}/v1.0/me?fields=id,username,name,threads_profile_picture_url,threads_biography&access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(endpoint, { method: 'GET' });

    if (!res.ok) {
      const errText = await res.text();
      this.logger.error(`Failed to fetch Threads user profile: ${res.status} - ${errText}`);
      throw new BadRequestException('Failed to fetch Threads user profile');
    }

    const data = await res.json();
    return data as ThreadsUserProfile;
  }

  /**
   * Fetches recent Threads posts for the user.
   */
  async fetchUserThreads(accessToken: string, limit = 10): Promise<ThreadsPostItem[]> {
    try {
      const fields = 'id,media_product_type,media_type,text,permalink,timestamp,shortcode,is_quote_post,has_replies';
      const endpoint = `${this.getApiBaseUrl()}/v1.0/me/threads?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(accessToken)}`;
      const res = await fetch(endpoint, { method: 'GET' });

      if (!res.ok) {
        this.logger.warn(`Failed to fetch Threads posts: ${res.status}`);
        return [];
      }

      const data = await res.json();
      return Array.isArray(data?.data) ? data.data : [];
    } catch (err) {
      this.logger.warn('Error fetching user threads posts:', err);
      return [];
    }
  }

  /**
   * Fetches lifetime insights for a specific Threads post (views, likes, replies, reposts, quotes).
   */
  async fetchThreadPostInsights(
    accessToken: string,
    mediaId: string,
  ): Promise<{ views: number; likes: number; replies: number; reposts: number; quotes: number }> {
    try {
      const endpoint = `${this.getApiBaseUrl()}/v1.0/${mediaId}/insights?metric=views,likes,replies,reposts,quotes&access_token=${encodeURIComponent(accessToken)}`;
      const res = await fetch(endpoint, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        const metrics: Record<string, number> = {};
        for (const item of data?.data || []) {
          const val = item?.values?.[0]?.value ?? item?.total_value?.value ?? 0;
          metrics[item.name] = Number(val) || 0;
        }
        return {
          views: metrics.views || 0,
          likes: metrics.likes || 0,
          replies: metrics.replies || 0,
          reposts: metrics.reposts || 0,
          quotes: metrics.quotes || 0,
        };
      }
    } catch (e) {
      this.logger.warn(`Could not fetch insights for thread post ${mediaId}:`, e);
    }
    return { views: 0, likes: 0, replies: 0, reposts: 0, quotes: 0 };
  }
}
