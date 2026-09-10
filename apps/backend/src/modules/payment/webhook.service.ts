import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PayoutStatus, Prisma, RefundStatus, WebhookProcessingStatus } from '@prisma/client';
import { createHash } from 'crypto';
import { PaymentRepository } from './payment.repository';
import { PaymentService } from './payment.service';
import { PayoutService } from './payout.service';
import { AuditService } from './audit.service';
import { PaymentProviderFactory } from './providers/payment-provider.factory';
import { PAYMENT_PROVIDER, PaymentProvider } from './payment-provider.interface';

export interface WebhookRequest {
  /** Raw, byte-for-byte request body. Signature verification depends on it. */
  rawBody: string;
  signature?: string;
  timestamp?: string;
  provider?: string;
}

const MAX_WEBHOOK_ATTEMPTS = 5;

/**
 * Provider event ingestion (TRD §43, §5.6).
 *
 * The order of operations is deliberate and non-negotiable:
 * verify signature → persist raw event → dedupe → process.
 *
 * A webhook is never trusted just because it arrived. Processing only happens
 * after the event is durably stored, so a crash mid-processing still leaves a
 * record to replay from.
 */
@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly repository: PaymentRepository,
    private readonly paymentService: PaymentService,
    private readonly payoutService: PayoutService,
    private readonly audit: AuditService,
    private readonly providerFactory: PaymentProviderFactory,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  async handleWebhook(request: WebhookRequest) {
    const providerId = request.provider ?? 'CASHFREE';

    // 1. Verify. An unsigned or mis-signed payload is discarded unread.
    const verification = this.provider.verifyWebhook({
      rawBody: request.rawBody,
      signature: request.signature,
      timestamp: request.timestamp,
    });

    if (!verification.valid) {
      this.logger.error('Rejected webhook: signature verification failed');
      // Persist the rejection for forensics, without executing anything from it.
      await this.repository.createWebhookEvent({
        provider: providerId,
        eventType: 'UNVERIFIED',
        eventHash: this.hash(`${providerId}:${request.rawBody}`),
        payload: { raw: request.rawBody } as Prisma.InputJsonValue,
        signatureValid: false,
      });
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = verification.event;
    const eventType = event?.eventType ?? 'UNKNOWN';
    const providerEventId = event?.providerEventId ?? null;

    // 2. Dedupe on a content hash: providers retry, and replaying a settled
    //    event must never move money a second time.
    const eventHash = this.hash(
      `${providerId}:${providerEventId ?? ''}:${request.rawBody}`,
    );

    const existing = await this.repository.findWebhookEventByHash(eventHash);
    if (existing) {
      if (existing.processingStatus === WebhookProcessingStatus.PROCESSED) {
        this.logger.debug(`Webhook ${eventHash} already processed; acknowledging`);
        return { status: 'DUPLICATE', id: existing.id };
      }
      // Only one caller may claim a stalled event; everyone else acks. This is
      // what stops two concurrent retries from paying out twice.
      const claimed = await this.repository.claimWebhookEvent(existing.id);
      if (!claimed) {
        return { status: 'IN_PROGRESS', id: existing.id };
      }
      return this.process(claimed);
    }

    // 3. Persist before processing.
    const stored = await this.repository.createWebhookEvent({
      provider: providerId,
      eventType,
      providerEventId,
      eventHash,
      payload: event as unknown as Prisma.InputJsonValue,
      signatureValid: true,
    });

    return this.process(stored);
  }

  /**
   * Dispatches a stored event to its handler.
   *
   * On failure the event is marked FAILED and left for retry rather than
   * being lost — after {@link MAX_WEBHOOK_ATTEMPTS} it moves to DEAD_LETTER
   * for human review.
   */
  private async process(stored: any) {
    try {
      await this.dispatch(stored);
      await this.repository.updateWebhookEvent(stored.id, {
        processingStatus: WebhookProcessingStatus.PROCESSED,
        processedAt: new Date(),
        lastError: null,
      });
      return { status: 'PROCESSED', id: stored.id };
    } catch (error) {
      const attempts = (stored.attempts ?? 0) + 1;
      const dead = attempts >= MAX_WEBHOOK_ATTEMPTS;

      this.logger.error(
        `Webhook ${stored.id} (${stored.eventType}) failed on attempt ${attempts}: ${(error as Error).message}`,
      );

      await this.repository.updateWebhookEvent(stored.id, {
        processingStatus: dead
          ? WebhookProcessingStatus.DEAD_LETTER
          : WebhookProcessingStatus.FAILED,
        lastError: (error as Error).message?.slice(0, 2000) ?? 'Unknown error',
      });

      // Never surface a processing failure as an auth-style 400 to the
      // provider; the event is stored and will be retried.
      return { status: dead ? 'DEAD_LETTER' : 'FAILED', id: stored.id };
    }
  }

  private async dispatch(stored: any) {
    const payload = stored.payload ?? {};
    const type: string = stored.eventType ?? '';

    switch (type) {
      case 'PAYMENT_SUCCESS':
      case 'PAYMENT_SUCCESSFUL':
      case 'PAYMENT_FAILED': {
        const providerOrderId = payload?.data?.order?.order_id ?? payload?.data?.order_id;
        const payment = providerOrderId
          ? await this.repository.findPaymentByProviderOrderId(providerOrderId)
          : null;
        if (!payment) return;

        // Re-read from the provider rather than trusting the payload body:
        // the signature proves origin, not that the body is current.
        await this.paymentService.syncPaymentStatus(payment.id);
        return this.audit.record({
          action: 'WEBHOOK_PAYMENT_EVENT',
          entityType: 'PAYMENT',
          entityId: payment.id,
          metadata: { eventType: type, providerEventId: stored.providerEventId ?? null },
        }, { actorType: 'WEBHOOK' });
      }

      case 'REFUND_SUCCESS':
      case 'REFUND_STATUS': {
        const providerRefundId = payload?.data?.refund?.cf_refund_id ?? payload?.data?.refund_id;
        if (!providerRefundId) return;
        const refund = await this.repository.findRefundByProviderRefundId(providerRefundId);
        if (!refund) return;

        const status = payload?.data?.refund?.refund_status ?? payload?.data?.refund_status;
        return this.paymentService.applyRefundStatus(refund.id, this.mapRefundStatus(status));
      }

      case 'PAYOUT_SUCCESS':
      case 'PAYOUT_FAILED':
      case 'PAYOUT_STATUS': {
        const providerPayoutId = payload?.data?.transfer?.cf_transfer_id ?? payload?.data?.transfer_id;
        if (!providerPayoutId) return;
        const payout = await this.repository.findPayoutByProviderPayoutId(providerPayoutId);
        if (!payout) return;

        const status = payload?.data?.transfer?.status ?? payload?.data?.status;
        await this.payoutService.applyPayoutStatus(
          payout.id,
          this.mapPayoutStatus(status),
          payload?.data?.transfer?.status_description,
          undefined,
          'webhook',
        );
        return this.audit.record({
          action: 'WEBHOOK_PAYOUT_EVENT',
          entityType: 'PAYOUT',
          entityId: payout.id,
          metadata: { eventType: type, providerEventId: stored.providerEventId ?? null },
        }, { actorType: 'WEBHOOK' });
      }

      default:
        // Unknown event types are stored and ignored; new provider events must
        // never break ingestion for the ones we do handle.
        this.logger.debug(`No handler for webhook event type ${type}`);
        return;
    }
  }

  /** Replays events that failed, e.g. from an admin action or a cron sweep. */
  async retryStalledEvents(take = 20) {
    const stalled = await this.repository.findStalledWebhookEvents(MAX_WEBHOOK_ATTEMPTS, take);
    const results = [];
    for (const event of stalled) {
      results.push(await this.process(event));
    }
    return results;
  }

  async listEvents(options: { status?: WebhookProcessingStatus; take?: number } = {}) {
    return this.repository.listWebhookEvents(options);
  }

  private mapRefundStatus(status?: string): RefundStatus {
    switch ((status ?? '').toUpperCase()) {
      case 'SUCCESS':
      case 'SUCCESSFUL':
        return RefundStatus.COMPLETED;
      case 'FAILED':
      case 'CANCELLED':
        return RefundStatus.FAILED;
      default:
        return RefundStatus.PROCESSING;
    }
  }

  private mapPayoutStatus(status?: string): PayoutStatus {
    switch ((status ?? '').toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return PayoutStatus.COMPLETED;
      case 'FAILED':
      case 'REJECTED':
      case 'REVERSED':
        return PayoutStatus.FAILED;
      default:
        return PayoutStatus.PROCESSING;
    }
  }

  private hash(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }
}
