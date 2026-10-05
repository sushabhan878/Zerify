import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OutboxService } from '../messaging/outbox.service';
import { isDeliverableComplete } from './deliverable-rules';

@Injectable()
export class DeliverableEventsService {
  constructor(private readonly outbox: OutboxService) {}

  async record(tx: Prisma.TransactionClient, d: any, actorId: string, eventType: string, newState: string, metadata: Prisma.InputJsonValue = {}) {
    await tx.deliverableEvent.create({ data: {
      deliverableId: d.id, actorId, actorRole: actorId === d.participant.influencerProfile.userId ? 'INFLUENCER' : 'BRAND',
      eventType, previousState: d.status, newState, metadata,
    } });
    await this.outbox.enqueue(tx, 'DELIVERABLE_WORKFLOW', d.id, {
      applicationId: d.participant.applicationId, campaignId: d.campaignId,
      campaignTitle: d.participant.campaign.title,
      brandUserId: d.participant.campaign.brandProfile.userId,
      influencerUserId: d.participant.influencerProfile.userId,
      actor: actorId === d.participant.influencerProfile.userId ? 'INFLUENCER' : 'BRAND',
      workflowMessage: `${d.title || d.type}: ${eventType.toLowerCase().replace(/_/g, ' ')}.`,
    });
  }

  async completeIfEligible(tx: Prisma.TransactionClient, d: any, actorId: string) {
    const items = await tx.participantDeliverable.findMany({ where: { participantId: d.participantId } });
    if (!items.length || !items.every(isDeliverableComplete)) return;
    const changed = await tx.campaignParticipant.updateMany({
      where: { id: d.participantId, status: 'PARTICIPANT_ACTIVE' },
      data: { status: 'PARTICIPANT_COMPLETED', completedAt: new Date() },
    });
    if (!changed.count) return;
    await this.record(tx, d, actorId, 'CAMPAIGN_ASSIGNMENT_COMPLETED', d.status);
    // Durable eligibility signal to the finance domain. No payment status or
    // ledger balance is fabricated, and external payouts remain finance-owned.
    await tx.financialAuditLog.create({ data: {
      actorType: 'SYSTEM', actorId, action: 'DELIVERABLES_COMPLETE_RELEASE_ELIGIBLE',
      entityType: 'CAMPAIGN_FINANCE', entityId: d.campaignId,
      metadata: { participantId: d.participantId, influencerProfileId: d.participant.influencerProfileId },
    } });
  }
}
