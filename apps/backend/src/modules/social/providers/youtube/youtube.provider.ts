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
  durationSeconds?: number;
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

export interface YouTubeDemographicItem {
  type: 'AGE_GENDER' | 'COUNTRY' | 'CITY' | 'LOCALE';
  key: string;
  label?: string;
  value: number;
  percentage?: number;
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

export function parseIsoDuration(duration?: string): number {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
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
            bannerUrl: undefined,
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
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,brandingSettings&mine=true',
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
    const branding = channel.brandingSettings || {};

    // Section 9: Follower count is subscriberCount. If hidden, null.
    const subscriberCount =
      stats.hiddenSubscriberCount === true || stats.subscriberCount === undefined || stats.subscriberCount === null
        ? null
        : parseInt(stats.subscriberCount, 10);

    // Section 10: Video count
    const videoCount =
      stats.videoCount !== undefined && stats.videoCount !== null ? parseInt(stats.videoCount, 10) : null;

    // Section 11: Total channel view count
    const viewCount = stats.viewCount ? BigInt(stats.viewCount) : null;

    const avatarUrl =
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url;

    const bannerUrl = branding.image?.bannerExternalUrl;
    const uploadsPlaylistId = contentDetails.relatedPlaylists?.uploads;

    // Section 13: Canonical profile URL
    const canonicalProfileUrl = snippet.customUrl
      ? `https://www.youtube.com/${snippet.customUrl}`
      : `https://www.youtube.com/channel/${channelId}`;

    return [
      {
        platform: SocialPlatform.YOUTUBE,
        platformUserId: channelId,
        username: snippet.customUrl || snippet.title,
        displayName: snippet.title,
        profileUrl: canonicalProfileUrl,
        avatar: avatarUrl,
        followerCount: subscriberCount ?? undefined,
        accessToken,
        refreshToken,
        expiresAt,
        rawData: {
          channelId,
          channelTitle: snippet.title,
          channelDescription: snippet.description,
          customUrl: snippet.customUrl,
          thumbnailUrl: avatarUrl,
          bannerUrl,
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
   * Conforms to TRD Section 6 & 45.
   */
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken?: string; expiresAt: Date }> {
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
      throw new BadRequestException(
        data.error_description || data.error || 'Failed to refresh YouTube access token. Reauthorization required.',
      );
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token, // May be rotated
      expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
    };
  }

  /**
   * Discovers and retrieves video metadata and metrics using the channel's Uploads Playlist.
   * Traverses pagination tokens and retrieves statistics in chunks.
   * Conforms to TRD Section 11 & Fix Spec Section 34-36.
   */
  async fetchChannelVideos(
    accessToken: string,
    uploadsPlaylistId?: string,
    maxResults = 50,
  ): Promise<YouTubeVideoData[]> {
    if (!uploadsPlaylistId || uploadsPlaylistId.startsWith('UU_mock')) {
      return [];
    }

    try {
      const allVideoIds: string[] = [];
      let nextPageToken: string | undefined = undefined;

      // 1. Fetch playlist items from Uploads playlist using cursor pagination
      while (allVideoIds.length < maxResults) {
        const pageSize = Math.min(50, maxResults - allVideoIds.length);
        const pageTokenParam = nextPageToken ? `&pageToken=${encodeURIComponent(nextPageToken)}` : '';
        const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(uploadsPlaylistId)}&maxResults=${pageSize}${pageTokenParam}`;

        const playlistRes = await fetch(playlistUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!playlistRes.ok) {
          const errJson = await playlistRes.json().catch(() => ({}));
          this.logger.warn('Error querying YouTube playlistItems:', errJson);
          break;
        }

        const playlistData = await playlistRes.json();
        const items = playlistData.items || [];
        if (items.length === 0) break;

        for (const item of items) {
          const vidId = item.contentDetails?.videoId;
          if (vidId) {
            allVideoIds.push(vidId);
          }
        }

        nextPageToken = playlistData.nextPageToken;
        if (!nextPageToken) break;
      }

      if (allVideoIds.length === 0) return [];

      // 2. Fetch full video statistics and content details in batches of 50
      const videos: YouTubeVideoData[] = [];
      const batchSize = 50;

      for (let i = 0; i < allVideoIds.length; i += batchSize) {
        const batchIds = allVideoIds.slice(i, i + batchSize);
        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,status&id=${batchIds.join(',')}`;

        const videosRes = await fetch(videosUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!videosRes.ok) {
          const errJson = await videosRes.json().catch(() => ({}));
          this.logger.warn('Error fetching YouTube videos batch:', errJson);
          continue;
        }

        const videosData = await videosRes.json();
        if (!videosData.items) continue;

        for (const vid of videosData.items) {
          const snippet = vid.snippet || {};
          const stats = vid.statistics || {};
          const contentDetails = vid.contentDetails || {};
          const status = vid.status || {};

          const durationIso = contentDetails.duration;
          const durationSeconds = parseIsoDuration(durationIso);

          videos.push({
            videoId: vid.id,
            title: snippet.title || 'Untitled Video',
            description: snippet.description,
            thumbnailUrl:
              snippet.thumbnails?.high?.url ||
              snippet.thumbnails?.medium?.url ||
              snippet.thumbnails?.default?.url,
            publishedAt: snippet.publishedAt ? new Date(snippet.publishedAt) : undefined,
            duration: durationIso,
            durationSeconds,
            viewCount: stats.viewCount ? BigInt(stats.viewCount) : BigInt(0),
            likeCount: stats.likeCount ? parseInt(stats.likeCount, 10) : 0,
            commentCount: stats.commentCount ? parseInt(stats.commentCount, 10) : 0,
            privacyStatus: status.privacyStatus || 'public',
            liveBroadcastContent: snippet.liveBroadcastContent || 'none',
          });
        }
      }

      return videos;
    } catch (err) {
      this.logger.error('Failed to fetch YouTube channel videos:', err);
      return [];
    }
  }

  /**
   * Retrieves authorized YouTube Analytics daily performance report.
   * Conforms to TRD Section 14 & Fix Spec Section 20-25.
   */
  async fetchChannelAnalytics(
    accessToken: string,
    startDate?: string,
    endDate?: string,
  ): Promise<YouTubeAnalyticsSnapshot[]> {
    if (accessToken.startsWith('mock_')) {
      return [];
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

      const analyticsUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${start}&endDate=${end}&metrics=${metrics}&dimensions=day&sort=day`;
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

  /**
   * Retrieves authorized audience demographics from YouTube Analytics.
   * Real data only; zero synthetic generation (conforms to Fix Spec Section 27-31).
   */
  async fetchChannelDemographics(
    accessToken: string,
    startDate?: string,
    endDate?: string,
  ): Promise<YouTubeDemographicItem[]> {
    if (accessToken.startsWith('mock_')) {
      return [];
    }

    const demographics: YouTubeDemographicItem[] = [];
    const now = new Date();
    const end = endDate || now.toISOString().split('T')[0];
    const start =
      startDate ||
      new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      // 1. Age & Gender breakdown from YouTube Analytics
      const ageGenderUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${start}&endDate=${end}&metrics=viewerPercentage&dimensions=ageGroup,gender&sort=gender,ageGroup`;
      const ageRes = await fetch(ageGenderUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (ageRes.ok) {
        const ageData = await ageRes.json();
        if (Array.isArray(ageData.rows)) {
          for (const row of ageData.rows) {
            const ageGroup = String(row[0] || ''); // e.g. "age18-24", "age25-34"
            const gender = String(row[1] || ''); // "female", "male", "genderOther"
            const pct = Number(row[2] || 0);

            const cleanAge = ageGroup.replace(/^age/, '');
            const cleanGender = gender === 'female' ? 'F' : gender === 'male' ? 'M' : 'Other';
            const key = `${cleanAge}.${cleanGender}`;
            const label = `${cleanGender === 'F' ? 'Female' : cleanGender === 'M' ? 'Male' : 'Other'} (${cleanAge})`;

            demographics.push({
              type: 'AGE_GENDER',
              key,
              label,
              value: pct,
              percentage: pct,
            });
          }
        }
      }

      // 2. Geography / Country breakdown
      const geoUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${start}&endDate=${end}&metrics=views&dimensions=country&sort=-views&maxResults=10`;
      const geoRes = await fetch(geoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (Array.isArray(geoData.rows)) {
          const totalViews = geoData.rows.reduce((sum: number, r: any[]) => sum + Number(r[1] || 0), 0) || 1;
          for (const row of geoData.rows) {
            const countryCode = String(row[0] || '');
            const views = Number(row[1] || 0);
            const pct = Math.round((views / totalViews) * 1000) / 10;
            demographics.push({
              type: 'COUNTRY',
              key: countryCode,
              label: countryCode,
              value: views,
              percentage: pct,
            });
          }
        }
      }
    } catch (err) {
      this.logger.warn('Error querying YouTube Analytics demographics:', err);
    }

    return demographics;
  }
}
