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

  async listCampaignParticipants(campaignId: string) {
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

  async getParticipantDetails(participantId: string) {
    const participant = await this.repository.findParticipantById(participantId);
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }
    return participant;
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

    return this.repository.updateParticipantStatus(
      participantId,
      ParticipantStatus.PARTICIPANT_ACTIVE,
    );
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
    const pendingDeliverables = allDeliverables.filter(
      (d) => d.status !== 'VERIFIED' && d.status !== 'APPROVED',
    );

    if (pendingDeliverables.length > 0) {
      throw new BadRequestException(
        `Cannot complete participant with ${pendingDeliverables.length} unapproved/unverified deliverables`,
      );
    }

    return this.repository.updateParticipantStatus(
      participantId,
      ParticipantStatus.PARTICIPANT_COMPLETED,
    );
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
