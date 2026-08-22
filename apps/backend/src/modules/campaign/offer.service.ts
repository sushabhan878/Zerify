import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CampaignRepository } from './campaign.repository';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferStatus, ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OfferService {
  constructor(
    private readonly repository: CampaignRepository,
    private readonly prisma: PrismaService,
  ) {}

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
      dueDate: d.dueDate || undefined,
    }));

    return this.repository.acceptOfferAndCreateParticipant({
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
}
