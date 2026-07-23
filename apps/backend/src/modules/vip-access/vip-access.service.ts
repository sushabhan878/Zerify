import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { VipType } from '@prisma/client';

@Injectable()
export class VipAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async create(email: string, type: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    // Standardize email
    const cleanEmail = email.trim().toLowerCase();

    // Map input type to VipType enum
    let vipType: VipType;
    const cleanType = type?.trim().toUpperCase();
    
    if (cleanType === 'BRAND' || cleanType === 'BUSINESS') {
      vipType = VipType.BRAND;
    } else if (cleanType === 'INFLUENCER' || cleanType === 'CREATOR') {
      vipType = VipType.INFLUENCER;
    } else {
      throw new BadRequestException('Invalid type. Must be BRAND or INFLUENCER');
    }

    try {
      // Check if already registered
      const existing = await this.prisma.vipAccess.findUnique({
        where: { email: cleanEmail },
      });

      if (existing) {
        return {
          success: true,
          message: 'You are already registered on the VIP waitlist!',
          data: existing,
        };
      }

      const vipAccess = await this.prisma.vipAccess.create({
        data: {
          email: cleanEmail,
          type: vipType,
        },
      });

      return {
        success: true,
        message: 'Successfully joined the VIP waitlist!',
        data: vipAccess,
      };
    } catch (error) {
      // Catch duplicate constraint just in case of race condition
      if (error.code === 'P2002') {
        return {
          success: true,
          message: 'You are already registered on the VIP waitlist!',
        };
      }
      throw error;
    }
  }
}
