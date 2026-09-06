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
    engagementRate?: number | null;
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
        engagementRate: data.engagementRate,
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
        ...(data.engagementRate !== undefined ? { engagementRate: data.engagementRate } : {}),
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
        instagramProfile: {
          include: {
            media: { orderBy: { publishedAt: 'desc' }, take: 25 },
            insights: { orderBy: { date: 'desc' }, take: 30 },
          },
        },
        facebookProfile: true,
        facebookPages: {
          include: {
            posts: { orderBy: { createdTime: 'desc' }, take: 25 },
            insights: { orderBy: { date: 'desc' }, take: 30 },
          },
        },
        youtubeChannel: {
          include: {
            videos: { orderBy: { publishedAt: 'desc' }, take: 25 },
            channelAnalytics: { orderBy: { date: 'desc' }, take: 30 },
          },
        },
        linkedInProfile: {
          include: {
            posts: { orderBy: { publishedAt: 'desc' }, take: 25 },
            analytics: { orderBy: { date: 'desc' }, take: 30 },
          },
        },
        twitterProfile: {
          include: {
            tweets: { orderBy: { publishedAt: 'desc' }, take: 25 },
            analytics: { orderBy: { date: 'desc' }, take: 30 },
          },
        },
        tiktokProfile: {
          include: {
            videos: { orderBy: { publishedAt: 'desc' }, take: 25 },
            analytics: { orderBy: { date: 'desc' }, take: 30 },
          },
        },
      },
    });

    return account;
  }

  // ==========================================
  // Dedicated Platform-Specific Helper Methods
  // ==========================================

  // --- Instagram ---
  async upsertInstagramProfile(
    socialAccountId: string,
    data: {
      igUserId: string;
      username: string;
      displayName?: string;
      biography?: string;
      profilePictureUrl?: string;
      website?: string;
      followerCount?: number;
      followingCount?: number;
      mediaCount?: number;
      isBusinessAccount?: boolean;
      isVerified?: boolean;
    },
  ) {
    return this.prisma.instagramProfile.upsert({
      where: { socialAccountId },
      create: { socialAccountId, ...data },
      update: { ...data, updatedAt: new Date() },
    });
  }

  async upsertInstagramMedia(
    instagramProfileId: string,
    media: {
      mediaId: string;
      mediaType?: string;
      caption?: string;
      permalink?: string;
      thumbnailUrl?: string;
      mediaUrl?: string;
      publishedAt?: Date;
      likeCount?: number;
      commentCount?: number;
      saveCount?: number;
      shareCount?: number;
      reach?: number;
      impressions?: number;
      videoViews?: number;
    },
  ) {
    return this.prisma.instagramMedia.upsert({
      where: { mediaId: media.mediaId },
      create: { instagramProfileId, ...media },
      update: { ...media, updatedAt: new Date() },
    });
  }

  // --- Facebook & Pages ---
  async upsertFacebookProfile(
    socialAccountId: string,
    data: {
      facebookUserId: string;
      name: string;
      email?: string;
      avatarUrl?: string;
      profileUrl?: string;
    },
  ) {
    return this.prisma.facebookProfile.upsert({
      where: { socialAccountId },
      create: { socialAccountId, ...data },
      update: { ...data, updatedAt: new Date() },
    });
  }

  async upsertFacebookPage(
    socialAccountId: string,
    page: {
      pageId: string;
      name: string;
      category?: string;
      tasks?: string[];
      pageAccessToken?: string;
      pictureUrl?: string;
      fanCount?: number;
      followersCount?: number;
      website?: string;
      about?: string;
    },
  ) {
    return this.prisma.facebookPage.upsert({
      where: { pageId: page.pageId },
      create: { socialAccountId, ...page },
      update: { ...page, updatedAt: new Date() },
    });
  }

  // --- YouTube ---
  async upsertYouTubeChannel(
    socialAccountId: string,
    data: {
      channelId: string;
      channelTitle: string;
      channelDescription?: string;
      customUrl?: string;
      thumbnailUrl?: string;
      subscriberCount?: number;
      videoCount?: number;
      viewCount?: bigint;
      publishedAt?: Date;
      country?: string;
    },
  ) {
    return this.prisma.youTubeChannel.upsert({
      where: { socialAccountId },
      create: { socialAccountId, ...data },
      update: { ...data, lastSyncedAt: new Date(), updatedAt: new Date() },
    });
  }

  async upsertYouTubeVideo(
    youtubeChannelId: string,
    video: {
      videoId: string;
      title: string;
      description?: string;
      thumbnailUrl?: string;
      publishedAt?: Date;
      duration?: string;
      viewCount?: bigint;
      likeCount?: number;
      commentCount?: number;
      privacyStatus?: string;
      liveBroadcastContent?: string;
    },
  ) {
    return this.prisma.youTubeVideo.upsert({
      where: { videoId: video.videoId },
      create: { youtubeChannelId, ...video },
      update: { ...video, lastSyncedAt: new Date(), updatedAt: new Date() },
    });
  }

  async findYouTubeChannelBySocialAccountId(socialAccountId: string) {
    return this.prisma.youTubeChannel.findUnique({
      where: { socialAccountId },
      include: {
        videos: {
          orderBy: { publishedAt: 'desc' },
          take: 25,
        },
        channelAnalytics: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });
  }

  async upsertYouTubeChannelAnalytics(
    youtubeChannelId: string,
    snapshot: {
      date: Date;
      views: bigint;
      likes: number;
      comments: number;
      shares: number;
      subscribersGained: number;
      subscribersLost: number;
      estimatedMinutesWatched: bigint;
      averageViewDuration: number;
    },
  ) {
    return this.prisma.youTubeChannelAnalytics.upsert({
      where: {
        youtubeChannelId_date: {
          youtubeChannelId,
          date: snapshot.date,
        },
      },
      create: {
        youtubeChannelId,
        ...snapshot,
      },
      update: {
        ...snapshot,
      },
    });
  }

  // --- LinkedIn ---
  async upsertLinkedInProfile(
    socialAccountId: string,
    data: {
      linkedinId: string;
      localizedFirstName?: string;
      localizedLastName?: string;
      vanityName?: string;
      headline?: string;
      profilePictureUrl?: string;
      connectionsCount?: number;
      followersCount?: number;
      email?: string;
      emailVerified?: boolean;
      locale?: string;
    },
  ) {
    return (this.prisma as any).linkedInProfile.upsert({
      where: { socialAccountId },
      create: { socialAccountId, ...data },
      update: { ...data, updatedAt: new Date() },
    });
  }

  // --- Twitter / X ---
  async upsertTwitterProfile(
    socialAccountId: string,
    data: {
      twitterId: string;
      username: string;
      name: string;
      description?: string;
      profileImageUrl?: string;
      followersCount?: number;
      followingCount?: number;
      tweetCount?: number;
      verifiedType?: string;
    },
  ) {
    return this.prisma.twitterProfile.upsert({
      where: { socialAccountId },
      create: { socialAccountId, ...data },
      update: { ...data, updatedAt: new Date() },
    });
  }

  async upsertTwitterTweet(
    twitterProfileId: string,
    data: {
      tweetId: string;
      text: string;
      publishedAt?: Date | null;
      retweetCount?: number;
      replyCount?: number;
      likeCount?: number;
      quoteCount?: number;
      bookmarkCount?: number;
      impressionCount?: number;
    },
  ) {
    return this.prisma.twitterTweet.upsert({
      where: { tweetId: data.tweetId },
      create: { twitterProfileId, ...data },
      update: { ...data, updatedAt: new Date() },
    });
  }

  async findTwitterProfile(socialAccountId: string) {
    return this.prisma.twitterProfile.findUnique({
      where: { socialAccountId },
      include: {
        tweets: {
          orderBy: { publishedAt: 'desc' },
          take: 20,
        },
      },
    });
  }


  // --- TikTok ---
  async upsertTikTokProfile(
    socialAccountId: string,
    data: {
      openId: string;
      unionId?: string;
      displayName: string;
      avatarUrl?: string;
      bioDescription?: string;
      followerCount?: number;
      followingCount?: number;
      likesCount?: number;
      videoCount?: number;
      isVerified?: boolean;
    },
  ) {
    return this.prisma.tikTokProfile.upsert({
      where: { socialAccountId },
      create: { socialAccountId, ...data },
      update: { ...data, updatedAt: new Date() },
    });
  }

  // --- Threads ---
  async upsertThreadsProfile(
    socialAccountId: string,
    data: {
      threadsId: string;
      username: string;
      name?: string | null;
      biography?: string | null;
      profilePictureUrl?: string | null;
      followersCount?: number;
      followingCount?: number;
      postCount?: number;
      isVerified?: boolean;
    },
  ) {
    return (this.prisma as any).threadsProfile.upsert({
      where: { socialAccountId },
      create: { socialAccountId, ...data },
      update: { ...data, updatedAt: new Date() },
    });
  }

  async upsertThreadsPost(
    threadsProfileId: string,
    data: {
      threadsPostId: string;
      text?: string | null;
      mediaType?: string | null;
      permalink?: string | null;
      publishedAt?: Date | null;
      likeCount?: number;
      replyCount?: number;
      repostCount?: number;
      quoteCount?: number;
      viewsCount?: number;
      hasReplies?: boolean;
      isQuotePost?: boolean;
    },
  ) {
    return (this.prisma as any).threadsPost.upsert({
      where: { threadsPostId: data.threadsPostId },
      create: { threadsProfileId, ...data },
      update: { ...data, updatedAt: new Date() },
    });
  }

  async upsertThreadsAnalytics(
    threadsProfileId: string,
    data: {
      date: Date;
      views?: number;
      likes?: number;
      replies?: number;
      reposts?: number;
      quotes?: number;
      followersNetChange?: number;
    },
  ) {
    return (this.prisma as any).threadsAnalytics.upsert({
      where: {
        threadsProfileId_date: {
          threadsProfileId,
          date: data.date,
        },
      },
      create: { threadsProfileId, ...data },
      update: { ...data },
    });
  }

  async findThreadsProfile(socialAccountId: string) {
    return (this.prisma as any).threadsProfile.findUnique({
      where: { socialAccountId },
      include: {
        posts: {
          orderBy: { publishedAt: 'desc' },
          take: 20,
        },
      },
    });
  }
}


