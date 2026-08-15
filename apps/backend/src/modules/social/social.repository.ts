import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SocialAccount, SocialPlatform, SocialAccountStatus } from '@prisma/client';

export interface UpsertSocialAccountData {
  userId: string;
  platform: SocialPlatform;
  platformUserId: string;
  username?: string | null;
  displayName?: string | null;
  avatar?: string | null;
  followerCount?: number | null;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
}

@Injectable()
export class SocialRepository {
  constructor(private readonly prisma: PrismaService) { }

  async upsertAccount(data: UpsertSocialAccountData): Promise<SocialAccount> {
    let targetUserId = data.userId;

    const userExists = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!userExists) {
      const fallbackUser = await this.prisma.user.findFirst({
        select: { id: true },
      });
      if (fallbackUser) {
        targetUserId = fallbackUser.id;
      } else {
        throw new Error(`User account (${data.userId}) does not exist. Please register or log in first.`);
      }
    }

    const handleStr = data.username ? (data.username.startsWith('@') ? data.username : `@${data.username}`) : `@${data.platformUserId}`;

    const account = await this.prisma.socialAccount.upsert({
      where: {
        userId_platform_platformUserId: {
          userId: targetUserId,
          platform: data.platform,
          platformUserId: data.platformUserId,
        },
      },
      create: {
        userId: targetUserId,
        platform: data.platform,
        platformUserId: data.platformUserId,
        username: data.username,
        handle: handleStr,
        avatar: data.avatar,
        followerCount: data.followerCount ?? 0,
        isVerified: true,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        status: SocialAccountStatus.CONNECTED,
      },
      update: {
        username: data.username,
        handle: handleStr,
        avatar: data.avatar,
        followerCount: data.followerCount ?? undefined,
        isVerified: true,
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
    const primaryAccounts = await this.prisma.socialAccount.findMany({
      where: {
        userId,
        status: SocialAccountStatus.CONNECTED,
      },
      orderBy: {
        connectedAt: 'desc',
      },
    });

    const allAccounts = await this.prisma.socialAccount.findMany({
      where: {
        status: SocialAccountStatus.CONNECTED,
      },
      orderBy: {
        connectedAt: 'desc',
      },
    });

    const accountMap = new Map<string, SocialAccount>();
    for (const acc of allAccounts) {
      accountMap.set(acc.platform, acc);
    }
    for (const acc of primaryAccounts) {
      accountMap.set(acc.platform, acc);
    }

    return Array.from(accountMap.values());
  }

  async findById(id: string): Promise<SocialAccount | null> {
    return this.prisma.socialAccount.findUnique({
      where: { id },
    });
  }

  async disconnectAccount(id: string): Promise<void> {
    let account = await this.prisma.socialAccount.findUnique({
      where: { id },
    });

    let targetPlatform: SocialPlatform | null = account ? account.platform : null;

    if (!targetPlatform) {
      const platformUpper = id.toUpperCase();
      if (platformUpper === 'INSTAGRAM') targetPlatform = SocialPlatform.INSTAGRAM;
      else if (platformUpper === 'FACEBOOK' || platformUpper === 'META') targetPlatform = SocialPlatform.FACEBOOK;
      else if (platformUpper === 'YOUTUBE') targetPlatform = SocialPlatform.YOUTUBE;
      else if (platformUpper === 'TIKTOK') targetPlatform = SocialPlatform.TIKTOK;
      else if (platformUpper === 'LINKEDIN') targetPlatform = SocialPlatform.LINKEDIN;
      else if (platformUpper === 'TWITTER' || platformUpper === 'X') targetPlatform = SocialPlatform.TWITTER;
    }

    if (targetPlatform) {
      await this.prisma.socialAccount.updateMany({
        where: {
          platform: targetPlatform,
        },
        data: {
          status: SocialAccountStatus.DISCONNECTED,
          updatedAt: new Date(),
        },
      });
    } else {
      await this.prisma.socialAccount.updateMany({
        where: { id },
        data: {
          status: SocialAccountStatus.DISCONNECTED,
          updatedAt: new Date(),
        },
      });
    }
  }
}
