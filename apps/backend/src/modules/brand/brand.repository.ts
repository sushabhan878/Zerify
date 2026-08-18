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
}
