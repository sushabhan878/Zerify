import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CampaignRepository } from './campaign.repository';
import { SubmitDeliverableDto } from './dto/submit-deliverable.dto';
import { ReviewDeliverableDto } from './dto/review-deliverable.dto';
import { PublishDeliverableDto } from './dto/publish-deliverable.dto';
import { DeliverableStatus } from '@prisma/client';

@Injectable()
export class DeliverableService {
  constructor(private readonly repository: CampaignRepository) {}

  async listParticipantDeliverables(participantId: string) {
    return this.repository.listDeliverablesForParticipant(participantId);
  }

  async getDeliverableDetails(deliverableId: string) {
    const deliverable = await this.repository.findDeliverableById(deliverableId);
    if (!deliverable) {
      throw new NotFoundException('Deliverable not found');
    }
    return deliverable;
  }

  async submitDraft(userId: string, deliverableId: string, dto: SubmitDeliverableDto) {
    const deliverable = await this.repository.findDeliverableById(deliverableId);
    if (!deliverable) {
      throw new NotFoundException('Deliverable not found');
    }

    if (deliverable.participant.influencerProfile.userId !== userId) {
      throw new ForbiddenException('Only the assigned influencer can submit deliverables');
    }

    if (
      deliverable.status !== DeliverableStatus.PENDING &&
      deliverable.status !== DeliverableStatus.IN_PROGRESS &&
      deliverable.status !== DeliverableStatus.REVISION_REQUESTED
    ) {
      throw new BadRequestException(`Cannot submit draft for deliverable with status ${deliverable.status}`);
    }

    return this.repository.submitDeliverableDraft(
      deliverableId,
      dto.contentUrls,
      dto.notes,
      userId,
    );
  }

  async reviewDeliverable(userId: string, deliverableId: string, dto: ReviewDeliverableDto) {
    const deliverable = await this.repository.findDeliverableById(deliverableId);
    if (!deliverable) {
      throw new NotFoundException('Deliverable not found');
    }

    if (deliverable.participant.campaign.brandProfile.userId !== userId) {
      throw new ForbiddenException('Only the campaign owner can review deliverables');
    }

    if (deliverable.status !== DeliverableStatus.SUBMITTED) {
      throw new BadRequestException('Can only review submitted deliverables');
    }

    return this.repository.reviewDeliverable(
      deliverableId,
      dto.decision,
      dto.comments,
      userId,
    );
  }

  async publishDeliverable(userId: string, deliverableId: string, dto: PublishDeliverableDto) {
    const deliverable = await this.repository.findDeliverableById(deliverableId);
    if (!deliverable) {
      throw new NotFoundException('Deliverable not found');
    }

    if (deliverable.participant.influencerProfile.userId !== userId) {
      throw new ForbiddenException('Only the assigned influencer can submit publication details');
    }

    if (
      deliverable.status !== DeliverableStatus.APPROVED &&
      deliverable.status !== DeliverableStatus.READY_TO_PUBLISH
    ) {
      throw new BadRequestException('Deliverable must be approved before publishing');
    }

    return this.repository.publishDeliverable(
      deliverableId,
      dto.publishedUrl,
      dto.proofUrls || [],
    );
  }

  async verifyDeliverable(userId: string, deliverableId: string) {
    const deliverable = await this.repository.findDeliverableById(deliverableId);
    if (!deliverable) {
      throw new NotFoundException('Deliverable not found');
    }

    if (deliverable.participant.campaign.brandProfile.userId !== userId) {
      throw new ForbiddenException('Only the campaign owner can verify publication');
    }

    if (deliverable.status !== DeliverableStatus.PUBLISHED) {
      throw new BadRequestException('Can only verify published deliverables');
    }

    return this.repository.verifyDeliverable(deliverableId, userId);
  }
}
