import {
  Injectable,
  OnModuleInit,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
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
import { ThreadsProvider } from './providers/threads/threads.provider';
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
    private readonly threadsProvider: ThreadsProvider,
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

  getMetaAuthUrl(userId: string, forceReauth: boolean = false): { url: string; state: string } {
    const state = generateOAuthState(userId);
    const redirectUri = this.getMetaRedirectUri();
    const url = this.metaProvider.getAuthUrl(redirectUri, state, undefined, forceReauth);
    return { url, state };
  }

  getInstagramAuthUrl(userId: string, forceReauth: boolean = true): { url: string; state: string } {
    const state = generateOAuthState(userId);
    const redirectUri = this.getInstagramRedirectUri();
    const url = this.instagramProvider.getAuthUrl(redirectUri, state, undefined, forceReauth);
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

  private getThreadsRedirectUri(): string {
    return (
      this.configService.get<string>('THREADS_REDIRECT_URI') ||
      'https://gyration-dragging-freebie.ngrok-free.dev/api/v1/social/threads/callback'
    );
  }

  getThreadsAuthUrl(userId: string): { url: string; state: string } {
    const state = generateOAuthState(userId);
    const redirectUri = this.getThreadsRedirectUri();
    const url = this.threadsProvider.getAuthUrl(redirectUri, state);
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
      const { userAccessToken, expiresAt } = await this.metaProvider.exchangeCodeForTokens(code, redirectUri);
      const userProfile = await this.metaProvider.getUserProfile(userAccessToken);

      if (!userProfile) {
        throw new BadRequestException('Failed to retrieve primary Facebook user profile from Meta Graph API');
      }

      const encryptedUserToken = encryptToken(userAccessToken);
      const nextRefreshAt = new Date(expiresAt.getTime() - 7 * 24 * 60 * 60 * 1000);

      // 1. Persist Facebook user identity (accountType: 'PERSONAL')
      const identityAccount = await this.socialRepository.upsertAccount({
        userId,
        platform: SocialPlatform.FACEBOOK,
        platformUserId: userProfile.id,
        accountType: 'PERSONAL',
        username: userProfile.name,
        displayName: userProfile.name,
        avatar: userProfile.avatar,
        profileUrl: `https://facebook.com/${userProfile.id}`,
        accessToken: encryptedUserToken,
        expiresAt,
        tokenType: 'BEARER_LONG_LIVED',
        issuedAt: new Date(),
        lastRefreshedAt: new Date(),
        nextRefreshAt,
        refreshMethod: 'FB_EXCHANGE_TOKEN',
        tokenStatus: 'ACTIVE',
      });

      await this.socialRepository.upsertProfileMetadata(identityAccount.id, {
        username: userProfile.name,
        displayName: userProfile.name,
        avatarUrl: userProfile.avatar,
        email: userProfile.email,
        profileUrl: `https://facebook.com/${userProfile.id}`,
      });

      // 2. Discover all managed Pages with pagination
      const discoveredPages = await this.metaProvider.getManagedPages(userAccessToken);

      // Cache discovered pages on identity customData
      await this.socialRepository.updateAccountCustomData(identityAccount.id, {
        discoveredPages: discoveredPages.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          fanCount: p.fanCount,
          followerCount: p.followerCount,
          pictureUrl: p.pictureUrl,
          link: p.link,
          isVerified: p.isVerified,
          tasks: p.tasks,
          hasInstagram: !!p.instagramBusinessAccount,
        })),
        discoveredAt: new Date(),
      });

      // 3. Automatically link all discovered Facebook Pages so they appear immediately in Zerify with live tokens
      let connectedCount = 1;
      for (const page of discoveredPages) {
        try {
          const encryptedPageToken = encryptToken(page.accessToken);
          const pageExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
          const pageNextRefreshAt = new Date(pageExpiresAt.getTime() - 7 * 24 * 60 * 60 * 1000);

          const savedPage = await this.socialRepository.upsertAccount({
            userId,
            platform: SocialPlatform.FACEBOOK,
            platformUserId: page.id,
            accountType: 'PAGE',
            username: page.name,
            displayName: page.name,
            avatar: page.pictureUrl,
            followerCount: page.followerCount ?? page.fanCount ?? 0,
            engagementRate: 0.0,
            isVerified: page.isVerified ?? null,
            profileUrl: page.link || `https://facebook.com/${page.id}`,
            accessToken: encryptedPageToken,
            expiresAt: pageExpiresAt,
            tokenType: 'BEARER_PAGE',
            issuedAt: new Date(),
            lastRefreshedAt: new Date(),
            nextRefreshAt: pageNextRefreshAt,
            refreshMethod: 'PAGE_ACCESS_TOKEN',
            tokenStatus: 'ACTIVE',
          });

          await this.socialRepository.upsertProfileMetadata(savedPage.id, {
            username: page.name,
            displayName: page.name,
            avatarUrl: page.pictureUrl,
            category: page.category,
            followerCount: page.followerCount ?? page.fanCount ?? 0,
            isVerified: page.isVerified ?? null,
            profileUrl: page.link || `https://facebook.com/${page.id}`,
          });

          await this.socialRepository.updateAccountCustomData(savedPage.id, {
            pageId: page.id,
            tasks: page.tasks,
            category: page.category,
          });

          // Trigger background sync for page metrics, posts, and engagement
          this.syncFacebookPage(savedPage.id).catch((err) => {
            this.logger.warn(`Background syncFacebookPage failed for ${savedPage.id}:`, err);
          });

          connectedCount++;

          // If the page has an attached Instagram business account, auto-link that too
          if (page.instagramBusinessAccount) {
            const ig = page.instagramBusinessAccount;
            const igEncryptedToken = encryptToken(page.accessToken);
            const cleanIg = (ig.username || '').replace(/^@/, '');
            const savedIg = await this.socialRepository.upsertAccount({
              userId,
              platform: SocialPlatform.INSTAGRAM,
              platformUserId: ig.id,
              username: (ig.name || cleanIg || 'Instagram Creator').replace(/^@/, ''),
              displayName: ig.name || cleanIg,
              handle: cleanIg ? `@${cleanIg}` : `@ig_${ig.id}`,
              profileUrl: cleanIg ? `https://instagram.com/${cleanIg}` : null,
              avatar: ig.profilePictureUrl,
              followerCount: ig.followersCount ?? 0,
              accessToken: igEncryptedToken,
              expiresAt: pageExpiresAt,
              tokenType: 'BEARER_PAGE',
              issuedAt: new Date(),
              lastRefreshedAt: new Date(),
              nextRefreshAt: pageNextRefreshAt,
              refreshMethod: 'PAGE_ACCESS_TOKEN',
              tokenStatus: 'ACTIVE',
            });

            this.syncAccountDetails(savedIg.id).catch((err) => {
              this.logger.warn(`Background syncAccountDetails for IG ${savedIg.id} failed:`, err);
            });
          }
        } catch (pageSaveErr) {
          this.logger.error(`Failed to auto-link page ${page.id}:`, pageSaveErr);
        }
      }

      return `${frontendUrl}/social/callback?status=success&platform=facebook&count=${connectedCount}`;
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

        const nextRefreshAt = profile.expiresAt
          ? new Date(new Date(profile.expiresAt).getTime() - 7 * 24 * 60 * 60 * 1000)
          : null;

        const cleanIgUsername = (profile.username || '').replace(/^@/, '');
        const igHandle = cleanIgUsername ? `@${cleanIgUsername}` : `@ig_${profile.platformUserId}`;
        const igProfileUrl = profile.profileUrl || (cleanIgUsername ? `https://instagram.com/${cleanIgUsername}` : null);
        const personName = (profile.displayName || profile.username || 'Instagram Creator').replace(/^@/, '');

        const savedAcc = await this.socialRepository.upsertAccount({
          userId,
          platform: profile.platform,
          platformUserId: profile.platformUserId,
          username: personName,
          displayName: personName,
          handle: igHandle,
          profileUrl: igProfileUrl,
          avatar: profile.avatar,
          followerCount: profile.followerCount,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: profile.expiresAt,
          tokenType: 'BEARER',
          issuedAt: new Date(),
          lastRefreshedAt: new Date(),
          nextRefreshAt,
          refreshMethod: 'INSTAGRAM_LONG_LIVED',
          tokenStatus: 'ACTIVE',
        });

        // Populate unified profile metadata
        await this.socialRepository.upsertProfileMetadata(savedAcc.id, {
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatar,
          followerCount: profile.followerCount || 0,
          profileUrl: profile.profileUrl,
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
        let encryptedAccessToken = encryptToken(profile.accessToken);
        let encryptedRefreshToken: string | null = null;

        if (profile.refreshToken) {
          encryptedRefreshToken = encryptToken(profile.refreshToken);
        } else {
          // Fix Spec Section 6 & 46: Retain existing refresh token if Google does not return a new one
          const existingAcc = await this.socialRepository.findAccountByUserAndPlatform(
            userId,
            SocialPlatform.YOUTUBE,
            profile.platformUserId,
          );
          if (existingAcc?.refreshToken) {
            encryptedRefreshToken = existingAcc.refreshToken;
          }
        }

        const raw = profile.rawData || {};
        const subscriberCount =
          raw.subscriberCount !== undefined && raw.subscriberCount !== null ? raw.subscriberCount : profile.followerCount ?? null;
        const videoCount = raw.videoCount !== undefined && raw.videoCount !== null ? raw.videoCount : null;

        const savedAcc = await this.socialRepository.upsertAccount({
          userId,
          platform: profile.platform,
          platformUserId: profile.platformUserId,
          accountType: 'CHANNEL',
          username: profile.username || 'YouTube Channel',
          displayName: profile.displayName || profile.username,
          avatar: profile.avatar,
          profileUrl: profile.profileUrl,
          followerCount: subscriberCount,
          isVerified: null, // Tri-state: YouTube Data API channels.list does not return verification badge
          accessToken: encryptedAccessToken,
          ...(encryptedRefreshToken ? { refreshToken: encryptedRefreshToken } : {}),
          expiresAt: profile.expiresAt,
          tokenType: 'BEARER',
          issuedAt: new Date(),
          lastRefreshedAt: new Date(),
          nextRefreshAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
          refreshMethod: 'OAUTH_REFRESH_TOKEN',
          tokenStatus: 'ACTIVE',
          scopes: [
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/yt-analytics.readonly',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
          ],
        });

        if (profile.rawData) {
          await this.socialRepository.upsertProfileMetadata(savedAcc.id, {
            username: profile.username,
            displayName: raw.channelTitle || profile.displayName,
            bio: raw.channelDescription,
            customUrl: raw.customUrl,
            avatarUrl: raw.thumbnailUrl || profile.avatar,
            country: raw.country,
            isVerified: null,
            followerCount: subscriberCount,
            mediaCount: videoCount,
            extraMetrics: {
              subscriberCount,
              videoCount,
              viewCount: raw.viewCount?.toString(),
              bannerUrl: raw.bannerUrl,
              publishedAt: raw.publishedAt,
            },
          });

          await this.socialRepository.updateAccountCustomData(savedAcc.id, {
            channelId: raw.channelId,
            uploadsPlaylistId: raw.uploadsPlaylistId,
          });

          // Trigger asynchronous initial synchronization
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

        if (profile.rawData) {
          const raw = profile.rawData;
          await this.socialRepository.upsertProfileMetadata(savedAcc.id, {
            username: profile.username,
            displayName: profile.displayName,
            avatarUrl: profile.avatar,
            profileUrl: profile.profileUrl,
            email: raw.email,
            followerCount: profile.followerCount || 0,
            followingCount: 0,
            mediaCount: 0,
            extraMetrics: {
              linkedinId: raw.linkedinId || profile.platformUserId,
              localizedFirstName: raw.localizedFirstName,
              localizedLastName: raw.localizedLastName,
              emailVerified: raw.emailVerified,
              locale: raw.locale,
            },
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

        await this.socialRepository.upsertProfileMetadata(socialAccountId, {
          username: fullName,
          displayName: fullName,
          avatarUrl,
          email: userInfo.email,
          profileUrl: `https://www.linkedin.com/in/${userInfo.sub || account.platformUserId}`,
          followerCount: account.followerCount ?? null,
          extraMetrics: {
            localizedFirstName: userInfo.given_name,
            localizedLastName: userInfo.family_name,
            emailVerified: userInfo.email_verified,
            locale: localeStr,
          },
        });

        if (account.followerCount != null) {
          await this.socialRepository.updateAccountFollowerCount(socialAccountId, account.followerCount);
        }

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

        // Populate profile metadata
        const raw = profile.rawData || {};
        await this.socialRepository.upsertProfileMetadata(savedAcc.id, {
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatar,
          profileUrl: profile.profileUrl,
          followerCount: profile.followerCount || 0,
          followingCount: raw.public_metrics?.following_count || 0,
          mediaCount: raw.public_metrics?.tweet_count || 0,
          extraMetrics: {
            twitterId: raw.id || profile.platformUserId,
            tweetCount: raw.public_metrics?.tweet_count,
            verifiedType: raw.verified_type,
          },
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
        const xHandle = `@${userInfo.username.replace(/^@/, '')}`;
        const xProfileUrl = `https://x.com/${userInfo.username.replace(/^@/, '')}`;

        await this.socialRepository.updateAccountProfile(socialAccountId, {
          username: userInfo.name || account.username,
          handle: xHandle,
          profileUrl: xProfileUrl,
          avatar: userInfo.profile_image_url || account.avatar,
        });

        await this.socialRepository.upsertProfileMetadata(socialAccountId, {
          username: userInfo.username,
          displayName: userInfo.name,
          bio: userInfo.description,
          avatarUrl: userInfo.profile_image_url,
          profileUrl: xProfileUrl,
          followerCount: userInfo.public_metrics?.followers_count || 0,
          followingCount: userInfo.public_metrics?.following_count || 0,
          mediaCount: userInfo.public_metrics?.tweet_count || 0,
          extraMetrics: {
            tweetCount: userInfo.public_metrics?.tweet_count,
            verifiedType: userInfo.verified_type,
          },
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

          await this.socialRepository.upsertMediaWithPerformance(
            socialAccountId,
            {
              platformMediaId: tweet.id,
              caption: tweet.text,
              permalink: `https://x.com/${userInfo.username}/status/${tweet.id}`,
              publishedAt: tweet.created_at ? new Date(tweet.created_at) : new Date(),
            },
            {
              likeCount,
              commentCount: replyCount,
              shareCount: retweetCount,
              reach: impressionCount,
              impressions: impressionCount,
              extraMetrics: {
                quoteCount,
                bookmarkCount,
              },
            },
          );
        }

        // Calculate normalized engagement rate
        const followers = userInfo.public_metrics?.followers_count || 0;
        let engagementRate: number | undefined;
        if (followers > 0 && tweets.length > 0) {
          const avgEngagementPerTweet = totalEngagements / tweets.length;
          engagementRate = Number(((avgEngagementPerTweet / followers) * 100).toFixed(2));
        }

        await this.socialRepository.updateAccountFollowerCount(socialAccountId, followers, engagementRate);
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

  async handleThreadsCallback(
    code?: string,
    state?: string,
    error?: string,
    errorDescription?: string,
  ): Promise<string> {
    const frontendUrl = this.getFrontendUrl();

    if (error || !code || !state) {
      this.logger.warn(`Threads OAuth Callback received error: ${error} - ${errorDescription}`);
      const reason = encodeURIComponent(
        errorDescription || error || 'Threads authorization was cancelled or denied',
      );
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const { userId, isValid } = verifyOAuthState(state);
    if (!isValid || !userId) {
      this.logger.warn('Threads OAuth callback received invalid or expired state token');
      const reason = encodeURIComponent(
        'Invalid or expired OAuth state parameter. Please try connecting again.',
      );
      return `${frontendUrl}/social/callback?status=error&message=${reason}`;
    }

    const redirectUri = this.getThreadsRedirectUri();

    try {
      const profiles = await this.threadsProvider.exchangeCodeAndGetAccounts(
        code,
        redirectUri,
      );
      let savedCount = 0;

      for (const profile of profiles) {
        // Account Collision Protection
        const existingAcc = await this.socialRepository.findByPlatformAndPlatformUserId(
          SocialPlatform.THREADS,
          profile.platformUserId,
        );

        if (existingAcc && existingAcc.userId !== userId && existingAcc.status === 'CONNECTED') {
          this.logger.warn(
            `Collision detected: Threads account ${profile.platformUserId} is already connected to user ${existingAcc.userId}`,
          );
          const collMsg = encodeURIComponent(
            'This Threads account is already connected to another Zerify user.',
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
          username: profile.username || 'Threads User',
          displayName: profile.displayName || profile.username,
          avatar: profile.avatar,
          followerCount: profile.followerCount || 0,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: profile.expiresAt,
        });

        // Upsert unified profile metadata
        const raw = profile.rawData || {};
        await this.socialRepository.upsertProfileMetadata(savedAcc.id, {
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatar,
          profileUrl: profile.profileUrl,
          followerCount: profile.followerCount || 0,
          bio: raw.threads_biography || raw.biography,
          isVerified: raw.isVerified || false,
          extraMetrics: {
            threadsId: raw.id || profile.platformUserId,
            followingCount: raw.followingCount || 0,
            postCount: raw.postCount || 0,
          },
        });

        // Trigger initial deep sync in background
        this.syncThreadsAccountDetails(savedAcc.id).catch((syncErr) => {
          this.logger.error(`Initial background sync for Threads account ${savedAcc.id} failed:`, syncErr);
        });

        // Notify realtime subscribers
        this.socialGateway.emitAccountMetricsUpdated(savedAcc.id, savedAcc);

        savedCount++;
      }

      return `${frontendUrl}/social/callback?status=success&platform=threads&count=${savedCount}`;
    } catch (err: any) {
      this.logger.error('Error during Threads OAuth callback processing:', err?.stack || err);
      const message = encodeURIComponent(err?.message || 'Failed to connect Threads account');
      return `${frontendUrl}/social/callback?status=error&message=${message}`;
    }
  }

  async syncThreadsAccountDetails(socialAccountId: string): Promise<void> {
    const account = await this.socialRepository.findById(socialAccountId);
    if (!account || !account.accessToken || account.platform !== SocialPlatform.THREADS) return;

    try {
      await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', 'SYNCING');
      let rawToken = decryptToken(account.accessToken);

      // Refresh token if near expiration (within 7 days)
      if (account.expiresAt && new Date(account.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000) {
        try {
          const refreshed = await this.threadsProvider.refreshAccessToken(rawToken);
          rawToken = refreshed.accessToken;
          await this.socialRepository.upsertAccount({
            userId: account.userId,
            platform: account.platform,
            platformUserId: account.platformUserId,
            username: account.username || '',
            accessToken: encryptToken(refreshed.accessToken),
            expiresAt: refreshed.expiresAt,
          });
        } catch (refreshErr) {
          this.logger.warn(`Could not refresh Threads token for account ${socialAccountId}:`, refreshErr);
        }
      }

      // Fetch user profile
      const userInfo = await this.threadsProvider.fetchUserProfile(rawToken, account.platformUserId).catch(() => null);
      if (userInfo) {
        const thHandle = `@${userInfo.username.replace(/^@/, '')}`;
        const thProfileUrl = `https://threads.net/@${userInfo.username.replace(/^@/, '')}`;

        await this.socialRepository.updateAccountProfile(socialAccountId, {
          username: userInfo.name || account.username,
          handle: thHandle,
          profileUrl: thProfileUrl,
          avatar: userInfo.threads_profile_picture_url || account.avatar,
        });

        await this.socialRepository.upsertProfileMetadata(socialAccountId, {
          username: userInfo.username,
          displayName: userInfo.name,
          avatarUrl: userInfo.threads_profile_picture_url,
          profileUrl: thProfileUrl,
          bio: userInfo.threads_biography,
        });

        // Fetch user threads
        const threads = await this.threadsProvider.fetchUserThreads(rawToken, 10);
        if (threads.length > 0) {
          for (const post of threads) {
            await this.socialRepository.upsertMediaWithPerformance(
              socialAccountId,
              {
                platformMediaId: post.id,
                caption: post.text,
                mediaType: post.media_type === 'VIDEO' ? 'VIDEO' : post.media_type === 'CAROUSEL_ALBUM' ? 'CAROUSEL' : 'IMAGE',
                permalink: post.permalink,
                publishedAt: post.timestamp ? new Date(post.timestamp) : new Date(),
              },
              {
                extraMetrics: {
                  hasReplies: post.has_replies ?? false,
                  isQuotePost: post.is_quote_post ?? false,
                },
              },
            );
          }
        }

        const threadsFollowers = await this.threadsProvider.fetchFollowerCount(rawToken);
        const resolvedFollowers = threadsFollowers > 0 ? threadsFollowers : account.followerCount || 0;

        let threadsEngagementRate: number | undefined;
        if (threads.length > 0 && resolvedFollowers > 0) {
          let totalThreadInteractions = 0;
          for (const post of threads) {
            const likes = (post as any).like_count ?? (post as any).likes ?? 0;
            const replies = (post as any).reply_count ?? (post as any).replies_count ?? 0;
            totalThreadInteractions += (Number(likes) || 0) + (Number(replies) || 0);
          }
          if (totalThreadInteractions > 0) {
            const avgPerThread = totalThreadInteractions / threads.length;
            threadsEngagementRate = Number(((avgPerThread / resolvedFollowers) * 100).toFixed(2));
          }
        }

        await this.socialRepository.updateAccountFollowerCount(socialAccountId, resolvedFollowers, threadsEngagementRate);
      }

      await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', 'SUCCESS');
      this.socialGateway.emitAccountMetricsUpdated(socialAccountId, account);
      this.logger.log(`Successfully synced Threads profile & posts for account ${socialAccountId}`);
    } catch (err: any) {
      this.logger.error(`Failed to sync Threads account ${socialAccountId}:`, err?.stack || err);
      await this.socialRepository.updateSyncState(
        socialAccountId,
        'PROFILE_METADATA',
        'FAILED',
        err?.message,
      );
    }
  }



  /**
   * Refreshes an expired YouTube/Google OAuth access token using the stored refresh token.
   * Conforms to TRD Section 6, 45, and 46.
   */
  async refreshYouTubeToken(socialAccountId: string): Promise<{ accessToken: string; expiresAt: Date }> {
    const account = await this.socialRepository.findById(socialAccountId);
    if (!account) {
      throw new NotFoundException(`Social account ${socialAccountId} not found`);
    }

    if (!account.refreshToken) {
      await this.socialRepository.updateTokenLifecycle(socialAccountId, {
        tokenStatus: 'REAUTHORIZATION_REQUIRED',
        lastTokenError: 'No refresh token available for offline access',
      });
      await this.socialRepository.updateSyncState(
        socialAccountId,
        'MEDIA_CONTENT',
        'REAUTHORIZATION_REQUIRED',
        {
          lastError: 'No refresh token available. Reauthorization required.',
          lastErrorCode: 'NO_REFRESH_TOKEN',
          lastErrorAt: new Date(),
        },
      );
      throw new BadRequestException('YouTube account has no refresh token. Reauthorization required.');
    }

    try {
      const decryptedRefresh = decryptToken(account.refreshToken);
      const refreshed = await this.youtubeProvider.refreshAccessToken(decryptedRefresh);
      const encryptedAccess = encryptToken(refreshed.accessToken);
      const encryptedRefresh = refreshed.refreshToken ? encryptToken(refreshed.refreshToken) : account.refreshToken;

      await this.socialRepository.upsertAccount({
        userId: account.userId,
        platform: account.platform,
        platformUserId: account.platformUserId,
        accountType: 'CHANNEL',
        username: account.username || '',
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        expiresAt: refreshed.expiresAt,
        tokenType: 'BEARER',
        lastRefreshedAt: new Date(),
        nextRefreshAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        tokenStatus: 'ACTIVE',
        refreshMethod: 'OAUTH_REFRESH_TOKEN',
      });

      return {
        accessToken: refreshed.accessToken,
        expiresAt: refreshed.expiresAt,
      };
    } catch (err: any) {
      this.logger.error(`YouTube token refresh failed for account ${socialAccountId}:`, err?.message || err);
      const isRevoked =
        err?.message?.includes('invalid_grant') ||
        err?.message?.includes('revoked') ||
        err?.message?.includes('expired') ||
        err?.message?.includes('Reauthorization required');

      if (isRevoked) {
        await this.socialRepository.updateTokenLifecycle(socialAccountId, {
          tokenStatus: 'REAUTHORIZATION_REQUIRED',
          lastTokenError: err?.message || 'Token refresh failed',
        });
        await this.socialRepository.updateSyncState(
          socialAccountId,
          'MEDIA_CONTENT',
          'REAUTHORIZATION_REQUIRED',
          {
            lastError: 'YouTube access revoked or expired. Reconnection required.',
            lastErrorCode: 'TOKEN_REVOKED',
            lastErrorAt: new Date(),
          },
        );
      }
      throw err;
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
        const isExpired = !account.expiresAt || new Date(account.expiresAt) <= new Date(Date.now() + 60000);
        if (isExpired && account.refreshToken) {
          const refreshed = await this.refreshYouTubeToken(socialAccountId);
          accessToken = refreshed.accessToken;
        } else {
          accessToken = decryptToken(account.accessToken);
        }
      } catch (tokenErr) {
        this.logger.error(`Failed to obtain valid token for YouTube account ${socialAccountId}:`, tokenErr);
        return;
      }
    }

    if (!accessToken) return;

    const syncStartedAt = new Date();
    await this.socialRepository.updateSyncState(socialAccountId, 'MEDIA_CONTENT', 'SYNCING');

    try {
      this.logger.log(`Starting YouTube channel deep sync for account ${socialAccountId}...`);

      const channelId = (account.customData as any)?.channelId || account.platformUserId;
      const playlistId =
        uploadsPlaylistId || (account.customData as any)?.uploadsPlaylistId || `UU${channelId.substring(2)}`;
      const videos = await this.youtubeProvider.fetchChannelVideos(accessToken, playlistId, 50);

      for (const video of videos) {
        await this.socialRepository.upsertMediaWithPerformance(
          socialAccountId,
          {
            platformMediaId: video.videoId,
            mediaType: 'VIDEO',
            title: video.title,
            caption: video.description,
            thumbnailUrl: video.thumbnailUrl,
            publishedAt: video.publishedAt,
            permalink: `https://youtube.com/watch?v=${video.videoId}`,
            duration: video.durationSeconds,
          },
          {
            playCount: Number(video.viewCount || 0),
            likeCount: video.likeCount,
            commentCount: video.commentCount,
            reach: null, // Fix Spec Section 21: Do not coerce views to reach
            impressions: null, // Fix Spec Section 21: Do not coerce views to impressions
            extraMetrics: {
              privacyStatus: video.privacyStatus,
              liveBroadcastContent: video.liveBroadcastContent,
              durationIso: video.duration,
              durationSeconds: video.durationSeconds,
            },
          },
        );
      }

      const analytics = await this.youtubeProvider.fetchChannelAnalytics(accessToken);
      for (const snap of analytics) {
        const snapViews = Number(snap.views || 0);
        const interactions = (snap.likes || 0) + (snap.comments || 0) + (snap.shares || 0);
        const snapEngagementRate = snapViews > 0 ? Number(((interactions / snapViews) * 100).toFixed(2)) : null;

        await this.socialRepository.recordAccountPerformance(socialAccountId, {
          recordedAt: snap.date,
          period: 'DAY',
          source: 'YOUTUBE_ANALYTICS_API',
          views: snapViews,
          likes: snap.likes,
          comments: snap.comments,
          shares: snap.shares,
          reach: null,
          impressions: null,
          engagementRate: snapEngagementRate,
          totalInteractions: interactions,
          rawMetrics: {
            views: snap.views.toString(),
            likes: snap.likes,
            comments: snap.comments,
            shares: snap.shares,
            subscribersGained: snap.subscribersGained,
            subscribersLost: snap.subscribersLost,
            estimatedMinutesWatched: snap.estimatedMinutesWatched.toString(),
            averageViewDuration: snap.averageViewDuration,
          },
        });
      }

      // Calculate aggregate channel engagement rate across analytics
      if (analytics.length > 0) {
        const totalViews = analytics.reduce((acc, a) => acc + Number(a.views || 0), 0);
        const totalInteractions = analytics.reduce(
          (acc, a) => acc + (a.likes || 0) + (a.comments || 0) + (a.shares || 0),
          0,
        );
        const overallEngagementRate = totalViews > 0 ? Number(((totalInteractions / totalViews) * 100).toFixed(2)) : null;
        if (overallEngagementRate !== null) {
          await this.socialRepository.updateAccountFollowerCount(
            socialAccountId,
            account.followerCount ?? 0,
            overallEngagementRate,
          );
        }
      }

      // Fetch channel demographics from YouTube Analytics (real only, zero synthetic fallbacks)
      let demoCount = 0;
      try {
        const ytDemos = await this.youtubeProvider.fetchChannelDemographics(accessToken);
        for (const d of ytDemos) {
          await this.socialRepository.upsertAudienceDemographic(
            socialAccountId,
            d.type,
            d.key,
            d.value,
            d.label,
            {
              percentage: d.percentage,
              source: 'youtube_analytics',
              sourceMetric: 'viewerPercentage',
            },
          );
        }
        demoCount = ytDemos.length;
      } catch (demoErr) {
        this.logger.warn(`Could not sync YouTube demographics for ${socialAccountId}:`, demoErr);
      }

      const totalSynced = videos.length + analytics.length + demoCount;
      const nextSyncAt = new Date(Date.now() + 6 * 3600 * 1000); // 6-hour operational sync window

      await this.socialRepository.updateSyncState(
        socialAccountId,
        'MEDIA_CONTENT',
        'SUCCESS',
        {
          lastStartedAt: syncStartedAt,
          lastCompletedAt: new Date(),
          lastSuccessAt: new Date(),
          nextSyncAt,
          recordsSynced: totalSynced,
          retryCount: 0,
        },
        nextSyncAt,
      );

      const fullAnalytics = await this.socialRepository.getAccountAnalytics(socialAccountId);
      this.socialGateway.emitAccountMetricsUpdated(socialAccountId, fullAnalytics);
      this.logger.log(`YouTube channel sync successfully finished for ${socialAccountId}`);
    } catch (err: any) {
      this.logger.error(`YouTube channel sync failed for ${socialAccountId}:`, err);
      const isAuthError =
        err?.status === 401 ||
        err?.message?.includes('401') ||
        err?.message?.includes('unauthorized') ||
        err?.message?.includes('invalid_grant');
      const nextRetryAt = new Date(Date.now() + 15 * 60 * 1000);

      await this.socialRepository.updateSyncState(
        socialAccountId,
        'MEDIA_CONTENT',
        isAuthError ? 'REAUTHORIZATION_REQUIRED' : 'FAILED',
        {
          lastStartedAt: syncStartedAt,
          lastCompletedAt: new Date(),
          lastError: err?.message || 'Sync failed',
          lastErrorCode: isAuthError ? 'AUTH_EXPIRED' : 'YOUTUBE_SYNC_ERROR',
          lastErrorAt: new Date(),
          nextRetryAt,
        },
      );

      if (isAuthError) {
        await this.socialRepository.updateTokenLifecycle(socialAccountId, {
          tokenStatus: 'REAUTHORIZATION_REQUIRED',
          lastTokenError: err?.message,
        });
      }
    }
  }

  async recalculateAccountEngagementRate(socialAccountId: string): Promise<number | null> {
    if (!this.socialRepository.findById || !this.socialRepository.getMediaContentsByAccountId) {
      return null;
    }
    const account = await this.socialRepository.findById(socialAccountId);
    if (!account) return null;

    const mediaItems = await this.socialRepository.getMediaContentsByAccountId(socialAccountId);
    if (!mediaItems || mediaItems.length === 0) {
      return account.engagementRate ?? null;
    }

    const followers = account.followerCount ?? 0;
    if (followers <= 0) {
      return account.engagementRate ?? null;
    }

    const totalInteractions = mediaItems.reduce((sum, item) => {
      return (
        sum +
        (Number(item.likeCount) || 0) +
        (Number(item.commentCount) || 0) +
        (Number(item.shareCount) || 0) +
        (Number(item.saveCount) || 0)
      );
    }, 0);

    const avgPerPost = totalInteractions / mediaItems.length;
    const calculatedER = Number(((avgPerPost / followers) * 100).toFixed(2));

    if (this.socialRepository.updateAccountFollowerCount) {
      await this.socialRepository.updateAccountFollowerCount(socialAccountId, followers, calculatedER);
    }
    return calculatedER;
  }

  async getUserAccounts(userId: string): Promise<SocialAccountResponseDto[]> {
    const accounts = await this.socialRepository.findByUserId(userId);
    return Promise.all(
      accounts.map(async (acc) => {
        let er = acc.engagementRate;
        if ((er === null || er === 0) && acc.followerCount && acc.followerCount > 0) {
          const recalculated = await this.recalculateAccountEngagementRate(acc.id);
          if (recalculated !== null && recalculated > 0) {
            er = recalculated;
          }
        }

        return {
          id: acc.id,
          userId: acc.userId,
          platform: acc.platform,
          platformUserId: acc.platformUserId,
          username: acc.username,
          handle: acc.handle,
          avatar: acc.avatar,
          followerCount: acc.followerCount,
          engagementRate: er,
          profileUrl: acc.profileUrl,
          isVerified: acc.isVerified,
          expiresAt: acc.expiresAt,
          status: acc.status,
          connectedAt: acc.connectedAt,
          updatedAt: acc.updatedAt,
        };
      }),
    );
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

    if (account.platform === SocialPlatform.THREADS) {
      return this.syncThreadsAccountDetails(socialAccountId);
    }

    if (account.platform === SocialPlatform.FACEBOOK && (account as any).accountType === 'PAGE') {
      return this.syncFacebookPage(socialAccountId);
    }


    this.logger.log(`Starting smart analytics & media fetch for SocialAccount ${socialAccountId} (${account.platform})...`);

    const isFacebook = account.platform === 'FACEBOOK' || account.platform === 'META';

    try {
      await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', 'RUNNING', {
        lastStartedAt: new Date(),
      });
      const rawToken = decryptToken(account.accessToken);

      // 1. Ensure baseline unified profile metadata exists right from the start
      const cleanAccountHandle = (account.handle || '').replace(/^@/, '');
      const baselineProfileUrl =
        account.profileUrl ||
        (isFacebook
          ? `https://facebook.com/${account.platformUserId}`
          : cleanAccountHandle
            ? `https://instagram.com/${cleanAccountHandle}`
            : undefined);

      await this.socialRepository.upsertProfileMetadata(socialAccountId, {
        username: cleanAccountHandle || account.username || (isFacebook ? 'Facebook User' : 'instagram_user'),
        displayName: account.username || account.handle,
        avatarUrl: account.avatar,
        profileUrl: baselineProfileUrl,
        followerCount: account.followerCount || 0,
      });

      // 2. Fetch Profile Metadata & Canonical Follower Count
      const profileFields = isFacebook
        ? 'id,name,fan_count,followers_count,picture{url},about,link,website,category,description'
        : 'id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website';

      let profileResult = await this.fetchGraphApiWithFallback(
        account.platform,
        '',
        { fields: profileFields },
        rawToken,
        account.platformUserId,
      );

      // Fallback for personal Facebook User profiles if Page query fails
      if (!profileResult.ok && isFacebook) {
        profileResult = await this.fetchGraphApiWithFallback(
          account.platform,
          'me',
          { fields: 'id,name,picture{url}' },
          rawToken,
          account.platformUserId,
        );
      }

      if (profileResult.ok && profileResult.data) {
        const pData = profileResult.data;
        this.logger.log(`Fetched Profile Metadata for account ${socialAccountId} (${account.platform}): ${JSON.stringify(pData)}`);

        const avatarUrl = pData.picture?.data?.url || pData.profile_picture_url || account.avatar;
        const followerCount = pData.followers_count ?? pData.fan_count ?? account.followerCount;
        const bio = pData.about || pData.description || pData.biography || null;
        const website = pData.link || pData.website || null;

        if (typeof followerCount === 'number' && followerCount >= 0) {
          await this.socialRepository.updateAccountFollowerCount(socialAccountId, followerCount);
        }

        const rawHandle = pData.username || account.handle;
        const resolvedHandle = rawHandle ? (rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`) : account.handle;
        const cleanHandle = (resolvedHandle || '').replace(/^@/, '');
        const resolvedPersonName = (pData.name || account.username || '').replace(/^@/, '');
        const resolvedProfileUrl =
          pData.link ||
          (isFacebook
            ? pData.id
              ? `https://facebook.com/${pData.id}`
              : cleanHandle
                ? `https://facebook.com/${cleanHandle}`
                : account.profileUrl
            : cleanHandle
              ? `https://instagram.com/${cleanHandle}`
              : account.profileUrl);

        // Update SocialAccount table so username is person's name, handle is @handle, and profileUrl is stored
        await this.socialRepository.updateAccountProfile(socialAccountId, {
          username: resolvedPersonName,
          handle: resolvedHandle,
          profileUrl: resolvedProfileUrl,
          avatar: avatarUrl,
        });

        // Upsert into unified profile metadata - retaining only real API data (null when absent)
        await this.socialRepository.upsertProfileMetadata(socialAccountId, {
          username: cleanHandle || resolvedHandle,
          displayName: resolvedPersonName || pData.name || account.username,
          avatarUrl,
          bio,
          website,
          profileUrl: resolvedProfileUrl,
          email: pData.email || null,
          followerCount: typeof followerCount === 'number' ? followerCount : 0,
          followingCount: typeof pData.follows_count === 'number' ? pData.follows_count : 0,
          mediaCount: typeof pData.media_count === 'number' ? pData.media_count : 0,
          category: pData.category || null,
          extraMetrics: {
            fanCount: pData.fan_count ?? null,
            pageId: isFacebook ? account.platformUserId : null,
            igUserId: !isFacebook ? account.platformUserId : null,
          },
        });
      }

      // 3. Fetch Time-Series Account Insights (Metric-by-Metric, preserving NULL for unsupported metrics)
      const metricsMap: Record<string, number | null> = {};
      const insightMetrics = isFacebook
        ? ['page_post_engagements', 'page_views_total', 'page_daily_follows', 'page_video_views']
        : ['reach', 'views', 'accounts_engaged', 'total_interactions', 'likes', 'comments', 'shares', 'saves'];

      for (const metric of insightMetrics) {
        const insResult = await this.fetchGraphApiWithFallback(
          account.platform,
          'insights',
          { metric, period: 'day' },
          rawToken,
          account.platformUserId,
        );

        if (insResult.ok && insResult.data) {
          const valuesArr = insResult.data.data?.[0]?.values;
          const latestVal = valuesArr?.[valuesArr.length - 1]?.value;
          metricsMap[metric] = typeof latestVal === 'number' ? latestVal : null;
        } else {
          metricsMap[metric] = null;
        }
      }

      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      const reachVal = metricsMap['reach'] !== undefined && metricsMap['reach'] !== null
        ? metricsMap['reach']
        : (metricsMap['page_post_engagements'] ?? null);

      const impressionsVal = metricsMap['views'] !== undefined && metricsMap['views'] !== null
        ? metricsMap['views']
        : (metricsMap['page_views_total'] ?? null);

      const totalInteractionsVal = metricsMap['total_interactions'] !== undefined && metricsMap['total_interactions'] !== null
        ? metricsMap['total_interactions']
        : null;

      // Calculate engagement rate safely: never 0/0. If reach is missing or 0, store null
      let calculatedEngagementRate: number | null = null;
      if (typeof reachVal === 'number' && reachVal > 0 && typeof totalInteractionsVal === 'number') {
        calculatedEngagementRate = Number(((totalInteractionsVal / reachVal) * 100).toFixed(2));
      } else if (typeof account.followerCount === 'number' && account.followerCount > 0 && typeof totalInteractionsVal === 'number') {
        calculatedEngagementRate = Number(((totalInteractionsVal / account.followerCount) * 100).toFixed(2));
      }

      // Save into unified performance table with strict nullability (NULL = unsupported, not 0)
      await this.socialRepository.recordAccountPerformance(socialAccountId, {
        recordedAt: todayDate,
        period: 'day',
        source: isFacebook ? 'facebook_graph_api' : 'instagram_graph_api',
        reach: reachVal,
        impressions: impressionsVal,
        profileViews: metricsMap['profile_views'] ?? null,
        websiteClicks: metricsMap['website_clicks'] ?? null,
        accountsEngaged: metricsMap['accounts_engaged'] ?? null,
        totalInteractions: totalInteractionsVal,
        views: metricsMap['views'] ?? null,
        likes: metricsMap['likes'] ?? null,
        comments: metricsMap['comments'] ?? null,
        shares: metricsMap['shares'] ?? null,
        saves: metricsMap['saves'] ?? null,
        followerCount: account.followerCount ?? null,
        engagementRate: calculatedEngagementRate,
        rawMetrics: metricsMap,
        extraMetrics: metricsMap,
      });

      // 4. Fetch Audience Demographics (Only real API-derived data; never fabricate or seed fake rows)
      let demographicCount = 0;

      if (!isFacebook) {
        // Instagram Insights: follower_demographics with breakdown parameters (requires metric_type=total_value)
        const igDemoBreakdowns: Array<{ breakdown: string; cat: 'AGE_GENDER' | 'COUNTRY' | 'CITY' | 'LOCALE' }> = [
          { breakdown: 'age', cat: 'AGE_GENDER' },
          { breakdown: 'gender', cat: 'AGE_GENDER' },
          { breakdown: 'country', cat: 'COUNTRY' },
          { breakdown: 'city', cat: 'CITY' },
        ];

        for (const { breakdown, cat } of igDemoBreakdowns) {
          const demoResult = await this.fetchGraphApiWithFallback(
            account.platform,
            'insights',
            { metric: 'follower_demographics', period: 'lifetime', metric_type: 'total_value', breakdown },
            rawToken,
            account.platformUserId,
          );

          if (demoResult.ok && demoResult.data) {
            const dataArr =
              demoResult.data.data?.[0]?.total_value?.breakdowns?.[0]?.results ||
              demoResult.data.data?.[0]?.values?.[0]?.value ||
              {};

            if (Array.isArray(dataArr)) {
              const totalSum = dataArr.reduce((sum, item) => sum + Number(item.value || 0), 0);
              for (const item of dataArr) {
                const rawKey = item.dimension_values?.[0] || item.dimension_values?.join('.') || item.dimension || 'unknown';
                const val = Number(item.value || 0);
                if (val > 0) {
                  demographicCount++;
                  const percentage = totalSum > 0 ? Number(((val / totalSum) * 100).toFixed(2)) : null;

                  let label = rawKey;
                  if (breakdown === 'gender') {
                    label = rawKey === 'F' ? 'Female' : rawKey === 'M' ? 'Male' : rawKey === 'U' ? 'Unspecified' : rawKey;
                  } else if (breakdown === 'age') {
                    label = `Age ${rawKey}`;
                  } else if (breakdown === 'country') {
                    try {
                      label = new Intl.DisplayNames(['en'], { type: 'region' }).of(rawKey) || rawKey;
                    } catch {
                      label = rawKey;
                    }
                  }

                  await this.socialRepository.upsertAudienceDemographic(
                    socialAccountId,
                    cat,
                    rawKey,
                    val,
                    label,
                    {
                      percentage,
                      timeframe: 'lifetime',
                      source: 'instagram_graph_api',
                      sourceMetric: 'follower_demographics',
                      rawData: item,
                    },
                  );
                }
              }
            } else if (typeof dataArr === 'object') {
              const entries = Object.entries(dataArr);
              const totalSum = entries.reduce((sum, [, v]) => sum + (typeof v === 'number' ? v : 0), 0);
              for (const [key, val] of entries) {
                const numVal = typeof val === 'number' ? val : 0;
                if (numVal > 0) {
                  demographicCount++;
                  const percentage = totalSum > 0 ? Number(((numVal / totalSum) * 100).toFixed(2)) : null;
                  await this.socialRepository.upsertAudienceDemographic(
                    socialAccountId,
                    cat,
                    key,
                    numVal,
                    key,
                    {
                      percentage,
                      timeframe: 'lifetime',
                      source: 'instagram_graph_api',
                      sourceMetric: 'follower_demographics',
                      rawData: { [key]: val },
                    },
                  );
                }
              }
            }
          }
        }

        // Secondary fallback: reached_audience_demographics if follower_demographics returned 0
        if (demographicCount === 0) {
          for (const { breakdown, cat } of igDemoBreakdowns) {
            const reachedRes = await this.fetchGraphApiWithFallback(
              account.platform,
              'insights',
              { metric: 'reached_audience_demographics', period: 'lifetime', metric_type: 'total_value', breakdown },
              rawToken,
              account.platformUserId,
            );

            if (reachedRes.ok && reachedRes.data) {
              const dataArr =
                reachedRes.data.data?.[0]?.total_value?.breakdowns?.[0]?.results ||
                reachedRes.data.data?.[0]?.values?.[0]?.value ||
                {};

              if (Array.isArray(dataArr)) {
                const totalSum = dataArr.reduce((sum, item) => sum + Number(item.value || 0), 0);
                for (const item of dataArr) {
                  const rawKey = item.dimension_values?.[0] || item.dimension || 'unknown';
                  const val = Number(item.value || 0);
                  if (val > 0) {
                    demographicCount++;
                    const percentage = totalSum > 0 ? Number(((val / totalSum) * 100).toFixed(2)) : null;
                    let label = rawKey;
                    if (breakdown === 'gender') {
                      label = rawKey === 'F' ? 'Female' : rawKey === 'M' ? 'Male' : rawKey === 'U' ? 'Unspecified' : rawKey;
                    } else if (breakdown === 'age') {
                      label = `Age ${rawKey}`;
                    } else if (breakdown === 'country') {
                      try {
                        label = new Intl.DisplayNames(['en'], { type: 'region' }).of(rawKey) || rawKey;
                      } catch {
                        label = rawKey;
                      }
                    }

                    await this.socialRepository.upsertAudienceDemographic(
                      socialAccountId,
                      cat,
                      rawKey,
                      val,
                      label,
                      {
                        percentage,
                        timeframe: 'lifetime',
                        source: 'instagram_graph_api',
                        sourceMetric: 'reached_audience_demographics',
                        rawData: item,
                      },
                    );
                  }
                }
              }
            }
          }
        }
      } else {
        // Facebook Page Demographics
        const fbDemoMetrics: Array<{ metric: string; cat: 'AGE_GENDER' | 'COUNTRY' | 'CITY' }> = [
          { metric: 'page_fans_gender_age', cat: 'AGE_GENDER' },
          { metric: 'page_fans_country', cat: 'COUNTRY' },
          { metric: 'page_fans_city', cat: 'CITY' },
        ];

        for (const { metric, cat } of fbDemoMetrics) {
          const demoResult = await this.fetchGraphApiWithFallback(
            account.platform,
            'insights',
            { metric, period: 'lifetime' },
            rawToken,
            account.platformUserId,
          );

          if (demoResult.ok && demoResult.data) {
            const breakdownData = demoResult.data.data?.[0]?.values?.[0]?.value || {};
            if (typeof breakdownData === 'object') {
              const entries = Object.entries(breakdownData);
              const totalSum = entries.reduce((sum, [, v]) => sum + (typeof v === 'number' ? v : 0), 0);
              for (const [key, val] of entries) {
                const numVal = typeof val === 'number' ? val : 0;
                if (numVal > 0) {
                  demographicCount++;
                  const percentage = totalSum > 0 ? Number(((numVal / totalSum) * 100).toFixed(2)) : null;
                  await this.socialRepository.upsertAudienceDemographic(
                    socialAccountId,
                    cat,
                    key,
                    numVal,
                    key,
                    {
                      percentage,
                      timeframe: 'lifetime',
                      source: 'facebook_graph_api',
                      sourceMetric: metric,
                      rawData: { [key]: val },
                    },
                  );
                }
              }
            }
          }
        }
      }

      // If Graph API returned 0 demographic records (account has < 100 followers), record operational status without fabricating data
      if (demographicCount === 0) {
        this.logger.log(`No live audience demographics returned from platform API for account ${socialAccountId} (requires >= 100 followers). No synthetic rows inserted.`);
        await this.socialRepository.updateSyncState(socialAccountId, 'AUDIENCE_DEMOGRAPHICS', 'PARTIAL_SUCCESS', {
          lastError: 'Demographic data requires >=100 followers per platform API constraints.',
          lastErrorCode: 'MINIMUM_FOLLOWER_REQUIREMENT',
        });
      } else {
        await this.socialRepository.updateSyncState(socialAccountId, 'AUDIENCE_DEMOGRAPHICS', 'SUCCESS', {
          recordsSynced: demographicCount,
        });
      }

      // 5. Fetch Media Posts & Performance (With pagination support)
      const syncLimit = this.configService.get<number>('SOCIAL_MEDIA_SYNC_LIMIT') || 25;
      const mediaPath = isFacebook ? 'feed' : 'media';
      const mediaFields = isFacebook
        ? 'id,message,story,created_time,full_picture,permalink_url,shares,reactions.summary(true),comments.summary(true)'
        : 'id,caption,media_type,media_product_type,permalink,shortcode,thumbnail_url,media_url,timestamp,like_count,comments_count,is_comment_enabled,is_shared_to_feed';

      let allPosts: any[] = [];
      let nextPageUrl: string | null = null;

      const firstPage = await this.fetchGraphApiWithFallback(
        account.platform,
        mediaPath,
        { fields: mediaFields, limit: String(Math.min(syncLimit, 25)) },
        rawToken,
        account.platformUserId,
      );

      if (firstPage.ok && firstPage.data) {
        allPosts = Array.isArray(firstPage.data.data) ? [...firstPage.data.data] : [];
        nextPageUrl = firstPage.data.paging?.next || null;

        // Follow pagination if more posts are needed
        while (nextPageUrl && allPosts.length < syncLimit) {
          try {
            const nextRes = await fetch(nextPageUrl);
            if (nextRes.ok) {
              const nextJson = await nextRes.json();
              if (Array.isArray(nextJson.data) && nextJson.data.length > 0) {
                allPosts.push(...nextJson.data);
                nextPageUrl = nextJson.paging?.next || null;
              } else {
                break;
              }
            } else {
              break;
            }
          } catch (pageErr) {
            this.logger.debug(`Pagination error for account ${socialAccountId}:`, pageErr);
            break;
          }
        }
      }

      if (allPosts.length > 0) {
        this.logger.log(`Fetched ${allPosts.length} media posts for SocialAccount ${socialAccountId} (${account.platform})`);

        let totalPostEngagements = 0;

        for (const postItem of allPosts) {
          let mType: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REEL' | 'STORY' = 'IMAGE';
          if (postItem.media_type === 'VIDEO' || postItem.media_product_type === 'REELS' || postItem.full_picture?.includes('video')) {
            mType = 'REEL';
          } else if (postItem.media_type === 'CAROUSEL_ALBUM') {
            mType = 'CAROUSEL';
          }

          const postInsights: Record<string, number | null> = {};

          if (!isFacebook) {
            let v26MetricStr = 'reach,saved,total_interactions,shares';
            if (mType === 'REEL') {
              v26MetricStr = 'views,reach,ig_reels_video_view_total_time,ig_reels_avg_watch_time,total_interactions,shares,saved';
            } else if (mType === 'IMAGE') {
              v26MetricStr = 'impressions,reach,saved,total_interactions,shares';
            }

            try {
              const insUrl = `https://graph.instagram.com/v26.0/${postItem.id}/insights?metric=${v26MetricStr}&access_token=${rawToken}`;
              const insRes = await fetch(insUrl);
              if (insRes.ok) {
                const insData = await insRes.json();
                if (Array.isArray(insData.data)) {
                  for (const ins of insData.data) {
                    const v = ins.values?.[0]?.value;
                    postInsights[ins.name] = typeof v === 'number' ? v : null;
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

          const likeCount = postItem.like_count ?? postItem.reactions?.summary?.total_count ?? postInsights['likes'] ?? null;
          const commentCount = postItem.comments_count ?? postItem.comments?.summary?.total_count ?? postInsights['comments'] ?? null;
          const shareCount = postItem.shares?.count ?? postInsights['shares'] ?? null;
          const saveCount = postInsights['saved'] ?? null;
          const playCount = postInsights['views'] ?? postInsights['plays'] ?? null;
          const reach = postInsights['reach'] ?? null;
          const impressions = postInsights['impressions'] ?? null;
          const videoViewTotalTime = postInsights['ig_reels_video_view_total_time'] ?? null;
          const avgWatchTime = postInsights['ig_reels_avg_watch_time'] ?? null;

          totalPostEngagements +=
            (Number(likeCount) || 0) +
            (Number(commentCount) || 0) +
            (Number(shareCount) || 0) +
            (Number(saveCount) || 0);

          await this.socialRepository.upsertMediaWithPerformance(
            socialAccountId,
            {
              platformMediaId: postItem.id,
              mediaType: mType,
              mediaProductType: postItem.media_product_type || (mType === 'REEL' ? 'REELS' : 'FEED'),
              title: postItem.name || null,
              caption,
              permalink,
              shortcode: postItem.shortcode || null,
              mediaUrl: postItem.media_url || permalink,
              thumbnailUrl,
              publishedAt,
              isCommentEnabled: postItem.is_comment_enabled ?? true,
              isSharedToFeed: postItem.is_shared_to_feed ?? true,
              rawPayload: {
                id: postItem.id,
                media_type: postItem.media_type,
                permalink: postItem.permalink,
                timestamp: postItem.timestamp,
              },
              extraMetrics: {
                reactionsSummary: postItem.reactions?.summary || null,
                commentsSummary: postItem.comments?.summary || null,
                shares: postItem.shares || null,
              },
            },
            {
              likeCount,
              commentCount,
              shareCount,
              saveCount,
              playCount,
              reach,
              impressions,
              videoViewTotalTime,
              avgWatchTime,
              extraMetrics: postInsights,
            },
          );
        }

        await this.socialRepository.pruneOldMediaContent(socialAccountId, syncLimit);

        // Calculate and persist account-level engagement rate
        const currentAccount = await this.socialRepository.findById(socialAccountId);
        const effectiveFollowerCount = typeof currentAccount?.followerCount === 'number' && currentAccount.followerCount > 0
          ? currentAccount.followerCount
          : (typeof account.followerCount === 'number' && account.followerCount > 0 ? account.followerCount : 0);

        let resolvedEngagementRate: number | null = null;
        if (effectiveFollowerCount > 0 && allPosts.length > 0) {
          const avgEngagementsPerPost = totalPostEngagements / allPosts.length;
          resolvedEngagementRate = Number(((avgEngagementsPerPost / effectiveFollowerCount) * 100).toFixed(2));
        } else if (typeof calculatedEngagementRate === 'number' && calculatedEngagementRate > 0) {
          resolvedEngagementRate = calculatedEngagementRate;
        }

        if (resolvedEngagementRate !== null && resolvedEngagementRate > 0) {
          await this.socialRepository.updateAccountFollowerCount(
            socialAccountId,
            effectiveFollowerCount,
            resolvedEngagementRate,
          );
        }
      } else {
        const currentAccount = await this.socialRepository.findById(socialAccountId);
        const effectiveFollowerCount = typeof currentAccount?.followerCount === 'number' && currentAccount.followerCount > 0
          ? currentAccount.followerCount
          : (typeof account.followerCount === 'number' && account.followerCount > 0 ? account.followerCount : 0);

        if (typeof calculatedEngagementRate === 'number' && calculatedEngagementRate > 0) {
          await this.socialRepository.updateAccountFollowerCount(
            socialAccountId,
            effectiveFollowerCount,
            calculatedEngagementRate,
          );
        } else {
          await this.recalculateAccountEngagementRate(socialAccountId);
        }
      }

      // 6. Complete Sync State with Calculated nextSyncAt (6h window)
      const nextSyncAt = new Date(Date.now() + 6 * 60 * 60 * 1000);
      await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', 'SUCCESS', {
        lastCompletedAt: new Date(),
        lastSuccessAt: new Date(),
        nextSyncAt,
        recordsSynced: allPosts.length,
      });

      // 7. Emit WebSocket Event for Real-Time UI Updates
      const fullAnalytics = await this.socialRepository.getAccountAnalytics(socialAccountId);
      if (fullAnalytics) {
        this.socialGateway.emitAccountMetricsUpdated(socialAccountId, fullAnalytics);
      }

      this.logger.log(`Completed sync & WebSocket emission for SocialAccount ${socialAccountId}`);
    } catch (err: any) {
      this.logger.error(`Failed deep analytics sync for ${socialAccountId}:`, err);

      const isAuthRevoked =
        err?.code === 190 ||
        err?.message?.includes('OAuth') ||
        err?.message?.includes('Session has expired') ||
        err?.message?.includes('access token');

      if (isAuthRevoked) {
        await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', 'REAUTHORIZATION_REQUIRED', {
          lastError: err?.message || 'Instagram session expired or unauthorized. Reauthorization required.',
          lastErrorCode: 'OAUTH_190',
          lastErrorAt: new Date(),
        });
        await this.socialRepository.updateTokenLifecycle(socialAccountId, {
          tokenStatus: 'REAUTHORIZATION_REQUIRED',
          lastTokenError: err?.message,
        });
      } else {
        const nextRetry = new Date(Date.now() + 5 * 60 * 1000); // 5 min retry
        await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', 'FAILED', {
          lastError: err?.message || 'Deep sync error',
          lastErrorCode: err?.code ? String(err.code) : 'SYNC_FAILED',
          lastErrorAt: new Date(),
          nextRetryAt: nextRetry,
        });
      }
    }
  }

  async refreshInstagramToken(socialAccountId: string): Promise<{ success: boolean; expiresAt?: Date; error?: string }> {
    const account = await this.socialRepository.findById(socialAccountId);
    if (!account || !account.accessToken) {
      return { success: false, error: 'Account not found or missing access token' };
    }

    try {
      const rawToken = decryptToken(account.accessToken);
      const refreshed = await this.instagramProvider.refreshLongLivedToken(rawToken);
      const encryptedAccessToken = encryptToken(refreshed.accessToken);
      const nextRefreshAt = new Date(refreshed.expiresAt.getTime() - 7 * 24 * 60 * 60 * 1000);

      await this.socialRepository.updateTokenLifecycle(socialAccountId, {
        accessToken: encryptedAccessToken,
        expiresAt: refreshed.expiresAt,
        lastRefreshedAt: new Date(),
        nextRefreshAt,
        tokenStatus: 'ACTIVE',
        lastTokenError: null,
      });

      this.logger.log(`Successfully refreshed Instagram long-lived token for account ${socialAccountId}`);
      return { success: true, expiresAt: refreshed.expiresAt };
    } catch (err: any) {
      this.logger.error(`Failed to refresh Instagram token for account ${socialAccountId}:`, err);
      const isAuthRevoked =
        err?.message?.includes('OAuth') || err?.message?.includes('expired') || err?.code === 190;
      const tokenStatus = isAuthRevoked ? 'REAUTHORIZATION_REQUIRED' : account.tokenStatus || 'ACTIVE';

      await this.socialRepository.updateTokenLifecycle(socialAccountId, {
        tokenStatus,
        lastTokenError: err?.message || 'Token refresh failed',
      });

      if (isAuthRevoked) {
        await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', 'REAUTHORIZATION_REQUIRED', {
          lastError: err?.message || 'Instagram session expired. Reauthorization required.',
          lastErrorCode: 'TOKEN_EXPIRED',
          lastErrorAt: new Date(),
        });
      }

      return { success: false, error: err?.message };
    }
  }

  async getAvailableFacebookPages(userId: string): Promise<{
    user: { id: string; name: string; avatar?: string };
    pages: any[];
  }> {
    const identity = (await this.socialRepository.findIdentityByUserId(userId, SocialPlatform.FACEBOOK))
      || (await this.socialRepository.findByUserIdAndPlatform(userId, SocialPlatform.FACEBOOK));

    if (!identity || !identity.accessToken) {
      throw new NotFoundException('No connected Facebook authorization found. Please connect Facebook first.');
    }

    const rawToken = decryptToken(identity.accessToken);
    const discoveredPages = await this.metaProvider.getManagedPages(rawToken);

    // Update cached pages on identity customData
    await this.socialRepository.updateAccountCustomData(identity.id, {
      discoveredPages: discoveredPages.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        fanCount: p.fanCount,
        followerCount: p.followerCount,
        pictureUrl: p.pictureUrl,
        link: p.link,
        isVerified: p.isVerified,
        tasks: p.tasks,
        hasInstagram: !!p.instagramBusinessAccount,
      })),
      discoveredAt: new Date(),
    });

    const connectedPages = await this.socialRepository.findPagesByUserId(userId, SocialPlatform.FACEBOOK);
    const connectedPageIds = new Set(connectedPages.map((p) => p.platformUserId));

    return {
      user: {
        id: identity.platformUserId,
        name: identity.username || 'Facebook User',
        avatar: identity.avatar || undefined,
      },
      pages: discoveredPages.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        fanCount: p.fanCount,
        followerCount: p.followerCount,
        pictureUrl: p.pictureUrl,
        link: p.link,
        isVerified: p.isVerified,
        tasks: p.tasks,
        hasInstagram: !!p.instagramBusinessAccount,
        isConnected: connectedPageIds.has(p.id),
      })),
    };
  }

  async selectFacebookPages(
    userId: string,
    selectedPageIds: string[],
  ): Promise<{
    success: boolean;
    count: number;
    pages: any[];
  }> {
    if (!selectedPageIds || selectedPageIds.length === 0) {
      throw new BadRequestException('No page IDs provided for selection');
    }

    const identity = (await this.socialRepository.findIdentityByUserId(userId, SocialPlatform.FACEBOOK))
      || (await this.socialRepository.findByUserIdAndPlatform(userId, SocialPlatform.FACEBOOK));

    if (!identity || !identity.accessToken) {
      throw new ForbiddenException('No active Facebook authorization found for this user');
    }

    const rawUserToken = decryptToken(identity.accessToken);
    const authorizedPages = await this.metaProvider.getManagedPages(rawUserToken);

    // Section 44 Security Validation: Ensure every selected page is owned/managed by this Facebook user
    const authorizedMap = new Map(authorizedPages.map((p) => [p.id, p]));
    const unauthorized = selectedPageIds.filter((id) => !authorizedMap.has(id));

    if (unauthorized.length > 0) {
      throw new ForbiddenException(
        `Access denied: Page(s) [${unauthorized.join(', ')}] are not authorized for this Facebook account`,
      );
    }

    const savedAccounts: any[] = [];

    for (const pageId of selectedPageIds) {
      const page = authorizedMap.get(pageId)!;
      const encryptedPageToken = encryptToken(page.accessToken);
      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      const nextRefreshAt = new Date(expiresAt.getTime() - 7 * 24 * 60 * 60 * 1000);

      const savedPage = await this.socialRepository.upsertAccount({
        userId,
        platform: SocialPlatform.FACEBOOK,
        platformUserId: page.id,
        accountType: 'PAGE',
        username: page.name,
        avatar: page.pictureUrl,
        followerCount: page.followerCount ?? page.fanCount ?? null,
        isVerified: page.isVerified ?? null,
        profileUrl: page.link ?? null,
        accessToken: encryptedPageToken,
        expiresAt,
        tokenType: 'BEARER_PAGE',
        issuedAt: new Date(),
        lastRefreshedAt: new Date(),
        nextRefreshAt,
        refreshMethod: 'PAGE_ACCESS_TOKEN',
        tokenStatus: 'ACTIVE',
      });

      await this.socialRepository.upsertProfileMetadata(savedPage.id, {
        username: page.name,
        displayName: page.name,
        avatarUrl: page.pictureUrl,
        category: page.category,
        followerCount: page.followerCount ?? page.fanCount ?? null,
        isVerified: page.isVerified ?? null,
        profileUrl: page.link ?? null,
      });

      await this.socialRepository.updateAccountCustomData(savedPage.id, {
        pageId: page.id,
        tasks: page.tasks,
        category: page.category,
      });

      // If page has a connected Instagram business account, link it too
      if (page.instagramBusinessAccount) {
        const ig = page.instagramBusinessAccount;
        const igEncryptedToken = encryptToken(page.accessToken);
        const cleanIg = (ig.username || '').replace(/^@/, '');
        const savedIg = await this.socialRepository.upsertAccount({
          userId,
          platform: SocialPlatform.INSTAGRAM,
          platformUserId: ig.id,
          username: (ig.name || cleanIg || 'Instagram Creator').replace(/^@/, ''),
          displayName: ig.name || cleanIg,
          handle: cleanIg ? `@${cleanIg}` : `@ig_${ig.id}`,
          profileUrl: cleanIg ? `https://instagram.com/${cleanIg}` : null,
          avatar: ig.profilePictureUrl,
          followerCount: ig.followersCount ?? null,
          accessToken: igEncryptedToken,
          expiresAt,
          tokenType: 'BEARER_PAGE',
          issuedAt: new Date(),
          lastRefreshedAt: new Date(),
          nextRefreshAt,
          refreshMethod: 'INSTAGRAM_LONG_LIVED',
          tokenStatus: 'ACTIVE',
        });

        await this.socialRepository.upsertProfileMetadata(savedIg.id, {
          username: cleanIg || ig.username,
          displayName: ig.name || cleanIg,
          avatarUrl: ig.profilePictureUrl,
          followerCount: ig.followersCount ?? null,
          profileUrl: cleanIg ? `https://instagram.com/${cleanIg}` : null,
        });

        this.syncAccountDetails(savedIg.id).catch((err) => {
          this.logger.error(`Initial Instagram sync failed for account ${savedIg.id}:`, err);
        });
      }

      // Trigger initial page sync
      this.syncFacebookPage(savedPage.id).catch((err) => {
        this.logger.error(`Initial Facebook Page sync failed for ${savedPage.id}:`, err);
      });

      this.socialGateway.emitAccountMetricsUpdated(savedPage.id, savedPage);
      savedAccounts.push({
        id: savedPage.id,
        platformUserId: savedPage.platformUserId,
        name: page.name,
        avatar: page.pictureUrl,
      });
    }

    return {
      success: true,
      count: savedAccounts.length,
      pages: savedAccounts,
    };
  }

  async syncFacebookPage(socialAccountId: string): Promise<void> {
    const account = await this.socialRepository.findById(socialAccountId);
    if (!account || !account.accessToken) return;

    this.logger.log(
      `Starting sync for Facebook Page ${account.username || account.platformUserId} (${socialAccountId})...`,
    );

    try {
      await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', 'RUNNING', {
        lastStartedAt: new Date(),
      });

      const rawToken = decryptToken(account.accessToken);

      // 1. Fetch Page Profile Details
      const pageProfile = await this.metaProvider.getPageProfile(account.platformUserId, rawToken);
      let followerCount: number = account.followerCount ?? 0;
      let profileUrl = account.profileUrl;

      if (pageProfile) {
        followerCount = typeof pageProfile.followers_count === 'number'
          ? pageProfile.followers_count
          : typeof pageProfile.fan_count === 'number'
          ? pageProfile.fan_count
          : (account.followerCount ?? 0);
        const isVerified = typeof pageProfile.is_verified === 'boolean' ? pageProfile.is_verified : null;
        profileUrl = pageProfile.link || account.profileUrl || `https://facebook.com/${account.platformUserId}`;

        const expiresAt = account.expiresAt || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
        const nextRefreshAt = new Date(expiresAt.getTime() - 7 * 24 * 60 * 60 * 1000);

        await this.socialRepository.upsertAccount({
          userId: account.userId,
          platform: account.platform,
          platformUserId: account.platformUserId,
          accountType: 'PAGE',
          username: pageProfile.name || account.username || '',
          displayName: pageProfile.name || account.username || '',
          avatar: pageProfile.picture?.data?.url || account.avatar,
          followerCount,
          isVerified,
          profileUrl,
          accessToken: account.accessToken,
          expiresAt,
          issuedAt: account.issuedAt || new Date(),
          lastRefreshedAt: new Date(),
          nextRefreshAt,
          refreshMethod: 'PAGE_ACCESS_TOKEN',
          tokenType: 'BEARER_PAGE',
          tokenStatus: 'ACTIVE',
        });

        await this.socialRepository.upsertProfileMetadata(socialAccountId, {
          username: pageProfile.name,
          displayName: pageProfile.name,
          avatarUrl: pageProfile.picture?.data?.url || account.avatar,
          bio: pageProfile.about || pageProfile.description || null,
          website: pageProfile.website || null,
          profileUrl,
          category: pageProfile.category || null,
          followerCount,
          isVerified,
        });
      }

      // 2. Fetch Page Insights
      const insights = await this.metaProvider.getPageInsights(account.platformUserId, rawToken);

      // Safe Engagement Rate: (totalInteractions / reach) * 100 only when reach > 0
      let engagementRate: number = 0.0;
      if (insights.reach && insights.reach > 0 && insights.totalInteractions != null && insights.totalInteractions > 0) {
        engagementRate = parseFloat(((insights.totalInteractions / insights.reach) * 100).toFixed(2));
      } else if (insights.totalInteractions != null && insights.totalInteractions > 0 && followerCount > 0) {
        engagementRate = parseFloat(((insights.totalInteractions / followerCount) * 100).toFixed(2));
      }

      await this.socialRepository.recordAccountPerformance(socialAccountId, {
        recordedAt: new Date(),
        period: 'day',
        source: 'FACEBOOK_GRAPH_API',
        reach: insights.reach,
        impressions: insights.impressions,
        totalInteractions: insights.totalInteractions,
        accountsEngaged: insights.engagedUsers,
        views: insights.views,
        likes: insights.likes,
        comments: insights.comments,
        shares: insights.shares,
        followerCount,
        engagementRate,
        rawMetrics: insights.rawMetrics,
      });

      // Always persist live followerCount & calculated engagementRate
      await this.socialRepository.updateAccountFollowerCount(
        socialAccountId,
        followerCount,
        engagementRate,
      );

      // 3. Fetch Page Demographics (authentic API data only, zero synthetic generation)
      const demographics = await this.metaProvider.getPageDemographics(account.platformUserId, rawToken);
      for (const demo of demographics) {
        await this.socialRepository.upsertAudienceDemographic(
          socialAccountId,
          demo.type as any,
          demo.key,
          demo.value,
          demo.label,
          {
            percentage: demo.percentage,
            source: demo.source,
            sourceMetric: demo.sourceMetric,
            rawData: demo.rawData,
          },
        );
      }

      // 4. Fetch Page Posts / Content
      const posts = await this.metaProvider.getPagePosts(account.platformUserId, rawToken, 50);
      for (const post of posts) {
        await this.socialRepository.upsertMediaWithPerformance(
          socialAccountId,
          {
            platformMediaId: post.platformMediaId,
            mediaType: post.mediaType,
            mediaProductType: 'FEED',
            title: post.message ? post.message.slice(0, 100) : undefined,
            caption: post.caption,
            permalink: post.permalink,
            thumbnailUrl: post.thumbnailUrl,
            mediaUrl: post.mediaUrl,
            publishedAt: post.publishedAt,
            rawPayload: post.rawPayload,
          },
          {
            likeCount: post.likeCount,
            commentCount: post.commentCount,
            shareCount: post.shareCount,
          },
        );
      }

      if ((engagementRate === null || engagementRate === 0) && posts.length > 0 && account.followerCount && account.followerCount > 0) {
        const totalPostInteractions = posts.reduce((sum, p) => sum + (p.likeCount || 0) + (p.commentCount || 0) + (p.shareCount || 0), 0);
        if (totalPostInteractions > 0) {
          const avgPerPost = totalPostInteractions / posts.length;
          const postER = Number(((avgPerPost / account.followerCount) * 100).toFixed(2));
          await this.socialRepository.updateAccountFollowerCount(
            socialAccountId,
            account.followerCount,
            postER,
          );
        }
      }

      // 5. Update Operational Sync Status (success, next sync in 6 hours)
      const nextSyncAt = new Date(Date.now() + 6 * 60 * 60 * 1000);
      await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', 'SUCCESS', {
        lastCompletedAt: new Date(),
        lastSuccessAt: new Date(),
        nextSyncAt,
        retryCount: 0,
      });

      this.logger.log(`Successfully synced Facebook Page ${account.username || account.platformUserId}`);
    } catch (err: any) {
      this.logger.error(`Failed to sync Facebook Page ${socialAccountId}:`, err);
      const isRevoked =
        err?.code === 190 ||
        err?.message?.includes('OAuth') ||
        err?.message?.includes('expired') ||
        err?.message?.includes('Session');
      const syncStatus = isRevoked ? 'REAUTHORIZATION_REQUIRED' : 'FAILED';
      const lastErrorCode = isRevoked ? 'TOKEN_EXPIRED' : 'SYNC_ERROR';

      await this.socialRepository.updateSyncState(socialAccountId, 'PROFILE_METADATA', syncStatus, {
        lastError: err?.message || 'Sync failed',
        lastErrorCode,
        lastErrorAt: new Date(),
        retryCount: 1,
        nextRetryAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min retry backoff
      });
    }
  }

  async getUserAudienceDemographics(userId: string) {
    return this.socialRepository.getUserAudienceDemographics(userId);
  }
}
