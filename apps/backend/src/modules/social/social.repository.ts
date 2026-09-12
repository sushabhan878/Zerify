import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';


import { SocialAccount, SocialPlatform, SocialAccountStatus } from '@prisma/client';

@Injectable()
export class SocialRepository {
  private readonly logger = new Logger(SocialRepository.name);

  constructor(private readonly prisma: PrismaService) { }

  async upsertAccount(data: {
    userId: string;
    platform: SocialPlatform;
    platformUserId: string;
    username: string;
    displayName?: string;
    handle?: string;
    avatar?: string;
    accountType?: string | null;
    followerCount?: number | null;
    engagementRate?: number | null;
    profileUrl?: string | null;
    isVerified?: boolean | null;
    accessToken: string;
    refreshToken?: string | null;
    expiresAt?: Date | null;
    tokenType?: string | null;
    issuedAt?: Date | null;
    lastRefreshedAt?: Date | null;
    nextRefreshAt?: Date | null;
    refreshMethod?: string | null;
    tokenStatus?: string | null;
    scopes?: string[];
    lastTokenError?: string | null;
  }): Promise<SocialAccount> {
    // 1. Resolve Handle (always formatted with leading @)
    let handle = data.handle?.trim();
    if (!handle) {
      handle = `@${data.username.replace(/^@/, '')}`;
    } else if (!handle.startsWith('@')) {
      handle = `@${handle}`;
    }

    // 2. Resolve Person's Name (User Name)
    let personName = (data.displayName?.trim() || data.username?.trim() || '').replace(/^@/, '');

    // 3. Resolve Canonical Profile URL
    let profileUrl = data.profileUrl?.trim() || null;
    if (!profileUrl && handle) {
      const cleanHandle = handle.replace(/^@/, '');
      switch (data.platform) {
        case SocialPlatform.INSTAGRAM:
          profileUrl = `https://instagram.com/${cleanHandle}`;
          break;
        case SocialPlatform.TWITTER:
          profileUrl = `https://x.com/${cleanHandle}`;
          break;
        case SocialPlatform.YOUTUBE:
          profileUrl = `https://youtube.com/@${cleanHandle}`;
          break;
        case SocialPlatform.TIKTOK:
          profileUrl = `https://tiktok.com/@${cleanHandle}`;
          break;
        case SocialPlatform.THREADS:
          profileUrl = `https://threads.net/@${cleanHandle}`;
          break;
        case SocialPlatform.LINKEDIN:
          profileUrl = `https://linkedin.com/in/${cleanHandle}`;
          break;
        case SocialPlatform.FACEBOOK:
          profileUrl = `https://facebook.com/${data.platformUserId || cleanHandle}`;
          break;
      }
    }

    const account = await this.prisma.socialAccount.upsert({
      where: {
        userId_platform_platformUserId: {
          userId: data.userId,
          platform: data.platform,
          platformUserId: data.platformUserId,
        },
      },
      create: {
        userId: data.userId,
        platform: data.platform,
        platformUserId: data.platformUserId,
        accountType: data.accountType || 'PERSONAL',
        username: personName,
        handle,
        avatar: data.avatar,
        followerCount: data.followerCount ?? null,
        engagementRate: data.engagementRate ?? null,
        profileUrl,
        isVerified: data.isVerified ?? null,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        tokenType: data.tokenType || 'BEARER',
        issuedAt: data.issuedAt || new Date(),
        lastRefreshedAt: data.lastRefreshedAt,
        nextRefreshAt: data.nextRefreshAt,
        refreshMethod: data.refreshMethod,
        tokenStatus: data.tokenStatus || 'ACTIVE',
        scopes: data.scopes || [],
        lastTokenError: data.lastTokenError,
        status: SocialAccountStatus.CONNECTED,
        connectedAt: new Date(),
      },
      update: {
        username: personName,
        handle,
        avatar: data.avatar,
        ...(data.accountType !== undefined ? { accountType: data.accountType } : {}),
        ...(data.followerCount !== undefined ? { followerCount: data.followerCount } : {}),
        ...(data.engagementRate !== undefined ? { engagementRate: data.engagementRate } : {}),
        ...(profileUrl ? { profileUrl } : {}),
        ...(data.isVerified !== undefined ? { isVerified: data.isVerified } : {}),
        accessToken: data.accessToken,
        ...(data.refreshToken !== undefined ? { refreshToken: data.refreshToken } : {}),
        expiresAt: data.expiresAt,
        ...(data.tokenType !== undefined ? { tokenType: data.tokenType } : {}),
        ...(data.lastRefreshedAt !== undefined ? { lastRefreshedAt: data.lastRefreshedAt } : {}),
        ...(data.nextRefreshAt !== undefined ? { nextRefreshAt: data.nextRefreshAt } : {}),
        ...(data.refreshMethod !== undefined ? { refreshMethod: data.refreshMethod } : {}),
        ...(data.tokenStatus !== undefined ? { tokenStatus: data.tokenStatus } : {}),
        ...(data.scopes !== undefined ? { scopes: data.scopes } : {}),
        ...(data.lastTokenError !== undefined ? { lastTokenError: data.lastTokenError } : {}),
        status: SocialAccountStatus.CONNECTED,
        updatedAt: new Date(),
      },
    });

    return account;
  }

  async findAccountByUserAndPlatform(
    userId: string,
    platform: SocialPlatform,
    platformUserId: string,
  ): Promise<SocialAccount | null> {
    return this.prisma.socialAccount.findUnique({
      where: {
        userId_platform_platformUserId: {
          userId,
          platform,
          platformUserId,
        },
      },
      include: {
        metadata: true,
        syncStates: true,
      },
    });
  }

  async findPagesByUserId(userId: string, platform = SocialPlatform.FACEBOOK): Promise<SocialAccount[]> {
    return this.prisma.socialAccount.findMany({
      where: {
        userId,
        platform,
        accountType: 'PAGE',
        status: SocialAccountStatus.CONNECTED,
      },
      include: {
        metadata: true,
        syncStates: true,
      },
    });
  }

  async findIdentityByUserId(userId: string, platform = SocialPlatform.FACEBOOK): Promise<SocialAccount | null> {
    return this.prisma.socialAccount.findFirst({
      where: {
        userId,
        platform,
        accountType: 'PERSONAL',
        status: SocialAccountStatus.CONNECTED,
      },
    });
  }

  async updateAccountFollowerCount(
    socialAccountId: string,
    followerCount: number,
    engagementRate?: number | null,
  ): Promise<SocialAccount> {
    return this.prisma.socialAccount.update({
      where: { id: socialAccountId },
      data: {
        followerCount,
        ...(engagementRate !== undefined ? { engagementRate } : {}),
        updatedAt: new Date(),
      },
    });
  }

  async updateAccountEngagementRate(
    socialAccountId: string,
    engagementRate: number | null,
  ): Promise<SocialAccount> {
    return this.prisma.socialAccount.update({
      where: { id: socialAccountId },
      data: {
        engagementRate,
        updatedAt: new Date(),
      },
    });
  }

  async updateAccountProfile(
    socialAccountId: string,
    data: {
      username?: string;
      handle?: string;
      profileUrl?: string | null;
      avatar?: string | null;
      isVerified?: boolean | null;
    },
  ): Promise<SocialAccount> {
    return this.prisma.socialAccount.update({
      where: { id: socialAccountId },
      data: {
        ...(data.username !== undefined ? { username: data.username } : {}),
        ...(data.handle !== undefined ? { handle: data.handle } : {}),
        ...(data.profileUrl !== undefined ? { profileUrl: data.profileUrl } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
        ...(data.isVerified !== undefined ? { isVerified: data.isVerified } : {}),
        updatedAt: new Date(),
      },
    });
  }

  async getMediaContentsByAccountId(socialAccountId: string) {
    return this.prisma.socialMediaContent.findMany({
      where: { socialAccountId },
      select: {
        likeCount: true,
        commentCount: true,
        shareCount: true,
        saveCount: true,
      },
    });
  }

  async getAudienceDemographicsByAccountId(socialAccountId: string) {
    return this.prisma.socialAudienceDemographic.findMany({
      where: { socialAccountId },
      orderBy: { value: 'desc' },
    });
  }

  async getUserAudienceDemographics(userId: string) {
    const userAccounts = await this.prisma.socialAccount.findMany({
      where: { userId, status: SocialAccountStatus.CONNECTED },
      select: { id: true, platform: true, username: true, followerCount: true },
    });

    const accountIds = userAccounts.map((a) => a.id);
    if (accountIds.length === 0) return { accounts: [], demographics: [] };

    const demographics = await this.prisma.socialAudienceDemographic.findMany({
      where: { socialAccountId: { in: accountIds } },
      orderBy: { value: 'desc' },
    });

    return { accounts: userAccounts, demographics };
  }

  async findByUserId(userId: string): Promise<SocialAccount[]> {
    return this.prisma.socialAccount.findMany({
      where: {
        userId,
        status: SocialAccountStatus.CONNECTED,
      },
      orderBy: { connectedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<SocialAccount | null> {
    return this.prisma.socialAccount.findUnique({
      where: { id },
    });
  }

  async findByPlatformAndPlatformUserId(
    platform: SocialPlatform,
    platformUserId: string,
  ): Promise<SocialAccount | null> {
    return this.prisma.socialAccount.findFirst({
      where: {
        platform,
        platformUserId,
        status: SocialAccountStatus.CONNECTED,
      },
    });
  }

  async findByUserIdAndPlatform(
    userId: string,
    platform: SocialPlatform,
  ): Promise<SocialAccount | null> {
    return this.prisma.socialAccount.findFirst({
      where: {
        userId,
        platform,
        status: SocialAccountStatus.CONNECTED,
      },
    });
  }

  async setPrimaryAccount(userId: string, platform: SocialPlatform, platformUserId: string): Promise<void> {
    // No-op for compatibility
  }


  async updateAccountStatus(id: string, status: SocialAccountStatus): Promise<void> {
    await this.prisma.socialAccount.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
  }

  async disconnectAccount(idOrPlatform: string, ownerUserId?: string): Promise<void> {
    // Guard: never mark every account of a platform (across all users) disconnected.
    // A platform name is only valid when the requesting user owns an account of that platform.
    const isPlatformEnum = Object.values(SocialPlatform).includes(idOrPlatform as SocialPlatform);

    if (isPlatformEnum && ownerUserId) {
      await this.prisma.socialAccount.updateMany({
        where: {
          platform: idOrPlatform as SocialPlatform,
          userId: ownerUserId,
        },
        data: {
          status: SocialAccountStatus.DISCONNECTED,
          updatedAt: new Date(),
        },
      });
      return;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrPlatform);

    if (isUuid) {
      const account = await this.prisma.socialAccount.findUnique({
        where: { id: idOrPlatform },
      });

      if (account) {
        await this.prisma.socialAccount.updateMany({
          where: {
            id: account.id,
            // Only the owning user may disconnect their own account
            ...(ownerUserId ? { userId: ownerUserId } : {}),
          },
          data: {
            status: SocialAccountStatus.DISCONNECTED,
            updatedAt: new Date(),
          },
        });
        return;
      }
    }

    await this.prisma.socialAccount.updateMany({
      where: {
        OR: [
          { platformUserId: idOrPlatform },
          ...(isUuid ? [{ id: idOrPlatform }] : []),
        ],
        // Only the owning user may disconnect their own account
        ...(ownerUserId ? { userId: ownerUserId } : {}),
      },
      data: {
        status: SocialAccountStatus.DISCONNECTED,
        updatedAt: new Date(),
      },
    });
  }

  // --- Modular Analytics Storage Methods ---

  async upsertProfileMetadata(
    socialAccountId: string,
    data: {
      username?: string | null;
      displayName?: string | null;
      avatarUrl?: string | null;
      bio?: string | null;
      website?: string | null;
      profileUrl?: string | null;
      email?: string | null;
      country?: string | null;
      customUrl?: string | null;
      isVerified?: boolean | null;
      followerCount?: number | null;
      followingCount?: number | null;
      mediaCount?: number | null;
      category?: string | null;
      extraMetrics?: any;
    },
  ) {
    return this.prisma.socialProfileMetadata.upsert({
      where: { socialAccountId },
      create: {
        socialAccountId,
        ...data,
      },
      update: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async recordAccountPerformance(
    socialAccountId: string,
    data: {
      recordedAt: Date;
      period?: string | null;
      source?: string | null;
      reach?: number | null;
      impressions?: number | null;
      profileViews?: number | null;
      websiteClicks?: number | null;
      accountsEngaged?: number | null;
      totalInteractions?: number | null;
      views?: number | null;
      likes?: number | null;
      comments?: number | null;
      shares?: number | null;
      saves?: number | null;
      replies?: number | null;
      follows?: number | null;
      unfollows?: number | null;
      profileLinksTaps?: number | null;
      followerCount?: number | null;
      engagementRate?: number | null;
      rawMetrics?: any;
      extraMetrics?: any;
    },
  ) {
    return this.prisma.socialAccountPerformance.upsert({
      where: {
        socialAccountId_recordedAt: {
          socialAccountId,
          recordedAt: data.recordedAt,
        },
      },
      create: {
        socialAccountId,
        ...data,
      },
      update: {
        ...data,
      },
    });
  }

  async upsertAudienceDemographic(
    socialAccountId: string,
    type: 'AGE_GENDER' | 'COUNTRY' | 'CITY' | 'LOCALE',
    key: string,
    value: number,
    label?: string,
    extra?: {
      percentage?: number | null;
      timeframe?: string | null;
      source?: string | null;
      sourceMetric?: string | null;
      fetchedAt?: Date | null;
      rawData?: any;
    },
  ) {
    return this.prisma.socialAudienceDemographic.upsert({
      where: {
        socialAccountId_type_key: {
          socialAccountId,
          type,
          key,
        },
      },
      create: {
        socialAccountId,
        type,
        key,
        value,
        label,
        percentage: extra?.percentage,
        timeframe: extra?.timeframe || 'last_30_days',
        source: extra?.source || 'instagram_graph_api',
        sourceMetric: extra?.sourceMetric || 'follower_demographics',
        fetchedAt: extra?.fetchedAt || new Date(),
        rawData: extra?.rawData,
      },
      update: {
        value,
        label,
        ...(extra?.percentage !== undefined ? { percentage: extra.percentage } : {}),
        ...(extra?.timeframe !== undefined ? { timeframe: extra.timeframe } : {}),
        ...(extra?.source !== undefined ? { source: extra.source } : {}),
        ...(extra?.sourceMetric !== undefined ? { sourceMetric: extra.sourceMetric } : {}),
        ...(extra?.fetchedAt !== undefined ? { fetchedAt: extra.fetchedAt } : {}),
        ...(extra?.rawData !== undefined ? { rawData: extra.rawData } : {}),
        updatedAt: new Date(),
      },
    });
  }

  async upsertMediaWithPerformance(
    socialAccountId: string,
    post: {
      platformMediaId: string;
      mediaType?: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REEL' | 'STORY';
      mediaProductType?: string | null;
      title?: string | null;
      caption?: string | null;
      permalink?: string | null;
      shortcode?: string | null;
      thumbnailUrl?: string | null;
      mediaUrl?: string | null;
      duration?: number | null;
      publishedAt?: Date | null;
      isCommentEnabled?: boolean | null;
      isSharedToFeed?: boolean | null;
      altText?: string | null;
      rawPayload?: any;
      extraMetrics?: any;
    },
    metrics: {
      likeCount?: number | null;
      commentCount?: number | null;
      shareCount?: number | null;
      saveCount?: number | null;
      playCount?: number | null;
      reach?: number | null;
      impressions?: number | null;
      videoViewTotalTime?: number | null;
      avgWatchTime?: number | null;
      extraMetrics?: any;
    },
  ) {
    return this.prisma.socialMediaContent.upsert({
      where: {
        socialAccountId_platformMediaId: {
          socialAccountId,
          platformMediaId: post.platformMediaId,
        },
      },
      create: {
        socialAccountId,
        ...post,
        ...metrics,
      },
      update: {
        ...post,
        ...metrics,
        updatedAt: new Date(),
      },
    });
  }

  async updateAccountCustomData(socialAccountId: string, customData: any): Promise<SocialAccount> {
    const existing = await this.prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
      select: { customData: true },
    });

    const mergedData = {
      ...(typeof existing?.customData === 'object' && existing.customData !== null ? existing.customData : {}),
      ...(typeof customData === 'object' && customData !== null ? customData : {}),
    };

    return this.prisma.socialAccount.update({
      where: { id: socialAccountId },
      data: {
        customData: mergedData,
        updatedAt: new Date(),
      },
    });
  }

  async updateTokenLifecycle(
    socialAccountId: string,
    data: {
      accessToken?: string;
      refreshToken?: string | null;
      expiresAt?: Date | null;
      lastRefreshedAt?: Date | null;
      nextRefreshAt?: Date | null;
      refreshMethod?: string | null;
      tokenStatus?: string | null;
      scopes?: string[];
      lastTokenError?: string | null;
    },
  ): Promise<SocialAccount> {
    return this.prisma.socialAccount.update({
      where: { id: socialAccountId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async updateSyncState(
    socialAccountId: string,
    target: 'PROFILE_METADATA' | 'AUDIENCE_DEMOGRAPHICS' | 'ACCOUNT_PERFORMANCE' | 'MEDIA_CONTENT',
    status:
      | 'IDLE'
      | 'QUEUED'
      | 'SYNCING'
      | 'RUNNING'
      | 'SUCCESS'
      | 'PARTIAL_SUCCESS'
      | 'FAILED'
      | 'PAUSED'
      | 'RATE_LIMITED'
      | 'REAUTHORIZATION_REQUIRED',
    detailsOrError?:
      | string
      | {
          lastError?: string | null;
          lastErrorCode?: string | null;
          lastErrorAt?: Date | null;
          lastStartedAt?: Date | null;
          lastCompletedAt?: Date | null;
          lastSuccessAt?: Date | null;
          nextSyncAt?: Date | null;
          retryCount?: number;
          nextRetryAt?: Date | null;
          recordsSynced?: number | null;
          syncWindowStart?: Date | null;
          syncWindowEnd?: Date | null;
        },
    nextSyncDueAt?: Date,
  ) {
    const details =
      typeof detailsOrError === 'string'
        ? { lastError: detailsOrError }
        : detailsOrError || {};

    return this.prisma.socialSyncState.upsert({
      where: {
        socialAccountId_target: {
          socialAccountId,
          target,
        },
      },
      create: {
        socialAccountId,
        target,
        syncStatus: status as any,
        lastSyncedAt: new Date(),
        nextSyncAt: details.nextSyncAt || nextSyncDueAt,
        nextSyncDueAt: details.nextSyncAt || nextSyncDueAt,
        lastError: details.lastError,
        lastErrorCode: details.lastErrorCode,
        lastErrorAt: details.lastErrorAt || (details.lastError ? new Date() : null),
        lastStartedAt: details.lastStartedAt,
        lastCompletedAt: details.lastCompletedAt,
        lastSuccessAt: details.lastSuccessAt || (status === 'SUCCESS' ? new Date() : null),
        retryCount: details.retryCount || 0,
        nextRetryAt: details.nextRetryAt,
        recordsSynced: details.recordsSynced,
        syncWindowStart: details.syncWindowStart,
        syncWindowEnd: details.syncWindowEnd,
      },
      update: {
        syncStatus: status as any,
        lastSyncedAt: new Date(),
        ...(details.nextSyncAt !== undefined || nextSyncDueAt !== undefined
          ? { nextSyncAt: details.nextSyncAt || nextSyncDueAt, nextSyncDueAt: details.nextSyncAt || nextSyncDueAt }
          : {}),
        ...(details.lastError !== undefined ? { lastError: details.lastError } : {}),
        ...(details.lastErrorCode !== undefined ? { lastErrorCode: details.lastErrorCode } : {}),
        ...(details.lastErrorAt !== undefined ? { lastErrorAt: details.lastErrorAt } : {}),
        ...(details.lastStartedAt !== undefined ? { lastStartedAt: details.lastStartedAt } : {}),
        ...(details.lastCompletedAt !== undefined ? { lastCompletedAt: details.lastCompletedAt } : {}),
        ...(details.lastSuccessAt !== undefined ? { lastSuccessAt: details.lastSuccessAt } : {}),
        ...(status === 'SUCCESS' ? { lastSuccessAt: new Date(), lastError: null, lastErrorCode: null, retryCount: 0 } : {}),
        ...(details.retryCount !== undefined ? { retryCount: details.retryCount } : {}),
        ...(details.nextRetryAt !== undefined ? { nextRetryAt: details.nextRetryAt } : {}),
        ...(details.recordsSynced !== undefined ? { recordsSynced: details.recordsSynced } : {}),
        ...(details.syncWindowStart !== undefined ? { syncWindowStart: details.syncWindowStart } : {}),
        ...(details.syncWindowEnd !== undefined ? { syncWindowEnd: details.syncWindowEnd } : {}),
        updatedAt: new Date(),
      },
    });
  }

  async findByPlatformUserId(platformUserId: string): Promise<SocialAccount | null> {
    return this.prisma.socialAccount.findFirst({
      where: {
        platformUserId,
        status: SocialAccountStatus.CONNECTED,
      },
    });
  }

  async findAllConnectedAccounts(): Promise<SocialAccount[]> {
    return this.prisma.socialAccount.findMany({
      where: {
        status: SocialAccountStatus.CONNECTED,
      },
    });
  }

  async pruneOldMediaContent(socialAccountId: string, keepLimit = 25): Promise<void> {
    const mediaItems = await this.prisma.socialMediaContent.findMany({
      where: { socialAccountId },
      orderBy: { publishedAt: 'desc' },
      select: { id: true },
    });

    if (mediaItems.length > keepLimit) {
      const idsToDelete = mediaItems.slice(keepLimit).map((item) => item.id);
      await this.prisma.socialMediaContent.deleteMany({
        where: {
          id: { in: idsToDelete },
        },
      });
    }
  }

  async getAccountAnalytics(socialAccountId: string) {
    return this.prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
      include: {
        metadata: true,
        demographics: {
          orderBy: { value: 'desc' },
        },
        performance: {
          orderBy: { recordedAt: 'desc' },
          take: 30,
        },
        contents: {
          orderBy: { publishedAt: 'desc' },
          take: 25,
        },
        syncStates: true,
      },
    });
  }
}
