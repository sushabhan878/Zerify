import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { FinancialAccountType, LedgerDirection, Prisma } from '@prisma/client';
import { PaymentRepository, PrismaLike } from './payment.repository';

/** One leg of a balanced ledger transaction. */
export interface LedgerLeg {
  ownerType: string;
  ownerId?: string | null;
  accountType: FinancialAccountType;
  direction: LedgerDirection;
  amountMinor: bigint;
}

export interface PostTransactionInput {
  referenceType: string;
  referenceId: string;
  description?: string;
  /** Unique per logical financial event — guarantees no double-posting. */
  idempotencyKey: string;
  currency?: string;
  legs: LedgerLeg[];
}

/**
 * Immutable double-entry ledger.
 *
 * Balances are never stored as a mutable column that gets incremented.
 * Instead every movement is recorded as entries and balances are derived by
 * summing them (TRD §8, §23). The key invariant — enforced here, not by
 * convention — is that every transaction's debits equal its credits (§44).
 */
@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(private readonly repository: PaymentRepository) {}

  /**
   * Posts a balanced transaction.
   *
   * Idempotent: replaying the same `idempotencyKey` returns the existing
   * transaction instead of double-posting. Callers can pass an active
   * transaction client so the post commits atomically with the business state
   * change it accompanies (TRD §26).
   *
   * @returns the ledger transaction id and whether it was newly created.
   */
  async postTransaction(
    input: PostTransactionInput,
    client?: PrismaLike,
  ): Promise<{ transactionId: string; created: boolean }> {
    const currency = input.currency ?? 'INR';

    // Replay check first: a repeated event must never create a second posting.
    const existing = await this.repository.findLedgerTransactionByIdempotencyKey(
      input.idempotencyKey,
      client,
    );
    if (existing) {
      this.logger.debug(`Ledger transaction already posted for key=${input.idempotencyKey}`);
      return { transactionId: existing.id, created: false };
    }

    if (!input.legs || input.legs.length < 2) {
      throw new BadRequestException('A ledger transaction requires at least two legs');
    }

    for (const leg of input.legs) {
      if (leg.amountMinor < 0n) {
        throw new BadRequestException('Ledger leg amounts cannot be negative');
      }
    }

    const totalDebits = input.legs
      .filter((l) => l.direction === LedgerDirection.DEBIT)
      .reduce((sum, l) => sum + l.amountMinor, 0n);
    const totalCredits = input.legs
      .filter((l) => l.direction === LedgerDirection.CREDIT)
      .reduce((sum, l) => sum + l.amountMinor, 0n);

    // The core invariant. An unbalanced transaction means a bug upstream, so
    // fail loudly rather than persist corrupt books.
    if (totalDebits !== totalCredits) {
      throw new BadRequestException(
        `Unbalanced ledger transaction: debits=${totalDebits} credits=${totalCredits} (key=${input.idempotencyKey})`,
      );
    }

    if (totalDebits === 0n) {
      throw new BadRequestException('Ledger transaction amount cannot be zero');
    }

    const run = async (tx: PrismaLike) => {
      // Resolve every leg's account (creating on first use) before writing.
      const resolved: {
        accountId: string;
        direction: LedgerDirection;
        amountMinor: bigint;
      }[] = [];
      for (const leg of input.legs) {
        const account = await this.repository.ensureAccount(
          {
            ownerType: leg.ownerType,
            ownerId: leg.ownerId ?? null,
            accountType: leg.accountType,
            currency,
          },
          tx,
        );
        resolved.push({ accountId: account.id, direction: leg.direction, amountMinor: leg.amountMinor });
      }

      const transaction = await tx.ledgerTransaction.create({
        data: {
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          description: input.description ?? null,
          idempotencyKey: input.idempotencyKey,
          entries: {
            create: resolved.map((leg) => ({
              accountId: leg.accountId,
              direction: leg.direction,
              amountMinor: leg.amountMinor,
              currency,
            })),
          },
        },
      });

      return transaction.id;
    };

    try {
      const transactionId = client
        ? await run(client)
        : await this.repository.runInTransaction((tx) => run(tx));

      this.logger.log(
        `Posted ledger transaction ${transactionId} (${input.referenceType}:${input.referenceId}) debits=${totalDebits}`,
      );
      return { transactionId, created: true };
    } catch (error) {
      // A concurrent caller won the race on the unique idempotency key; their
      // posting is the authoritative one.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        input.idempotencyKey
      ) {
        const winner = await this.repository.findLedgerTransactionByIdempotencyKey(
          input.idempotencyKey,
          client,
        );
        if (winner) {
          this.logger.debug(
            `Ledger transaction race resolved for key=${input.idempotencyKey}; using existing`,
          );
          return { transactionId: winner.id, created: false };
        }
      }
      throw error;
    }
  }

  // ---------------------------------------------------------------- conveniences

  /**
   * Brand funds a campaign: money moves from the brand's funds into the
   * campaign's ring-fenced bucket (TRD §8.3).
   */
  async postCampaignFunding(
    params: {
      paymentId: string;
      brandProfileId: string;
      campaignId: string;
      amountMinor: bigint;
      currency?: string;
    },
    client?: PrismaLike,
  ) {
    return this.postTransaction(
      {
        referenceType: 'PAYMENT',
        referenceId: params.paymentId,
        description: 'Campaign funding',
        idempotencyKey: `payment:${params.paymentId}:funding`,
        currency: params.currency,
        legs: [
          {
            ownerType: 'PLATFORM',
            ownerId: null,
            accountType: FinancialAccountType.PAYMENT_CLEARING,
            direction: LedgerDirection.DEBIT,
            amountMinor: params.amountMinor,
          },
          {
            ownerType: 'CAMPAIGN',
            ownerId: params.campaignId,
            accountType: FinancialAccountType.CAMPAIGN_FUNDS,
            direction: LedgerDirection.CREDIT,
            amountMinor: params.amountMinor,
          },
        ],
      },
      client,
    );
  }

  /**
   * Campaign settles (TRD §8.3): the ring-fenced funds are split into the
   * influencer's payable, Zerify's revenue, and the tax withheld for the
   * authority.
   *
   * `influencerProfileId` attributes the payable to a specific person so their
   * balance can be queried directly. When the payable has no confirmed
   * participant yet it stays in the campaign's own payable bucket until
   * {@link postPayableTransfer} moves it.
   */
  async postCampaignSettlement(
    params: {
      referenceId: string;
      campaignId: string;
      influencerProfileId?: string | null;
      totalAmountMinor: bigint;
      influencerPayableMinor: bigint;
      platformFeeMinor: bigint;
      taxAmountMinor?: bigint;
      idempotencyKey: string;
      currency?: string;
    },
    client?: PrismaLike,
  ) {
    const legs: LedgerLeg[] = [
      {
        ownerType: 'CAMPAIGN',
        ownerId: params.campaignId,
        accountType: FinancialAccountType.CAMPAIGN_FUNDS,
        direction: LedgerDirection.DEBIT,
        amountMinor: params.totalAmountMinor,
      },
    ];

    if (params.influencerPayableMinor > 0n) {
      legs.push({
        ownerType: params.influencerProfileId ? 'INFLUENCER' : 'CAMPAIGN',
        ownerId: params.influencerProfileId ?? params.campaignId,
        accountType: FinancialAccountType.INFLUENCER_PAYABLE,
        direction: LedgerDirection.CREDIT,
        amountMinor: params.influencerPayableMinor,
      });
    }

    // Revenue and tax are separate accounts: the tax portion is held for the
    // authority and is not Zerify's to spend (§47).
    const platformRevenueMinor = params.platformFeeMinor - (params.taxAmountMinor ?? 0n);
    if (platformRevenueMinor > 0n) {
      legs.push({
        ownerType: 'PLATFORM',
        ownerId: null,
        accountType: FinancialAccountType.PLATFORM_REVENUE,
        direction: LedgerDirection.CREDIT,
        amountMinor: platformRevenueMinor,
      });
    }

    if ((params.taxAmountMinor ?? 0n) > 0n) {
      legs.push({
        ownerType: 'PLATFORM',
        ownerId: null,
        accountType: FinancialAccountType.TAX_PAYABLE,
        direction: LedgerDirection.CREDIT,
        amountMinor: params.taxAmountMinor as bigint,
      });
    }

    return this.postTransaction(
      {
        referenceType: 'CAMPAIGN_SETTLEMENT',
        referenceId: params.referenceId,
        description: 'Campaign settlement',
        idempotencyKey: params.idempotencyKey,
        currency: params.currency,
        legs,
      },
      client,
    );
  }

  /**
   * Moves a payable held at campaign level to the influencer it belongs to,
   * once their participation is confirmed.
   */
  async postPayableTransfer(
    params: {
      referenceId: string;
      campaignId: string;
      influencerProfileId: string;
      amountMinor: bigint;
      idempotencyKey: string;
      currency?: string;
    },
    client?: PrismaLike,
  ) {
    return this.postTransaction(
      {
        referenceType: 'PAYABLE_TRANSFER',
        referenceId: params.referenceId,
        description: 'Payable attributed to influencer',
        idempotencyKey: params.idempotencyKey,
        currency: params.currency,
        legs: [
          {
            ownerType: 'CAMPAIGN',
            ownerId: params.campaignId,
            accountType: FinancialAccountType.INFLUENCER_PAYABLE,
            direction: LedgerDirection.DEBIT,
            amountMinor: params.amountMinor,
          },
          {
            ownerType: 'INFLUENCER',
            ownerId: params.influencerProfileId,
            accountType: FinancialAccountType.INFLUENCER_PAYABLE,
            direction: LedgerDirection.CREDIT,
            amountMinor: params.amountMinor,
          },
        ],
      },
      client,
    );
  }

  /**
   * Influencer payable is released to the payout clearing position.
   * Posted when a payout is successfully dispatched.
   */
  async postPayoutRelease(
    params: {
      payoutId: string;
      influencerProfileId: string;
      campaignId?: string | null;
      amountMinor: bigint;
      currency?: string;
    },
    client?: PrismaLike,
  ) {
    return this.postTransaction(
      {
        referenceType: 'PAYOUT',
        referenceId: params.payoutId,
        description: 'Influencer payout release',
        idempotencyKey: `payout:${params.payoutId}:release`,
        currency: params.currency,
        legs: [
          {
            ownerType: 'INFLUENCER',
            ownerId: params.influencerProfileId,
            accountType: FinancialAccountType.INFLUENCER_PAYABLE,
            direction: LedgerDirection.DEBIT,
            amountMinor: params.amountMinor,
          },
          {
            ownerType: 'PLATFORM',
            ownerId: null,
            accountType: FinancialAccountType.PAYMENT_CLEARING,
            direction: LedgerDirection.CREDIT,
            amountMinor: params.amountMinor,
          },
        ],
      },
      client,
    );
  }

  /**
   * Refund reversal: campaign funds return to the brand, reversing the
   * original funding posting (TRD §14).
   */
  async postRefund(
    params: {
      refundId: string;
      campaignId?: string | null;
      brandProfileId?: string | null;
      amountMinor: bigint;
      currency?: string;
    },
    client?: PrismaLike,
  ) {
    return this.postTransaction(
      {
        referenceType: 'REFUND',
        referenceId: params.refundId,
        description: 'Payment refund',
        idempotencyKey: `refund:${params.refundId}:reversal`,
        currency: params.currency,
        legs: [
          {
            ownerType: params.campaignId ? 'CAMPAIGN' : 'PLATFORM',
            ownerId: params.campaignId ?? null,
            accountType: params.campaignId
              ? FinancialAccountType.CAMPAIGN_FUNDS
              : FinancialAccountType.PAYMENT_CLEARING,
            direction: LedgerDirection.DEBIT,
            amountMinor: params.amountMinor,
          },
          {
            ownerType: 'PLATFORM',
            ownerId: null,
            accountType: FinancialAccountType.REFUNDS,
            direction: LedgerDirection.CREDIT,
            amountMinor: params.amountMinor,
          },
        ],
      },
      client,
    );
  }

  /**
   * Dispute resolution release (PRD §24): moves exactly the adjudicated
   * amount from the campaign's funds to the influencer's payable.
   *
   * Deliberately bypasses the fee engine — a dispute outcome is an admin
   * decision about money that already sits in the campaign bucket, and the
   * released amount is credited to the influencer in full.
   */
  async postDisputeRelease(
    params: {
      disputeId: string;
      campaignId: string;
      influencerProfileId: string;
      amountMinor: bigint;
      currency?: string;
    },
    client?: PrismaLike,
  ) {
    return this.postTransaction(
      {
        referenceType: 'DISPUTE_RELEASE',
        referenceId: params.disputeId,
        description: 'Dispute resolution: funds released to influencer',
        idempotencyKey: `dispute:${params.disputeId}:release:${params.influencerProfileId}`,
        currency: params.currency,
        legs: [
          {
            ownerType: 'CAMPAIGN',
            ownerId: params.campaignId,
            accountType: FinancialAccountType.CAMPAIGN_FUNDS,
            direction: LedgerDirection.DEBIT,
            amountMinor: params.amountMinor,
          },
          {
            ownerType: 'INFLUENCER',
            ownerId: params.influencerProfileId,
            accountType: FinancialAccountType.INFLUENCER_PAYABLE,
            direction: LedgerDirection.CREDIT,
            amountMinor: params.amountMinor,
          },
        ],
      },
      client,
    );
  }

  /** Current spendable balance for an account bucket. */
  async getBalance(
    params: {
      ownerType: string;
      ownerId?: string | null;
      accountType: FinancialAccountType;
      currency?: string;
    },
    client?: PrismaLike,
  ): Promise<bigint> {
    const account = await this.repository.ensureAccount(
      {
        ownerType: params.ownerType,
        ownerId: params.ownerId ?? null,
        accountType: params.accountType,
        currency: params.currency ?? 'INR',
      },
      client,
    );
    return this.repository.getAccountBalance(account.id, client);
  }
}
