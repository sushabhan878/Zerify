import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';

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
   * Atomically creates a User record and the corresponding role profile
   * (BrandProfile or InfluencerProfile) in Neon PostgreSQL database.
   */
  async createUserWithRoleProfile(registerDto: RegisterDto, hashedPassword: string) {
    const { email, name, role, companyName, website, handle, platform, bio } = registerDto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Store core User record
      const user = await tx.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password: hashedPassword,
          role,
        },
      });

      // 2. Based on selected role, populate BrandProfile or InfluencerProfile
      if (role === UserRole.BRAND) {
        await tx.brandProfile.create({
          data: {
            userId: user.id,
            companyName: companyName || name || 'My Brand',
            website: website || null,
          },
        });
      } else if (role === UserRole.INFLUENCER) {
        await tx.influencerProfile.create({
          data: {
            userId: user.id,
            handle: handle || `@${(name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
            platform: platform || 'Instagram',
            bio: bio || null,
          },
        });
      }

      // 3. Return user record including attached role profile
      return tx.user.findUnique({
        where: { id: user.id },
        include: {
          brandProfile: true,
          influencer: true,
        },
      });
    });
  }
}
