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
        displayName: data.displayName,
        avatar: data.avatar,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        status: SocialAccountStatus.CONNECTED,
      },
      update: {
        username: data.username,
        displayName: data.displayName,
        avatar: data.avatar,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        status: SocialAccountStatus.CONNECTED,
        updatedAt: new Date(),
      },
    });

    try {
      const influencer = await this.prisma.influencerProfile.findUnique({
        where: { userId: data.userId },
      });
      if (influencer) {
        const platformName = data.platform === SocialPlatform.INSTAGRAM ? 'Instagram' : 'Facebook';
        const existingConnected = await this.prisma.influencerConnectedAccount.findFirst({
          where: {
            influencerId: influencer.id,
            platform: platformName,
          },
        });

        if (existingConnected) {
          await this.prisma.influencerConnectedAccount.update({
            where: { id: existingConnected.id },
            data: {
              handle: data.username ? `@${data.username}` : existingConnected.handle,
              followerCount: data.followerCount ?? existingConnected.followerCount,
              isVerified: true,
            },
          });
        } else {
          await this.prisma.influencerConnectedAccount.create({
            data: {
              influencerId: influencer.id,
              platform: platformName,
              handle: data.username ? `@${data.username}` : `@${data.platformUserId}`,
              followerCount: data.followerCount ?? 0,
              isVerified: true,
            },
          });
        }
      }
    } catch {
      // Ignore secondary sync errors gracefully
    }

    return account;
  }

  async findByUserId(userId: string): Promise<SocialAccount[]> {
    return this.prisma.socialAccount.findMany({
      where: {
        userId,
        status: SocialAccountStatus.CONNECTED,
      },
      orderBy: {
        connectedAt: 'desc',
      },
    });
  }

  async findById(id: string): Promise<SocialAccount | null> {
    return this.prisma.socialAccount.findUnique({
      where: { id },
    });
  }

  async deleteAccount(id: string, userId: string): Promise<SocialAccount> {
    return this.prisma.socialAccount.delete({
      where: {
        id,
        userId,
      },
    });
  }
}
