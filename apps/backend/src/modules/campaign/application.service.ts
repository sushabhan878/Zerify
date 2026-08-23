import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CampaignRepository } from './campaign.repository';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationStatus, CampaignStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly repository: CampaignRepository,
    private readonly prisma: PrismaService,
  ) {}

  async applyToCampaign(userId: string, campaignId: string, dto: CreateApplicationDto) {
    const influencerProfile = await this.prisma.influencerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!influencerProfile) {
      throw new ForbiddenException('You must have an influencer profile to apply');
    }

    const campaign = await this.repository.findCampaignById(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (![CampaignStatus.OPEN, CampaignStatus.FILLING].includes(campaign.status as any)) {
      throw new BadRequestException('Campaign is not open for applications');
    }


    if (campaign.applicationDeadline && new Date() > new Date(campaign.applicationDeadline)) {
      throw new BadRequestException('Application deadline for this campaign has passed');
    }

    if (campaign.applicationsClosedAt) {
      throw new BadRequestException('Applications for this campaign have been closed');
    }

    // Verify social account belongs to this user
    const socialAccount = await this.prisma.socialAccount.findFirst({
      where: {
        id: dto.socialAccountId,
        userId,
      },
      include: {
        metadata: true,
      },
    });

    if (!socialAccount) {
      throw new ForbiddenException('Invalid social account or account does not belong to you');
    }

    // Check duplicate
    const existing = await this.repository.findApplicationByCampaignAndAccount(
      campaignId,
      dto.socialAccountId,
    );

    if (existing && existing.status !== ApplicationStatus.WITHDRAWN) {
      throw new ConflictException('You have already applied to this campaign with this social account');
    }

    // Capture profile snapshot
    const profileSnapshot = {
      displayName: influencerProfile.user?.name || influencerProfile.handle,
      username: socialAccount.username || socialAccount.handle,
      platform: socialAccount.platform,
      followersCount: socialAccount.followerCount || 0,
      engagementRate: socialAccount.engagementRate || 0,
      categories: influencerProfile.niches || [],
      location: {
        location: influencerProfile.location,
      },
    };

    // Calculate match score & reasons
    const matchData = this.calculateMatch(campaign, influencerProfile, socialAccount);

    // If strict eligibility is required and influencer is NOT eligible
    const requirements = (campaign as any).requirement || (campaign as any).requirements || {};
    if (requirements?.strictEligibility && matchData.eligibility === 'NOT_ELIGIBLE') {
      throw new BadRequestException(
        `You do not satisfy the strict eligibility requirements: ${matchData.reasons.find((r) => r.result === 'NOT_MATCHED')?.details || 'Criteria not met'}`,
      );
    }

    return this.repository.createApplication({
      campaign: { connect: { id: campaignId } },
      influencerProfile: { connect: { id: influencerProfile.id } },
      socialAccount: { connect: { id: dto.socialAccountId } },
      status: ApplicationStatus.APPLIED,
      applicationMessage: dto.applicationMessage,
      proposedAmount: dto.proposedAmount,
      proposedCurrency: dto.proposedCurrency || 'USD',
      contentIdea: dto.contentIdea,
      portfolioUrls: dto.portfolioUrls || [],
      matchSnapshot: matchData as any,
      profileSnapshot: profileSnapshot as any,
      submittedAt: new Date(),
    });
  }

  private calculateMatch(campaign: any, influencer: any, socialAccount: any) {
    const req = campaign.requirement || campaign.requirements || {};
    const minFollowers = req.minFollowers || req.social?.minFollowers;
    const targetCountries = req.targetCountries || req.influencer?.countries || [];
    const reasons: any[] = [];
    let matchedCount = 0;
    let totalCriteria = 0;

    // 1. Follower count check
    if (minFollowers) {
      totalCriteria++;
      const followers = socialAccount.followerCount || 0;
      if (followers >= minFollowers) {
        matchedCount++;
        reasons.push({
          criterion: 'Minimum Followers',
          result: 'MATCHED',
          weight: 25,
          details: `Has ${followers.toLocaleString()} followers (minimum: ${minFollowers.toLocaleString()})`,
        });
      } else {
        reasons.push({
          criterion: 'Minimum Followers',
          result: 'NOT_MATCHED',
          weight: 25,
          details: `Has ${followers.toLocaleString()} followers, which is below the requirement of ${minFollowers.toLocaleString()}`,
        });
      }
    }

    // 2. Platform check
    if (campaign.platforms && campaign.platforms.length > 0) {
      totalCriteria++;
      const platformMatch = campaign.platforms.includes(socialAccount.platform);
      if (platformMatch) {
        matchedCount++;
        reasons.push({
          criterion: 'Platform Support',
          result: 'MATCHED',
          weight: 25,
          details: `Connected ${socialAccount.platform} account matches campaign requirements`,
        });
      } else {
        reasons.push({
          criterion: 'Platform Support',
          result: 'NOT_MATCHED',
          weight: 25,
          details: `Platform ${socialAccount.platform} not among required: ${campaign.platforms.join(', ')}`,
        });
      }
    }

    // 3. Category / Objective overlap
    const campaignObjectives = campaign.objective || campaign.categories || [];
    if (Array.isArray(campaignObjectives) && campaignObjectives.length > 0) {
      totalCriteria++;
      const influencerNiches = influencer.niches || [];
      const hasOverlap = campaignObjectives.some((cat: string) =>
        influencerNiches.some((n: string) => n.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(n.toLowerCase())),
      );
      if (hasOverlap) {
        matchedCount++;
        reasons.push({
          criterion: 'Content Category / Objective',
          result: 'MATCHED',
          weight: 25,
          details: `Matches category/objective focus`,
        });
      } else {
        reasons.push({
          criterion: 'Content Category / Objective',
          result: 'PARTIAL',
          weight: 25,
          details: `No direct niche overlap found, but open to application`,
        });
      }
    }

    // 4. Location check
    if (Array.isArray(targetCountries) && targetCountries.length > 0) {
      totalCriteria++;
      const loc = influencer.location || '';
      const countryMatch = targetCountries.some((c: string) => loc.toLowerCase().includes(c.toLowerCase()));
      if (countryMatch) {
        matchedCount++;
        reasons.push({
          criterion: 'Creator Location',
          result: 'MATCHED',
          weight: 25,
          details: `Location matches campaign preference`,
        });
      } else {
        reasons.push({
          criterion: 'Creator Location',
          result: 'PARTIAL',
          weight: 25,
          details: `Location does not directly match targeted countries`,
        });
      }
    }

    const score = totalCriteria > 0 ? Math.round((matchedCount / totalCriteria) * 100) : 85;
    let eligibility = 'ELIGIBLE';
    if (score < 40) eligibility = 'NOT_ELIGIBLE';
    else if (score < 75) eligibility = 'PARTIALLY_ELIGIBLE';

    return {
      score,
      eligibility,
      reasons,
      calculatedAt: new Date(),
      algorithmVersion: '1.0.0',
    };
  }

  async listApplicationsForCampaign(campaignId: string, status?: ApplicationStatus) {
    return this.repository.listApplicationsForCampaign(campaignId, status);
  }

  async listApplicationsForInfluencer(userId: string) {
    const influencerProfile = await this.prisma.influencerProfile.findUnique({
      where: { userId },
    });
    if (!influencerProfile) {
      throw new ForbiddenException('Influencer profile not found');
    }
    return this.repository.listApplicationsForInfluencer(influencerProfile.id);
  }

  async getApplicationDetails(applicationId: string) {
    const application = await this.repository.findApplicationById(applicationId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  async withdrawApplication(userId: string, applicationId: string) {
    const application = await this.repository.findApplicationById(applicationId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.influencerProfile.userId !== userId) {
      throw new ForbiddenException('You can only withdraw your own applications');
    }

    if (application.status === ApplicationStatus.OFFER_ACCEPTED) {
      throw new BadRequestException('Cannot withdraw an application after accepting an offer');
    }

    return this.repository.updateApplicationStatus(applicationId, ApplicationStatus.WITHDRAWN, {
      withdrawnAt: new Date(),
    });
  }

  async reviewApplication(applicationId: string, reviewedBy: string, notes?: string) {
    return this.repository.updateApplicationStatus(applicationId, ApplicationStatus.UNDER_REVIEW, {
      reviewedBy,
      reviewedAt: new Date(),
      reviewNotes: notes,
    });
  }

  async shortlistApplication(applicationId: string) {
    return this.repository.updateApplicationStatus(applicationId, ApplicationStatus.SHORTLISTED);
  }

  async rejectApplication(applicationId: string, reviewNotes?: string) {
    return this.repository.updateApplicationStatus(applicationId, ApplicationStatus.REJECTED, {
      rejectedAt: new Date(),
      reviewNotes,
    });
  }
}
