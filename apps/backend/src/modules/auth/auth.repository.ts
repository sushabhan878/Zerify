import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserRole, SocialPlatform, SocialAccountStatus } from '@prisma/client';
import { RegisterBrandDto } from './dto/register-brand.dto';
import { RegisterInfluencerDto } from './dto/register-influencer.dto';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        brandProfile: true,
        influencer: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        brandProfile: true,
        influencer: true,
      },
    });
  }

  /**
   * Atomically creates a User record with BRAND role and populates BrandProfile
   */
  async createBrandUser(dto: RegisterBrandDto, hashedPassword: string) {
    const { email, name, companyName, website, currency, budget } = dto;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password: hashedPassword,
          role: UserRole.BRAND,
        },
      });

      await tx.brandProfile.create({
        data: {
          userId: user.id,
          companyName: companyName || name || 'My Brand',
          website: website || null,
          currency: currency || 'INR',
          campaignBudget: budget !== undefined && budget !== null ? String(budget) : null,
        },
      });

      return tx.user.findUnique({
        where: { id: user.id },
        include: { brandProfile: true, influencer: true },
      });
    });
  }

  /**
   * Atomically creates a User record with INFLUENCER role and populates InfluencerProfile
   */
  async createInfluencerUser(dto: RegisterInfluencerDto, hashedPassword: string) {
    const {
      email,
      name,
      handle,
      platform,
      avatarUrl,
      bio,
      gender,
      category,
      pricingRange,
    } = dto;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password: hashedPassword,
          role: UserRole.INFLUENCER,
        },
      });

      const profile = await tx.influencerProfile.create({
        data: {
          userId: user.id,
          handle: handle || `@${(name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
          avatarUrl: avatarUrl || null,
          bio: bio || null,
          gender: gender || null,
          niches: dto.niches || (category ? [category] : []),
          location: dto.location || null,
          phoneCode: dto.phoneCode || '+1',
          phoneNumber: dto.phoneNumber || null,
          dob: dto.dob ? new Date(dto.dob) : null,
          contentLanguages: dto.contentLanguages || [],
          availableForBarter: Boolean(dto.availableForBarter),
          availableForRelocation: Boolean(dto.availableForRelocation),
          collaborationTypes: dto.collaborationTypes || [],
          minPricePerReel: dto.minPricePerReel ? Number(dto.minPricePerReel) : null,
          currency: dto.currency || 'INR',
          responseTime: dto.responseTime || 'Within 24 hours',
          pricingRange: pricingRange || null,
        },
      });

      if (platform) {
        const platformUpper = (platform || 'INSTAGRAM').toUpperCase();
        let socialPlatform: SocialPlatform = SocialPlatform.INSTAGRAM;
        if (Object.values(SocialPlatform).includes(platformUpper as SocialPlatform)) {
          socialPlatform = platformUpper as SocialPlatform;
        }

        const handleStr = handle || `@${(name || 'creator').toLowerCase().replace(/\s+/g, '')}`;

        await tx.socialAccount.create({
          data: {
            userId: user.id,
            platform: socialPlatform,
            platformUserId: `user_${user.id.slice(0, 8)}`,
            username: handleStr.replace(/^@/, ''),
            handle: handleStr,
            isVerified: true,
            accessToken: 'initial_registration_token',
            status: SocialAccountStatus.CONNECTED,
          },
        });
      }

      return tx.user.findUnique({
        where: { id: user.id },
        include: { brandProfile: true, influencer: true },
      });
    });
  }
}
