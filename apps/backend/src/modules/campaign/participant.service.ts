import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CampaignRepository } from './campaign.repository';
import { ParticipantStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ParticipantService {
  constructor(
    private readonly repository: CampaignRepository,
    private readonly prisma: PrismaService,
  ) {}

  async listCampaignParticipants(campaignId: string, userId: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId }, include: { brandProfile: true } });
    if (!campaign || campaign.brandProfile.userId !== userId) throw new ForbiddenException('Only the campaign owner can view participants');
    return this.repository.listParticipantsForCampaign(campaignId);
  }

  async listInfluencerCollaborations(userId: string) {
    const influencerProfile = await this.prisma.influencerProfile.findUnique({
      where: { userId },
    });
    if (!influencerProfile) {
      throw new ForbiddenException('Influencer profile not found');
    }
    return this.repository.listParticipantsForInfluencer(influencerProfile.id);
  }

  async getParticipantDetails(participantId: string, userId: string) {
    const participant = await this.repository.findParticipantById(participantId);
    if (!participant) throw new NotFoundException('Participant not found');
    if (participant.influencerProfile.userId !== userId && participant.campaign.brandProfile.userId !== userId) {
      throw new ForbiddenException('You do not have access to this collaboration');
    }
    const payouts = await this.prisma.zerifyPayout.findMany({
      where: { campaignId: participant.campaignId, influencerProfileId: participant.influencerProfileId },
      select: { id: true, status: true, currency: true, failureReason: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return { ...participant, payouts };
  }

  async startParticipantWork(userId: string, participantId: string) {
    const participant = await this.repository.findParticipantById(participantId);
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    const isInfluencer = participant.influencerProfile.userId === userId;
    const isBrand = participant.campaign.brandProfile.userId === userId;

    if (!isInfluencer && !isBrand) {
      throw new ForbiddenException('You do not have permission to update this participant');
    }

    if (!isInfluencer) throw new ForbiddenException('Only the assigned creator can start this campaign');
    if (participant.status !== 'CONFIRMED') throw new BadRequestException('Only a confirmed collaboration can be started');
    return this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM campaigns WHERE id = ${participant.campaignId} FOR UPDATE`;
      const campaign = await tx.campaign.findUniqueOrThrow({ where: { id: participant.campaignId } });
      if (!['OPEN', 'FILLING', 'ACTIVE'].includes(campaign.status)) throw new BadRequestException('Campaign is no longer active');
      const changed = await tx.campaignParticipant.updateMany({ where: { id: participantId, status: 'CONFIRMED' }, data: { status: 'PARTICIPANT_ACTIVE', startedAt: new Date() } });
      if (!changed.count) throw new BadRequestException('Campaign has already been started or cancelled');
      await tx.participantDeliverable.updateMany({ where: { participantId, status: 'PENDING' }, data: { status: 'IN_PROGRESS' } });
      await tx.deliverableEvent.createMany({ data: participant.deliverables.map(d => ({
        deliverableId: d.id, actorId: userId, actorRole: 'INFLUENCER', eventType: 'CAMPAIGN_STARTED', previousState: d.status, newState: 'IN_PROGRESS',
      })) });
      return { started: true };
    });
  }

  async completeParticipant(userId: string, participantId: string) {
    const participant = await this.repository.findParticipantById(participantId);
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    // Only brand can mark completed
    if (participant.campaign.brandProfile.userId !== userId) {
      throw new ForbiddenException('Only the campaign owner can complete a participant');
    }

    // Check if all deliverables are approved/verified
    const allDeliverables = participant.deliverables || [];
    if (participant.status !== 'PARTICIPANT_ACTIVE' || allDeliverables.length === 0) {
      throw new BadRequestException('Only an active collaboration with deliverables can be completed');
    }
    const pendingDeliverables = allDeliverables.filter(
      (d) => d.status !== 'VERIFIED' && !(d.status === 'APPROVED' && (d.requirements as any)?.requiresPublication === false),
    );

    if (pendingDeliverables.length > 0) {
      throw new BadRequestException(
        `Cannot complete participant with ${pendingDeliverables.length} unapproved/unverified deliverables`,
      );
    }

    const updated = await this.repository.updateParticipantStatus(
      participantId,
      ParticipantStatus.PARTICIPANT_COMPLETED,
    );

    // Auto-record to influencer brand partner network
    try {
      if (participant.influencerProfileId && participant.campaign?.brandProfileId) {
        const brand = participant.campaign.brandProfile;
        const brandName = (brand as any).user?.name || brand.companyName || 'Brand Partner';
        const contactLead = (brand as any).user?.name || 'Brand Partnerships Lead';
        const campaignRecord = `${participant.campaign.title || 'Completed Campaign'} ($${(participant.agreedAmount || 0).toLocaleString('en-US')})`;

        const existing = await (this.prisma as any).influencerBrandPartner.findUnique({
          where: {
            influencerProfileId_brandProfileId: {
              influencerProfileId: participant.influencerProfileId,
              brandProfileId: participant.campaign.brandProfileId,
            },
          },
        });

        if (existing) {
          const newDeals = existing.totalDeals + 1;
          const newPaid = (existing.totalPaid || 0) + (participant.agreedAmount || 0);
          const pastList = Array.isArray(existing.pastCampaignsList)
            ? [...existing.pastCampaignsList, campaignRecord]
            : [campaignRecord];

          await (this.prisma as any).influencerBrandPartner.update({
            where: { id: existing.id },
            data: {
              totalDeals: newDeals,
              totalPaid: newPaid,
              lastWorked: new Date(),
              pastCampaignsList: pastList,
              relationshipTag:
                newDeals >= 2 && existing.relationshipTag !== 'PREFERRED'
                  ? 'REPEAT_SPONSOR'
                  : existing.relationshipTag,
            },
          });
        } else {
          await (this.prisma as any).influencerBrandPartner.create({
            data: {
              influencerProfileId: participant.influencerProfileId,
              brandProfileId: participant.campaign.brandProfileId,
              totalDeals: 1,
              totalPaid: participant.agreedAmount || 0,
              lastWorked: new Date(),
              pastCampaignsList: [campaignRecord],
              relationshipTag: 'COMPLETED',
              contactPerson: contactLead,
              contactRole: 'Influencer Marketing Manager',
              rating: 5.0,
            },
          });
        }
      }
    } catch (e) {
      console.warn('Could not auto-record influencer brand partner network entry:', e);
    }

    return updated;
  }

  async cancelParticipant(userId: string, participantId: string) {
    const participant = await this.repository.findParticipantById(participantId);
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    const isBrand = participant.campaign.brandProfile.userId === userId;
    if (!isBrand) {
      throw new ForbiddenException('Only the campaign owner can cancel participant collaboration');
    }

    return this.repository.updateParticipantStatus(
      participantId,
      ParticipantStatus.PARTICIPANT_CANCELLED,
    );
  }
}
