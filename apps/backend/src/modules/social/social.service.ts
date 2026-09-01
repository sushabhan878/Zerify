import {
  Injectable,
  OnModuleInit,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  Inject,
  Optional,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { SocialRepository } from './social.repository';
import { SocialGateway } from './social.gateway';
import { MetaProvider } from './providers/meta/meta.provider';
import { InstagramProvider } from './providers/instagram/instagram.provider';
import { encryptToken, decryptToken, generateOAuthState, verifyOAuthState } from './utils/crypto.util';
import { SocialAccountResponseDto } from './dto/social-account-response.dto';

@Injectable()
export class SocialService implements OnModuleInit {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly socialRepository: SocialRepository,
    private readonly metaProvider: MetaProvider,
    private readonly instagramProvider: InstagramProvider,
    private readonly socialGateway: SocialGateway,
    @Optional() @Inject(CACHE_MANAGER) private readonly cacheManager?: Cache,
  ) { }

  onModuleInit() {
    this.logger.log('Initializing automated 15-minute background real-time sync timer for connected social accounts...');
    setInterval(() => {
      this.logger.log('Running automated background sync cycle for all connected accounts...');
      this.syncAllConnectedAccounts().catch((err) => {
        this.logger.error('Error during automated background sync cycle:', err);
      });
    }, 15 * 60 * 1000);
  }

  async syncAllConnectedAccounts(): Promise<void> {
    const accounts = await this.socialRepository.findAllConnectedAccounts();
    for (const acc of accounts) {
      this.syncAccountDetails(acc.id).catch((err) => {
        this.logger.error(`Error syncing account ${acc.id}:`, err);
      });
    }
  }


  private getMetaRedirectUri(): string {
    return (
      this.configService.get<string>('META_REDIRECT_URI') ||
      'https://gyration-dragging-freebie.ngrok-free.dev/api/v1/social/meta/callback'
    );
  }

  private getInstagramRedirectUri(): string {
    return (
      this.configService.get<string>('INSTAGRAM_REDIRECT_URI') ||
      'https://gyration-dragging-freebie.ngrok-free.dev/api/v1/social/instagram/callback'
    );
  }

  private getFrontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  getMetaAuthUrl(userId: string): { url: string; state: string } {
    const state = generateOAuthState(userId);
    const redirectUri = this.getMetaRedirectUri();
    const url = this.metaProvider.getAuthUrl(redirectUri, state);
    return { url, state };
  }

  getInstagramAuthUrl(userId: string): { url: string; state: string } {
    const state = generateOAuthState(userId);
    const redirectUri = this.getInstagramRedirectUri();
    const url = this.instagramProvider.getAuthUrl(redirectUri, state);
    return { url, state };
  }

  async handleMetaCallback(
    code?: string,
    state?: string,
    error?: string,
    errorDescription?: string,
  ): Promise<string> {
    const frontendUrl = this.getFrontendUrl();

    if (error || !code || !state) {
      this.logger.warn(`Meta OAuth Callback received error: ${error} - ${errorDescription}`);
      const reason = encodeURIComponent(errorDescription || error || 'Authorization was cancelled or denied');
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const { userId, isValid } = verifyOAuthState(state);
    if (!isValid || !userId) {
      this.logger.warn('Meta OAuth callback received invalid or expired state token');
      const reason = encodeURIComponent('Invalid or expired OAuth state parameter. Please try connecting again.');
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const redirectUri = this.getMetaRedirectUri();

    try {
      const profiles = await this.metaProvider.exchangeCodeAndGetAccounts(code, redirectUri);

      let savedCount = 0;
      for (const profile of profiles) {
        const encryptedAccessToken = encryptToken(profile.accessToken);
        const encryptedRefreshToken = profile.refreshToken
          ? encryptToken(profile.refreshToken)
          : null;

        const savedAcc = await this.socialRepository.upsertAccount({
          userId,
          platform: profile.platform,
          platformUserId: profile.platformUserId,
          username: profile.username,
          displayName: profile.displayName,
          avatar: profile.avatar,
          followerCount: profile.followerCount,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: profile.expiresAt,
        });

        // Trigger deep analytics sync immediately upon connecting
        this.syncAccountDetails(savedAcc.id).catch((syncErr) => {
          this.logger.error(`Initial analytics sync failed for account ${savedAcc.id}:`, syncErr);
        });

        savedCount++;
      }

      return `${frontendUrl}/social/callback?status=success&count=${savedCount}`;
    } catch (err: any) {
      this.logger.error('Error during Meta OAuth callback processing:', err?.stack || err);
      const message = encodeURIComponent(err?.message || 'Failed to connect Meta account');
      return `${frontendUrl}/social/callback?status=error&message=${message}`;
    }
  }

  async handleInstagramCallback(
    code?: string,
    state?: string,
    error?: string,
    errorDescription?: string,
  ): Promise<string> {
    const frontendUrl = this.getFrontendUrl();

    if (error || !code || !state) {
      this.logger.warn(`Instagram OAuth Callback received error: ${error} - ${errorDescription}`);
      const reason = encodeURIComponent(errorDescription || error || 'Authorization was cancelled or denied');
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const { userId, isValid } = verifyOAuthState(state);
    if (!isValid || !userId) {
      this.logger.warn('Instagram OAuth callback received invalid or expired state token');
      const reason = encodeURIComponent('Invalid or expired OAuth state parameter. Please try connecting again.');
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const redirectUri = this.getInstagramRedirectUri();

    try {
      const profiles = await this.instagramProvider.exchangeCodeAndGetAccounts(code, redirectUri);

      let savedCount = 0;
      for (const profile of profiles) {
        const encryptedAccessToken = encryptToken(profile.accessToken);
        const encryptedRefreshToken = profile.refreshToken
          ? encryptToken(profile.refreshToken)
          : null;

        const savedAcc = await this.socialRepository.upsertAccount({
          userId,
          platform: profile.platform,
          platformUserId: profile.platformUserId,
          username: profile.username,
          displayName: profile.displayName,
          avatar: profile.avatar,
          followerCount: profile.followerCount,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: profile.expiresAt,
        });

        // Trigger deep analytics sync immediately upon connecting
        this.syncAccountDetails(savedAcc.id).catch((syncErr) => {
          this.logger.error(`Initial analytics sync failed for account ${savedAcc.id}:`, syncErr);
        });

        savedCount++;
      }

      return `${frontendUrl}/social/callback?status=success&count=${savedCount}`;
    } catch (err: any) {
      this.logger.error('Error during Instagram OAuth callback processing:', err?.stack || err);
      const message = encodeURIComponent(err?.message || 'Failed to connect Instagram account');
      return `${frontendUrl}/social/callback?status=error&message=${message}`;
    }
  }

  async getUserAccounts(userId: string): Promise<SocialAccountResponseDto[]> {
    const accounts = await this.socialRepository.findByUserId(userId);
    return accounts.map((acc) => ({
      id: acc.id,
      userId: acc.userId,
      platform: acc.platform,
      platformUserId: acc.platformUserId,
      username: acc.username,
      handle: acc.handle,
      avatar: acc.avatar,
      followerCount: acc.followerCount,
      engagementRate: acc.engagementRate,
      profileUrl: acc.profileUrl,
      isVerified: acc.isVerified,
      expiresAt: acc.expiresAt,
      status: acc.status,
      connectedAt: acc.connectedAt,
      updatedAt: acc.updatedAt,
    }));
  }

  async disconnectAccount(userId: string, accountId: string): Promise<{ success: boolean; id: string }> {
    await this.socialRepository.disconnectAccount(accountId);
    if (this.cacheManager) {
      try {
        if (userId) {
          await this.cacheManager.del(`influencer:profile:${userId}`);
        }
        await this.cacheManager.del(`influencer:profile:first`);
      } catch (err) {
        this.logger.warn('Error clearing influencer cache on disconnect:', err);
      }
    }
    return { success: true, id: accountId };
  }

  async getAccountAnalytics(socialAccountId: string) {
    return this.socialRepository.getAccountAnalytics(socialAccountId);
  }

  async syncAllUserAccounts(userId: string): Promise<{ syncedCount: number }> {
    const accounts = await this.socialRepository.findByUserId(userId);
    let count = 0;

    for (const acc of accounts) {
      this.syncAccountDetails(acc.id).catch((err) => {
        this.logger.error(`Error during manual sync for account ${acc.id}:`, err);
      });
      count++;
    }

    return { syncedCount: count };
  }

  // --- Meta Webhook Handlers ---

  getWebhookUrl(): string {
    const webhookUrl = this.configService.get<string>('META_WEBHOOK_URL');
    if (!webhookUrl) {
      throw new InternalServerErrorException('META_WEBHOOK_URL environment variable is missing');
    }
    return webhookUrl;
  }

  verifyMetaWebhook(mode?: string, token?: string, challenge?: string): string {
    const configuredToken = this.configService.get<string>('META_WEBHOOK_VERIFY_TOKEN');

    if (!configuredToken) {
      this.logger.error('META_WEBHOOK_VERIFY_TOKEN environment variable is missing in .env');
      throw new InternalServerErrorException(
        'META_WEBHOOK_VERIFY_TOKEN environment variable is missing in server configuration',
      );
    }

    this.logger.log(`Received Meta Webhook Verification Request. Mode: ${mode}, Token matched: ${token === configuredToken}`);

    if (mode === 'subscribe' && token === configuredToken) {
      this.logger.log('Meta Webhook verification succeeded. Returning hub.challenge');
      return challenge || 'OK';
    }

    throw new BadRequestException('Webhook verification failed: Invalid verify token or hub.mode parameter');
  }

  async handleMetaWebhookEvent(payload: any): Promise<{ received: boolean }> {
    this.logger.log(`Received Meta Webhook Event POST payload: ${JSON.stringify(payload)}`);

    if (payload && payload.entry && Array.isArray(payload.entry)) {
      for (const entry of payload.entry) {
        const platformUserId = String(entry.id || entry.uid || '');
        if (platformUserId) {
          const account = await this.socialRepository.findByPlatformUserId(platformUserId);
          if (account) {
            this.logger.log(`Found matching SocialAccount (${account.id}) for Webhook Event ID ${platformUserId}. Syncing stats...`);
            this.syncAccountDetails(account.id).catch((err) => {
              this.logger.error(`Error during async background sync for account ${account.id}:`, err);
            });
          }
        }
      }
    }

    return { received: true };
  }

  /**
   * Smart Multi-Host Multi-Node Graph API Request Helper
   */
  private async fetchGraphApiWithFallback(
    platform: string,
    path: string,
    params: Record<string, string>,
    accessToken: string,
    platformUserId: string,
  ): Promise<{ ok: boolean; data?: any; errorText?: string }> {
    // For Instagram accounts, prioritize graph.instagram.com with 'me' node
    const domains = platform === 'INSTAGRAM'
      ? ['https://graph.instagram.com', 'https://graph.facebook.com']
      : ['https://graph.facebook.com', 'https://graph.instagram.com'];

    const versions = ['v26.0', 'v23.0'];
    const nodes = ['me', platformUserId];

    for (const domain of domains) {
      for (const ver of versions) {
        for (const node of nodes) {
          if (!node) continue;
          try {
            const cleanPath = path ? `/${path.replace(/^\/+/, '')}` : '';
            const urlStr = `${domain}/${ver}/${node}${cleanPath}`;
            const url = new URL(urlStr);

            for (const [k, v] of Object.entries(params)) {
              url.searchParams.append(k, v);
            }
            url.searchParams.append('access_token', accessToken);

            const res = await fetch(url.toString());
            if (res.ok) {
              const data = await res.json();
              if (data && !data.error) {
                this.logger.log(`Graph API query succeeded: ${domain}/${ver}/${node}${cleanPath}`);
                return { ok: true, data };
              }
            }
          } catch (e) {
            // try next candidate
          }
        }
      }
    }

    return { ok: false, errorText: `All fallback candidates failed for path '${path}'` };
  }

  async syncAccountDetails(socialAccountId: string): Promise<void> {
    const account = await this.socialRepository.findById(socialAccountId);
    if (!account || !account.accessToken) return;

    this.logger.log(`Starting smart analytics & media fetch for SocialAccount ${socialAccountId} (${account.platform})...`);

    try {
      await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', 'SYNCING');
      const rawToken = decryptToken(account.accessToken);

      const isFacebook = account.platform === 'FACEBOOK' || account.platform === 'META';

      // 1. Fetch Profile Metadata & Follower Count
      const profileFields = isFacebook
        ? 'id,name,fan_count,followers_count,picture{url},about,link,website,category,description'
        : 'id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website';

      const profileResult = await this.fetchGraphApiWithFallback(
        account.platform,
        '',
        { fields: profileFields },
        rawToken,
        account.platformUserId,
      );

      if (profileResult.ok && profileResult.data) {
        const pData = profileResult.data;
        this.logger.log(`Fetched Profile Metadata for account ${socialAccountId} (${account.platform}): ${JSON.stringify(pData)}`);

        const avatarUrl = pData.picture?.data?.url || pData.profile_picture_url || account.avatar;
        const followerCount = pData.followers_count ?? pData.fan_count ?? account.followerCount;
        const bio = pData.about || pData.description || pData.biography;
        const website = pData.link || pData.website;

        await this.socialRepository.upsertProfileMetadata(socialAccountId, {
          username: pData.username || pData.name || account.username,
          displayName: pData.name || account.handle,
          avatarUrl,
          bio,
          website,
          followerCount,
          followingCount: pData.follows_count ?? 0,
          mediaCount: pData.media_count ?? 0,
          category: pData.category,
        });
      }

      // 2. Fetch Time-Series Account Insights (Metric-by-Metric)
      const metricsMap: Record<string, number> = {};
      const insightMetrics = isFacebook
        ? ['page_post_engagements', 'page_views_total', 'page_daily_follows', 'page_video_views']
        : ['reach', 'follower_count', 'website_clicks', 'profile_views', 'accounts_engaged', 'total_interactions', 'views'];

      for (const metric of insightMetrics) {
        const insResult = await this.fetchGraphApiWithFallback(
          account.platform,
          'insights',
          { metric, period: 'day' },
          rawToken,
          account.platformUserId,
        );

        if (insResult.ok && insResult.data) {
          const latestVal = insResult.data.data?.[0]?.values?.[insResult.data.data[0].values.length - 1]?.value || 0;
          metricsMap[metric] = typeof latestVal === 'number' ? latestVal : 0;
        }
      }

      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      await this.socialRepository.recordAccountPerformance(socialAccountId, {
        recordedAt: todayDate,
        impressions: metricsMap['views'] || metricsMap['page_views_total'] || metricsMap['impressions'] || 0,
        reach: metricsMap['reach'] || metricsMap['page_post_engagements'] || 0,
        profileViews: metricsMap['profile_views'] || metricsMap['page_views_total'] || 0,
        websiteClicks: metricsMap['website_clicks'] || 0,
        accountsEngaged: metricsMap['accounts_engaged'] || metricsMap['page_post_engagements'] || 0,
        followerCount: metricsMap['follower_count'] || metricsMap['page_daily_follows'] || account.followerCount || 0,
        engagementRate: account.engagementRate || 0,
      });

      // 3. Fetch Audience Demographics (Graph API v26.0 metric names + legacy fallbacks)
      const demoMetricCandidates: Array<{ metric: string; cat: 'AGE_GENDER' | 'COUNTRY' | 'CITY' | 'LOCALE' }> = [
        { metric: 'follower_demographics', cat: 'AGE_GENDER' },
        { metric: 'engaged_audience_demographics', cat: 'AGE_GENDER' },
        { metric: 'audience_gender_age', cat: 'AGE_GENDER' },
        { metric: 'audience_country', cat: 'COUNTRY' },
        { metric: 'audience_city', cat: 'CITY' },
        { metric: 'audience_locale', cat: 'LOCALE' },
      ];

      for (const { metric, cat } of demoMetricCandidates) {
        const demoResult = await this.fetchGraphApiWithFallback(
          account.platform,
          'insights',
          { metric, period: 'lifetime', metric_type: 'total_value' },
          rawToken,
          account.platformUserId,
        );

        if (demoResult.ok && demoResult.data) {
          const breakdownData = demoResult.data.data?.[0]?.values?.[0]?.value || {};
          if (typeof breakdownData === 'object') {
            for (const [key, val] of Object.entries(breakdownData)) {
              let parsedCat = cat;
              if (key.includes('country')) parsedCat = 'COUNTRY';
              else if (key.includes('city')) parsedCat = 'CITY';
              else if (key.includes('locale')) parsedCat = 'LOCALE';

              await this.socialRepository.upsertAudienceDemographic(
                socialAccountId,
                parsedCat,
                key,
                typeof val === 'number' ? val : 0,
                key,
              );
            }
          }
        }
      }

      // 4. Fetch Media Posts, Reels & Post Performance Metrics (Limited to Recent N Posts to Optimize Performance & API Limits)
      const syncLimit = this.configService.get<number>('SOCIAL_MEDIA_SYNC_LIMIT') || 25;
      const mediaPath = isFacebook ? 'feed' : 'media';
      const mediaFields = isFacebook
        ? 'id,message,story,created_time,full_picture,permalink_url,shares,reactions.summary(true),comments.summary(true)'
        : 'id,caption,media_type,media_product_type,permalink,thumbnail_url,timestamp,like_count,comments_count';

      const mediaResult = await this.fetchGraphApiWithFallback(
        account.platform,
        mediaPath,
        { fields: mediaFields, limit: String(syncLimit) },
        rawToken,
        account.platformUserId,
      );

      if (mediaResult.ok && mediaResult.data) {
        const posts = Array.isArray(mediaResult.data.data) ? mediaResult.data.data : [];
        this.logger.log(`Fetched ${posts.length} media posts (limit: ${syncLimit}) for SocialAccount ${socialAccountId} (${account.platform})`);

        for (const postItem of posts) {
          let mType: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REEL' | 'STORY' = 'IMAGE';
          if (postItem.media_type === 'VIDEO' || postItem.media_product_type === 'REELS' || postItem.full_picture?.includes('video')) {
            mType = 'REEL';
          } else if (postItem.media_type === 'CAROUSEL_ALBUM') {
            mType = 'CAROUSEL';
          }

          const postInsights: Record<string, number> = {};

          if (!isFacebook) {
            // Select exact allowed Graph API v26.0 metric string based on Instagram media type
            let v26MetricStr = 'reach,saved,total_interactions,shares';

            if (mType === 'REEL') {
              v26MetricStr = 'views,reach,ig_reels_video_view_total_time,ig_reels_avg_watch_time,total_interactions,shares,saved';
            } else if (mType === 'IMAGE') {
              v26MetricStr = 'impressions,reach,saved,total_interactions,shares';
            }

            // Query post insights
            try {
              const insUrl = `https://graph.instagram.com/v26.0/${postItem.id}/insights?metric=${v26MetricStr}&access_token=${rawToken}`;
              const insRes = await fetch(insUrl);
              if (insRes.ok) {
                const insData = await insRes.json();
                if (Array.isArray(insData.data)) {
                  for (const ins of insData.data) {
                    const v = ins.values?.[0]?.value || 0;
                    postInsights[ins.name] = typeof v === 'number' ? v : 0;
                  }
                }
              }
            } catch (pInsErr) {
              this.logger.debug(`Error fetching post insights for ${postItem.id}:`, pInsErr);
            }
          }

          const caption = postItem.caption || postItem.message || postItem.story || null;
          const permalink = postItem.permalink || postItem.permalink_url || null;
          const thumbnailUrl = postItem.thumbnail_url || postItem.full_picture || permalink;
          const publishedAt = postItem.timestamp ? new Date(postItem.timestamp) : (postItem.created_time ? new Date(postItem.created_time) : new Date());

          const likeCount = postItem.like_count ?? postItem.reactions?.summary?.total_count ?? postInsights['likes'] ?? 0;
          const commentCount = postItem.comments_count ?? postItem.comments?.summary?.total_count ?? postInsights['comments'] ?? 0;
          const shareCount = postItem.shares?.count ?? postInsights['shares'] ?? 0;

          // Always upsert media content & performance with likes/comments + any available insight metrics
          await this.socialRepository.upsertMediaWithPerformance(
            socialAccountId,
            {
              platformMediaId: postItem.id,
              mediaType: mType,
              caption,
              permalink,
              thumbnailUrl,
              publishedAt,
            },
            {
              likeCount,
              commentCount,
              shareCount,
              saveCount: postInsights['saved'] || 0,
              playCount: postInsights['views'] || postInsights['plays'] || 0,
              reach: postInsights['reach'] || 0,
              impressions: postInsights['impressions'] || 0,
              videoViewTotalTime: postInsights['ig_reels_video_view_total_time'] || 0,
              avgWatchTime: postInsights['ig_reels_avg_watch_time'] || 0,
            },
          );
        }

        // Prune older posts beyond syncLimit to keep database size optimal
        await this.socialRepository.pruneOldMediaContent(socialAccountId, syncLimit);
      }



      // Mark Sync State as SUCCESS
      await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', 'SUCCESS');

      // 5. Emit WebSocket Event for Real-Time UI Updates
      const fullAnalytics = await this.socialRepository.getAccountAnalytics(socialAccountId);
      if (fullAnalytics) {
        this.socialGateway.emitAccountMetricsUpdated(socialAccountId, fullAnalytics);
      }

      this.logger.log(`Completed smart deep analytics sync & WebSocket emission for SocialAccount ${socialAccountId}`);
    } catch (err: any) {
      this.logger.error(`Failed deep analytics sync for ${socialAccountId}:`, err);
      await this.socialRepository.updateSyncState(
        socialAccountId,
        'PROFILE_METADATA',
        'FAILED',
        err?.message || 'Deep sync error',
      );
    }
  }
}
