import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '@prisma/client';
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
    const { email, name, companyName, website } = dto;

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
      openToAffiliate,
      openToUgc,
      contactInfo,
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

      await tx.influencerProfile.create({
        data: {
          userId: user.id,
          handle: handle || `@${(name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
          platform: platform || 'Instagram',
          avatarUrl: avatarUrl || null,
          bio: bio || null,
          gender: gender || null,
          category: category || null,
          openToAffiliate: Boolean(openToAffiliate),
          openToUgc: Boolean(openToUgc),
          contactInfo: contactInfo || null,
          pricingRange: pricingRange || null,
        } as any,
      });

      return tx.user.findUnique({
        where: { id: user.id },
        include: { brandProfile: true, influencer: true },
      });
    });
  }
}
