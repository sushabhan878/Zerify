import { Injectable } from '@nestjs/common';
import { CampaignRepository } from './campaign.repository';
import { ParticipantService } from './participant.service';
import { DeliverableAccessService } from './deliverable-access.service';
import { DeliverableWorkflowService } from './deliverable-workflow.service';
import { SubmitDeliverableDto } from './dto/submit-deliverable.dto';
import { ReviewDeliverableDto } from './dto/review-deliverable.dto';
import { PublishDeliverableDto } from './dto/publish-deliverable.dto';

@Injectable()
export class DeliverableService {
  constructor(
    private readonly repository: CampaignRepository,
    private readonly participants: ParticipantService,
    private readonly access: DeliverableAccessService,
    private readonly workflow: DeliverableWorkflowService,
  ) {}

  async listParticipantDeliverables(participantId: string, userId: string) {
    await this.participants.getParticipantDetails(participantId, userId);
    return this.repository.listDeliverablesForParticipant(participantId);
  }

  getDeliverableDetails(deliverableId: string, userId: string) {
    return this.access.get(userId, deliverableId);
  }

  submitDraft(userId: string, id: string, dto: SubmitDeliverableDto) {
    return this.workflow.submit(userId, id, dto);
  }

  reviewDeliverable(userId: string, id: string, dto: ReviewDeliverableDto) {
    return this.workflow.review(userId, id, dto);
  }

  publishDeliverable(userId: string, id: string, dto: PublishDeliverableDto) {
    return this.workflow.publish(userId, id, dto);
  }

  verifyDeliverable(userId: string, id: string, version: number) {
    return this.workflow.verify(userId, id, version);
  }
}
