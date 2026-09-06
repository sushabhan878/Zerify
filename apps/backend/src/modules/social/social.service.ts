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
import { YoutubeProvider } from './providers/youtube/youtube.provider';
import { LinkedinProvider } from './providers/linkedin/linkedin.provider';
import { TwitterProvider } from './providers/twitter/twitter.provider';
import { SocialPlatform } from '@prisma/client';
import { encryptToken, decryptToken, generateOAuthState, verifyOAuthState, generatePkcePair } from './utils/crypto.util';
import { SocialAccountResponseDto } from './dto/social-account-response.dto';

@Injectable()
export class SocialService implements OnModuleInit {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly socialRepository: SocialRepository,
    private readonly metaProvider: MetaProvider,
    private readonly instagramProvider: InstagramProvider,
    private readonly youtubeProvider: YoutubeProvider,
    private readonly linkedinProvider: LinkedinProvider,
    private readonly twitterProvider: TwitterProvider,
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

  private getYouTubeRedirectUri(): string {
    return (
      this.configService.get<string>('YOUTUBE_REDIRECT_URI') ||
      'https://gyration-dragging-freebie.ngrok-free.dev/api/v1/social/youtube/callback'
    );
  }

  getYouTubeAuthUrl(userId: string): { url: string; state: string } {
    const state = generateOAuthState(userId);
    const redirectUri = this.getYouTubeRedirectUri();
    const url = this.youtubeProvider.getAuthUrl(redirectUri, state);
    return { url, state };
  }

  private getLinkedInRedirectUri(): string {
    return (
      this.configService.get<string>('LINKEDIN_REDIRECT_URI') ||
      process.env.LINKEDIN_REDIRECT_URI ||
      'https://gyration-dragging-freebie.ngrok-free.dev/api/v1/social/linkedin/callback'
    );
  }

  getLinkedInAuthUrl(userId: string): { url: string; state: string } {
    const state = generateOAuthState(userId);
    const redirectUri = this.getLinkedInRedirectUri();
    const url = this.linkedinProvider.getAuthUrl(redirectUri, state);
    return { url, state };
  }

  private getXRedirectUri(): string {
    return (
      this.configService.get<string>('X_REDIRECT_URI') ||
      this.configService.get<string>('TWITTER_REDIRECT_URI') ||
      'https://gyration-dragging-freebie.ngrok-free.dev/api/v1/social/x/callback'
    );
  }

  getXAuthUrl(userId: string): { url: string; state: string } {
    const { codeVerifier, codeChallenge } = generatePkcePair();
    const state = generateOAuthState(userId, { codeVerifier });
    const redirectUri = this.getXRedirectUri();
    const url = this.twitterProvider.getAuthUrl(redirectUri, state, codeChallenge);
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

  async handleYouTubeCallback(
    code?: string,
    state?: string,
    error?: string,
    errorDescription?: string,
  ): Promise<string> {
    const frontendUrl = this.getFrontendUrl();

    if (error || !code || !state) {
      this.logger.warn(`YouTube OAuth Callback received error: ${error} - ${errorDescription}`);
      const reason = encodeURIComponent(errorDescription || error || 'YouTube authorization was cancelled or denied');
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const { userId, isValid } = verifyOAuthState(state);
    if (!isValid || !userId) {
      this.logger.warn('YouTube OAuth callback received invalid or expired state token');
      const reason = encodeURIComponent('Invalid or expired OAuth state parameter. Please try connecting again.');
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const redirectUri = this.getYouTubeRedirectUri();

    try {
      const profiles = await this.youtubeProvider.exchangeCodeAndGetAccounts(code, redirectUri);
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
          username: profile.username || 'YouTube Channel',
          displayName: profile.displayName || profile.username,
          avatar: profile.avatar,
          followerCount: profile.followerCount,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: profile.expiresAt,
        });

        if (profile.rawData) {
          const raw = profile.rawData;
          await this.socialRepository.upsertYouTubeChannel(savedAcc.id, {
            channelId: raw.channelId,
            channelTitle: raw.channelTitle,
            channelDescription: raw.channelDescription,
            customUrl: raw.customUrl,
            thumbnailUrl: raw.thumbnailUrl,
            subscriberCount: raw.subscriberCount,
            videoCount: raw.videoCount,
            viewCount: raw.viewCount,
            publishedAt: raw.publishedAt,
            country: raw.country,
          });

          // Trigger asynchronous initial synchronization (TRD Section 12)
          this.syncYouTubeChannelDetails(savedAcc.id, profile.accessToken, raw.uploadsPlaylistId).catch((syncErr) => {
            this.logger.error(`Initial YouTube sync failed for account ${savedAcc.id}:`, syncErr);
          });
        }

        savedCount++;
      }

      return `${frontendUrl}/social/callback?status=success&count=${savedCount}`;
    } catch (err: any) {
      this.logger.error('Error during YouTube OAuth callback processing:', err?.stack || err);
      const message = encodeURIComponent(err?.message || 'Failed to connect YouTube account');
      return `${frontendUrl}/social/callback?status=error&message=${message}`;
    }
  }

  async handleLinkedInCallback(
    code?: string,
    state?: string,
    error?: string,
    errorDescription?: string,
  ): Promise<string> {
    const frontendUrl = this.getFrontendUrl();

    if (error || !code || !state) {
      this.logger.warn(`LinkedIn OAuth Callback received error: ${error} - ${errorDescription}`);
      const reason = encodeURIComponent(
        errorDescription || error || 'LinkedIn authorization was cancelled or denied',
      );
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const { userId, isValid } = verifyOAuthState(state);
    if (!isValid || !userId) {
      this.logger.warn('LinkedIn OAuth callback received invalid or expired state token');
      const reason = encodeURIComponent(
        'Invalid or expired OAuth state parameter. Please try connecting again.',
      );
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const redirectUri = this.getLinkedInRedirectUri();

    try {
      const profiles = await this.linkedinProvider.exchangeCodeAndGetAccounts(code, redirectUri);
      let savedCount = 0;

      for (const profile of profiles) {
        // TRD Section 25: Account Collision Protection
        const existingAcc = await this.socialRepository.findByPlatformAndPlatformUserId(
          SocialPlatform.LINKEDIN,
          profile.platformUserId,
        );

        if (existingAcc && existingAcc.userId !== userId && existingAcc.status === 'CONNECTED') {
          this.logger.warn(
            `Collision detected: LinkedIn member ${profile.platformUserId} is already connected to user ${existingAcc.userId}`,
          );
          const collMsg = encodeURIComponent(
            'This LinkedIn account is already connected to another Zerify user.',
          );
          return `${frontendUrl}/social/callback?status=error&message=${collMsg}`;
        }

        const encryptedAccessToken = encryptToken(profile.accessToken);
        const encryptedRefreshToken = profile.refreshToken
          ? encryptToken(profile.refreshToken)
          : null;

        const savedAcc = await this.socialRepository.upsertAccount({
          userId,
          platform: profile.platform,
          platformUserId: profile.platformUserId,
          username: profile.username || 'LinkedIn Member',
          displayName: profile.displayName || profile.username,
          avatar: profile.avatar,
          followerCount: profile.followerCount || 0,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: profile.expiresAt,
        });

        // Upsert LinkedInProfile table
        if (profile.rawData) {
          const raw = profile.rawData;
          await this.socialRepository.upsertLinkedInProfile(savedAcc.id, {
            linkedinId: raw.linkedinId || profile.platformUserId,
            localizedFirstName: raw.localizedFirstName,
            localizedLastName: raw.localizedLastName,
            profilePictureUrl: raw.profilePictureUrl || profile.avatar,
            email: raw.email,
            emailVerified: raw.emailVerified,
            locale: raw.locale,
          });

          // Also populate basic profile metadata
          await this.socialRepository.upsertProfileMetadata(savedAcc.id, {
            username: profile.username,
            displayName: profile.displayName,
            avatarUrl: profile.avatar,
            profileUrl: profile.profileUrl,
            followerCount: profile.followerCount || 0,
            followingCount: 0,
            mediaCount: 0,
          });
        }

        // Notify realtime subscribers
        this.socialGateway.emitAccountMetricsUpdated(savedAcc.id, savedAcc);

        savedCount++;
      }

      return `${frontendUrl}/social/callback?status=success&count=${savedCount}`;
    } catch (err: any) {
      this.logger.error('Error during LinkedIn OAuth callback processing:', err?.stack || err);
      const message = encodeURIComponent(err?.message || 'Failed to connect LinkedIn account');
      return `${frontendUrl}/social/callback?status=error&message=${message}`;
    }
  }

  async syncLinkedInAccountDetails(socialAccountId: string): Promise<void> {
    const account = await this.socialRepository.findById(socialAccountId);
    if (!account || !account.accessToken || account.platform !== SocialPlatform.LINKEDIN) return;

    try {
      await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', 'SYNCING');
      const rawToken = decryptToken(account.accessToken);
      const userInfo = await this.linkedinProvider.fetchUserInfo(rawToken);

      if (userInfo) {
        const fullName =
          userInfo.name ||
          [userInfo.given_name, userInfo.family_name].filter(Boolean).join(' ') ||
          account.username ||
          'LinkedIn Member';
        const avatarUrl = userInfo.picture || account.avatar;

        let localeStr: string | undefined;
        if (typeof userInfo.locale === 'string') {
          localeStr = userInfo.locale;
        } else if (userInfo.locale && typeof userInfo.locale === 'object') {
          localeStr = `${userInfo.locale.language}_${userInfo.locale.country}`;
        }

        await this.socialRepository.upsertLinkedInProfile(socialAccountId, {
          linkedinId: userInfo.sub || account.platformUserId,
          localizedFirstName: userInfo.given_name,
          localizedLastName: userInfo.family_name,
          profilePictureUrl: avatarUrl,
          email: userInfo.email,
          emailVerified: userInfo.email_verified,
          locale: localeStr,
        });

        await this.socialRepository.upsertProfileMetadata(socialAccountId, {
          username: fullName,
          displayName: fullName,
          avatarUrl,
          profileUrl: `https://www.linkedin.com/in/${userInfo.sub || account.platformUserId}`,
        });

        await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', 'SUCCESS');
        this.socialGateway.emitAccountMetricsUpdated(account.id, account);
        this.logger.log(`Successfully synced LinkedIn profile metadata for account ${socialAccountId}`);
      }
    } catch (err: any) {
      this.logger.error(`Failed to sync LinkedIn account ${socialAccountId}:`, err?.stack || err);
      await this.socialRepository.updateSyncState(
        socialAccountId,
        'PROFILE_METADATA',
        'FAILED',
        err?.message,
      );
    }
  }

  async handleXCallback(
    code?: string,
    state?: string,
    error?: string,
    errorDescription?: string,
  ): Promise<string> {
    const frontendUrl = this.getFrontendUrl();

    if (error || !code || !state) {
      this.logger.warn(`X OAuth Callback received error: ${error} - ${errorDescription}`);
      const reason = encodeURIComponent(
        errorDescription || error || 'X authorization was cancelled or denied',
      );
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const { userId, isValid, data } = verifyOAuthState<{ codeVerifier?: string }>(state);
    if (!isValid || !userId) {
      this.logger.warn('X OAuth callback received invalid or expired state token');
      const reason = encodeURIComponent(
        'Invalid or expired OAuth state parameter. Please try connecting again.',
      );
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const redirectUri = this.getXRedirectUri();
    const codeVerifier = data?.codeVerifier;

    try {
      const profiles = await this.twitterProvider.exchangeCodeAndGetAccounts(
        code,
        redirectUri,
        codeVerifier,
      );
      let savedCount = 0;

      for (const profile of profiles) {
        // Account Collision Protection
        const existingAcc = await this.socialRepository.findByPlatformAndPlatformUserId(
          SocialPlatform.TWITTER,
          profile.platformUserId,
        );

        if (existingAcc && existingAcc.userId !== userId && existingAcc.status === 'CONNECTED') {
          this.logger.warn(
            `Collision detected: X account ${profile.platformUserId} is already connected to user ${existingAcc.userId}`,
          );
          const collMsg = encodeURIComponent(
            'This X (Twitter) account is already connected to another Zerify user.',
          );
          return `${frontendUrl}/social/callback?status=error&message=${collMsg}`;
        }

        const encryptedAccessToken = encryptToken(profile.accessToken);
        const encryptedRefreshToken = profile.refreshToken
          ? encryptToken(profile.refreshToken)
          : null;

        const savedAcc = await this.socialRepository.upsertAccount({
          userId,
          platform: profile.platform,
          platformUserId: profile.platformUserId,
          username: profile.username || 'X User',
          displayName: profile.displayName || profile.username,
          avatar: profile.avatar,
          followerCount: profile.followerCount || 0,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: profile.expiresAt,
        });

        // Upsert TwitterProfile table
        const raw = profile.rawData || {};
        const twitterProfile = await this.socialRepository.upsertTwitterProfile(savedAcc.id, {
          twitterId: raw.id || profile.platformUserId,
          username: raw.username || profile.username || 'XUser',
          name: raw.name || profile.displayName || 'X User',
          description: raw.description,
          profileImageUrl: raw.profile_image_url || profile.avatar,
          followersCount: raw.public_metrics?.followers_count || profile.followerCount || 0,
          followingCount: raw.public_metrics?.following_count || 0,
          tweetCount: raw.public_metrics?.tweet_count || 0,
          verifiedType: raw.verified_type,
        });

        // Also populate basic profile metadata
        await this.socialRepository.upsertProfileMetadata(savedAcc.id, {
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatar,
          profileUrl: profile.profileUrl,
          followerCount: profile.followerCount || 0,
          followingCount: raw.public_metrics?.following_count || 0,
          mediaCount: raw.public_metrics?.tweet_count || 0,
        });

        // Trigger initial deep sync in background
        this.syncXAccountDetails(savedAcc.id).catch((syncErr) => {
          this.logger.error(`Initial background sync for X account ${savedAcc.id} failed:`, syncErr);
        });

        // Notify realtime subscribers
        this.socialGateway.emitAccountMetricsUpdated(savedAcc.id, savedAcc);

        savedCount++;
      }

      return `${frontendUrl}/social/callback?status=success&count=${savedCount}`;
    } catch (err: any) {
      this.logger.error('Error during X OAuth callback processing:', err?.stack || err);
      const message = encodeURIComponent(err?.message || 'Failed to connect X account');
      return `${frontendUrl}/social/callback?status=error&message=${message}`;
    }
  }

  async syncXAccountDetails(socialAccountId: string): Promise<void> {
    const account = await this.socialRepository.findById(socialAccountId);
    if (!account || !account.accessToken || account.platform !== SocialPlatform.TWITTER) return;

    try {
      await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', 'SYNCING');
      let rawToken = decryptToken(account.accessToken);

      // Refresh token if expired
      if (account.expiresAt && new Date(account.expiresAt) <= new Date() && account.refreshToken) {
        try {
          const decryptedRefresh = decryptToken(account.refreshToken);
          const refreshed = await this.twitterProvider.refreshAccessToken(decryptedRefresh);
          rawToken = refreshed.accessToken;
          await this.socialRepository.upsertAccount({
            userId: account.userId,
            platform: account.platform,
            platformUserId: account.platformUserId,
            username: account.username || '',
            accessToken: encryptToken(refreshed.accessToken),
            refreshToken: refreshed.refreshToken ? encryptToken(refreshed.refreshToken) : account.refreshToken,
            expiresAt: refreshed.expiresAt,
          });
        } catch (refreshErr) {
          this.logger.warn(`Could not refresh X token for account ${socialAccountId}:`, refreshErr);
        }
      }

      // Fetch latest profile
      const userInfo = await this.twitterProvider.fetchUserInfo(rawToken).catch(() => null);
      if (userInfo) {
        const twitterProfile = await this.socialRepository.upsertTwitterProfile(socialAccountId, {
          twitterId: userInfo.id,
          username: userInfo.username,
          name: userInfo.name,
          description: userInfo.description,
          profileImageUrl: userInfo.profile_image_url,
          followersCount: userInfo.public_metrics?.followers_count || 0,
          followingCount: userInfo.public_metrics?.following_count || 0,
          tweetCount: userInfo.public_metrics?.tweet_count || 0,
          verifiedType: userInfo.verified_type,
        });

        await this.socialRepository.upsertProfileMetadata(socialAccountId, {
          username: userInfo.username,
          displayName: userInfo.name,
          avatarUrl: userInfo.profile_image_url,
          profileUrl: `https://x.com/${userInfo.username}`,
          followerCount: userInfo.public_metrics?.followers_count || 0,
          followingCount: userInfo.public_metrics?.following_count || 0,
          mediaCount: userInfo.public_metrics?.tweet_count || 0,
        });

        // Fetch recent tweets
        const tweets = await this.twitterProvider.fetchUserTweets(userInfo.id, rawToken, 10);
        let totalEngagements = 0;

        for (const tweet of tweets) {
          const metrics = tweet.public_metrics || {};
          const likeCount = metrics.like_count || 0;
          const retweetCount = metrics.retweet_count || 0;
          const replyCount = metrics.reply_count || 0;
          const quoteCount = metrics.quote_count || 0;
          const bookmarkCount = metrics.bookmark_count || 0;
          const impressionCount = metrics.impression_count || 0;

          totalEngagements += likeCount + retweetCount + replyCount + quoteCount;

          await this.socialRepository.upsertTwitterTweet(twitterProfile.id, {
            tweetId: tweet.id,
            text: tweet.text,
            publishedAt: tweet.created_at ? new Date(tweet.created_at) : new Date(),
            retweetCount,
            replyCount,
            likeCount,
            quoteCount,
            bookmarkCount,
            impressionCount,
          });
        }

        // Calculate normalized engagement rate
        const followers = userInfo.public_metrics?.followers_count || 0;
        let engagementRate: number | undefined;
        if (followers > 0 && tweets.length > 0) {
          const avgEngagementPerTweet = totalEngagements / tweets.length;
          engagementRate = Number(((avgEngagementPerTweet / followers) * 100).toFixed(2));
        }

        if (engagementRate !== undefined) {
          await this.socialRepository.upsertAccount({
            userId: account.userId,
            platform: account.platform,
            platformUserId: account.platformUserId,
            username: userInfo.username,
            followerCount: followers,
            engagementRate,
            accessToken: account.accessToken,
          });
        }
      }

      await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', 'SUCCESS');
      this.socialGateway.emitAccountMetricsUpdated(socialAccountId, account);
      this.logger.log(`Successfully synced X (Twitter) profile & tweets for account ${socialAccountId}`);
    } catch (err: any) {
      this.logger.error(`Failed to sync X account ${socialAccountId}:`, err?.stack || err);
      await this.socialRepository.updateSyncState(
        socialAccountId,
        'PROFILE_METADATA',
        'FAILED',
        err?.message,
      );
    }
  }


  async syncYouTubeChannelDetails(
    socialAccountId: string,
    accessTokenOverride?: string,
    uploadsPlaylistId?: string,
  ): Promise<void> {
    const account = await this.socialRepository.findById(socialAccountId);
    if (!account) return;

    let accessToken = accessTokenOverride;
    if (!accessToken && account.accessToken) {
      try {
        accessToken = decryptToken(account.accessToken);
        if (account.expiresAt && new Date(account.expiresAt) <= new Date() && account.refreshToken) {
          const decryptedRefresh = decryptToken(account.refreshToken);
          const refreshed = await this.youtubeProvider.refreshAccessToken(decryptedRefresh);
          accessToken = refreshed.accessToken;
          await this.socialRepository.upsertAccount({
            userId: account.userId,
            platform: account.platform,
            platformUserId: account.platformUserId,
            username: account.username || '',
            accessToken: encryptToken(refreshed.accessToken),
            refreshToken: account.refreshToken,
            expiresAt: refreshed.expiresAt,
          });
        }
      } catch (tokenErr) {
        this.logger.error(`Failed to decrypt or refresh token for YouTube account ${socialAccountId}:`, tokenErr);
        return;
      }
    }

    if (!accessToken) return;

    try {
      this.logger.log(`Starting YouTube channel deep sync for account ${socialAccountId}...`);
      await this.socialRepository.updateSyncState(socialAccountId, 'MEDIA_CONTENT', 'SYNCING');

      const ytChannel = await this.socialRepository.findYouTubeChannelBySocialAccountId(socialAccountId);
      if (ytChannel) {
        const playlistId = uploadsPlaylistId || `UU${ytChannel.channelId.substring(2)}`;
        const videos = await this.youtubeProvider.fetchChannelVideos(accessToken, playlistId, 25);

        for (const video of videos) {
          await this.socialRepository.upsertYouTubeVideo(ytChannel.id, {
            videoId: video.videoId,
            title: video.title,
            description: video.description,
            thumbnailUrl: video.thumbnailUrl,
            publishedAt: video.publishedAt,
            duration: video.duration,
            viewCount: video.viewCount,
            likeCount: video.likeCount,
            commentCount: video.commentCount,
            privacyStatus: video.privacyStatus,
            liveBroadcastContent: video.liveBroadcastContent,
          });
        }

        const analytics = await this.youtubeProvider.fetchChannelAnalytics(accessToken);
        for (const snap of analytics) {
          await this.socialRepository.upsertYouTubeChannelAnalytics(ytChannel.id, snap);
        }

        await this.socialRepository.updateSyncState(socialAccountId, 'MEDIA_CONTENT', 'SUCCESS');

        const fullAnalytics = await this.socialRepository.getAccountAnalytics(socialAccountId);
        this.socialGateway.emitAccountMetricsUpdated(socialAccountId, fullAnalytics);
        this.logger.log(`YouTube channel sync successfully finished for ${socialAccountId}`);
      }
    } catch (err: any) {
      this.logger.error(`YouTube channel sync failed for ${socialAccountId}:`, err);
      await this.socialRepository.updateSyncState(
        socialAccountId,
        'MEDIA_CONTENT',
        'FAILED',
        undefined,
        err?.message || 'Sync failed',
      );
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
    let existing = await this.socialRepository.findById(accountId);

    const platformUpper = accountId.toUpperCase() as SocialPlatform;
    const isPlatformEnum = Object.values(SocialPlatform).includes(platformUpper);

    if (!existing && isPlatformEnum) {
      const userAccounts = await this.socialRepository.findByUserId(userId);
      existing = (userAccounts || []).find((a) => a.platform === platformUpper) || null;
    }

    if (!existing) {
      const userAccounts = await this.socialRepository.findByUserId(userId);
      existing = (userAccounts || []).find((a) => a.platformUserId === accountId) || null;
    }

    if (!existing && !isPlatformEnum) {
      throw new NotFoundException('Social account not found');
    }

    if (existing && userId && existing.userId !== userId) {
      throw new NotFoundException('Social account not found');
    }

    const targetId = existing ? existing.id : accountId;
    await this.socialRepository.disconnectAccount(targetId);

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
    return { success: true, id: targetId };
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

    if (account.platform === SocialPlatform.YOUTUBE) {
      return this.syncYouTubeChannelDetails(socialAccountId);
    }

    if (account.platform === SocialPlatform.LINKEDIN) {
      return this.syncLinkedInAccountDetails(socialAccountId);
    }

    if (account.platform === SocialPlatform.TWITTER) {
      return this.syncXAccountDetails(socialAccountId);
    }


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
