import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialPlatform } from '@prisma/client';
import { ISocialProvider } from '../social-provider.interface';
import { SocialAccountProfileDto } from '../../dto/social-account-profile.dto';

export interface YouTubeVideoData {
  videoId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  publishedAt?: Date;
  duration?: string;
  viewCount: bigint;
  likeCount: number;
  commentCount: number;
  privacyStatus?: string;
  liveBroadcastContent?: string;
}

export interface YouTubeAnalyticsSnapshot {
  date: Date;
  views: bigint;
  likes: number;
  comments: number;
  shares: number;
  subscribersGained: number;
  subscribersLost: number;
  estimatedMinutesWatched: bigint;
  averageViewDuration: number;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}

@Injectable()
export class YoutubeProvider implements ISocialProvider {
  private readonly logger = new Logger(YoutubeProvider.name);

  constructor(private readonly configService: ConfigService) {}

  getPlatform(): SocialPlatform {
    return SocialPlatform.YOUTUBE;
  }

  private getClientId(): string {
    return this.configService.get<string>('YOUTUBE_CLIENT_ID') || '';
  }

  private getClientSecret(): string {
    return this.configService.get<string>('YOUTUBE_CLIENT_SECRET') || '';
  }

  /**
   * Generates Google OAuth 2.0 authorization URL for YouTube Data & Analytics APIs.
   * Prompts for consent and requests offline access to receive a persistent refresh token.
   */
  getAuthUrl(redirectUri: string, state: string): string {
    const clientId = this.getClientId();
    if (!clientId) {
      throw new BadRequestException(
        'YOUTUBE_CLIENT_ID is not configured in apps/backend/.env. Please configure your Google Cloud OAuth Client ID and Secret before connecting YouTube.',
      );
    }

    const scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' ');

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', scopes);
    url.searchParams.append('state', state);
    url.searchParams.append('access_type', 'offline');
    url.searchParams.append('prompt', 'select_account consent');
    url.searchParams.append('include_granted_scopes', 'true');

    return url.toString();
  }

  /**
   * Exchanges authorization code for Google access & refresh tokens,
   * then calls YouTube Data API to retrieve channel profile information.
   */
  async exchangeCodeAndGetAccounts(
    code: string,
    redirectUri: string,
  ): Promise<SocialAccountProfileDto[]> {
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();

    // Fallback/Mock implementation when testing without live Google credentials
    if (!clientId || !clientSecret || code.startsWith('mock_')) {
      this.logger.log('Using mock YouTube channel data for local verification');
      return [
        {
          platform: SocialPlatform.YOUTUBE,
          platformUserId: 'UC_mock_channel_789',
          username: 'Zerify Tech & Reviews',
          displayName: 'Zerify Tech & Reviews',
          profileUrl: 'https://youtube.com/@zerifyreviews',
          avatar: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format&fit=crop',
          followerCount: 142000,
          accessToken: `mock_yt_access_${Date.now()}`,
          refreshToken: `mock_yt_refresh_${Date.now()}`,
          expiresAt: new Date(Date.now() + 3600 * 1000),
          rawData: {
            channelId: 'UC_mock_channel_789',
            channelTitle: 'Zerify Tech & Reviews',
            channelDescription: 'Official Zerify YouTube Channel for tech and creator reviews',
            customUrl: '@zerifyreviews',
            thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&auto=format&fit=crop',
            subscriberCount: 142000,
            videoCount: 184,
            viewCount: BigInt(28500000),
            country: 'IN',
            publishedAt: new Date('2021-03-15'),
            uploadsPlaylistId: 'UU_mock_channel_789',
          },
        },
      ];
    }

    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;

    if (!tokenRes.ok || tokenData.error) {
      this.logger.error('Google OAuth token exchange failed:', tokenData);
      throw new BadRequestException(
        tokenData.error_description || tokenData.error || 'Failed to exchange YouTube authorization code',
      );
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);

    // 2. Fetch authenticated YouTube channel details
    const channelRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    const channelData = await channelRes.json();

    if (!channelRes.ok || channelData.error) {
      this.logger.error('YouTube Data API channel query failed:', channelData.error);
      throw new BadRequestException(
        channelData.error?.message || 'Failed to retrieve YouTube channel information',
      );
    }

    const items = channelData.items || [];
    if (items.length === 0) {
      throw new BadRequestException(
        'No active YouTube channel was found for this Google account. Please create a channel on YouTube first.',
      );
    }

    const channel = items[0];
    const channelId = channel.id;
    const snippet = channel.snippet || {};
    const stats = channel.statistics || {};
    const contentDetails = channel.contentDetails || {};

    const subscriberCount = parseInt(stats.subscriberCount || '0', 10);
    const videoCount = parseInt(stats.videoCount || '0', 10);
    const viewCount = BigInt(stats.viewCount || '0');
    const avatarUrl = snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url;
    const uploadsPlaylistId = contentDetails.relatedPlaylists?.uploads;

    return [
      {
        platform: SocialPlatform.YOUTUBE,
        platformUserId: channelId,
        username: snippet.customUrl || snippet.title,
        displayName: snippet.title,
        profileUrl: snippet.customUrl ? `https://youtube.com/${snippet.customUrl}` : `https://youtube.com/channel/${channelId}`,
        avatar: avatarUrl,
        followerCount: subscriberCount,
        accessToken,
        refreshToken,
        expiresAt,
        rawData: {
          channelId,
          channelTitle: snippet.title,
          channelDescription: snippet.description,
          customUrl: snippet.customUrl,
          thumbnailUrl: avatarUrl,
          subscriberCount,
          videoCount,
          viewCount,
          country: snippet.country,
          publishedAt: snippet.publishedAt ? new Date(snippet.publishedAt) : undefined,
          uploadsPlaylistId,
        },
      },
    ];
  }

  /**
   * Refreshes an expired Google access token using the stored refresh token.
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();

    if (!clientId || !clientSecret || refreshToken.startsWith('mock_')) {
      return {
        accessToken: `mock_yt_refreshed_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      };
    }

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = (await res.json()) as GoogleTokenResponse;
    if (!res.ok || data.error) {
      this.logger.error('Google token refresh failed:', data);
      throw new BadRequestException('Failed to refresh YouTube access token. Reauthorization required.');
    }

    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
    };
  }

  /**
   * Discovers and retrieves video metadata and metrics using the channel's Uploads Playlist.
   * Conforms to TRD Section 11 (Video Discovery).
   */
  async fetchChannelVideos(
    accessToken: string,
    uploadsPlaylistId?: string,
    maxResults = 25,
  ): Promise<YouTubeVideoData[]> {
    if (!uploadsPlaylistId || uploadsPlaylistId.startsWith('UU_mock')) {
      return this.getMockVideos();
    }

    try {
      // 1. Fetch playlist items from Uploads playlist
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}`;
      const playlistRes = await fetch(playlistUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const playlistData = await playlistRes.json();
      if (!playlistRes.ok || !playlistData.items || playlistData.items.length === 0) {
        return [];
      }

      const videoIds = playlistData.items
        .map((item: any) => item.contentDetails?.videoId)
        .filter(Boolean);

      if (videoIds.length === 0) return [];

      // 2. Fetch full video statistics and content details
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,status&id=${videoIds.join(',')}`;
      const videosRes = await fetch(videosUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const videosData = await videosRes.json();
      if (!videosRes.ok || !videosData.items) {
        return [];
      }

      return videosData.items.map((vid: any) => {
        const snippet = vid.snippet || {};
        const stats = vid.statistics || {};
        const contentDetails = vid.contentDetails || {};
        const status = vid.status || {};

        return {
          videoId: vid.id,
          title: snippet.title || 'Untitled Video',
          description: snippet.description,
          thumbnailUrl:
            snippet.thumbnails?.high?.url ||
            snippet.thumbnails?.medium?.url ||
            snippet.thumbnails?.default?.url,
          publishedAt: snippet.publishedAt ? new Date(snippet.publishedAt) : undefined,
          duration: contentDetails.duration, // ISO 8601 string e.g. PT12M30S
          viewCount: BigInt(stats.viewCount || '0'),
          likeCount: parseInt(stats.likeCount || '0', 10),
          commentCount: parseInt(stats.commentCount || '0', 10),
          privacyStatus: status.privacyStatus || 'public',
          liveBroadcastContent: snippet.liveBroadcastContent || 'none',
        };
      });
    } catch (err) {
      this.logger.error('Failed to fetch YouTube channel videos:', err);
      return [];
    }
  }

  /**
   * Retrieves authorized YouTube Analytics daily performance report.
   * Conforms to TRD Section 14 (YouTube Analytics API).
   */
  async fetchChannelAnalytics(
    accessToken: string,
    startDate?: string,
    endDate?: string,
  ): Promise<YouTubeAnalyticsSnapshot[]> {
    if (accessToken.startsWith('mock_')) {
      return this.getMockAnalytics();
    }

    try {
      const now = new Date();
      const end = endDate || now.toISOString().split('T')[0];
      const start =
        startDate ||
        new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const metrics = [
        'views',
        'likes',
        'comments',
        'shares',
        'subscribersGained',
        'subscribersLost',
        'estimatedMinutesWatched',
        'averageViewDuration',
      ].join(',');

      const analyticsUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${start}&endDate=${end}&metrics=${metrics}&dimensions=day`;
      const res = await fetch(analyticsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json();
      if (!res.ok || !data.rows) {
        this.logger.warn('YouTube Analytics report returned no rows or failed:', data);
        return [];
      }

      return data.rows.map((row: any[]) => ({
        date: new Date(row[0]),
        views: BigInt(row[1] || 0),
        likes: Number(row[2] || 0),
        comments: Number(row[3] || 0),
        shares: Number(row[4] || 0),
        subscribersGained: Number(row[5] || 0),
        subscribersLost: Number(row[6] || 0),
        estimatedMinutesWatched: BigInt(row[7] || 0),
        averageViewDuration: Number(row[8] || 0),
      }));
    } catch (err) {
      this.logger.error('Error querying YouTube Analytics API:', err);
      return [];
    }
  }

  private getMockVideos(): YouTubeVideoData[] {
    return [
      {
        videoId: 'vid_yt_mock_1',
        title: 'Complete Creator Sponsorship Workflow & Campaign Walkthrough',
        description: 'An in-depth breakdown of connecting brands with high-engagement tech creators.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        duration: 'PT14M22S',
        viewCount: BigInt(184200),
        likeCount: 9420,
        commentCount: 420,
        privacyStatus: 'public',
        liveBroadcastContent: 'none',
      },
      {
        videoId: 'vid_yt_mock_2',
        title: 'Top AI Development Tools for Content Creators in 2026',
        description: 'Reviewing modern automation, analytics, and collaboration toolkits.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        duration: 'PT9M45S',
        viewCount: BigInt(340100),
        likeCount: 18200,
        commentCount: 1120,
        privacyStatus: 'public',
        liveBroadcastContent: 'none',
      },
      {
        videoId: 'vid_yt_mock_3',
        title: 'Studio Desk Setup & 4K Recording Gear Tour',
        description: 'Everything we use to shoot 4K HDR sponsored brand integration content.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
        publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        duration: 'PT18M10S',
        viewCount: BigInt(95400),
        likeCount: 5120,
        commentCount: 380,
        privacyStatus: 'public',
        liveBroadcastContent: 'none',
      },
    ];
  }

  private getMockAnalytics(): YouTubeAnalyticsSnapshot[] {
    const snapshots: YouTubeAnalyticsSnapshot[] = [];
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      snapshots.push({
        date: new Date(now - i * 24 * 60 * 60 * 1000),
        views: BigInt(Math.floor(12000 + Math.random() * 8000)),
        likes: Math.floor(600 + Math.random() * 400),
        comments: Math.floor(40 + Math.random() * 30),
        shares: Math.floor(25 + Math.random() * 20),
        subscribersGained: Math.floor(80 + Math.random() * 50),
        subscribersLost: Math.floor(5 + Math.random() * 5),
        estimatedMinutesWatched: BigInt(Math.floor(45000 + Math.random() * 20000)),
        averageViewDuration: Number((3.5 + Math.random() * 1.5).toFixed(2)),
      });
    }
    return snapshots;
  }
}
