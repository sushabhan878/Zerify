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
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
}

@Injectable()
export class SocialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertAccount(data: UpsertSocialAccountData): Promise<SocialAccount> {
    return this.prisma.socialAccount.upsert({
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
