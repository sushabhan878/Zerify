import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateInfluencerProfileDto } from './dto/update-profile.dto';

@Injectable()
export class InfluencerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    let profile = await this.prisma.influencerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        connectedAccounts: true,
        pastDeliverables: true,
        paymentDetails: true,
      },
    });

    if (!profile) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        profile = await this.prisma.influencerProfile.create({
          data: {
            userId: user.id,
            handle: `@${(user.name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },
            connectedAccounts: true,
            pastDeliverables: true,
            paymentDetails: true,
          },
        });
      }
    }

    return profile;
  }

  async findFirstProfile() {
    let firstProfile = await this.prisma.influencerProfile.findFirst({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        connectedAccounts: true,
        pastDeliverables: true,
        paymentDetails: true,
      },
    });

    if (!firstProfile) {
      let user = await this.prisma.user.findFirst({ where: { role: 'INFLUENCER' } });
      if (!user) {
        user = await this.prisma.user.findFirst();
      }

      if (user) {
        firstProfile = await this.prisma.influencerProfile.create({
          data: {
            userId: user.id,
            handle: `@${(user.name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },
            connectedAccounts: true,
            pastDeliverables: true,
            paymentDetails: true,
          },
        });
      }
    }

    return firstProfile;
  }

  async updateProfile(userId: string, dto: UpdateInfluencerProfileDto) {
    // 1. If name is provided, update User.name
    if (dto.name !== undefined && dto.name !== null) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { name: dto.name },
      });
    }

    // 2. Format fields for InfluencerProfile update
    const dataToUpdate: any = {};

    if (dto.handle !== undefined && dto.handle !== null) dataToUpdate.handle = dto.handle;
    if (dto.bio !== undefined && dto.bio !== null) dataToUpdate.bio = dto.bio;
    if (dto.location !== undefined && dto.location !== null) dataToUpdate.location = dto.location;
    if (dto.phoneCode !== undefined && dto.phoneCode !== null) dataToUpdate.phoneCode = dto.phoneCode;
    if (dto.phoneNumber !== undefined && dto.phoneNumber !== null) dataToUpdate.phoneNumber = dto.phoneNumber;
    if (dto.gender !== undefined && dto.gender !== null) dataToUpdate.gender = dto.gender;
    if (dto.avatarUrl !== undefined && dto.avatarUrl !== null) dataToUpdate.avatarUrl = dto.avatarUrl;
    if (dto.niches !== undefined && dto.niches !== null) dataToUpdate.niches = dto.niches;
    if (dto.contentLanguages !== undefined && dto.contentLanguages !== null) dataToUpdate.contentLanguages = dto.contentLanguages;
    if (dto.availableForBarter !== undefined && dto.availableForBarter !== null) dataToUpdate.availableForBarter = dto.availableForBarter;
    if (dto.availableForRelocation !== undefined && dto.availableForRelocation !== null) dataToUpdate.availableForRelocation = dto.availableForRelocation;
    if (dto.collaborationTypes !== undefined && dto.collaborationTypes !== null) dataToUpdate.collaborationTypes = dto.collaborationTypes;
    if (dto.minPricePerReel !== undefined && dto.minPricePerReel !== null) dataToUpdate.minPricePerReel = Number(dto.minPricePerReel);
    if (dto.currency !== undefined && dto.currency !== null) dataToUpdate.currency = dto.currency;
    if (dto.responseTime !== undefined && dto.responseTime !== null) dataToUpdate.responseTime = dto.responseTime;
    if (dto.portfolioLinks !== undefined && dto.portfolioLinks !== null) dataToUpdate.portfolioLinks = dto.portfolioLinks;

    if (dto.dob) {
      const parsedDate = new Date(dto.dob);
      if (!isNaN(parsedDate.getTime())) {
        dataToUpdate.dob = parsedDate;
      }
    }

    // 3. Upsert InfluencerProfile record
    return this.prisma.influencerProfile.upsert({
      where: { userId },
      update: dataToUpdate,
      create: {
        userId,
        handle: dto.handle || '@creator',
        ...dataToUpdate,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        connectedAccounts: true,
        pastDeliverables: true,
        paymentDetails: true,
      },
    });
  }
}
