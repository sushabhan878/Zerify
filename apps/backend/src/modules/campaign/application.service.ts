import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CampaignRepository, INBOUND_APPLICATIONS_WHERE } from './campaign.repository';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationStatus, CampaignStatus, ParticipantStatus, OfferStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { OutboxService } from '../messaging/outbox.service';
import {
  ApplicationEventPayload,
  OUTBOX_EVENTS,
} from '../messaging/events/messaging-events';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly repository: CampaignRepository,
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) { }

  /**
   * Collects the brand/creator identities a system message needs.
   * Returns null when the application cannot be resolved — messaging must never
   * be the reason a status change fails.
   */
  private async buildApplicationEventPayload(
    applicationId: string,
    actor: 'BRAND' | 'INFLUENCER',
  ): Promise<ApplicationEventPayload | null> {
    const application = await this.prisma.campaignApplication.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        campaign: {
          select: {
            id: true,
            title: true,
            brandProfile: { select: { userId: true, companyName: true } },
          },
        },
        influencerProfile: {
          select: { handle: true, user: { select: { id: true, name: true } } },
        },
      },
    });

    const brandUserId = application?.campaign?.brandProfile?.userId;
    const influencerUserId = application?.influencerProfile?.user?.id;
    if (!application || !brandUserId || !influencerUserId) {
      return null;
    }

    return {
      applicationId: application.id,
      campaignId: application.campaign.id,
      campaignTitle: application.campaign.title,
      brandUserId,
      brandName: application.campaign.brandProfile?.companyName ?? null,
      influencerUserId,
      influencerName:
        application.influencerProfile?.user?.name ??
        application.influencerProfile?.handle ??
        null,
      actor,
    };
  }

  /**
   * Applies a status change and enqueues its system message in one transaction,
   * so the two can never diverge (PRD §38).
   */
  private async updateStatusWithEvent(
    applicationId: string,
    status: ApplicationStatus,
    extra: Prisma.CampaignApplicationUpdateInput,
    eventType: string,
    actor: 'BRAND' | 'INFLUENCER',
  ) {
    const payload = await this.buildApplicationEventPayload(applicationId, actor);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.campaignApplication.update({
        where: { id: applicationId },
        data: { status, ...extra },
        include: { campaign: true, influencerProfile: true, offers: true },
      });

      if (payload) {
        await this.outbox.enqueue(tx, eventType, applicationId, payload);
      }

      return updated;
    });
  }

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

    // Verify or resolve social account for this user
    let socialAccount = await this.prisma.socialAccount.findFirst({
      where: {
        id: dto.socialAccountId,
        userId,
      },
      include: {
        metadata: true,
      },
    });

    if (!socialAccount) {
      const userAccounts = await this.prisma.socialAccount.findMany({
        where: { userId },
        include: { metadata: true },
      });

      if (!userAccounts || userAccounts.length === 0) {
        throw new BadRequestException(
          'You do not have any connected social accounts. Please connect a social media account (Instagram, YouTube, etc.) in Settings before applying to campaigns.',
        );
      }

      // Match target campaign platform if possible
      const campaignPlatforms = (campaign.platforms || []).map((p: string) => p.toUpperCase());
      const platformMatch = userAccounts.find((acc) =>
        campaignPlatforms.includes(acc.platform.toUpperCase()),
      );

      socialAccount = platformMatch || userAccounts[0];
    }

    // Check duplicate
    const existing = await this.repository.findApplicationByCampaignAndAccount(
      campaignId,
      socialAccount.id,
    );

    if (existing && existing.status !== ApplicationStatus.WITHDRAWN) {
      throw new ConflictException('You have already applied to this campaign with this social account');
    }

    // Capture profile snapshot
    const profileSnapshot = {
      displayName: influencerProfile.user?.name || influencerProfile.handle,
      username: socialAccount.username || socialAccount.handle,
      platform: socialAccount.platform,
      avatarUrl: influencerProfile.avatarUrl || socialAccount.avatar,
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

    const brandUserId = (campaign as any).brandProfile?.userId;

    // Create the application and enqueue its system message atomically with generous timeout for Neon.
    return this.prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM campaigns WHERE id = ${campaignId} FOR UPDATE`;
        const currentCampaign = await tx.campaign.findUniqueOrThrow({ where: { id: campaignId } });
        if (!['OPEN', 'FILLING'].includes(currentCampaign.status) || currentCampaign.applicationsClosedAt) {
          throw new BadRequestException('Campaign is no longer open for applications');
        }
        const application = await tx.campaignApplication.create({
          data: {
            campaign: { connect: { id: campaignId } },
            influencerProfile: { connect: { id: influencerProfile.id } },
            socialAccount: { connect: { id: socialAccount.id } },
            status: ApplicationStatus.APPLIED,
            applicationMessage: dto.applicationMessage,
            proposedAmount: dto.proposedAmount,
            proposedCurrency: dto.proposedCurrency || 'USD',
            contentIdea: dto.contentIdea,
            portfolioUrls: dto.portfolioUrls || [],
            matchSnapshot: matchData as any,
            profileSnapshot: profileSnapshot as any,
            submittedAt: new Date(),
          },
          include: {
            campaign: { include: { brandProfile: true } },
            influencerProfile: true,
            socialAccount: true,
          },
        });

        if (brandUserId) {
          try {
            await this.outbox.enqueue(
              tx,
              OUTBOX_EVENTS.COLLABORATION_REQUEST_CREATED,
              application.id,
              {
                applicationId: application.id,
                campaignId,
                campaignTitle: campaign.title,
                brandUserId,
                brandName: (campaign as any).brandProfile?.companyName ?? null,
                influencerUserId: userId,
                influencerName: influencerProfile.user?.name ?? influencerProfile.handle ?? null,
                actor: 'INFLUENCER',
              },
            );
          } catch (outboxErr) {
            console.warn('Could not enqueue outbox event:', outboxErr);
          }
        }

        return application;
      },
      { maxWait: 15000, timeout: 30000 },
    );
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
    const applications = await this.repository.listApplicationsForCampaign(campaignId, status);
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { brandProfile: { select: { userId: true } } },
    });
    if (!campaign?.brandProfile?.userId) return applications;
    return this.annotatePastCollaboration(campaign.brandProfile.userId, applications);
  }

  /**
   * Flags applications whose creator already has a relationship with this
   * brand: a confirmed participant record, or any accepted offer/deal.
   */
  private async annotatePastCollaboration<
    T extends { influencerProfileId: string; status: ApplicationStatus; offers?: { status: OfferStatus }[] },
  >(brandProfileUserId: string, applications: T[]): Promise<(T & { hasWorkedWithBrand: boolean })[]> {
    const [confirmedParticipants, acceptedOffers] = await Promise.all([
      this.prisma.campaignParticipant.findMany({
        where: {
          campaign: {
            brandProfile: {
              userId: brandProfileUserId,
            },
          },
          status: {
            in: [
              ParticipantStatus.CONFIRMED,
              ParticipantStatus.PARTICIPANT_ACTIVE,
              ParticipantStatus.PARTICIPANT_COMPLETED,
            ],
          },
        },
        select: {
          influencerProfileId: true,
        },
      }),
      this.prisma.campaignOffer.findMany({
        where: {
          application: {
            campaign: {
              brandProfile: {
                userId: brandProfileUserId,
              },
            },
          },
          status: OfferStatus.ACCEPTED,
        },
        select: {
          influencerProfileId: true,
        },
      }),
    ]);

    const pastCollaboratorIds = new Set<string>([
      ...confirmedParticipants.map((p) => p.influencerProfileId),
      ...acceptedOffers.map((o) => o.influencerProfileId),
    ]);

    return applications.map((app) => ({
      ...app,
      hasWorkedWithBrand:
        pastCollaboratorIds.has(app.influencerProfileId) ||
        app.status === ApplicationStatus.OFFER_ACCEPTED ||
        app.offers?.some((o) => o.status === OfferStatus.ACCEPTED) === true,
    }));
  }

  async listBrandApplications(userId: string, status?: ApplicationStatus) {
    const applications = await this.prisma.campaignApplication.findMany({
      where: {
        campaign: {
          brandProfile: {
            userId,
          },
        },
        ...(status ? { status } : {}),
        ...INBOUND_APPLICATIONS_WHERE,
      },
      include: {
        campaign: {
          include: {
            brandProfile: true,
            deliverables: true,
          },
        },
        influencerProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                socialAccounts: {
                  include: {
                    metadata: true,
                    audienceGenders: true,
                    audienceAgeGroups: true,
                    audienceCountries: true,
                    audienceCities: true,
                    audienceLocales: true,
                    performance: true,
                  },
                },
              },
            },
          },
        },
        socialAccount: {
          include: {
            metadata: true,
            audienceGenders: true,
            audienceAgeGroups: true,
            audienceCountries: true,
            audienceCities: true,
            audienceLocales: true,
            performance: true,
          },
        },
        offers: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Check which influencers have worked previously with this brand
    // (either as a confirmed CampaignParticipant, or having an accepted offer/deal with this brand)
    return this.annotatePastCollaboration(userId, applications);
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

    return this.updateStatusWithEvent(
      applicationId,
      ApplicationStatus.WITHDRAWN,
      { withdrawnAt: new Date() },
      OUTBOX_EVENTS.COLLABORATION_REQUEST_WITHDRAWN,
      'INFLUENCER',
    );
  }

  async reviewApplication(applicationId: string, reviewedBy: string, notes?: string) {
    return this.updateStatusWithEvent(
      applicationId,
      ApplicationStatus.UNDER_REVIEW,
      { reviewedBy, reviewedAt: new Date(), reviewNotes: notes },
      OUTBOX_EVENTS.COLLABORATION_REQUEST_UNDER_REVIEW,
      'BRAND',
    );
  }

  async shortlistApplication(applicationId: string) {
    return this.updateStatusWithEvent(
      applicationId,
      ApplicationStatus.SHORTLISTED,
      {},
      OUTBOX_EVENTS.COLLABORATION_REQUEST_SHORTLISTED,
      'BRAND',
    );
  }

  async rejectApplication(applicationId: string, reviewNotes?: string) {
    return this.updateStatusWithEvent(
      applicationId,
      ApplicationStatus.REJECTED,
      { rejectedAt: new Date(), reviewNotes },
      OUTBOX_EVENTS.COLLABORATION_REQUEST_REJECTED,
      'BRAND',
    );
  }
}
