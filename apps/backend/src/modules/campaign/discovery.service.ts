import { Injectable, NotFoundException } from '@nestjs/common';
import { CampaignRepository } from './campaign.repository';
import { DiscoverCampaignsQueryDto, CampaignSortOption } from './dto/discover-campaigns-query.dto';
import { CampaignStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly repository: CampaignRepository,
    private readonly prisma: PrismaService,
  ) {}

  async discoverCampaigns(query: DiscoverCampaignsQueryDto, userId?: string) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CampaignWhereInput = {
      status: { in: [CampaignStatus.OPEN, CampaignStatus.FILLING, CampaignStatus.ACTIVE] },
      OR: query.search
        ? [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            { brandProfile: { companyName: { contains: query.search, mode: 'insensitive' } } },
            { industry: { contains: query.search, mode: 'insensitive' } },
            { product: { productName: { contains: query.search, mode: 'insensitive' } } },
          ]
        : undefined,
      ...(query.category && query.category !== 'All'
        ? {
            OR: [
              { objective: { has: query.category } },
              { industry: { contains: query.category, mode: 'insensitive' } },
            ],
          }
        : query.objective
        ? { objective: { has: query.objective } }
        : {}),
      platforms: query.platform && query.platform !== 'All Platforms' ? { has: query.platform } : undefined,
      budgetPaymentModel: query.paymentModel,
      budgetTotalAmount: {
        gte: query.minBudget ? Number(query.minBudget) : undefined,
        lte: query.maxBudget ? Number(query.maxBudget) : undefined,
      },
    };

    // Sort order
    let orderBy: Prisma.CampaignOrderByWithRelationInput = { createdAt: 'desc' };
    switch (query.sort) {
      case CampaignSortOption.HIGHEST_BUDGET:
        orderBy = { budgetTotalAmount: 'desc' };
        break;
      case CampaignSortOption.DEADLINE:
        orderBy = { applicationDeadline: 'asc' };
        break;
      case CampaignSortOption.NEWEST:
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const { campaigns, total } = await this.repository.discoverCampaigns({
      where,
      orderBy,
      skip,
      take: limit,
    });

    // If userId provided, calculate user-specific match info
    let influencerProfile: any = null;
    let socialAccounts: any[] = [];
    if (userId) {
      influencerProfile = await this.prisma.influencerProfile.findUnique({
        where: { userId },
      });
      if (influencerProfile) {
        socialAccounts = await this.prisma.socialAccount.findMany({
          where: { userId },
        });
      }
    }

    const enhancedCampaigns = campaigns.map((campaign) => {
      const match = this.evaluateEligibility(campaign, influencerProfile, socialAccounts);
      return {
        ...campaign,
        eligibility: match.eligibility,
        matchScore: match.score,
        matchReasons: match.reasons,
      };
    });

    return {
      campaigns: enhancedCampaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async checkEligibility(campaignId: string, userId: string) {
    const campaign = await this.repository.findCampaignById(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const influencerProfile = await this.prisma.influencerProfile.findUnique({
      where: { userId },
    });

    const socialAccounts = await this.prisma.socialAccount.findMany({
      where: { userId },
    });

    return this.evaluateEligibility(campaign, influencerProfile, socialAccounts);
  }

  private evaluateEligibility(campaign: any, influencerProfile: any, socialAccounts: any[]) {
    if (!influencerProfile || !socialAccounts || socialAccounts.length === 0) {
      return {
        eligibility: 'ELIGIBLE',
        score: 85,
        reasons: [{ criterion: 'Profile', result: 'MATCHED', details: 'Sign in with connected accounts to check detailed criteria' }],
      };
    }

    const req = (campaign.requirement as any) || (campaign.requirements as any) || {};
    const socialReq = req.social || req;
    const minFollowers = req.minFollowers || socialReq.minFollowers;
    const reasons: any[] = [];
    let matchedCount = 0;
    let totalCriteria = 0;

    // Follower check
    if (minFollowers) {
      totalCriteria++;
      const maxFollowers = Math.max(...socialAccounts.map((a) => a.followerCount || 0), 0);
      if (maxFollowers >= minFollowers) {
        matchedCount++;
        reasons.push({
          criterion: 'Followers',
          result: 'MATCHED',
          details: `Top account has ${maxFollowers.toLocaleString()} followers (min ${minFollowers.toLocaleString()})`,
        });
      } else {
        reasons.push({
          criterion: 'Followers',
          result: 'NOT_MATCHED',
          details: `Top account has ${maxFollowers.toLocaleString()} followers (min required: ${minFollowers.toLocaleString()})`,
        });
      }
    }

    // Platform check
    if (campaign.platforms && campaign.platforms.length > 0) {
      totalCriteria++;
      const userPlatforms = socialAccounts.map((a) => a.platform);
      const hasPlatform = campaign.platforms.some((p: string) => userPlatforms.includes(p as any));
      if (hasPlatform) {
        matchedCount++;
        reasons.push({
          criterion: 'Platforms',
          result: 'MATCHED',
          details: `You have accounts on supported platforms`,
        });
      } else {
        reasons.push({
          criterion: 'Platforms',
          result: 'NOT_MATCHED',
          details: `Required platforms: ${campaign.platforms.join(', ')}`,
        });
      }
    }

    // Niche check
    if (campaign.categories && campaign.categories.length > 0) {
      totalCriteria++;
      const niches = influencerProfile.niches || [];
      const hasOverlap = campaign.categories.some((c: string) =>
        niches.some((n: string) => n.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(n.toLowerCase())),
      );
      if (hasOverlap) {
        matchedCount++;
        reasons.push({
          criterion: 'Category Focus',
          result: 'MATCHED',
          details: `Your content niche matches campaign focus`,
        });
      } else {
        reasons.push({
          criterion: 'Category Focus',
          result: 'PARTIAL',
          details: `Niches differ slightly, but application allowed`,
        });
      }
    }

    const score = totalCriteria > 0 ? Math.round((matchedCount / totalCriteria) * 100) : 90;
    let eligibility = 'ELIGIBLE';
    if (score < 40) eligibility = 'NOT_ELIGIBLE';
    else if (score < 75) eligibility = 'PARTIALLY_ELIGIBLE';

    return {
      eligibility,
      score,
      reasons,
    };
  }
}
