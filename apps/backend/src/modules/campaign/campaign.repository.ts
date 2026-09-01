import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  Campaign,
  CampaignApplication,
  CampaignOffer,
  CampaignParticipant,
  ParticipantDeliverable,
  DeliverableRevision,
  CampaignStatus,
  ApplicationStatus,
  OfferStatus,
  ParticipantStatus,
  DeliverableStatus,
  Prisma,
} from '@prisma/client';

@Injectable()
export class CampaignRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------------------------
  // Campaign CRUD
  // ----------------------------------------------------
  async createCampaign(data: Prisma.CampaignCreateInput): Promise<Campaign> {
    return this.prisma.campaign.create({
      data,
      include: {
        product: true,
        requirement: true,
        deliverables: true,
        brandProfile: true,
      },
    });
  }

  async findCampaignById(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: {
        product: true,
        requirement: true,
        brandProfile: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        deliverables: true,
        applications: {
          include: {
            influencerProfile: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
            socialAccount: true,
            offers: true,
          },
        },
        participants: {
          include: {
            influencerProfile: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
            deliverables: true,
          },
        },
      },
    });
  }

  async findCampaignBySlug(slug: string) {
    return this.prisma.campaign.findUnique({
      where: { slug },
      include: {
        product: true,
        requirement: true,
        brandProfile: true,
        deliverables: true,
      },
    });
  }

  async listCampaignsByBrand(brandProfileId: string) {
    return this.prisma.campaign.findMany({
      where: { brandProfileId },
      include: {
        product: true,
        requirement: true,
        deliverables: true,
        _count: {
          select: {
            applications: true,
            participants: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCampaign(id: string, data: Prisma.CampaignUpdateInput): Promise<Campaign> {
    return this.prisma.campaign.update({
      where: { id },
      data,
      include: {
        product: true,
        requirement: true,
        deliverables: true,
        brandProfile: true,
      },
    });
  }

  async updateCampaignStatus(id: string, status: CampaignStatus, extraData: Prisma.CampaignUpdateInput = {}) {
    return this.prisma.campaign.update({
      where: { id },
      data: {
        status,
        ...extraData,
      },
    });
  }

  async deleteCampaign(id: string) {
    return this.prisma.campaign.delete({
      where: { id },
    });
  }

  // ----------------------------------------------------
  // Campaign Deliverables (Templates)
  // ----------------------------------------------------
  async createDeliverables(campaignId: string, deliverables: Prisma.CampaignDeliverableCreateManyCampaignInput[]) {
    return this.prisma.campaignDeliverable.createMany({
      data: deliverables.map((d) => ({ ...d, campaignId })),
    });
  }

  async replaceDeliverables(campaignId: string, deliverables: Prisma.CampaignDeliverableCreateManyCampaignInput[]) {
    await this.prisma.campaignDeliverable.deleteMany({ where: { campaignId } });
    if (deliverables.length > 0) {
      return this.prisma.campaignDeliverable.createMany({
        data: deliverables.map((d) => ({ ...d, campaignId })),
      });
    }
  }

  // ----------------------------------------------------
  // Discovery & Search
  // ----------------------------------------------------
  async discoverCampaigns(params: {
    where: Prisma.CampaignWhereInput;
    orderBy: Prisma.CampaignOrderByWithRelationInput;
    skip: number;
    take: number;
  }) {
    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where: params.where,
        orderBy: params.orderBy,
        skip: params.skip,
        take: params.take,
        include: {
          brandProfile: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
              industry: true,
              location: true,
              completionPercentage: true,
            },
          },
          product: true,
          requirement: true,
          deliverables: true,
          _count: {
            select: {
              applications: true,
              participants: true,
            },
          },
        },
      }),
      this.prisma.campaign.count({ where: params.where }),
    ]);

    return { campaigns, total };
  }

  // ----------------------------------------------------
  // Applications
  // ----------------------------------------------------
  async createApplication(data: Prisma.CampaignApplicationCreateInput): Promise<CampaignApplication> {
    return this.prisma.campaignApplication.create({
      data,
      include: {
        campaign: {
          include: { brandProfile: true },
        },
        influencerProfile: true,
        socialAccount: true,
      },
    });
  }

  async findApplicationById(id: string) {
    return this.prisma.campaignApplication.findUnique({
      where: { id },
      include: {
        campaign: {
          include: {
            brandProfile: true,
            deliverables: true,
          },
        },
        influencerProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        socialAccount: true,
        offers: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findApplicationByCampaignAndAccount(campaignId: string, socialAccountId: string) {
    return this.prisma.campaignApplication.findUnique({
      where: {
        campaignId_socialAccountId: {
          campaignId,
          socialAccountId,
        },
      },
    });
  }

  async listApplicationsForCampaign(campaignId: string, status?: ApplicationStatus) {
    return this.prisma.campaignApplication.findMany({
      where: {
        campaignId,
        ...(status ? { status } : {}),
      },
      include: {
        influencerProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        socialAccount: true,
        offers: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async listApplicationsForInfluencer(influencerProfileId: string) {
    return this.prisma.campaignApplication.findMany({
      where: { influencerProfileId },
      include: {
        campaign: {
          include: {
            brandProfile: true,
            deliverables: true,
          },
        },
        socialAccount: true,
        offers: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    extra: Prisma.CampaignApplicationUpdateInput = {},
  ) {
    return this.prisma.campaignApplication.update({
      where: { id },
      data: {
        status,
        ...extra,
      },
      include: {
        campaign: true,
        influencerProfile: true,
        offers: true,
      },
    });
  }

  // ----------------------------------------------------
  // Offers
  // ----------------------------------------------------
  async createOffer(data: Prisma.CampaignOfferCreateInput): Promise<CampaignOffer> {
    return this.prisma.campaignOffer.create({
      data,
      include: {
        application: {
          include: {
            campaign: true,
            influencerProfile: true,
          },
        },
      },
    });
  }

  async findOfferById(id: string) {
    return this.prisma.campaignOffer.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            campaign: {
              include: { brandProfile: true, deliverables: true },
            },
            influencerProfile: {
              include: { user: true },
            },
            socialAccount: true,
          },
        },
        participant: true,
      },
    });
  }

  async listOffersForInfluencer(influencerProfileId: string) {
    return this.prisma.campaignOffer.findMany({
      where: { influencerProfileId },
      include: {
        application: {
          include: {
            campaign: {
              include: { brandProfile: true, deliverables: true },
            },
            socialAccount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listOffersForCampaign(campaignId: string) {
    return this.prisma.campaignOffer.findMany({
      where: { campaignId },
      include: {
        application: {
          include: {
            influencerProfile: true,
            socialAccount: true,
          },
        },
        participant: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Transactional Offer Acceptance
  async acceptOfferAndCreateParticipant(params: {
    offerId: string;
    campaignId: string;
    influencerProfileId: string;
    socialAccountId: string;
    applicationId: string;
    agreedAmount: number;
    agreedCurrency: string;
    agreedPaymentModel: any;
    deliverables: {
      platform?: string;
      type: string;
      title?: string;
      description?: string;
      quantity?: number;
      dueDate?: Date;
    }[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Update Offer
      const updatedOffer = await tx.campaignOffer.update({
        where: { id: params.offerId },
        data: {
          status: OfferStatus.ACCEPTED,
          respondedAt: new Date(),
        },
      });

      // 2. Update Application
      await tx.campaignApplication.update({
        where: { id: params.applicationId },
        data: { status: ApplicationStatus.OFFER_ACCEPTED },
      });

      // 3. Create Participant
      const participant = await tx.campaignParticipant.create({
        data: {
          campaign: { connect: { id: params.campaignId } },
          influencerProfile: { connect: { id: params.influencerProfileId } },
          offer: { connect: { id: params.offerId } },
          socialAccountId: params.socialAccountId,
          applicationId: params.applicationId,
          status: ParticipantStatus.CONFIRMED,
          agreedAmount: params.agreedAmount,
          agreedCurrency: params.agreedCurrency,
          agreedPaymentModel: params.agreedPaymentModel,
          allocationStatus: 'PENDING',
        },
      });

      // 4. Instantiate Participant Deliverables from template
      if (params.deliverables && params.deliverables.length > 0) {
        await tx.participantDeliverable.createMany({
          data: params.deliverables.map((d) => ({
            campaignId: params.campaignId,
            participantId: participant.id,
            platform: d.platform,
            type: d.type,
            title: d.title,
            description: d.description,
            quantity: d.quantity || 1,
            dueDate: d.dueDate,
            status: DeliverableStatus.PENDING,
          })),
        });
      }

      // 5. Update Campaign Status if first participant joined
      await tx.campaign.update({
        where: { id: params.campaignId },
        data: {
          status: CampaignStatus.FILLING,
        },
      });

      return { offer: updatedOffer, participant };
    });
  }

  async updateOfferStatus(id: string, status: OfferStatus) {
    return this.prisma.campaignOffer.update({
      where: { id },
      data: {
        status,
        respondedAt: new Date(),
      },
    });
  }

  // ----------------------------------------------------
  // Participants
  // ----------------------------------------------------
  async findParticipantById(id: string) {
    return this.prisma.campaignParticipant.findUnique({
      where: { id },
      include: {
        campaign: {
          include: { brandProfile: true },
        },
        influencerProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        deliverables: {
          include: {
            revisions: { orderBy: { createdAt: 'desc' } },
          },
        },
        payments: true,
      },
    });
  }

  async listParticipantsForCampaign(campaignId: string) {
    return this.prisma.campaignParticipant.findMany({
      where: { campaignId },
      include: {
        influencerProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        deliverables: true,
        payments: true,
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async listParticipantsForInfluencer(influencerProfileId: string) {
    return this.prisma.campaignParticipant.findMany({
      where: { influencerProfileId },
      include: {
        campaign: {
          include: {
            brandProfile: true,
            deliverables: true,
          },
        },
        deliverables: {
          include: {
            revisions: { orderBy: { createdAt: 'desc' } },
          },
        },
        payments: true,
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async updateParticipantStatus(id: string, status: ParticipantStatus) {
    return this.prisma.campaignParticipant.update({
      where: { id },
      data: {
        status,
        ...(status === ParticipantStatus.PARTICIPANT_ACTIVE ? { startedAt: new Date() } : {}),
        ...(status === ParticipantStatus.PARTICIPANT_COMPLETED ? { completedAt: new Date() } : {}),
        ...(status === ParticipantStatus.PARTICIPANT_CANCELLED ? { cancelledAt: new Date() } : {}),
      },
    });
  }

  // ----------------------------------------------------
  // Deliverables
  // ----------------------------------------------------
  async findDeliverableById(id: string) {
    return this.prisma.participantDeliverable.findUnique({
      where: { id },
      include: {
        participant: {
          include: {
            campaign: { include: { brandProfile: true } },
            influencerProfile: true,
          },
        },
        revisions: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async listDeliverablesForParticipant(participantId: string) {
    return this.prisma.participantDeliverable.findMany({
      where: { participantId },
      include: {
        revisions: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async submitDeliverableDraft(
    deliverableId: string,
    contentUrls: string[],
    notes?: string,
    submittedBy?: string,
  ) {
    const current = await this.prisma.participantDeliverable.findUnique({
      where: { id: deliverableId },
      include: { revisions: true },
    });

    const version = (current?.revisions.length || 0) + 1;

    return this.prisma.$transaction(async (tx) => {
      // Create revision entry
      await tx.deliverableRevision.create({
        data: {
          deliverableId,
          version,
          submittedBy,
          files: contentUrls,
          notes,
          status: 'SUBMITTED',
        },
      });

      // Update deliverable
      return tx.participantDeliverable.update({
        where: { id: deliverableId },
        data: {
          status: DeliverableStatus.SUBMITTED,
          contentUrls,
          submissionNotes: notes,
          submittedAt: new Date(),
          reviewStatus: 'PENDING',
        },
      });
    });
  }

  async reviewDeliverable(
    deliverableId: string,
    decision: 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED',
    comments?: string,
    reviewedBy?: string,
  ) {
    const statusMap = {
      APPROVED: DeliverableStatus.APPROVED,
      REVISION_REQUESTED: DeliverableStatus.REVISION_REQUESTED,
      REJECTED: DeliverableStatus.DELIVERABLE_REJECTED,
    };

    return this.prisma.participantDeliverable.update({
      where: { id: deliverableId },
      data: {
        status: statusMap[decision],
        reviewStatus: decision,
        reviewComments: comments,
        reviewedBy,
        reviewedAt: new Date(),
        ...(decision === 'REVISION_REQUESTED' ? { revisionCount: { increment: 1 } } : {}),
      },
    });
  }

  async publishDeliverable(deliverableId: string, publishedUrl: string, proofUrls: string[] = []) {
    return this.prisma.participantDeliverable.update({
      where: { id: deliverableId },
      data: {
        status: DeliverableStatus.PUBLISHED,
        publishedUrl,
        proofUrls,
        publishedAt: new Date(),
      },
    });
  }

  async verifyDeliverable(deliverableId: string, verifiedBy?: string) {
    return this.prisma.participantDeliverable.update({
      where: { id: deliverableId },
      data: {
        status: DeliverableStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy,
      },
    });
  }
}
