import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { CampaignRepository } from './campaign.repository';
import { CreateOfferDto } from './dto/create-offer.dto';
import { InviteCreatorDto } from './dto/invite-creator.dto';
import { OfferStatus, ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ConversationService } from '../messaging/conversation.service';
import { MessageService } from '../messaging/message.service';

@Injectable()
export class OfferService {
  private readonly logger = new Logger(OfferService.name);

  constructor(
    private readonly repository: CampaignRepository,
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) { }

  async sendOffer(userId: string, applicationId: string, dto: CreateOfferDto) {
    const application = await this.repository.findApplicationById(applicationId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify requesting user owns the campaign
    if (application.campaign.brandProfile.userId !== userId) {
      throw new ForbiddenException('Only the campaign owner can send offers');
    }

    if (
      [
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
        ApplicationStatus.OFFER_ACCEPTED,
      ].includes(application.status as any)
    ) {
      throw new BadRequestException(`Cannot send offer for application with status ${application.status}`);
    }

    // Create terms snapshot
    const termsSnapshot = {
      campaignTitle: application.campaign.title,
      platforms: application.campaign.platforms,
      deliverables: application.campaign.deliverables,
      budgetPaymentModel: dto.compensationPaymentModel || 'FIXED',
      compensationAmount: dto.compensationAmount,
      currency: dto.compensationCurrency || 'USD',
      startDate: dto.startDate,
      endDate: dto.endDate,
      responseDeadline: dto.responseDeadline,
      isCounterOffer: Boolean(dto.isCounterOffer),
      originalProposedAmount: application.proposedAmount,
    };

    const offer = await this.repository.createOffer({
      campaignId: application.campaignId,
      application: { connect: { id: applicationId } },
      influencerProfileId: application.influencerProfileId,
      compensationAmount: dto.compensationAmount,
      compensationCurrency: dto.compensationCurrency || 'USD',
      compensationPaymentModel: dto.compensationPaymentModel,

      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      responseDeadline: dto.responseDeadline ? new Date(dto.responseDeadline) : undefined,
      termsSnapshot: termsSnapshot as any,
      customNotes: dto.customNotes,
      sentBy: userId,
      status: OfferStatus.PENDING,
    });

    // Update application status to OFFER_SENT
    await this.repository.updateApplicationStatus(applicationId, ApplicationStatus.OFFER_SENT);

    return offer;
  }

  async acceptOffer(userId: string, offerId: string) {
    const offer = await this.repository.findOfferById(offerId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Verify recipient influencer
    if (offer.application.influencerProfile.userId !== userId) {
      throw new ForbiddenException('You can only accept offers sent to you');
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException(`Offer is already in ${offer.status} status`);
    }

    if (offer.responseDeadline && new Date() > new Date(offer.responseDeadline)) {
      await this.repository.updateOfferStatus(offerId, OfferStatus.OFFER_EXPIRED);
      throw new BadRequestException('This offer has expired');
    }

    // Convert template deliverables to participant deliverables
    const templateDeliverables = (offer.application.campaign.deliverables || []).map((d) => ({
      platform: d.platform || undefined,
      type: d.type,
      title: d.title || undefined,
      description: d.description || undefined,
      quantity: d.quantity,
      dueDate: d.dueDate || offer.endDate || offer.application.campaign.endDate || undefined,
      requirements: {
        requiresPreApproval: d.requiresPreApproval,
        requiresPublication: d.requiresPublication,
        allowLateSubmission: d.allowLateSubmission,
        publicationDeadline: d.publicationDeadline?.toISOString(),
        maxFileSizeMb: d.maxFileSizeMb,
        allowedMimeTypes: d.allowedMimeTypes,
        mandatoryHashtags: d.mandatoryHashtags,
        mandatoryMentions: d.mandatoryMentions,
        requiredCta: d.requiredCta,
        instructions: d.instructions,
      },
    }));

    const participant = await this.repository.acceptOfferAndCreateParticipant({
      offerId,
      campaignId: offer.campaignId,
      influencerProfileId: offer.influencerProfileId,
      socialAccountId: offer.application.socialAccountId,
      applicationId: offer.applicationId,
      agreedAmount: offer.compensationAmount,
      agreedCurrency: offer.compensationCurrency,
      agreedPaymentModel: offer.compensationPaymentModel,
      deliverables: templateDeliverables,
    });

    let conversationId: string | undefined;
    try {
      const brandUserId = offer.application.campaign.brandProfile?.userId;
      const influencerUserId = offer.application.influencerProfile?.userId;

      if (brandUserId && influencerUserId) {
        const conversation = await this.conversationService.resolveCollaborationConversation({
          applicationId: offer.applicationId,
          campaignId: offer.campaignId,
          brandUserId,
          influencerUserId,
        });

        conversationId = conversation.id;

        const influencerName =
          offer.application.influencerProfile?.user?.name ||
          offer.application.influencerProfile?.handle ||
          'The creator';
        const campaignTitle = offer.application.campaign?.title || 'the campaign';

        await this.messageService.createSystemMessage({
          conversationId: conversation.id,
          text: `🎉 ${influencerName} accepted the offer for "${campaignTitle}" and started the project! The collaboration is now active.`,
          systemEvent: 'COLLABORATION_OFFER_ACCEPTED',
          metadata: {
            offerId: offer.id,
            campaignId: offer.campaignId,
            applicationId: offer.applicationId,
            systemEvent: 'COLLABORATION_OFFER_ACCEPTED',
          },
          clientMessageId: `offer_accepted:${offer.id}`,
        });

        this.logger.log(
          `Created collaboration conversation ${conversationId} for offer ${offerId} between brand ${brandUserId} and influencer ${influencerUserId}`,
        );
      }
    } catch (msgErr: any) {
      this.logger.error('Failed to initialize conversation on offer accept:', msgErr?.stack || msgErr);
    }

    return {
      ...participant,
      conversationId,
    };
  }

  async declineOffer(userId: string, offerId: string) {
    const offer = await this.repository.findOfferById(offerId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.application.influencerProfile.userId !== userId) {
      throw new ForbiddenException('You can only decline offers sent to you');
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException(`Offer is already in ${offer.status} status`);
    }

    await this.repository.updateOfferStatus(offerId, OfferStatus.DECLINED);
    await this.repository.updateApplicationStatus(offer.applicationId, ApplicationStatus.OFFER_DECLINED);

    return { success: true, message: 'Offer declined' };
  }

  async cancelOffer(userId: string, offerId: string) {
    const offer = await this.repository.findOfferById(offerId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.application.campaign.brandProfile.userId !== userId) {
      throw new ForbiddenException('Only the campaign owner can cancel sent offers');
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException(`Cannot cancel offer in ${offer.status} status`);
    }

    await this.repository.updateOfferStatus(offerId, OfferStatus.CANCELLED);
    return { success: true, message: 'Offer cancelled' };
  }

  async getOfferDetails(offerId: string) {
    const offer = await this.repository.findOfferById(offerId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  async listOffersForInfluencer(userId: string) {
    const influencerProfile = await this.prisma.influencerProfile.findUnique({
      where: { userId },
    });
    if (!influencerProfile) {
      throw new ForbiddenException('Influencer profile not found');
    }
    return this.repository.listOffersForInfluencer(influencerProfile.id);
  }

  async listOffersForCampaign(campaignId: string) {
    return this.repository.listOffersForCampaign(campaignId);
  }

  async inviteCreator(userId: string, campaignId: string, dto: InviteCreatorDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { brandProfile: true, deliverables: true },
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    if (campaign.brandProfile.userId !== userId) {
      throw new ForbiddenException('Only the campaign owner can send invitations');
    }

    // Resolve influencer profile by id or userId
    let influencer = await this.prisma.influencerProfile.findUnique({
      where: { id: dto.influencerProfileId },
      include: {
        user: {
          include: { socialAccounts: true },
        },
      },
    });

    if (!influencer) {
      influencer = await this.prisma.influencerProfile.findUnique({
        where: { userId: dto.influencerProfileId },
        include: {
          user: {
            include: { socialAccounts: true },
          },
        },
      });
    }

    if (!influencer) {
      throw new NotFoundException('Influencer profile not found');
    }

    // Check if already invited (pending or accepted offer)
    const existingOffer = await this.prisma.campaignOffer.findFirst({
      where: {
        campaignId,
        influencerProfileId: influencer.id,
        status: { in: [OfferStatus.PENDING, OfferStatus.ACCEPTED] },
      },
    });

    if (existingOffer) {
      throw new BadRequestException('Already invited for this campaign');
    }

    // Resolve or create social account
    let socialAccount =
      influencer.user?.socialAccounts?.[0] ||
      (await this.prisma.socialAccount.findFirst({
        where: { userId: influencer.userId },
      }));

    if (!socialAccount) {
      socialAccount = await this.prisma.socialAccount.create({
        data: {
          userId: influencer.userId,
          platform: 'INSTAGRAM',
          platformUserId: `user_${influencer.userId}`,
          username: influencer.handle?.replace('@', '') || influencer.user?.name || 'creator',
          handle: influencer.handle || `@${influencer.user?.name || 'creator'}`,
          accessToken: 'placeholder_token',
        },
      });
    }

    // Find or create CampaignApplication
    let application = await this.prisma.campaignApplication.findFirst({
      where: {
        campaignId,
        influencerProfileId: influencer.id,
      },
    });

    if (!application) {
      application = await this.prisma.campaignApplication.create({
        data: {
          campaignId,
          influencerProfileId: influencer.id,
          socialAccountId: socialAccount.id,
          status: ApplicationStatus.OFFER_SENT,
          proposedAmount: dto.compensationAmount,
          proposedCurrency: dto.compensationCurrency || 'USD',
          applicationMessage: dto.customNotes || 'Direct brand invitation',
          reviewNotes: 'DIRECT_INVITE',
          profileSnapshot: {
            displayName: influencer.user?.name || influencer.handle,
            username: socialAccount.username,
            platform: socialAccount.platform,
            avatarUrl: influencer.avatarUrl,
            categories: influencer.niches || [],
            location: { location: influencer.location },
          },
        },
      });
    } else {
      await this.prisma.campaignApplication.update({
        where: { id: application.id },
        data: {
          status: ApplicationStatus.OFFER_SENT,
          proposedAmount: dto.compensationAmount,
          proposedCurrency: dto.compensationCurrency || 'USD',
        },
      });
    }

    // Create terms snapshot
    const termsSnapshot = {
      campaignTitle: campaign.title,
      platforms: campaign.platforms,
      deliverables: campaign.deliverables,
      budgetPaymentModel: dto.compensationPaymentModel || 'FIXED',
      compensationAmount: dto.compensationAmount,
      currency: dto.compensationCurrency || 'USD',
      startDate: dto.startDate,
      endDate: dto.endDate,
      responseDeadline: dto.responseDeadline,
      customNotes: dto.customNotes,
    };

    const offer = await this.prisma.campaignOffer.create({
      data: {
        campaignId,
        applicationId: application.id,
        influencerProfileId: influencer.id,
        compensationAmount: dto.compensationAmount,
        compensationCurrency: dto.compensationCurrency || 'USD',
        compensationPaymentModel: (dto.compensationPaymentModel as any) || 'FIXED',
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        responseDeadline: dto.responseDeadline ? new Date(dto.responseDeadline) : undefined,
        termsSnapshot: termsSnapshot as any,
        customNotes: dto.customNotes,
        sentBy: userId,
        status: OfferStatus.PENDING,
      },
      include: {
        application: {
          include: {
            influencerProfile: {
              include: { user: true },
            },
            socialAccount: true,
          },
        },
      },
    });

    try {
      const conversation = await this.conversationService.resolveCollaborationConversation({
        applicationId: application.id,
        campaignId,
        brandUserId: userId,
        influencerUserId: influencer.userId,
      });

      await this.messageService.createSystemMessage({
        conversationId: conversation.id,
        text: `📩 Brand sent a collaboration invitation for "${campaign.title}" (${dto.compensationCurrency || '$'}${dto.compensationAmount}).`,
        systemEvent: 'COLLABORATION_OFFER_SENT',
        metadata: {
          offerId: offer.id,
          campaignId,
          applicationId: application.id,
        },
        clientMessageId: `offer_invite:${offer.id}`,
      });
    } catch (msgErr: any) {
      this.logger.warn(`Could not start conversation for direct invite: ${msgErr?.message}`);
    }

    return offer;
  }

  async getInvitedCampaignIdsForBrand(brandUserId: string, creatorId: string): Promise<string[]> {
    let influencer = await this.prisma.influencerProfile.findUnique({
      where: { id: creatorId },
      select: { id: true },
    });
    if (!influencer) {
      influencer = await this.prisma.influencerProfile.findUnique({
        where: { userId: creatorId },
        select: { id: true },
      });
    }
    if (!influencer) return [];

    const brandProfile = await this.prisma.brandProfile.findUnique({
      where: { userId: brandUserId },
      select: { id: true },
    });
    if (!brandProfile) return [];

    const brandCampaigns = await this.prisma.campaign.findMany({
      where: { brandProfileId: brandProfile.id },
      select: { id: true },
    });
    const campaignIds = brandCampaigns.map((c) => c.id);
    if (campaignIds.length === 0) return [];

    const offers = await this.prisma.campaignOffer.findMany({
      where: {
        influencerProfileId: influencer.id,
        campaignId: { in: campaignIds },
        status: { in: [OfferStatus.PENDING, OfferStatus.ACCEPTED] },
      },
      select: { campaignId: true },
    });

    return Array.from(new Set(offers.map((o) => o.campaignId)));
  }
}
