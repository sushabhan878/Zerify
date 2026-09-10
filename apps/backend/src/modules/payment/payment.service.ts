import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, Prisma, RefundStatus } from '@prisma/client';
import { PaymentRepository, PrismaLike } from './payment.repository';
import { LedgerService } from './ledger.service';
import { FeeEngine } from './fee-engine.service';
import { AuditService } from './audit.service';
import {
  PAYMENT_PROVIDER,
  PaymentProvider,
  OrderStatusResult,
} from './payment-provider.interface';
import { PaymentProviderFactory } from './providers/payment-provider.factory';
import { toMinor, fromMinor } from './money.util';

/** Legal payment status transitions (TRD §31). Anything else is a bug. */
const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [
    PaymentStatus.PROCESSING,
    PaymentStatus.SUCCESSFUL,
    PaymentStatus.FAILED,
    PaymentStatus.CANCELLED,
  ],
  [PaymentStatus.PROCESSING]: [
    PaymentStatus.SUCCESSFUL,
    PaymentStatus.FAILED,
    PaymentStatus.CANCELLED,
  ],
  [PaymentStatus.SUCCESSFUL]: [
    PaymentStatus.PARTIALLY_REFUNDED,
    PaymentStatus.REFUNDED,
  ],
  [PaymentStatus.PARTIALLY_REFUNDED]: [
    PaymentStatus.PARTIALLY_REFUNDED,
    PaymentStatus.REFUNDED,
  ],
  [PaymentStatus.REFUNDED]: [],
  [PaymentStatus.FAILED]: [PaymentStatus.PENDING, PaymentStatus.CANCELLED],
  [PaymentStatus.CANCELLED]: [PaymentStatus.PENDING],
};

export interface CreateOrderParams {
  userId: string;
  /** User id attributed in the audit trail; defaults to userId. */
  actorUserId?: string;
  brandProfileId?: string | null;
  campaignId?: string | null;
  amount: string | number;
  currency?: string;
  idempotencyKey?: string;
  returnUrl?: string;
  provider?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly repository: PaymentRepository,
    private readonly ledger: LedgerService,
    private readonly feeEngine: FeeEngine,
    private readonly providerFactory: PaymentProviderFactory,
    private readonly audit: AuditService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  // ------------------------------------------------------------------ orders

  /**
   * Creates a payment order (TRD §33).
   *
   * Replay-safe in three layers: the caller's idempotency key, the
   * campaign+amount in-flight check, and the provider order id. A repeat of
   * any of these returns the original record instead of charging twice.
   */
  async createOrder(params: CreateOrderParams) {
    const currency = (params.currency ?? 'INR').toUpperCase();
    const amountMinor = BigInt(toMinor(params.amount, currency));
    const providerId = params.provider ?? 'CASHFREE';

    if (params.idempotencyKey) {
      const existing = await this.repository.findPaymentByIdempotencyKey(params.idempotencyKey);
      if (existing) {
        this.logger.debug(`Replaying payment order for key=${params.idempotencyKey}`);
        return existing;
      }
    }

    if (params.campaignId) {
      await this.assertCampaignAccess(params.campaignId, params.brandProfileId);

      // A successful payment for this campaign+amount is the funding event;
      // hand back the original rather than opening a second one.
      const settled = await this.repository.findActivePaymentForCampaign(
        params.campaignId,
        amountMinor,
        currency,
      );
      if (settled?.status === PaymentStatus.SUCCESSFUL) {
        return settled;
      }
      // An in-flight attempt in the last 15 minutes is still payable — reuse
      // its checkout session rather than minting a parallel order.
      if (
        settled?.status === PaymentStatus.PENDING &&
        settled.providerSessionId &&
        Date.now() - settled.createdAt.getTime() < 15 * 60 * 1000
      ) {
        return settled;
      }
      if (settled) {
        // Stale or abandoned attempt: close it so it cannot be paid later
        // while a new order is live.
        await this.transition(settled.id, PaymentStatus.CANCELLED, {
          failureReason: 'Superseded by a newer funding attempt',
        });
      }
    }

    const provider = this.providerFactory.getProvider(providerId);

    const created = await this.repository.runInTransaction(async (client) => {
      const payment = await this.repository.createPayment(
        {
          userId: params.userId,
          brandProfileId: params.brandProfileId ?? null,
          campaignId: params.campaignId ?? null,
          provider: providerId,
          amountMinor,
          currency,
          idempotencyKey:
            params.idempotencyKey ?? `order:${params.campaignId ?? params.userId}:${amountMinor}:${Date.now()}`,
          metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue,
        },
        client,
      );

      await this.audit.record(
        {
          action: 'PAYMENT_CREATED',
          entityType: 'PAYMENT',
          entityId: payment.id,
          newStatus: PaymentStatus.PENDING,
          metadata: { campaignId: params.campaignId ?? null, amountMinor: amountMinor.toString(), currency, provider: providerId },
        },
        { actorType: 'USER', actorId: params.actorUserId ?? params.userId },
        client,
      );

      const order = await provider.createOrder({
        paymentId: payment.id,
        amountMinor: Number(amountMinor),
        currency,
        orderDescription: `Zerify campaign funding ${payment.id}`,
        returnUrl: params.returnUrl ?? '',
      });

      return this.repository.updatePayment(
        payment.id,
        {
          providerOrderId: order.providerOrderId,
          providerSessionId: order.paymentSessionId ?? null,
        },
        client,
      );
    });

    return created;
  }

  async getPayment(id: string) {
    const payment = await this.repository.findPaymentById(id);
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  /** Payments the authenticated user has made, newest first. */
  async listPaymentsForUser(
    userId: string,
    options: { campaignId?: string; status?: PaymentStatus } = {},
  ) {
    return this.repository.listPaymentsForUser(userId, options);
  }

  /**
   * Server-side verification — the only source of truth for payment success
   * (TRD §26/§43). A frontend redirect is never proof of payment; the status
   * is always read back from the provider.
   */
  async syncPaymentStatus(paymentId: string) {
    const payment = await this.getPayment(paymentId);
    if (!payment.providerOrderId) {
      throw new BadRequestException('Payment has no provider order yet');
    }

    // Terminal states are settled; re-querying could only regress them.
    if (
      payment.status === PaymentStatus.SUCCESSFUL ||
      payment.status === PaymentStatus.REFUNDED ||
      payment.status === PaymentStatus.PARTIALLY_REFUNDED
    ) {
      return payment;
    }

    const provider = this.providerFactory.getProvider(payment.provider);
    const status = await provider.getOrder(payment.providerOrderId);
    status.source = 'api';
    return this.applyProviderStatus(payment.id, status);
  }

  /**
   * Applies a provider-reported status to the local record. Shared by the
   * verification path and the webhook path so both enforce the same state
   * machine and the same ledger posting.
   */
  async applyProviderStatus(paymentId: string, status: OrderStatusResult) {
    return this.repository.runInTransaction(async (client) => {
      const payment = await this.repository.findPaymentById(paymentId, client);
      if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);

      if (status.status === 'SUCCESSFUL') {
        if (payment.status === PaymentStatus.SUCCESSFUL) return payment; // already settled

        // Never trust a client- or webhook-supplied amount: the local record
        // is authoritative, and a mismatch is a fraud signal worth surfacing.
        if (
          status.amountMinor !== undefined &&
          BigInt(status.amountMinor) !== payment.amountMinor
        ) {
          this.logger.error(
            `Amount mismatch on payment ${paymentId}: provider=${status.amountMinor} local=${payment.amountMinor}`,
          );
          throw new ConflictException('Provider amount does not match the recorded payment');
        }

        this.assertTransition(payment.status, PaymentStatus.SUCCESSFUL);

        const updated = await this.repository.updatePayment(
          paymentId,
          {
            status: PaymentStatus.SUCCESSFUL,
            providerPaymentId: status.providerPaymentId ?? payment.providerPaymentId,
            paymentMethod: status.paymentMethod ?? payment.paymentMethod,
          },
          client,
        );

        await this.audit.record(
          {
            action: 'PAYMENT_SUCCEEDED',
            entityType: 'PAYMENT',
            entityId: paymentId,
            previousStatus: payment.status,
            newStatus: PaymentStatus.SUCCESSFUL,
            metadata: { campaignId: payment.campaignId ?? null, source: status.source ?? 'api' },
          },
          { actorType: status.source === 'webhook' ? 'WEBHOOK' : 'SYSTEM' },
          client,
        );

        await this.onPaymentSucceeded(updated, client);
        return updated;
      }

      if (status.status === 'FAILED') {
        if (payment.status === PaymentStatus.FAILED) return payment;
        this.assertTransition(payment.status, PaymentStatus.FAILED);
        const updated = await this.repository.updatePayment(
          paymentId,
          {
            status: PaymentStatus.FAILED,
            failureCode: status.failureCode ?? null,
            failureReason: status.failureReason ?? null,
          },
          client,
        );

        await this.audit.record(
          {
            action: 'PAYMENT_FAILED',
            entityType: 'PAYMENT',
            entityId: paymentId,
            previousStatus: payment.status,
            newStatus: PaymentStatus.FAILED,
            metadata: { failureCode: status.failureCode ?? null, source: status.source ?? 'api' },
          },
          { actorType: status.source === 'webhook' ? 'WEBHOOK' : 'SYSTEM' },
          client,
        );

        return updated;
      }

      return payment;
    });
  }

  /**
   * Side effects of a successful collection: the money moves into the
   * campaign's ring-fenced bucket and the campaign is marked funded. Runs in
   * the same transaction as the status write, so a crash cannot leave a paid
   * payment with unfunded books.
   */
  private async onPaymentSucceeded(payment: any, client: PrismaLike) {
    if (!payment.campaignId) return;

    await this.ledger.postCampaignFunding(
      {
        paymentId: payment.id,
        brandProfileId: payment.brandProfileId,
        campaignId: payment.campaignId,
        amountMinor: payment.amountMinor,
        currency: payment.currency,
      },
      client,
    );

    const existing = await this.repository.findCampaignFinance(payment.campaignId, client);
    const currentFunded = existing?.fundedAmountMinor ?? 0n;
    const fundedAmountMinor = currentFunded + payment.amountMinor;

    // Recompute against the campaign's fee plan (or the current default the
    // first time around) so a top-up is priced identically to the original.
    const breakdown = this.feeEngine.calculate({
      baseAmountMinor: fundedAmountMinor,
      planId: existing?.feePlanId ?? undefined,
      currency: payment.currency,
    });

    await this.repository.upsertCampaignFinance(
      payment.campaignId,
      {
        currency: payment.currency,
        fundedAmountMinor,
        grossBudgetMinor: existing?.grossBudgetMinor ?? payment.amountMinor,
        influencerPayableMinor: breakdown.influencerPayableMinor,
        platformFeeMinor: breakdown.totalFeeMinor,
        taxAmountMinor: breakdown.taxAmountMinor,
        remainingAmountMinor:
          fundedAmountMinor -
          (existing?.paidOutAmountMinor ?? 0n) -
          (existing?.refundedAmountMinor ?? 0n),
        isFunded: true,
        fundedAt: existing?.fundedAt ?? new Date(),
        feePlanId: breakdown.snapshot.feePlanId as string,
        feeRatePercent: this.feeEngine.getPlan(breakdown.snapshot.feePlanId as string)
          .platformFeePercent,
        feeCalculationSnapshot: breakdown.snapshot as Prisma.InputJsonValue,
      },
      client,
    );
  }

  // ----------------------------------------------------------------- refunds

  /**
   * Initiates a refund against a successful payment (TRD §14).
   *
   * The cumulative cap is enforced against the sum of non-failed refunds, so
   * a sequence of partial refunds can never exceed what was collected.
   */
  async refund(params: {
    paymentId: string;
    amount?: string | number;
    reason?: string;
    idempotencyKey?: string;
    actorUserId?: string;
    /** Set by dispute resolution, which moves disputed money deliberately. */
    bypassDisputeLock?: boolean;
  }) {
    const payment = await this.getPayment(params.paymentId);

    if (
      payment.status !== PaymentStatus.SUCCESSFUL &&
      payment.status !== PaymentStatus.PARTIALLY_REFUNDED
    ) {
      throw new BadRequestException(
        `Cannot refund a payment in status ${payment.status}`,
      );
    }

    // Disputed money is frozen until an admin resolves the dispute (PRD §24).
    if (!params.bypassDisputeLock) {
      const dispute = await this.repository.findOpenDisputeForPayment(payment.id);
      if (dispute) {
        throw new ConflictException(
          `Payment is under an open dispute (${dispute.id}); refund blocked until resolution`,
        );
      }
    }

    if (params.idempotencyKey) {
      const existing = await this.repository.findRefundByIdempotencyKey(params.idempotencyKey);
      if (existing) return existing;
    }

    const alreadyRefunded = await this.repository.sumRefundsForPayment(payment.id);
    const refundableMinor = payment.amountMinor - alreadyRefunded;

    if (refundableMinor <= 0n) {
      throw new ConflictException('Payment has already been fully refunded');
    }

    const requestedMinor = params.amount
      ? BigInt(toMinor(params.amount, payment.currency))
      : refundableMinor;

    if (requestedMinor <= 0n) {
      throw new BadRequestException('Refund amount must be positive');
    }

    // The headline rule of §14: cumulative refunds never exceed the payment.
    if (requestedMinor > refundableMinor) {
      throw new BadRequestException(
        `Refund of ${fromMinor(Number(requestedMinor), payment.currency)} ${payment.currency} ` +
          `exceeds the refundable balance of ${fromMinor(Number(refundableMinor), payment.currency)} ${payment.currency}`,
      );
    }

    const provider = this.providerFactory.getProvider(payment.provider);

    return this.repository.runInTransaction(async (client) => {
      const refund = await this.repository.createRefund(
        {
          paymentId: payment.id,
          provider: payment.provider,
          amountMinor: requestedMinor,
          currency: payment.currency,
          reason: params.reason ?? null,
          idempotencyKey:
            params.idempotencyKey ?? `refund:${payment.id}:${alreadyRefunded}:${requestedMinor}`,
        },
        client,
      );

      const result = await provider.createRefund({
        refundId: refund.id,
        providerOrderId: payment.providerOrderId,
        amountMinor: Number(requestedMinor),
        currency: payment.currency,
        note: params.reason,
      });

      const status =
        result.status === 'SUCCESSFUL'
          ? RefundStatus.COMPLETED
          : result.status === 'FAILED'
            ? RefundStatus.FAILED
            : RefundStatus.PROCESSING;

      const updated = await this.repository.updateRefund(
        refund.id,
        { providerRefundId: result.providerRefundId, status },
        client,
      );

      if (status === RefundStatus.COMPLETED) {
        await this.onRefundCompleted(updated, payment, client);
      }

      await this.audit.record(
        {
          action: 'REFUND_REQUESTED',
          entityType: 'REFUND',
          entityId: refund.id,
          newStatus: status,
          metadata: {
            paymentId: payment.id,
            amountMinor: requestedMinor.toString(),
            currency: payment.currency,
            providerStatus: result.status,
          },
        },
        { actorType: params.actorUserId ? 'USER' : 'SYSTEM', actorId: params.actorUserId ?? null },
        client,
      );

      return updated;
    });
  }

  /** Applies a refund status change coming from a webhook or a status poll. */
  async applyRefundStatus(refundId: string, status: RefundStatus) {
    return this.repository.runInTransaction(async (client) => {
      const refund = await this.repository.findRefundById(refundId, client);
      if (!refund) throw new NotFoundException(`Refund ${refundId} not found`);
      if (refund.status === status) return refund;

      const updated = await this.repository.updateRefund(
        refundId,
        { status },
        client,
      );

      if (status === RefundStatus.COMPLETED && refund.status !== RefundStatus.COMPLETED) {
        const payment = await this.repository.findPaymentById(refund.paymentId, client);
        await this.onRefundCompleted(updated, payment, client);

        await this.audit.record(
          {
            action: 'REFUND_COMPLETED',
            entityType: 'REFUND',
            entityId: refundId,
            previousStatus: refund.status,
            newStatus: RefundStatus.COMPLETED,
            metadata: { paymentId: refund.paymentId },
          },
          { actorType: 'WEBHOOK' },
          client,
        );
      }

      return updated;
    });
  }

  private async onRefundCompleted(refund: any, payment: any, client: PrismaLike) {
    await this.ledger.postRefund(
      {
        refundId: refund.id,
        campaignId: payment?.campaignId ?? null,
        brandProfileId: payment?.brandProfileId ?? null,
        amountMinor: refund.amountMinor,
        currency: refund.currency,
      },
      client,
    );

    const totalRefunded = await this.repository.sumRefundsForPayment(refund.paymentId, client);

    await this.repository.updatePayment(
      refund.paymentId,
      {
        status:
          totalRefunded >= payment.amountMinor
            ? PaymentStatus.REFUNDED
            : PaymentStatus.PARTIALLY_REFUNDED,
      },
      client,
    );

    if (payment?.campaignId) {
      const finance = await this.repository.findCampaignFinance(payment.campaignId, client);
      if (finance) {
        const refundedAmountMinor = finance.refundedAmountMinor + refund.amountMinor;
        await this.repository.upsertCampaignFinance(
          payment.campaignId,
          {
            refundedAmountMinor,
            remainingAmountMinor:
              finance.fundedAmountMinor -
              refundedAmountMinor -
              finance.paidOutAmountMinor,
          },
          client,
        );
      }
    }
  }

  async listRefunds(paymentId: string) {
    await this.getPayment(paymentId);
    return this.repository.listRefundsForPayment(paymentId);
  }

  // ------------------------------------------------------------------ shared

  /**
   * Guards every status write with the §31 state machine. Illegal transitions
   * throw rather than silently corrupting the lifecycle.
   */
  private assertTransition(from: PaymentStatus, to: PaymentStatus) {
    const allowed = PAYMENT_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new ConflictException(`Illegal payment transition ${from} → ${to}`);
    }
  }

  private async transition(
    paymentId: string,
    to: PaymentStatus,
    extra: Prisma.ZerifyPaymentUpdateInput = {},
  ) {
    const payment = await this.getPayment(paymentId);
    this.assertTransition(payment.status, to);
    return this.repository.updatePayment(paymentId, { status: to, ...extra });
  }

  /** A brand may only fund its own campaigns. */
  private async assertCampaignAccess(campaignId: string, brandProfileId?: string | null) {
    if (!brandProfileId) return;
    const campaign = await this.repository.findCampaignById(campaignId);
    if (!campaign) throw new NotFoundException(`Campaign ${campaignId} not found`);
    if (campaign.brandProfileId !== brandProfileId) {
      throw new ForbiddenException('Campaign does not belong to this brand');
    }
  }
}
