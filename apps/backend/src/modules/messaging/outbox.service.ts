import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { MessagingRepository, PrismaLike } from './messaging.repository';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { ApplicationEventPayload } from './events/messaging-events';
import { buildSystemMetadata, renderSystemMessage } from './events/system-message.templates';

/**
 * Transactional outbox for backend-authored SYSTEM messages.
 *
 * Business code enqueues an event inside its own transaction, so the status
 * change and the intent to notify commit atomically (PRD §38). This poller
 * then turns events into messages. Delivery is at-least-once; the message
 * write is idempotent on the event id, which makes the net effect exactly-once.
 */
@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);
  private processing = false;

  constructor(
    private readonly repository: MessagingRepository,
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) {}

  /** Enqueue inside the caller's transaction — never opens its own. */
  async enqueue(
    client: PrismaLike,
    eventType: string,
    aggregateId: string,
    payload: ApplicationEventPayload,
  ) {
    return this.repository.createOutboxEvent(
      client,
      eventType,
      aggregateId,
      payload as unknown as Prisma.InputJsonValue,
    );
  }

  /**
   * In-process poller. This is the seam where a dedicated worker process would
   * take over for multi-instance deployments — the logic below is unchanged.
   */
  @Interval(2000)
  async processPending(): Promise<void> {
    if (this.processing) return; // Never overlap runs.
    this.processing = true;

    try {
      const events = await this.repository.claimPendingOutboxEvents(20);
      for (const event of events) {
        try {
          await this.handleEvent(event.id, event.eventType, event.payload as any);
          await this.repository.markOutboxProcessed(event.id);
        } catch (error: any) {
          // Left PENDING for retry; only marked FAILED once attempts are spent.
          this.logger.error(
            `Outbox event ${event.id} (${event.eventType}) failed: ${error?.message}`,
          );
          await this.repository.markOutboxFailed(event.id, error?.message ?? 'Unknown error');
        }
      }
    } catch (error: any) {
      const msg = error?.message || '';
      if (msg.includes('Server has closed the connection') || msg.includes('Connection pool') || msg.includes('timed out')) {
        this.logger.warn(`Outbox poller paused: transient database connection reset (${msg.split('\n')[0]}). Will retry automatically on next interval.`);
      } else {
        this.logger.error(`Outbox poll failed: ${msg}`);
      }
    } finally {
      this.processing = false;
    }
  }

  private async handleEvent(eventId: string, eventType: string, payload: ApplicationEventPayload) {
    const rendered = renderSystemMessage(eventType, payload);
    if (!rendered) {
      this.logger.warn(`No system-message template for event type ${eventType}; skipping`);
      return;
    }

    if (!payload?.brandUserId || !payload?.influencerUserId) {
      throw new Error(`Event ${eventId} is missing brandUserId/influencerUserId`);
    }

    const conversation = await this.conversationService.resolveCollaborationConversation({
      applicationId: payload.applicationId,
      campaignId: payload.campaignId,
      brandUserId: payload.brandUserId,
      influencerUserId: payload.influencerUserId,
    });

    await this.messageService.createSystemMessage({
      conversationId: conversation.id,
      text: rendered.text,
      systemEvent: eventType,
      metadata: buildSystemMetadata(eventType, payload, rendered.messageKey) as Prisma.InputJsonValue,
      // Keying on the event id means a retried event reuses the same message.
      clientMessageId: `outbox:${eventId}`,
    });
  }
}
