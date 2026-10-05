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
      if (data.username?.startsWith('@')) {
        handle = data.username.trim();
      } else if (data.username) {
        handle = `@${data.username.replace(/^@/, '')}`;
      }
    } else if (!handle.startsWith('@')) {
      handle = `@${handle}`;
    }

    // 2. Resolve Person's Name / Display Name
    const resolvedDisplayName = data.displayName?.trim() || null;
    let personName = (resolvedDisplayName || data.username?.trim() || '').replace(/^@/, '');

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
        ...(handle ? { handle } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
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
    const [genders, ageGroups, countries, cities, locales] = await Promise.all([
      this.prisma.socialAudienceGender.findMany({ where: { socialAccountId }, orderBy: { count: 'desc' } }),
      this.prisma.socialAudienceAge.findMany({ where: { socialAccountId }, orderBy: { count: 'desc' } }),
      this.prisma.socialAudienceCountry.findMany({ where: { socialAccountId }, orderBy: { count: 'desc' } }),
      this.prisma.socialAudienceCity.findMany({ where: { socialAccountId }, orderBy: { count: 'desc' } }),
      this.prisma.socialAudienceLocale.findMany({ where: { socialAccountId }, orderBy: { count: 'desc' } }),
    ]);
    return { genders, ageGroups, countries, cities, locales };
  }

  async getUserAudienceDemographics(userId: string) {
    const userAccounts = await this.prisma.socialAccount.findMany({
      where: { userId, status: SocialAccountStatus.CONNECTED },
      select: { id: true, platform: true, username: true, followerCount: true },
    });

    const accountIds = userAccounts.map((a) => a.id);
    if (accountIds.length === 0) return { accounts: [], demographics: [] };

    const [genders, ageGroups, countries, cities, locales] = await Promise.all([
      this.prisma.socialAudienceGender.findMany({ where: { socialAccountId: { in: accountIds } }, orderBy: { count: 'desc' } }),
      this.prisma.socialAudienceAge.findMany({ where: { socialAccountId: { in: accountIds } }, orderBy: { count: 'desc' } }),
      this.prisma.socialAudienceCountry.findMany({ where: { socialAccountId: { in: accountIds } }, orderBy: { count: 'desc' } }),
      this.prisma.socialAudienceCity.findMany({ where: { socialAccountId: { in: accountIds } }, orderBy: { count: 'desc' } }),
      this.prisma.socialAudienceLocale.findMany({ where: { socialAccountId: { in: accountIds } }, orderBy: { count: 'desc' } }),
    ]);

    // Adapter array format for frontend dashboard charts
    const demographics: Array<{
      socialAccountId: string;
      type: string;
      key: string;
      label: string | null;
      value: number;
      percentage: number | null;
    }> = [
      ...genders.map((g) => ({
        socialAccountId: g.socialAccountId,
        type: 'AGE_GENDER',
        key: g.gender,
        label: g.label,
        value: g.count,
        percentage: g.percentage,
      })),
      ...ageGroups.map((a) => ({
        socialAccountId: a.socialAccountId,
        type: 'AGE_GENDER',
        key: a.ageRange,
        label: a.label,
        value: a.count,
        percentage: a.percentage,
      })),
      ...countries.map((c) => ({
        socialAccountId: c.socialAccountId,
        type: 'COUNTRY',
        key: c.countryCode,
        label: c.countryName,
        value: c.count,
        percentage: c.percentage,
      })),
      ...cities.map((ct) => ({
        socialAccountId: ct.socialAccountId,
        type: 'CITY',
        key: ct.cityName,
        label: ct.cityName,
        value: ct.count,
        percentage: ct.percentage,
      })),
      ...locales.map((l) => ({
        socialAccountId: l.socialAccountId,
        type: 'LOCALE',
        key: l.locale,
        label: l.label,
        value: l.count,
        percentage: l.percentage,
      })),
    ];

    return {
      accounts: userAccounts,
      demographics,
      genders,
      ageGroups,
      countries,
      cities,
      locales,
    };
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



  async upsertAudienceGender(
    socialAccountId: string,
    gender: string,
    count: number,
    label?: string,
    percentage?: number | null,
    rawData?: any,
  ) {
    const normGender = gender.toUpperCase();
    return this.prisma.socialAudienceGender.upsert({
      where: {
        socialAccountId_gender: {
          socialAccountId,
          gender: normGender,
        },
      },
      create: {
        socialAccountId,
        gender: normGender,
        label: label || (normGender === 'M' ? 'Male' : normGender === 'F' ? 'Female' : 'Unspecified'),
        count,
        percentage,
        rawData,
      },
      update: {
        count,
        label: label || (normGender === 'M' ? 'Male' : normGender === 'F' ? 'Female' : 'Unspecified'),
        percentage,
        rawData,
        updatedAt: new Date(),
      },
    });
  }

  async upsertAudienceAge(
    socialAccountId: string,
    ageRange: string,
    count: number,
    label?: string,
    percentage?: number | null,
    rawData?: any,
  ) {
    return this.prisma.socialAudienceAge.upsert({
      where: {
        socialAccountId_ageRange: {
          socialAccountId,
          ageRange,
        },
      },
      create: {
        socialAccountId,
        ageRange,
        label: label || `Age ${ageRange}`,
        count,
        percentage,
        rawData,
      },
      update: {
        count,
        label: label || `Age ${ageRange}`,
        percentage,
        rawData,
        updatedAt: new Date(),
      },
    });
  }

  async upsertAudienceCountry(
    socialAccountId: string,
    countryCode: string,
    count: number,
    countryName?: string,
    percentage?: number | null,
    rawData?: any,
  ) {
    const normCode = countryCode.toUpperCase();
    return this.prisma.socialAudienceCountry.upsert({
      where: {
        socialAccountId_countryCode: {
          socialAccountId,
          countryCode: normCode,
        },
      },
      create: {
        socialAccountId,
        countryCode: normCode,
        countryName: countryName || normCode,
        count,
        percentage,
        rawData,
      },
      update: {
        count,
        countryName: countryName || normCode,
        percentage,
        rawData,
        updatedAt: new Date(),
      },
    });
  }

  async upsertAudienceCity(
    socialAccountId: string,
    cityName: string,
    count: number,
    countryCode?: string,
    percentage?: number | null,
    rawData?: any,
  ) {
    return this.prisma.socialAudienceCity.upsert({
      where: {
        socialAccountId_cityName: {
          socialAccountId,
          cityName,
        },
      },
      create: {
        socialAccountId,
        cityName,
        countryCode,
        count,
        percentage,
        rawData,
      },
      update: {
        count,
        countryCode: countryCode || undefined,
        percentage,
        rawData,
        updatedAt: new Date(),
      },
    });
  }

  async upsertAudienceLocale(
    socialAccountId: string,
    locale: string,
    count: number,
    label?: string,
    percentage?: number | null,
    rawData?: any,
  ) {
    return this.prisma.socialAudienceLocale.upsert({
      where: {
        socialAccountId_locale: {
          socialAccountId,
          locale,
        },
      },
      create: {
        socialAccountId,
        locale,
        label,
        count,
        percentage,
        rawData,
      },
      update: {
        count,
        label,
        percentage,
        rawData,
        updatedAt: new Date(),
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
    if (type === 'AGE_GENDER' || (type as string) === 'AGE' || (type as string) === 'GENDER') {
      const upKey = key.toUpperCase();
      if (['M', 'F', 'U', 'MALE', 'FEMALE', 'UNSPECIFIED'].includes(upKey)) {
        return this.upsertAudienceGender(socialAccountId, upKey, value, label, extra?.percentage, extra?.rawData);
      } else if (/^\d{2}-\d{2}$/.test(key) || /^\d{2}\+$/.test(key) || /^\d{2}_/.test(key)) {
        return this.upsertAudienceAge(socialAccountId, key, value, label, extra?.percentage, extra?.rawData);
      } else if (key.includes('.')) {
        const [agePart, genderPart] = key.split('.');
        const cleanAge = agePart.replace(/^age/, '');
        const upGender = (genderPart || '').toUpperCase();
        const cleanGender = ['FEMALE', 'F'].includes(upGender) ? 'F' : ['MALE', 'M'].includes(upGender) ? 'M' : 'U';
        await this.upsertAudienceAge(socialAccountId, cleanAge, value, `Age ${cleanAge}`, extra?.percentage, extra?.rawData);
        return this.upsertAudienceGender(socialAccountId, cleanGender, value, cleanGender === 'F' ? 'Female' : 'Male', extra?.percentage, extra?.rawData);
      }
    } else if (type === 'COUNTRY') {
      return this.upsertAudienceCountry(socialAccountId, key, value, label, extra?.percentage, extra?.rawData);
    } else if (type === 'CITY') {
      return this.upsertAudienceCity(socialAccountId, key, value, undefined, extra?.percentage, extra?.rawData);
    } else if (type === 'LOCALE') {
      return this.upsertAudienceLocale(socialAccountId, key, value, label, extra?.percentage, extra?.rawData);
    }
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
        audienceGenders: { orderBy: { count: 'desc' } },
        audienceAgeGroups: { orderBy: { count: 'desc' } },
        audienceCountries: { orderBy: { count: 'desc' } },
        audienceCities: { orderBy: { count: 'desc' } },
        audienceLocales: { orderBy: { count: 'desc' } },
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
