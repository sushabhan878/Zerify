import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class BrandRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.brandProfile.findUnique({
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
        products: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async upsertProfile(userId: string, data: any) {
    return this.prisma.brandProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: {
        ...data,
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
        products: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async addProduct(brandProfileId: string, productData: any) {
    return this.prisma.brandProduct.create({
      data: {
        brandProfileId,
        ...productData,
      },
    });
  }

  async updateUserName(userId: string, name: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { name },
    });
  }

  async deleteProduct(productId: string, brandProfileId: string) {
    return this.prisma.brandProduct.deleteMany({
      where: {
        id: productId,
        brandProfileId,
      },
    });
  }

  async findAllForDiscovery() {
    return this.prisma.brandProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        products: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async toggleSavedCreator(brandUserId: string, influencerId: string) {
    const brand = await this.findByUserId(brandUserId);
    if (!brand) return { isSaved: false };

    const existing = await (this.prisma as any).savedCreator.findUnique({
      where: {
        brandProfileId_influencerId: {
          brandProfileId: brand.id,
          influencerId,
        },
      },
    });

    if (existing) {
      await (this.prisma as any).savedCreator.delete({
        where: { id: existing.id },
      });
      return { isSaved: false, influencerId };
    } else {
      await (this.prisma as any).savedCreator.create({
        data: {
          brandProfileId: brand.id,
          influencerId,
        },
      });
      return { isSaved: true, influencerId };
    }
  }

  async getSavedCreatorIds(brandUserId: string) {
    const brand = await this.findByUserId(brandUserId);
    if (!brand) return [];

    const saved = await (this.prisma as any).savedCreator.findMany({
      where: { brandProfileId: brand.id },
      select: { influencerId: true },
    });

    return saved.map((s: any) => s.influencerId);
  }

  async getSavedCreatorsDetailed(brandUserId: string) {
    const brand = await this.findByUserId(brandUserId);
    if (!brand) return [];

    const saved = await (this.prisma as any).savedCreator.findMany({
      where: { brandProfileId: brand.id },
      include: {
        influencer: {
          include: {
            user: {
              include: {
                socialAccounts: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return saved.map((s: any) => s.influencer).filter(Boolean);
  }
}
