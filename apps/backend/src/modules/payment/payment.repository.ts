import { Injectable, Logger } from '@nestjs/common';
import {
  Dispute,
  DisputeOpenedBy,
  DisputeResolution,
  DisputeStatus,
  FinancialAccountType,
  LedgerDirection,
  PaymentStatus,
  PayoutStatus,
  Prisma,
  RefundStatus,
  WebhookProcessingStatus,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

/** Prisma client or an active interactive-transaction client. */
export type PrismaLike = Prisma.TransactionClient | PrismaService;

/**
 * All Payments-domain database access lives here.
 *
 * Every write accepts an optional {@link PrismaLike} so callers can compose
 * several mutations into one atomic transaction (TRD §26). Nothing in this
 * layer performs business validation — that belongs in the services.
 */
@Injectable()
export class PaymentRepository {
  private readonly logger = new Logger(PaymentRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------- payments

  async findPaymentById(id: string, client: PrismaLike = this.prisma) {
    return client.zerifyPayment.findUnique({ where: { id } });
  }

  async findPaymentByIdempotencyKey(idempotencyKey: string, client: PrismaLike = this.prisma) {
    return client.zerifyPayment.findUnique({ where: { idempotencyKey } });
  }

  async findPaymentByProviderOrderId(
    providerOrderId: string,
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyPayment.findFirst({ where: { providerOrderId } });
  }

  /**
   * An in-flight or successful payment for the same campaign + amount, used to
   * reject duplicate funding attempts before an order is created (TRD §33).
   */
  async findActivePaymentForCampaign(
    campaignId: string,
    amountMinor: bigint,
    currency: string,
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyPayment.findFirst({
      where: {
        campaignId,
        amountMinor,
        currency,
        status: {
          in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.SUCCESSFUL],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPayment(
    data: {
      userId: string;
      brandProfileId?: string | null;
      campaignId?: string | null;
      provider: string;
      amountMinor: bigint;
      currency: string;
      idempotencyKey: string;
      metadata?: Prisma.InputJsonValue;
    },
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyPayment.create({ data });
  }

  async updatePayment(
    id: string,
    data: Prisma.ZerifyPaymentUpdateInput,
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyPayment.update({ where: { id }, data });
  }

  /** Sum of refunds already recorded against a payment (any non-failed state). */
  async sumRefundsForPayment(paymentId: string, client: PrismaLike = this.prisma): Promise<bigint> {
    const result = await client.zerifyRefund.aggregate({
      where: {
        paymentId,
        status: { in: [RefundStatus.PENDING, RefundStatus.PROCESSING, RefundStatus.COMPLETED] },
      },
      _sum: { amountMinor: true },
    });
    return result._sum.amountMinor ?? 0n;
  }

  async listPaymentsForUser(
    userId: string,
    options: { campaignId?: string; status?: PaymentStatus; take?: number } = {},
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyPayment.findMany({
      where: {
        userId,
        ...(options.campaignId ? { campaignId: options.campaignId } : {}),
        ...(options.status ? { status: options.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: options.take ?? 50,
    });
  }

  // ---------------------------------------------------------------- refunds

  async findRefundById(id: string, client: PrismaLike = this.prisma) {
    return client.zerifyRefund.findUnique({ where: { id } });
  }

  async findRefundByIdempotencyKey(key: string, client: PrismaLike = this.prisma) {
    return client.zerifyRefund.findUnique({ where: { idempotencyKey: key } });
  }

  async findRefundByProviderRefundId(
    providerRefundId: string,
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyRefund.findFirst({ where: { providerRefundId } });
  }

  async createRefund(
    data: {
      paymentId: string;
      provider: string;
      amountMinor: bigint;
      currency: string;
      idempotencyKey: string;
      reason?: string | null;
    },
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyRefund.create({ data });
  }

  async updateRefund(
    id: string,
    data: Prisma.ZerifyRefundUpdateInput,
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyRefund.update({ where: { id }, data });
  }

  async listRefundsForPayment(paymentId: string, client: PrismaLike = this.prisma) {
    return client.zerifyRefund.findMany({
      where: { paymentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------------------------------------------------------- ledger

  /**
   * Finds or creates the account for an (ownerType, ownerId, accountType,
   * currency) tuple. Accounts are stable identifiers for a money bucket, so
   * they are created lazily on first use.
   */
  async ensureAccount(
    params: {
      ownerType: string;
      ownerId?: string | null;
      accountType: FinancialAccountType;
      currency: string;
    },
    client: PrismaLike = this.prisma,
  ) {
    const existing = await client.financialAccount.findFirst({
      where: {
        ownerType: params.ownerType,
        ownerId: params.ownerId ?? null,
        accountType: params.accountType,
        currency: params.currency,
      },
    });
    if (existing) return existing;

    return client.financialAccount.create({
      data: {
        ownerType: params.ownerType,
        ownerId: params.ownerId ?? null,
        accountType: params.accountType,
        currency: params.currency,
        status: 'ACTIVE',
      },
    });
  }

  async findLedgerTransactionByIdempotencyKey(key: string, client: PrismaLike = this.prisma) {
    return client.ledgerTransaction.findUnique({
      where: { idempotencyKey: key },
      include: { entries: true },
    });
  }

  /** Signed balance for one account: credits positive, debits negative. */
  async getAccountBalance(accountId: string, client: PrismaLike = this.prisma): Promise<bigint> {
    const [credits, debits] = await Promise.all([
      client.ledgerEntry.aggregate({
        where: { accountId, direction: LedgerDirection.CREDIT },
        _sum: { amountMinor: true },
      }),
      client.ledgerEntry.aggregate({
        where: { accountId, direction: LedgerDirection.DEBIT },
        _sum: { amountMinor: true },
      }),
    ]);

    return (credits._sum.amountMinor ?? 0n) - (debits._sum.amountMinor ?? 0n);
  }

  async listLedgerEntriesForAccount(
    accountId: string,
    options: { take?: number } = {},
    client: PrismaLike = this.prisma,
  ) {
    return client.ledgerEntry.findMany({
      where: { accountId },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
      take: options.take ?? 100,
    });
  }

  // ---------------------------------------------------------------- campaign finance

  async findCampaignFinance(campaignId: string, client: PrismaLike = this.prisma) {
    return client.campaignFinance.findUnique({ where: { campaignId } });
  }

  /**
   * Updates a campaign's financial position, creating the row on first use.
   *
   * Only the fields supplied are written, so callers that touch a single
   * counter (a refund, a completed payout) never clobber the others with
   * stale values read outside their own transaction.
   */
  async upsertCampaignFinance(
    campaignId: string,
    data: {
      currency?: string;
      grossBudgetMinor?: bigint;
      fundedAmountMinor?: bigint;
      committedAmountMinor?: bigint;
      influencerPayableMinor?: bigint;
      platformFeeMinor?: bigint;
      taxAmountMinor?: bigint;
      refundedAmountMinor?: bigint;
      paidOutAmountMinor?: bigint;
      remainingAmountMinor?: bigint;
      isFunded?: boolean;
      fundedAt?: Date | null;
      feePlanId?: string | null;
      feeRatePercent?: number | null;
      feeCalculationSnapshot?: Prisma.InputJsonValue;
    },
    client: PrismaLike = this.prisma,
  ) {
    return client.campaignFinance.upsert({
      where: { campaignId },
      create: {
        campaign: { connect: { id: campaignId } },
        ...data,
      },
      update: data,
    });
  }

  // ---------------------------------------------------------------- payouts

  async findPayoutById(id: string, client: PrismaLike = this.prisma) {
    return client.zerifyPayout.findUnique({ where: { id } });
  }

  async findPayoutByIdempotencyKey(key: string, client: PrismaLike = this.prisma) {
    return client.zerifyPayout.findUnique({ where: { idempotencyKey: key } });
  }

  async findPayoutByProviderPayoutId(
    providerPayoutId: string,
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyPayout.findFirst({ where: { providerPayoutId } });
  }

  /** Guards against paying an influencer twice for the same campaign (TRD §34). */
  async findBlockingPayout(
    influencerProfileId: string,
    campaignId: string | null,
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyPayout.findFirst({
      where: {
        influencerProfileId,
        campaignId,
        status: { in: [PayoutStatus.PENDING, PayoutStatus.PROCESSING, PayoutStatus.COMPLETED] },
      },
    });
  }

  async createPayout(
    data: {
      influencerProfileId: string;
      campaignId?: string | null;
      beneficiaryId?: string | null;
      provider: string;
      amountMinor: bigint;
      currency: string;
      idempotencyKey: string;
      grossAmountMinor?: bigint | null;
      tdsAmountMinor?: bigint | null;
      netPayoutMinor?: bigint | null;
      taxCategory?: string | null;
      invoiceReference?: string | null;
      metadata?: Prisma.InputJsonValue;
    },
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyPayout.create({ data });
  }

  async updatePayout(
    id: string,
    data: Prisma.ZerifyPayoutUpdateInput,
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyPayout.update({ where: { id }, data });
  }

  async listPayoutsForInfluencer(
    influencerProfileId: string,
    options: { status?: PayoutStatus; take?: number } = {},
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyPayout.findMany({
      where: {
        influencerProfileId,
        ...(options.status ? { status: options.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: options.take ?? 50,
    });
  }

  // ---------------------------------------------------------------- beneficiaries

  async findBeneficiaryById(id: string, client: PrismaLike = this.prisma) {
    return client.payoutBeneficiary.findUnique({ where: { id } });
  }

  async findBeneficiaryByInfluencer(
    influencerProfileId: string,
    client: PrismaLike = this.prisma,
  ) {
    return client.payoutBeneficiary.findUnique({ where: { influencerProfileId } });
  }

  /**
   * Creates or updates an influencer's payout destination. Only
   * non-sensitive metadata and a provider token are accepted here — raw bank
   * credentials are never persisted (TRD §16).
   */
  async upsertBeneficiary(
    influencerProfileId: string,
    data: {
      provider: string;
      providerBeneficiaryId?: string | null;
      kycStatus: string;
      beneficiaryStatus: string;
      accountHolderName?: string | null;
      bankName?: string | null;
      accountLast4?: string | null;
      ifscCode?: string | null;
      verifiedAt?: Date | null;
    },
    client: PrismaLike = this.prisma,
  ) {
    const { provider, ...rest } = data;
    return client.payoutBeneficiary.upsert({
      where: { influencerProfileId },
      create: {
        influencerProfileId,
        provider,
        ...rest,
      },
      update: { provider, ...rest },
    });
  }

  // ---------------------------------------------------------------- webhooks

  async findWebhookEventByHash(eventHash: string, client: PrismaLike = this.prisma) {
    return client.webhookEvent.findUnique({ where: { eventHash } });
  }

  async createWebhookEvent(
    data: {
      provider: string;
      eventType: string;
      providerEventId?: string | null;
      eventHash: string;
      payload: Prisma.InputJsonValue;
      signatureValid: boolean;
    },
    client: PrismaLike = this.prisma,
  ) {
    return client.webhookEvent.create({ data });
  }

  async updateWebhookEvent(
    id: string,
    data: Prisma.WebhookEventUpdateInput,
    client: PrismaLike = this.prisma,
  ) {
    return client.webhookEvent.update({ where: { id }, data });
  }

  /**
   * Atomically takes ownership of an event for processing.
   *
   * The status filter is the concurrency control: two simultaneous deliveries
   * of the same event result in exactly one winner, and the loser gets `null`
   * rather than a second execution of the side effects (TRD §13).
   */
  async claimWebhookEvent(id: string, client: PrismaLike = this.prisma) {
    const result = await client.webhookEvent.updateMany({
      where: {
        id,
        processingStatus: { in: [WebhookProcessingStatus.PENDING, WebhookProcessingStatus.FAILED] },
      },
      data: {
        processingStatus: WebhookProcessingStatus.PROCESSING,
        attempts: { increment: 1 },
      },
    });

    if (result.count === 0) return null;
    return client.webhookEvent.findUnique({ where: { id } });
  }

  /** Requeues events that were accepted but never finished processing. */
  async findStalledWebhookEvents(maxAttempts = 5, take = 20, client: PrismaLike = this.prisma) {
    return client.webhookEvent.findMany({
      where: {
        processingStatus: { in: [WebhookProcessingStatus.PENDING, WebhookProcessingStatus.FAILED] },
        attempts: { lt: maxAttempts },
      },
      orderBy: { receivedAt: 'asc' },
      take,
    });
  }

  async listWebhookEvents(
    options: { status?: WebhookProcessingStatus; take?: number } = {},
    client: PrismaLike = this.prisma,
  ) {
    return client.webhookEvent.findMany({
      where: options.status ? { processingStatus: options.status } : {},
      orderBy: { receivedAt: 'desc' },
      take: options.take ?? 100,
    });
  }

  // ---------------------------------------------------------------- unit of work

  /**
   * Runs `fn` inside one interactive transaction. Services use this to make a
   * business state change and its ledger posting commit or roll back together
   * (TRD §26). Callers already holding a `PrismaLike` should pass it down
   * rather than nesting a second transaction.
   */
  async runInTransaction<T>(fn: (client: PrismaLike) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) => fn(tx));
  }

  // ---------------------------------------------------------------- campaigns

  /** Minimal campaign lookup used for ownership checks on financial actions. */
  async findCampaignById(id: string, client: PrismaLike = this.prisma) {
    return client.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        brandProfileId: true,
        status: true,
        title: true,
        budgetCurrency: true,
        budgetTotalAmount: true,
      },
    });
  }

  /** Participant record for a campaign, used to resolve the payable party. */
  async findCampaignParticipant(
    campaignId: string,
    influencerProfileId: string,
    client: PrismaLike = this.prisma,
  ) {
    return client.campaignParticipant.findUnique({
      where: { campaignId_influencerProfileId: { campaignId, influencerProfileId } },
    });
  }

  // ---------------------------------------------------------------- disputes

  async findDisputeById(id: string, client: PrismaLike = this.prisma) {
    return client.dispute.findUnique({
      where: { id },
      include: { payment: true },
    });
  }

  async findOpenDisputeForPayment(paymentId: string, client: PrismaLike = this.prisma) {
    return client.dispute.findFirst({
      where: {
        paymentId,
        status: { in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW] },
      },
    });
  }

  /** Any open dispute attached to a payment of the given campaign. */
  async findOpenDisputeForCampaign(campaignId: string, client: PrismaLike = this.prisma) {
    return client.dispute.findFirst({
      where: {
        campaignId,
        status: { in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW] },
      },
    });
  }

  async createDispute(
    data: {
      paymentId: string;
      campaignId?: string | null;
      influencerProfileId?: string | null;
      brandProfileId?: string | null;
      openedBy: DisputeOpenedBy;
      openedByUserId: string;
      reason: string;
      description?: string | null;
      evidence?: string[];
      requestedResolution?: DisputeResolution | null;
    },
    client: PrismaLike = this.prisma,
  ): Promise<Dispute> {
    return client.dispute.create({
      data: {
        paymentId: data.paymentId,
        campaignId: data.campaignId ?? null,
        influencerProfileId: data.influencerProfileId ?? null,
        brandProfileId: data.brandProfileId ?? null,
        openedBy: data.openedBy,
        openedByUserId: data.openedByUserId,
        reason: data.reason,
        description: data.description ?? null,
        evidence: data.evidence ?? [],
        requestedResolution: data.requestedResolution ?? null,
      },
    });
  }

  async updateDispute(
    id: string,
    data: Prisma.DisputeUpdateInput,
    client: PrismaLike = this.prisma,
  ) {
    return client.dispute.update({ where: { id }, data });
  }

  async listDisputes(
    options: { status?: DisputeStatus; paymentId?: string; take?: number } = {},
    client: PrismaLike = this.prisma,
  ) {
    return client.dispute.findMany({
      where: {
        ...(options.status ? { status: options.status } : {}),
        ...(options.paymentId ? { paymentId: options.paymentId } : {}),
      },
      include: { payment: { select: { amountMinor: true, currency: true, campaignId: true } } },
      orderBy: { createdAt: 'desc' },
      take: options.take ?? 50,
    });
  }

  // ---------------------------------------------------------------- audit

  /**
   * Appends a financial audit record (TRD §22). Insert-only — audit rows are
   * never updated or deleted.
   */
  async createAuditLog(
    data: {
      actorType: string;
      actorId?: string | null;
      action: string;
      entityType: string;
      entityId: string;
      previousStatus?: string | null;
      newStatus?: string | null;
      metadata?: Prisma.InputJsonValue;
      ipAddress?: string | null;
      userAgent?: string | null;
    },
    client: PrismaLike = this.prisma,
  ) {
    return client.financialAuditLog.create({ data });
  }

  async listAuditLogs(
    options: { entityType?: string; entityId?: string; action?: string; take?: number } = {},
    client: PrismaLike = this.prisma,
  ) {
    return client.financialAuditLog.findMany({
      where: {
        ...(options.entityType ? { entityType: options.entityType } : {}),
        ...(options.entityId ? { entityId: options.entityId } : {}),
        ...(options.action ? { action: options.action } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: options.take ?? 100,
    });
  }

  // ---------------------------------------------------------------- admin listings

  /** Admin payment listing with brand/influencer context (TRD §21). */
  async listPaymentsForAdmin(
    options: { status?: PaymentStatus; campaignId?: string; take?: number; skip?: number } = {},
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyPayment.findMany({
      where: {
        ...(options.status ? { status: options.status } : {}),
        ...(options.campaignId ? { campaignId: options.campaignId } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        campaign: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: options.take ?? 50,
      skip: options.skip ?? 0,
    });
  }

  async listPayoutsForAdmin(
    options: { status?: PayoutStatus; take?: number; skip?: number } = {},
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyPayout.findMany({
      where: options.status ? { status: options.status } : {},
      include: {
        beneficiary: { select: { accountHolderName: true, bankName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: options.take ?? 50,
      skip: options.skip ?? 0,
    });
  }

  async listRefundsForAdmin(
    options: { status?: RefundStatus; take?: number } = {},
    client: PrismaLike = this.prisma,
  ) {
    return client.zerifyRefund.findMany({
      where: options.status ? { status: options.status } : {},
      include: { payment: { select: { campaignId: true, userId: true } } },
      orderBy: { createdAt: 'desc' },
      take: options.take ?? 50,
    });
  }

  /** Aggregate counters powering the admin dashboard (TRD §21). */
  async getAdminFinanceSummary(client: PrismaLike = this.prisma) {
    const [paymentsByStatus, payoutsByStatus, refundsByStatus, campaignFinanceAgg] =
      await Promise.all([
        client.zerifyPayment.groupBy({
          by: ['status'],
          _count: { _all: true },
          _sum: { amountMinor: true },
        }),
        client.zerifyPayout.groupBy({
          by: ['status'],
          _count: { _all: true },
          _sum: { amountMinor: true },
        }),
        client.zerifyRefund.groupBy({
          by: ['status'],
          _count: { _all: true },
          _sum: { amountMinor: true },
        }),
        client.campaignFinance.aggregate({
          _count: { _all: true },
          _sum: {
            fundedAmountMinor: true,
            platformFeeMinor: true,
            influencerPayableMinor: true,
            refundedAmountMinor: true,
            paidOutAmountMinor: true,
          },
        }),
      ]);

    const openDisputes = await client.dispute.count({
      where: { status: { in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW] } },
    });

    return { paymentsByStatus, payoutsByStatus, refundsByStatus, campaignFinanceAgg, openDisputes };
  }

  // ---------------------------------------------------------------- helpers

  /** Resolves the influencer profile id for a user, if any. */
  async findInfluencerProfileByUser(userId: string, client: PrismaLike = this.prisma) {
    return client.influencerProfile.findUnique({ where: { userId } });
  }

  /** Resolves the brand profile id for a user, if any. */
  async findBrandProfileByUser(userId: string, client: PrismaLike = this.prisma) {
    return client.brandProfile.findUnique({ where: { userId } });
  }

  /** Lists disputes visible to a user: those they opened or are party to. */
  async listDisputesForUser(
    userId: string,
    options: { status?: DisputeStatus; take?: number } = {},
    client: PrismaLike = this.prisma,
  ) {
    return client.dispute.findMany({
      where: {
        OR: [{ openedByUserId: userId }, { payment: { userId } }],
        ...(options.status ? { status: options.status } : {}),
      },
      include: { payment: { select: { amountMinor: true, currency: true } } },
      orderBy: { createdAt: 'desc' },
      take: options.take ?? 50,
    });
  }
}
