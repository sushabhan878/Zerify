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
    avatar?: string;
    followerCount?: number;
    accessToken: string;
    refreshToken?: string | null;
    expiresAt?: Date | null;
  }): Promise<SocialAccount> {
    const handle = `@${data.username.replace(/^@/, '')}`;

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
        username: data.username,
        handle,
        avatar: data.avatar,
        followerCount: data.followerCount || 0,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        status: SocialAccountStatus.CONNECTED,
        connectedAt: new Date(),
      },
      update: {
        username: data.username,
        handle,
        avatar: data.avatar,
        followerCount: data.followerCount || 0,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        status: SocialAccountStatus.CONNECTED,
        updatedAt: new Date(),
      },
    });

    return account;
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

  async setPrimaryAccount(userId: string, platform: SocialPlatform, platformUserId: string): Promise<void> {
    // No-op for compatibility
  }


  async updateAccountStatus(id: string, status: SocialAccountStatus): Promise<void> {
    await this.prisma.socialAccount.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
  }

  async disconnectAccount(idOrPlatform: string): Promise<void> {
    const isPlatformEnum = Object.values(SocialPlatform).includes(idOrPlatform as SocialPlatform);

    if (isPlatformEnum) {
      await this.prisma.socialAccount.updateMany({
        where: {
          platform: idOrPlatform as SocialPlatform,
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
            platform: account.platform,
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
      isVerified?: boolean;
      followerCount?: number;
      followingCount?: number;
      mediaCount?: number;
      category?: string | null;
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
      reach?: number;
      impressions?: number;
      profileViews?: number;
      websiteClicks?: number;
      accountsEngaged?: number;
      totalInteractions?: number;
      followerCount?: number;
      engagementRate?: number;
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
      },
      update: {
        value,
        label,
        updatedAt: new Date(),
      },
    });
  }

  async upsertMediaWithPerformance(
    socialAccountId: string,
    post: {
      platformMediaId: string;
      mediaType?: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REEL' | 'STORY';
      caption?: string | null;
      permalink?: string | null;
      thumbnailUrl?: string | null;
      publishedAt?: Date | null;
    },
    metrics: {
      likeCount?: number;
      commentCount?: number;
      shareCount?: number;
      saveCount?: number;
      playCount?: number;
      reach?: number;
      impressions?: number;
      videoViewTotalTime?: number | null;
      avgWatchTime?: number | null;
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

  async updateSyncState(
    socialAccountId: string,
    target: 'PROFILE_METADATA' | 'AUDIENCE_DEMOGRAPHICS' | 'ACCOUNT_PERFORMANCE' | 'MEDIA_CONTENT',
    status: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'FAILED' | 'RATE_LIMITED',
    lastError?: string,
    nextSyncDueAt?: Date,
  ) {
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
        syncStatus: status,
        lastSyncedAt: new Date(),
        nextSyncDueAt,
        lastError,
      },
      update: {
        syncStatus: status,
        lastSyncedAt: new Date(),
        nextSyncDueAt,
        lastError,
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
    const account = await this.prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
      include: {
        metadata: true,
        demographics: true,
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

    return account;
  }
}

