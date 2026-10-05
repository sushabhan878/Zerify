import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PayoutStatus, Prisma } from '@prisma/client';
import { PaymentRepository, PrismaLike } from './payment.repository';
import { LedgerService } from './ledger.service';
import { AuditService } from './audit.service';
import { PaymentProviderFactory } from './providers/payment-provider.factory';
import { PAYMENT_PROVIDER, PaymentProvider } from './payment-provider.interface';
import { toMinor } from './money.util';

/** Legal payout status transitions (TRD §31). */
const PAYOUT_TRANSITIONS: Record<PayoutStatus, PayoutStatus[]> = {
  [PayoutStatus.PENDING]: [PayoutStatus.PROCESSING, PayoutStatus.CANCELLED, PayoutStatus.FAILED],
  [PayoutStatus.PROCESSING]: [PayoutStatus.COMPLETED, PayoutStatus.FAILED],
  // A failed payout is retryable; completed and cancelled are terminal.
  [PayoutStatus.FAILED]: [PayoutStatus.PROCESSING, PayoutStatus.CANCELLED],
  [PayoutStatus.COMPLETED]: [],
  [PayoutStatus.CANCELLED]: [],
};

const MAX_PAYOUT_ATTEMPTS = 5;

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(
    private readonly repository: PaymentRepository,
    private readonly ledger: LedgerService,
    private readonly audit: AuditService,
    private readonly providerFactory: PaymentProviderFactory,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  // ------------------------------------------------------------ beneficiaries

  /**
   * Registers an influencer's payout destination.
   *
   * Only the provider-issued token and non-sensitive display metadata are
   * stored. Raw bank credentials never reach Zerify's database (TRD §16).
   */
  async upsertBeneficiary(params: {
    influencerProfileId: string;
    provider?: string;
    providerBeneficiaryId?: string;
    kycStatus?: string;
    beneficiaryStatus?: string;
    accountHolderName?: string;
    bankName?: string;
    accountLast4?: string;
    ifscCode?: string;
  }) {
    if (params.accountLast4 && !/^\d{4}$/.test(params.accountLast4)) {
      throw new BadRequestException('accountLast4 must be exactly four digits');
    }

    return this.repository.upsertBeneficiary(params.influencerProfileId, {
      provider: params.provider ?? 'CASHFREE',
      providerBeneficiaryId: params.providerBeneficiaryId ?? null,
      kycStatus: params.kycStatus ?? 'PENDING',
      beneficiaryStatus: params.beneficiaryStatus ?? 'PENDING',
      accountHolderName: params.accountHolderName ?? null,
      bankName: params.bankName ?? null,
      accountLast4: params.accountLast4 ?? null,
      ifscCode: params.ifscCode ?? null,
      verifiedAt: params.kycStatus === 'VERIFIED' ? new Date() : null,
    });
  }

  async getBeneficiary(influencerProfileId: string) {
    return this.repository.findBeneficiaryByInfluencer(influencerProfileId);
  }

  // ------------------------------------------------------------------ payouts

  /**
   * Creates and dispatches a payout (TRD §34).
   *
   * Guarded four ways: the beneficiary must be KYC-verified, no payout for the
   * same influencer+campaign may be in flight or completed, the influencer's
   * payable balance must cover it, and the idempotency key must be unused.
   */
  async createPayout(params: {
    influencerProfileId: string;
    campaignId?: string | null;
    amount?: string | number;
    currency?: string;
    idempotencyKey?: string;
    tdsPercent?: number;
    invoiceReference?: string;
  }) {
    const currency = (params.currency ?? 'INR').toUpperCase();

    if (params.idempotencyKey) {
      const existing = await this.repository.findPayoutByIdempotencyKey(params.idempotencyKey);
      if (existing) {
        this.logger.debug(`Replaying payout for key=${params.idempotencyKey}`);
        return existing;
      }
    }

    const beneficiary = await this.repository.findBeneficiaryByInfluencer(
      params.influencerProfileId,
    );
    if (!beneficiary) {
      throw new BadRequestException('Influencer has no payout beneficiary configured');
    }
    // Paying an unverified destination is how money leaves the platform for
    // good — refuse it outright (TRD §16).
    if (beneficiary.kycStatus !== 'VERIFIED' || beneficiary.beneficiaryStatus !== 'ACTIVE') {
      throw new ForbiddenException(
        `Beneficiary is not payout-ready (kyc=${beneficiary.kycStatus}, status=${beneficiary.beneficiaryStatus})`,
      );
    }
    if (!beneficiary.providerBeneficiaryId) {
      throw new BadRequestException('Beneficiary has no provider reference');
    }

    if (params.campaignId) {
      const blocking = await this.repository.findBlockingPayout(
        params.influencerProfileId,
        params.campaignId,
      );
      if (blocking) {
        throw new ConflictException(
          `A payout for this campaign is already ${blocking.status} (${blocking.id})`,
        );
      }

      // Campaign money under an open dispute is frozen for everyone (PRD §24).
      const dispute = await this.repository.findOpenDisputeForCampaign(params.campaignId);
      if (dispute) {
        throw new ConflictException(
          `Campaign is under an open dispute (${dispute.id}); payouts blocked until resolution`,
        );
      }
    }

    // A payout may never exceed what the influencer has actually earned; the
    // ledger balance is the authority, not a client-supplied number.
    const payableBalance = await this.ledger.getBalance({
      ownerType: 'INFLUENCER',
      ownerId: params.influencerProfileId,
      accountType: 'INFLUENCER_PAYABLE' as any,
      currency,
    });

    const grossMinor = params.amount
      ? BigInt(toMinor(params.amount, currency))
      : payableBalance;

    if (grossMinor <= 0n) {
      throw new BadRequestException('Nothing payable for this influencer');
    }
    if (grossMinor > payableBalance) {
      throw new ConflictException(
        `Requested payout exceeds the influencer's payable balance`,
      );
    }

    // TDS is withheld at source; the influencer receives the net amount.
    const tdsPercent = params.tdsPercent ?? 0;
    const tdsAmountMinor =
      tdsPercent > 0
        ? (grossMinor * BigInt(Math.round(tdsPercent * 100))) / 10000n
        : 0n;
    const netPayoutMinor = grossMinor - tdsAmountMinor;

    const payout = await this.repository.createPayout({
      influencerProfileId: params.influencerProfileId,
      campaignId: params.campaignId ?? null,
      beneficiaryId: beneficiary.id,
      provider: beneficiary.provider ?? 'CASHFREE',
      amountMinor: netPayoutMinor,
      currency,
      grossAmountMinor: grossMinor,
      tdsAmountMinor,
      netPayoutMinor,
      taxCategory: tdsAmountMinor > 0n ? 'TDS_194J' : null,
      invoiceReference: params.invoiceReference ?? null,
      idempotencyKey:
        params.idempotencyKey ??
        `payout:${params.influencerProfileId}:${params.campaignId ?? 'wallet'}:${grossMinor}`,
    });

    // The provider call happens outside any transaction: a network round trip
    // must never hold a database transaction open.
    return this.dispatch(payout.id);
  }

  /**
   * Sends a payout to the provider. Split out so retries reuse the same path.
   *
   * The state write and its ledger posting share one transaction, but the
   * provider call itself sits before it — a slow or failed provider response
   * leaves no partial financial state behind.
   */
  private async dispatch(payoutId: string) {
    const payout = await this.repository.findPayoutById(payoutId);
    if (!payout) throw new NotFoundException(`Payout ${payoutId} not found`);

    if (!PAYOUT_TRANSITIONS[payout.status]?.includes(PayoutStatus.PROCESSING)) {
      throw new ConflictException(`Payout ${payoutId} cannot be dispatched from ${payout.status}`);
    }
    if (payout.attempts >= MAX_PAYOUT_ATTEMPTS) {
      throw new ConflictException(
        `Payout ${payoutId} exhausted its ${MAX_PAYOUT_ATTEMPTS} attempts`,
      );
    }

    const beneficiary = payout.beneficiaryId
      ? await this.repository.findBeneficiaryById(payout.beneficiaryId)
      : null;
    if (!beneficiary?.providerBeneficiaryId) {
      throw new BadRequestException('Payout has no provider beneficiary reference');
    }

    const provider = this.providerFactory.getProvider(payout.provider);
    const result = await provider.createPayout({
      payoutId: payout.id,
      beneficiaryReference: beneficiary.providerBeneficiaryId,
      amountMinor: Number(payout.amountMinor),
      currency: payout.currency,
    });

    const status = this.mapProviderPayoutStatus(result.status);

    return this.repository.runInTransaction(async (client) => {
      const updated = await this.repository.updatePayout(
        payout.id,
        {
          status,
          providerPayoutId: result.providerPayoutId,
          attempts: payout.attempts + 1,
          lastAttemptAt: new Date(),
        },
        client,
      );

      await this.audit.record(
        {
          action: 'PAYOUT_DISPATCHED',
          entityType: 'PAYOUT',
          entityId: payout.id,
          previousStatus: payout.status,
          newStatus: status,
          metadata: {
            influencerProfileId: payout.influencerProfileId,
            campaignId: payout.campaignId ?? null,
            providerPayoutId: result.providerPayoutId,
            attempt: payout.attempts + 1,
          },
        },
        { actorType: 'SYSTEM' },
        client,
      );

      // The payable is only released once the provider has accepted the
      // instruction; a PENDING acknowledgement leaves books untouched.
      if (status === PayoutStatus.PROCESSING || status === PayoutStatus.COMPLETED) {
        await this.ledger.postPayoutRelease(
          {
            payoutId: payout.id,
            influencerProfileId: payout.influencerProfileId,
            campaignId: payout.campaignId,
            amountMinor: payout.amountMinor,
            currency: payout.currency,
          },
          client,
        );
      }

      return updated;
    });
  }

  /** Retries a failed payout (TRD §15). Attempt counting is enforced. */
  async retryPayout(payoutId: string) {
    const payout = await this.repository.findPayoutById(payoutId);
    if (!payout) throw new NotFoundException(`Payout ${payoutId} not found`);
    if (payout.status !== PayoutStatus.FAILED) {
      throw new ConflictException(`Only FAILED payouts can be retried (is ${payout.status})`);
    }
    return this.dispatch(payoutId);
  }

  async getPayout(id: string) {
    const payout = await this.repository.findPayoutById(id);
    if (!payout) throw new NotFoundException(`Payout ${id} not found`);
    return payout;
  }

  /**
   * Reconciles local payout state with the provider, applying webhook-missed
   * transitions (TRD §25).
   */
  async syncPayoutStatus(payoutId: string) {
    const payout = await this.getPayout(payoutId);
    if (!payout.providerPayoutId) {
      throw new BadRequestException('Payout has not been dispatched yet');
    }
    if (payout.status === PayoutStatus.COMPLETED || payout.status === PayoutStatus.CANCELLED) {
      return payout;
    }

    const provider = this.providerFactory.getProvider(payout.provider);
    const status = await provider.getPayout(payout.providerPayoutId);
    return this.applyPayoutStatus(payoutId, this.mapProviderPayoutStatus(status.status), status.failureReason);
  }

  async applyPayoutStatus(
    payoutId: string,
    status: PayoutStatus,
    failureReason?: string,
    failureCode?: string,
    source: 'webhook' | 'api' = 'api',
  ) {
    return this.repository.runInTransaction(async (client) => {
      const payout = await this.repository.findPayoutById(payoutId, client);
      if (!payout) throw new NotFoundException(`Payout ${payoutId} not found`);
      if (payout.status === status) return payout;

      if (!PAYOUT_TRANSITIONS[payout.status]?.includes(status)) {
        this.logger.warn(
          `Ignoring illegal payout transition ${payout.status} → ${status} for ${payoutId}`,
        );
        return payout;
      }

      const updated = await this.repository.updatePayout(
        payoutId,
        {
          status,
          failureReason: failureReason ?? null,
          failureCode: failureCode ?? null,
        },
        client,
      );

      await this.audit.record(
        {
          action: status === PayoutStatus.COMPLETED ? 'PAYOUT_COMPLETED' : 'PAYOUT_STATUS_UPDATED',
          entityType: 'PAYOUT',
          entityId: payoutId,
          previousStatus: payout.status,
          newStatus: status,
          metadata: { failureReason: failureReason ?? null },
        },
        { actorType: source === 'webhook' ? 'WEBHOOK' : 'SYSTEM' },
        client,
      );

      if (status === PayoutStatus.COMPLETED) {
        await this.onPayoutCompleted(updated, client);
      }

      return updated;
    });
  }

  /** Marks the campaign's paid-out total once money has actually left. */
  private async onPayoutCompleted(payout: any, client: PrismaLike) {
    if (!payout.campaignId) return;

    const finance = await this.repository.findCampaignFinance(payout.campaignId, client);
    if (!finance) return;

    const paidOutAmountMinor = finance.paidOutAmountMinor + payout.amountMinor;
    await this.repository.upsertCampaignFinance(
      payout.campaignId,
      {
        paidOutAmountMinor,
        remainingAmountMinor:
          finance.fundedAmountMinor - paidOutAmountMinor - finance.refundedAmountMinor,
      },
      client,
    );
  }

  async listPayouts(influencerProfileId: string, status?: PayoutStatus) {
    return this.repository.listPayoutsForInfluencer(influencerProfileId, { status });
  }

  private mapProviderPayoutStatus(status: string): PayoutStatus {
    switch (status) {
      case 'COMPLETED':
        return PayoutStatus.COMPLETED;
      case 'PROCESSING':
        return PayoutStatus.PROCESSING;
      case 'FAILED':
        return PayoutStatus.FAILED;
      default:
        return PayoutStatus.PROCESSING;
    }
  }
}
