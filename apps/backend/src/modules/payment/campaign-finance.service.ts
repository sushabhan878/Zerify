import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FinancialAccountType, Prisma } from '@prisma/client';
import { PaymentRepository, PrismaLike } from './payment.repository';
import { LedgerService } from './ledger.service';
import { FeeEngine } from './fee-engine.service';
import { fromMinor, toMinor } from './money.util';

/**
 * Campaign financial state (TRD §9, §5.3).
 *
 * Every counter on `CampaignFinance` is a projection of ledger activity —
 * the ledger is the source of truth, this row is the fast read model. Both are
 * always written in the same transaction.
 */
@Injectable()
export class CampaignFinanceService {
  private readonly logger = new Logger(CampaignFinanceService.name);

  constructor(
    private readonly repository: PaymentRepository,
    private readonly ledger: LedgerService,
    private readonly feeEngine: FeeEngine,
  ) {}

  /** Returns the campaign's financial position, synthesising a zeroed view. */
  async getFinance(campaignId: string, actorBrandProfileId?: string | null) {
    const campaign = await this.repository.findCampaignById(campaignId);
    if (!campaign) throw new NotFoundException(`Campaign ${campaignId} not found`);

    if (actorBrandProfileId && campaign.brandProfileId !== actorBrandProfileId) {
      throw new ForbiddenException('Campaign does not belong to this brand');
    }

    const finance = await this.repository.findCampaignFinance(campaignId);
    const currency = finance?.currency ?? campaign.budgetCurrency ?? 'INR';

    const campaignFunds = await this.ledger.getBalance({
      ownerType: 'CAMPAIGN',
      ownerId: campaignId,
      accountType: FinancialAccountType.CAMPAIGN_FUNDS,
      currency,
    });

    if (!finance) {
      return {
        campaignId,
        currency,
        grossBudget: fromMinor(0, currency),
        fundedAmount: fromMinor(0, currency),
        influencerPayable: fromMinor(0, currency),
        platformFee: fromMinor(0, currency),
        taxAmount: fromMinor(0, currency),
        refundedAmount: fromMinor(0, currency),
        paidOutAmount: fromMinor(0, currency),
        remainingAmount: fromMinor(0, currency),
        ledgerCampaignFunds: fromMinor(Number(campaignFunds), currency),
        isFunded: false,
        fundedAt: null,
      };
    }

    return {
      campaignId,
      currency,
      grossBudget: fromMinor(Number(finance.grossBudgetMinor), currency),
      fundedAmount: fromMinor(Number(finance.fundedAmountMinor), currency),
      influencerPayable: fromMinor(Number(finance.influencerPayableMinor), currency),
      platformFee: fromMinor(Number(finance.platformFeeMinor), currency),
      taxAmount: fromMinor(Number(finance.taxAmountMinor), currency),
      refundedAmount: fromMinor(Number(finance.refundedAmountMinor), currency),
      paidOutAmount: fromMinor(Number(finance.paidOutAmountMinor), currency),
      remainingAmount: fromMinor(Number(finance.remainingAmountMinor), currency),
      // Surfaced so a divergence between the read model and the ledger is
      // visible rather than silent.
      ledgerCampaignFunds: fromMinor(Number(campaignFunds), currency),
      isFunded: finance.isFunded,
      fundedAt: finance.fundedAt,
      feePlanId: finance.feePlanId,
    };
  }

  /**
   * Sets the campaign's approved budget. This is a commitment only — no money
   * moves and no ledger entry is written until the brand actually pays.
   */
  async setBudget(params: {
    campaignId: string;
    brandProfileId: string;
    grossBudget: string | number;
    currency?: string;
    planId?: string;
  }) {
    const campaign = await this.repository.findCampaignById(params.campaignId);
    if (!campaign) throw new NotFoundException(`Campaign ${params.campaignId} not found`);
    if (campaign.brandProfileId !== params.brandProfileId) {
      throw new ForbiddenException('Campaign does not belong to this brand');
    }

    const currency = (params.currency ?? campaign.budgetCurrency ?? 'INR').toUpperCase();
    const finance = await this.repository.findCampaignFinance(params.campaignId);

    const grossBudgetMinor = BigInt(toMinor(params.grossBudget, currency));

    if (finance?.isFunded && grossBudgetMinor < finance.fundedAmountMinor) {
      throw new ConflictException(
        'Budget cannot be reduced below the amount already funded',
      );
    }

    // Recompute the split against the plan this campaign is pinned to, so the
    // preview shown to the brand matches what funding will produce.
    const planId = finance?.feePlanId ?? params.planId;
    const projectedFunded = finance?.fundedAmountMinor ?? 0n;
    const breakdown =
      projectedFunded > 0n
        ? this.feeEngine.calculate({ baseAmountMinor: projectedFunded, planId, currency })
        : null;

    return this.repository.upsertCampaignFinance(params.campaignId, {
      currency,
      grossBudgetMinor,
      ...(breakdown
        ? {
            influencerPayableMinor: breakdown.influencerPayableMinor,
            platformFeeMinor: breakdown.totalFeeMinor,
            taxAmountMinor: breakdown.taxAmountMinor,
          }
        : {}),
    });
  }

  /**
   * Quotes the fee split for an amount without persisting anything, so the
   * brand can see the breakdown before paying (TRD §47).
   */
  async quote(params: { campaignId: string; amount: string | number; currency?: string }) {
    const campaign = await this.repository.findCampaignById(params.campaignId);
    if (!campaign) throw new NotFoundException(`Campaign ${params.campaignId} not found`);

    const currency = (params.currency ?? campaign.budgetCurrency ?? 'INR').toUpperCase();
    const finance = await this.repository.findCampaignFinance(params.campaignId);
    const amountMinor = BigInt(toMinor(params.amount, currency));

    const breakdown = this.feeEngine.calculate({
      baseAmountMinor: amountMinor,
      planId: finance?.feePlanId ?? undefined,
      currency,
    });

    return {
      currency,
      feePlanId: breakdown.snapshot.feePlanId,
      baseAmount: fromMinor(Number(breakdown.baseAmountMinor), currency),
      influencerPayable: fromMinor(Number(breakdown.influencerPayableMinor), currency),
      platformFee: fromMinor(Number(breakdown.totalFeeMinor), currency),
      taxAmount: fromMinor(Number(breakdown.taxAmountMinor), currency),
      totalFees: fromMinor(Number(breakdown.totalFeeMinor), currency),
      breakdown: breakdown.snapshot,
    };
  }

  /**
   * Records a confirmed influencer's compensation and reserves it against the
   * campaign's funded balance.
   *
   * The committed total can never exceed what has been funded — a campaign
   * cannot promise money it does not hold (TRD §44).
   */
  async commitParticipant(params: {
    campaignId: string;
    brandProfileId: string;
    influencerProfileId: string;
    agreedAmount: string | number;
    currency?: string;
  }) {
    const campaign = await this.repository.findCampaignById(params.campaignId);
    if (!campaign) throw new NotFoundException(`Campaign ${params.campaignId} not found`);
    if (campaign.brandProfileId !== params.brandProfileId) {
      throw new ForbiddenException('Campaign does not belong to this brand');
    }

    const participant = await this.repository.findCampaignParticipant(
      params.campaignId,
      params.influencerProfileId,
    );
    if (!participant) {
      throw new BadRequestException('Influencer is not a participant of this campaign');
    }

    const currency = (params.currency ?? campaign.budgetCurrency ?? 'INR').toUpperCase();
    const amountMinor = BigInt(toMinor(params.agreedAmount, currency));

    return this.repository.runInTransaction(async (client) => {
      const finance = await this.repository.findCampaignFinance(params.campaignId, client);
      if (!finance?.isFunded) {
        throw new ConflictException('Campaign must be funded before compensation is committed');
      }

      const availableMinor =
        finance.fundedAmountMinor - finance.committedAmountMinor - finance.refundedAmountMinor;

      if (amountMinor > availableMinor) {
        throw new ConflictException(
          `Committing ${params.agreedAmount} ${currency} exceeds the campaign's uncommitted balance of ` +
            `${fromMinor(Number(availableMinor), currency)} ${currency}`,
        );
      }

      const committedAmountMinor = finance.committedAmountMinor + amountMinor;

      await this.repository.upsertCampaignFinance(
        params.campaignId,
        { committedAmountMinor },
        client,
      );

      return { campaignId: params.campaignId, influencerProfileId: params.influencerProfileId, committedAmountMinor };
    });
  }

  /**
   * Settles a campaign on completion: the ring-fenced funds are split into the
   * influencer's payable, platform revenue, and tax, and the campaign's
   * payable counter is updated. Idempotent per campaign.
   */
  async settle(params: { campaignId: string; actorBrandProfileId?: string | null }) {
    const campaign = await this.repository.findCampaignById(params.campaignId);
    if (!campaign) throw new NotFoundException(`Campaign ${params.campaignId} not found`);

    if (params.actorBrandProfileId && campaign.brandProfileId !== params.actorBrandProfileId) {
      throw new ForbiddenException('Campaign does not belong to this brand');
    }

    return this.repository.runInTransaction(async (client) => {
      const finance = await this.repository.findCampaignFinance(params.campaignId, client);
      if (!finance?.isFunded) {
        throw new ConflictException('Campaign has not been funded');
      }

      const breakdown = this.feeEngine.calculate({
        baseAmountMinor: finance.fundedAmountMinor,
        planId: finance.feePlanId ?? undefined,
        currency: finance.currency,
      });

      const result = await this.ledger.postCampaignSettlement(
        {
          referenceId: params.campaignId,
          campaignId: params.campaignId,
          totalAmountMinor: finance.fundedAmountMinor,
          influencerPayableMinor: breakdown.influencerPayableMinor,
          platformFeeMinor: breakdown.totalFeeMinor,
          taxAmountMinor: breakdown.taxAmountMinor,
          idempotencyKey: `campaign:${params.campaignId}:settlement`,
          currency: finance.currency,
        },
        client,
      );

      await this.repository.upsertCampaignFinance(
        params.campaignId,
        {
          influencerPayableMinor: breakdown.influencerPayableMinor,
          platformFeeMinor: breakdown.totalFeeMinor,
          taxAmountMinor: breakdown.taxAmountMinor,
          feePlanId: breakdown.snapshot.feePlanId as string,
          feeCalculationSnapshot: breakdown.snapshot as Prisma.InputJsonValue,
        },
        client,
      );

      this.logger.log(
        `Settled campaign ${params.campaignId}: payable=${breakdown.influencerPayableMinor} fee=${breakdown.totalFeeMinor}`,
      );

      return { campaignId: params.campaignId, ...result, breakdown: breakdown.snapshot };
    });
  }

  /**
   * Attributes a settled payable to a specific influencer once their
   * participation is confirmed (TRD §34 — the payable must exist before any
   * payout can be requested).
   */
  async attributePayable(params: {
    campaignId: string;
    influencerProfileId: string;
    amount: string | number;
  }) {
    const finance = await this.repository.findCampaignFinance(params.campaignId);
    if (!finance?.isFunded) {
      throw new ConflictException('Campaign has not been funded');
    }

    const amountMinor = BigInt(toMinor(params.amount, finance.currency));
    if (amountMinor <= 0n) {
      throw new BadRequestException('Payable amount must be positive');
    }

    const heldAtCampaign = await this.ledger.getBalance({
      ownerType: 'CAMPAIGN',
      ownerId: params.campaignId,
      accountType: FinancialAccountType.INFLUENCER_PAYABLE,
      currency: finance.currency,
    });

    if (amountMinor > heldAtCampaign) {
      throw new ConflictException(
        'Payable attribution exceeds the amount held for this campaign',
      );
    }

    return this.ledger.postPayableTransfer(
      {
        referenceId: `${params.campaignId}:${params.influencerProfileId}`,
        campaignId: params.campaignId,
        influencerProfileId: params.influencerProfileId,
        amountMinor,
        idempotencyKey: `payable:${params.campaignId}:${params.influencerProfileId}`,
        currency: finance.currency,
      },
    );
  }

  /** Balance an influencer can be paid out, straight from the ledger. */
  async getInfluencerPayable(influencerProfileId: string, currency = 'INR') {
    const balance = await this.ledger.getBalance({
      ownerType: 'INFLUENCER',
      ownerId: influencerProfileId,
      accountType: FinancialAccountType.INFLUENCER_PAYABLE,
      currency,
    });
    return {
      influencerProfileId,
      currency,
      payableAmount: fromMinor(Number(balance), currency),
    };
  }
}
