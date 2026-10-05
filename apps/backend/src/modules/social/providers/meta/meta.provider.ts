import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialPlatform } from '@prisma/client';
import { ISocialProvider } from '../social-provider.interface';
import { SocialAccountProfileDto } from '../../dto/social-account-profile.dto';

interface MetaShortTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface MetaLongTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface MetaPageAccount {
  id: string;
  name: string;
  access_token?: string;
  fan_count?: number;
  followers_count?: number;
  picture?: {
    data?: {
      url?: string;
    };
  };
  instagram_business_account?: {
    id: string;
    username?: string;
    name?: string;
    profile_picture_url?: string;
    followers_count?: number;
  };
}

interface MetaAccountsResponse {
  data?: MetaPageAccount[];
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

export interface MetaDiscoveredPage {
  id: string;
  name: string;
  category?: string;
  accessToken: string;
  tasks?: string[];
  fanCount?: number;
  followerCount?: number;
  pictureUrl?: string;
  link?: string;
  isVerified?: boolean | null;
  instagramBusinessAccount?: {
    id: string;
    username?: string;
    name?: string;
    profilePictureUrl?: string;
    followersCount?: number;
  };
}

export interface MetaPageInsights {
  reach: number | null;
  impressions: number | null;
  mediaViews: number | null;
  engagedUsers: number | null;
  totalInteractions: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  clicks: number | null;
  views: number | null;
  rawMetrics: Record<string, any>;
}

export interface MetaAudienceDemographicItem {
  type: 'AGE_GENDER' | 'COUNTRY' | 'CITY' | 'LOCALE';
  key: string;
  value: number;
  percentage?: number;
  source: string;
  sourceMetric: string;
  label?: string;
  rawData?: any;
}

export interface MetaPagePostItem {
  platformMediaId: string;
  message?: string;
  caption?: string;
  permalink?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
  publishedAt?: Date;
  likeCount: number | null;
  commentCount: number | null;
  shareCount: number | null;
  rawPayload: Record<string, any>;
}

@Injectable()
export class MetaProvider implements ISocialProvider {
  private readonly logger = new Logger(MetaProvider.name);

  constructor(private readonly configService: ConfigService) { }

  getPlatform(): SocialPlatform {
    return SocialPlatform.META;
  }

  private getAppId(): string {
    const appId = this.configService.get<string>('META_APP_ID');
    if (!appId) {
      throw new InternalServerErrorException('META_APP_ID environment variable is missing');
    }
    return appId;
  }

  private getAppSecret(): string {
    const appSecret = this.configService.get<string>('META_APP_SECRET');
    if (!appSecret) {
      throw new InternalServerErrorException('META_APP_SECRET environment variable is missing');
    }
    return appSecret;
  }

  private getGraphApiUrl(): string {
    const apiVersion = this.configService.get<string>('META_API_VERSION') || 'v26.0';
    const graphUrl =
      this.configService.get<string>('META_GRAPH_URL') || `https://graph.facebook.com/${apiVersion}`;
    return graphUrl.replace(/\/+$/, '');
  }

  getAuthUrl(redirectUri: string, state: string, codeChallenge?: string, forceReauth: boolean = true): string {
    const appId = this.getAppId();

    const apiVersion = this.configService.get<string>('META_API_VERSION') || 'v26.0';
    const dialogUrl =
      this.configService.get<string>('META_OAUTH_DIALOG_URL') ||
      `https://www.facebook.com/${apiVersion}/dialog/oauth`;

    const url = new URL(dialogUrl);

    url.searchParams.append('client_id', appId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('override_default_response_type', 'true');

    // For personal Facebook Profile connection, standard OAuth requires scopes: public_profile, email, user_friends, user_posts.
    // When config_id is provided, Meta locks permissions to Business assets and ignores user scopes.
    // Hence, config_id is only attached if explicitly configured via META_USE_CONFIG_ID=true.
    const configId = this.configService.get<string>('META_CONFIG_ID');
    const useConfigId = this.configService.get<string>('META_USE_CONFIG_ID') === 'true';
    if (configId && useConfigId) {
      url.searchParams.append('config_id', configId);
    }

    if (forceReauth) {
      url.searchParams.append('auth_type', 'rerequest');
    }

    const defaultScopes =
      'public_profile,email,pages_show_list,pages_read_engagement,pages_read_user_content';
    const customScopes = this.configService.get<string>('META_SCOPES');

    if (customScopes) {
      url.searchParams.append('scope', customScopes);
    } else {
      url.searchParams.append('scope', defaultScopes);
    }

    return url.toString();
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string,
  ): Promise<{ userAccessToken: string; expiresInSeconds: number; expiresAt: Date }> {
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();
    const graphUrl = this.getGraphApiUrl();

    // Exchange authorization code for short-lived access token
    const tokenUrl = `${graphUrl}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&client_secret=${appSecret}&code=${code}`;

    const res = await fetch(tokenUrl);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      this.logger.error('Meta code exchange error:', err);
      throw new BadRequestException(err?.error?.message || 'Failed to exchange Meta authorization code');
    }

    const shortData = (await res.json()) as MetaShortTokenResponse;

    // Exchange short-lived token for long-lived 60-day token
    const longTokenUrl = `${graphUrl}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortData.access_token}`;
    const longRes = await fetch(longTokenUrl);
    const longData = (await longRes.json()) as MetaLongTokenResponse & { error?: any };

    const userAccessToken = longRes.ok && longData.access_token ? longData.access_token : shortData.access_token;
    const expiresInSeconds = longData.expires_in || 60 * 24 * 60 * 60; // Default 60 days
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    return { userAccessToken, expiresInSeconds, expiresAt };
  }

  async getUserProfile(userAccessToken: string): Promise<{
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    followerCount?: number;
    engagementRate?: number;
  } | null> {
    const graphUrl = this.getGraphApiUrl();
    try {
      const userMeUrl = `${graphUrl}/me?fields=id,name,email,picture.width(480).height(480){url},friends.summary(true),link&access_token=${userAccessToken}`;
      let res = await fetch(userMeUrl);
      if (!res.ok) {
        // Fallback to standard picture field if custom dimensions are unsupported
        res = await fetch(`${graphUrl}/me?fields=id,name,email,picture{url},friends.summary(true),link&access_token=${userAccessToken}`);
      }
      if (!res.ok) return null;
      const data = (await res.json()) as any;

      // 1. Resolve Friends / Followers count
      let friendCount = data.friends?.summary?.total_count ?? (Array.isArray(data.friends?.data) ? data.friends.data.length : null) ?? 0;
      if (friendCount === 0) {
        try {
          const friendsRes = await fetch(`${graphUrl}/me/friends?summary=true&access_token=${userAccessToken}`);
          if (friendsRes.ok) {
            const friendsData = await friendsRes.json();
            friendCount = friendsData.summary?.total_count ?? (Array.isArray(friendsData.data) ? friendsData.data.length : 0);
          }
        } catch (fErr) {
          this.logger.debug('Could not fetch /me/friends summary count:', fErr);
        }
      }

      // 1b. Check if user is in Professional Mode with followers_count
      if (friendCount === 0) {
        try {
          const followerRes = await fetch(`${graphUrl}/me?fields=followers_count&access_token=${userAccessToken}`);
          if (followerRes.ok) {
            const fData = await followerRes.json();
            if (typeof fData.followers_count === 'number') {
              friendCount = fData.followers_count;
            }
          }
        } catch (folErr) {
          this.logger.debug('Could not fetch /me followers_count:', folErr);
        }
      }

      // 1c. Fetch managed pages to aggregate followers if personal profile followers is 0
      let managedPages: any[] = [];
      try {
        const pagesRes = await fetch(`${graphUrl}/me/accounts?fields=id,name,fan_count,followers_count,picture{url},access_token&access_token=${userAccessToken}`);
        if (pagesRes.ok) {
          const pagesData = await pagesRes.json();
          managedPages = Array.isArray(pagesData.data) ? pagesData.data : [];
          if (friendCount === 0 && managedPages.length > 0) {
            friendCount = managedPages.reduce((sum, p) => sum + (p.followers_count ?? p.fan_count ?? 0), 0);
          }
        }
      } catch (pagesErr) {
        this.logger.debug('Could not fetch /me/accounts for follower fallback:', pagesErr);
      }

      // 2. Query personal posts to calculate live Engagement Rate
      let totalInteractions = 0;
      let postCount = 0;
      try {
        const postsRes = await fetch(
          `${graphUrl}/me/posts?fields=id,message,created_time,reactions.summary(true),comments.summary(true),shares&limit=25&access_token=${userAccessToken}`,
        );
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          let posts = Array.isArray(postsData.data) ? postsData.data : [];
          if (posts.length === 0) {
            const feedRes = await fetch(
              `${graphUrl}/me/feed?fields=id,message,created_time,reactions.summary(true),comments.summary(true),shares&limit=25&access_token=${userAccessToken}`,
            );
            if (feedRes.ok) {
              const feedData = await feedRes.json();
              posts = Array.isArray(feedData.data) ? feedData.data : [];
            }
          }

          postCount = posts.length;
          for (const p of posts) {
            const likes = p.reactions?.summary?.total_count ?? 0;
            const comments = p.comments?.summary?.total_count ?? 0;
            const shares = p.shares?.count ?? 0;
            totalInteractions += likes + comments + shares;
          }
        }
      } catch (pErr) {
        this.logger.debug('Could not query user posts for engagement calculation:', pErr);
      }

      // If no personal posts returned, query managed pages posts using page access token
      if (postCount === 0 && managedPages.length > 0) {
        for (const page of managedPages) {
          if (!page.access_token) continue;
          try {
            const pRes = await fetch(
              `${graphUrl}/${page.id}/posts?fields=id,message,created_time,reactions.summary(true),comments.summary(true),shares&limit=25&access_token=${page.access_token}`,
            );
            if (pRes.ok) {
              const pData = await pRes.json();
              const pagePosts = Array.isArray(pData.data) ? pData.data : [];
              postCount += pagePosts.length;
              for (const p of pagePosts) {
                const likes = p.reactions?.summary?.total_count ?? 0;
                const comments = p.comments?.summary?.total_count ?? 0;
                const shares = p.shares?.count ?? 0;
                totalInteractions += likes + comments + shares;
              }
            }
          } catch (pagePostErr) {
            this.logger.debug(`Could not query page ${page.id} posts:`, pagePostErr);
          }
        }
      }

      let engagementRate = 0.0;
      if (postCount > 0 && friendCount > 0) {
        engagementRate = parseFloat((((totalInteractions / postCount) / friendCount) * 100).toFixed(2));
      } else if (postCount > 0 && totalInteractions > 0) {
        engagementRate = parseFloat((totalInteractions / postCount).toFixed(2));
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.picture?.data?.url,
        followerCount: friendCount,
        engagementRate,
      };
    } catch (err) {
      this.logger.warn('Could not fetch primary Meta user profile:', err);
      return null;
    }
  }

  async getManagedPages(userAccessToken: string): Promise<MetaDiscoveredPage[]> {
    const graphUrl = this.getGraphApiUrl();
    const discoveredPages: MetaDiscoveredPage[] = [];

    let nextUrl: string | null = `${graphUrl}/me/accounts?fields=id,name,category,access_token,tasks,fan_count,followers_count,link,is_verified,picture{url},instagram_business_account{id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography}&limit=100&access_token=${userAccessToken}`;

    while (nextUrl) {
      try {
        const res = await fetch(nextUrl);
        if (!res.ok) {
          this.logger.warn(`Failed to fetch managed pages batch: ${res.statusText}`);
          break;
        }

        const json = (await res.json()) as {
          data?: any[];
          paging?: { next?: string };
          error?: any;
        };

        if (json.error) {
          this.logger.error('Meta /me/accounts error:', json.error);
          break;
        }

        const pages = json.data || [];
        for (const page of pages) {
          const isVerified = typeof page.is_verified === 'boolean' ? page.is_verified : null;
          const fanCount = typeof page.fan_count === 'number' ? page.fan_count : undefined;
          const followerCount = typeof page.followers_count === 'number' ? page.followers_count : fanCount;

          let igAccount: MetaDiscoveredPage['instagramBusinessAccount'];
          if (page.instagram_business_account) {
            igAccount = {
              id: page.instagram_business_account.id,
              username: page.instagram_business_account.username,
              name: page.instagram_business_account.name,
              profilePictureUrl: page.instagram_business_account.profile_picture_url,
              followersCount: page.instagram_business_account.followers_count,
            };
          }

          discoveredPages.push({
            id: String(page.id),
            name: page.name,
            category: page.category,
            accessToken: page.access_token || userAccessToken,
            tasks: page.tasks,
            fanCount,
            followerCount,
            pictureUrl: page.picture?.data?.url,
            link: page.link,
            isVerified,
            instagramBusinessAccount: igAccount,
          });
        }

        nextUrl = json.paging?.next || null;
      } catch (err) {
        this.logger.error('Error paginating /me/accounts:', err);
        break;
      }
    }

    return discoveredPages;
  }

  async getPageProfile(pageId: string, pageAccessToken: string): Promise<Record<string, any> | null> {
    const graphUrl = this.getGraphApiUrl();
    const fields = 'id,name,username,about,description,category,fan_count,followers_count,link,picture{url},is_verified,website,single_line_address';
    try {
      const url = `${graphUrl}/${pageId}?fields=${fields}&access_token=${pageAccessToken}`;
      const res = await fetch(url);
      if (!res.ok) {
        this.logger.warn(`Failed to fetch profile for page ${pageId}: ${res.statusText}`);
        return null;
      }
      return await res.json();
    } catch (err) {
      this.logger.error(`Error fetching page profile for ${pageId}:`, err);
      return null;
    }
  }

  async getPageInsights(pageId: string, pageAccessToken: string): Promise<MetaPageInsights> {
    const graphUrl = this.getGraphApiUrl();
    const insights: MetaPageInsights = {
      reach: null,
      impressions: null,
      mediaViews: null,
      engagedUsers: null,
      totalInteractions: null,
      likes: null,
      comments: null,
      shares: null,
      clicks: null,
      views: null,
      rawMetrics: {},
    };

    const metricsToRequest = [
      'page_post_engagements',
      'page_views_total',
      'page_daily_follows',
      'page_daily_follows_unique',
    ].join(',');

    try {
      const url = `${graphUrl}/${pageId}/insights?metric=${metricsToRequest}&period=day&access_token=${pageAccessToken}`;
      const res = await fetch(url);
      if (!res.ok) {
        this.logger.warn(`Page insights request for ${pageId} returned status ${res.status}`);
        return insights;
      }

      const json = await res.json();
      if (json.error) {
        this.logger.warn(`Page insights error for ${pageId}: ${json.error.message}`);
        return insights;
      }

      const data = json.data || [];
      for (const item of data) {
        const metricName = item.name;
        insights.rawMetrics[metricName] = item.values;
        const latestVal = Array.isArray(item.values) && item.values.length > 0
          ? item.values[item.values.length - 1]?.value
          : null;

        if (typeof latestVal === 'number') {
          if (metricName === 'page_post_engagements') {
            insights.totalInteractions = latestVal;
            insights.engagedUsers = latestVal;
          }
          if (metricName === 'page_views_total') {
            insights.views = latestVal;
            insights.impressions = latestVal;
            insights.reach = latestVal;
          }
        }
      }
    } catch (err) {
      this.logger.warn(`Failed to fetch page insights for ${pageId}:`, err);
    }

    return insights;
  }

  async getPageDemographics(pageId: string, pageAccessToken: string): Promise<MetaAudienceDemographicItem[]> {
    const graphUrl = this.getGraphApiUrl();
    const demographicMetrics = [
      'page_fans_gender_age',
      'page_fans_country',
      'page_fans_city',
      'page_fans_locale',
    ].join(',');

    const results: MetaAudienceDemographicItem[] = [];

    try {
      const url = `${graphUrl}/${pageId}/insights?metric=${demographicMetrics}&period=lifetime&access_token=${pageAccessToken}`;
      const res = await fetch(url);
      if (!res.ok) {
        return [];
      }

      const json = await res.json();
      if (json.error || !Array.isArray(json.data)) {
        return [];
      }

      for (const item of json.data) {
        const metricName = item.name;
        const latestVal = Array.isArray(item.values) && item.values.length > 0
          ? item.values[item.values.length - 1]?.value
          : null;

        if (!latestVal || typeof latestVal !== 'object') continue;

        let demoType: 'AGE_GENDER' | 'COUNTRY' | 'CITY' | 'LOCALE' = 'COUNTRY';
        if (metricName === 'page_fans_gender_age') demoType = 'AGE_GENDER';
        else if (metricName === 'page_fans_country') demoType = 'COUNTRY';
        else if (metricName === 'page_fans_city') demoType = 'CITY';
        else if (metricName === 'page_fans_locale') demoType = 'LOCALE';

        const entries = Object.entries(latestVal);
        const total = entries.reduce((acc, [, val]) => acc + (typeof val === 'number' ? val : 0), 0);

        for (const [k, count] of entries) {
          if (typeof count !== 'number' || count <= 0) continue;
          const percentage = total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : undefined;

          results.push({
            type: demoType,
            key: k,
            value: count,
            percentage,
            source: 'FACEBOOK_GRAPH_API',
            sourceMetric: metricName,
            label: k,
            rawData: { count, total, percentage },
          });
        }
      }
    } catch (err) {
      this.logger.warn(`Could not fetch Facebook page demographics for ${pageId}:`, err);
    }

    return results;
  }

  async getPagePosts(pageId: string, pageAccessToken: string, limit = 50): Promise<MetaPagePostItem[]> {
    const graphUrl = this.getGraphApiUrl();
    const posts: MetaPagePostItem[] = [];
    const fields = 'id,message,created_time,permalink_url,full_picture,attachments{media_type,url,unshimmed_url},shares,comments.summary(true),likes.summary(true),reactions.summary(true)';

    let nextUrl: string | null = `${graphUrl}/${pageId}/posts?fields=${fields}&limit=${Math.min(limit, 100)}&access_token=${pageAccessToken}`;

    while (nextUrl && posts.length < limit) {
      try {
        const res = await fetch(nextUrl);
        if (!res.ok) {
          // If query failed because pages_read_user_content is missing, fall back to basic post fields
          if (res.status === 400 && nextUrl.includes('reactions.summary')) {
            const fallbackFields = 'id,message,created_time,permalink_url,shares';
            nextUrl = `${graphUrl}/${pageId}/posts?fields=${fallbackFields}&limit=${Math.min(limit, 100)}&access_token=${pageAccessToken}`;
            continue;
          }
          break;
        }

        const json = await res.json();
        if (json.error || !Array.isArray(json.data)) break;

        for (const post of json.data) {
          const likes = post.likes?.summary?.total_count ?? post.reactions?.summary?.total_count ?? null;
          const comments = post.comments?.summary?.total_count ?? null;
          const shares = post.shares?.count ?? null;

          const attachment = post.attachments?.data?.[0];
          let mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL' = 'IMAGE';
          if (attachment?.media_type === 'video') mediaType = 'VIDEO';
          else if (attachment?.media_type === 'album') mediaType = 'CAROUSEL';

          const mediaUrl = attachment?.url || attachment?.unshimmed_url || post.full_picture;

          posts.push({
            platformMediaId: String(post.id),
            message: post.message,
            caption: post.message,
            permalink: post.permalink_url,
            thumbnailUrl: post.full_picture,
            mediaUrl,
            mediaType,
            publishedAt: post.created_time ? new Date(post.created_time) : undefined,
            likeCount: likes,
            commentCount: comments,
            shareCount: shares,
            rawPayload: {
              id: post.id,
              created_time: post.created_time,
              permalink_url: post.permalink_url,
              attachments: post.attachments,
            },
          });

          if (posts.length >= limit) break;
        }

        nextUrl = json.paging?.next || null;
      } catch (err) {
        this.logger.warn(`Error paginating posts for page ${pageId}:`, err);
        break;
      }
    }

    return posts;
  }

  async exchangeCodeAndGetAccounts(
    code: string,
    redirectUri: string,
  ): Promise<SocialAccountProfileDto[]> {
    const { userAccessToken, expiresAt } = await this.exchangeCodeForTokens(code, redirectUri);
    const profiles: SocialAccountProfileDto[] = [];

    // 1. User profile
    const user = await this.getUserProfile(userAccessToken);
    if (user) {
      profiles.push({
        platform: SocialPlatform.FACEBOOK,
        platformUserId: user.id,
        username: user.name,
        displayName: user.name,
        avatar: user.avatar,
        accessToken: userAccessToken,
        expiresAt,
      });
    }

    // 2. Discovered pages with pagination
    const pages = await this.getManagedPages(userAccessToken);
    for (const page of pages) {
      if (!profiles.some((p) => p.platformUserId === page.id)) {
        profiles.push({
          platform: SocialPlatform.FACEBOOK,
          platformUserId: page.id,
          username: page.name,
          displayName: page.name,
          avatar: page.pictureUrl,
          followerCount: page.followerCount,
          accessToken: page.accessToken,
          expiresAt,
        });
      }

      if (page.instagramBusinessAccount && !profiles.some((p) => p.platformUserId === page.instagramBusinessAccount!.id)) {
        const ig = page.instagramBusinessAccount;
        profiles.push({
          platform: SocialPlatform.INSTAGRAM,
          platformUserId: ig.id,
          username: ig.username || ig.name || `ig_${ig.id}`,
          displayName: ig.name || ig.username || 'Instagram Account',
          avatar: ig.profilePictureUrl,
          followerCount: ig.followersCount,
          accessToken: page.accessToken,
          expiresAt,
        });
      }
    }

    if (profiles.length === 0) {
      throw new BadRequestException('Failed to discover any Meta assets for this user.');
    }

    return profiles;
  }
}
