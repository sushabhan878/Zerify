import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { INBOUND_APPLICATIONS_WHERE } from '../campaign/campaign.repository';

@Injectable()
export class BrandOverviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCampaigns(userId: string) {
    return this.prisma.campaign.findMany({
      where: { brandProfile: { userId }, status: { not: 'DELETED' } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, status: true, platforms: true, createdAt: true,
        finance: { select: { currency: true, paidOutAmountMinor: true } },
        applications: {
          where: INBOUND_APPLICATIONS_WHERE,
          select: { id: true, status: true, submittedAt: true },
        },
        participants: {
          select: {
            id: true, influencerProfileId: true, status: true, joinedAt: true,
            influencerProfile: {
              select: { user: { select: { name: true } } },
            },
            deliverables: { select: { id: true, status: true } },
          },
        },
      },
    });
  }
}
