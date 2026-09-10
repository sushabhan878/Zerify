import { Injectable, Logger, BadRequestException } from '@nestjs/common';

/**
 * A versioned fee plan (TRD §47–48).
 *
 * Fees are configuration, never hard-coded arithmetic. Each plan is immutable
 * once published: changing pricing means publishing a new version, so a
 * historical transaction can always be recomputed from the plan it recorded.
 */
export interface FeePlan {
  /** Stable version identifier stored on every transaction, e.g. "v1". */
  id: string;
  currency: string;
  /** Percentage of the base amount, e.g. 10 for 10%. */
  platformFeePercent: number;
  /** Flat platform fee in minor units, added to the percentage component. */
  platformFeeFixedMinor: number;
  /** Payment-gateway cost recovered from the brand, as a percentage. */
  paymentFeePercent: number;
  paymentFeeFixedMinor: number;
  /** Optional campaign service fee. */
  serviceFeePercent: number;
  serviceFeeFixedMinor: number;
  /** GST-style tax applied to the fee total, as a percentage. */
  taxPercent: number;
  /** Inclusive tax: deducted from the base instead of added on top. */
  taxInclusive: boolean;
}

export interface FeeBreakdown {
  baseAmountMinor: bigint;
  platformFeeMinor: bigint;
  paymentFeeMinor: bigint;
  serviceFeeMinor: bigint;
  totalFeeMinor: bigint;
  taxAmountMinor: bigint;
  /** Amount left for the influencer after fees and tax. */
  influencerPayableMinor: bigint;
  /** Platform's net revenue: fee total excluding the tax held for the authority. */
  platformNetRevenueMinor: bigint;
  currency: string;
  /** Reproducible record of the plan and inputs used (TRD §48). */
  snapshot: Record<string, unknown>;
}

/**
 * The current plans. Publishing a new price list means adding an entry here
 * and pointing new campaigns at it — existing campaigns keep the plan id they
 * were funded under.
 */
const FEE_PLANS: Record<string, FeePlan> = {
  'v1-INR': {
    id: 'v1-INR',
    currency: 'INR',
    platformFeePercent: 10,
    platformFeeFixedMinor: 0,
    paymentFeePercent: 2,
    paymentFeeFixedMinor: 0,
    serviceFeePercent: 0,
    serviceFeeFixedMinor: 0,
    taxPercent: 18,
    taxInclusive: true,
  },
};

/** The plan applied to newly funded campaigns. */
export const DEFAULT_FEE_PLAN_ID = 'v1-INR';

@Injectable()
export class FeeEngine {
  private readonly logger = new Logger(FeeEngine.name);

  getPlan(planId: string = DEFAULT_FEE_PLAN_ID, currency = 'INR'): FeePlan {
    const plan = FEE_PLANS[planId] ?? FEE_PLANS[`${planId}-${currency}`];
    if (!plan) {
      throw new BadRequestException(`Unknown fee plan: ${planId}`);
    }
    return plan;
  }

  /**
   * Computes the split for a campaign budget.
   *
   * `baseAmountMinor` is the gross amount the brand pays. Fees and tax come
   * out of it, and the influencer receives the remainder. Rounding is done
   * per component with `Math.round` and the influencer's share is derived by
   * subtraction, so the parts always sum back to the base exactly — money is
   * never created or lost to rounding (TRD §30, §44).
   */
  calculate(params: {
    baseAmountMinor: bigint;
    planId?: string;
    currency?: string;
  }): FeeBreakdown {
    const currency = params.currency ?? 'INR';
    const plan = this.getPlan(params.planId ?? DEFAULT_FEE_PLAN_ID, currency);
    const base = params.baseAmountMinor;

    if (base <= 0n) {
      throw new BadRequestException('Fee base amount must be positive');
    }

    if (plan.currency !== currency) {
      throw new BadRequestException(
        `Fee plan ${plan.id} is denominated in ${plan.currency}, not ${currency}`,
      );
    }

    const percentOf = (percent: number, amount: bigint): bigint => {
      if (!percent) return 0n;
      // Integer arithmetic only: scale the percentage into basis points so no
      // intermediate float ever touches a monetary value.
      const basisPoints = BigInt(Math.round(percent * 100));
      return (amount * basisPoints) / 10000n;
    };

    const platformFeeMinor = percentOf(plan.platformFeePercent, base) + BigInt(plan.platformFeeFixedMinor);
    const paymentFeeMinor = percentOf(plan.paymentFeePercent, base) + BigInt(plan.paymentFeeFixedMinor);
    const serviceFeeMinor = percentOf(plan.serviceFeePercent, base) + BigInt(plan.serviceFeeFixedMinor);
    const totalFeeMinor = platformFeeMinor + paymentFeeMinor + serviceFeeMinor;

    if (totalFeeMinor >= base) {
      throw new BadRequestException(
        `Fees (${totalFeeMinor}) consume the entire base amount (${base}) under plan ${plan.id}`,
      );
    }

    let taxAmountMinor: bigint;
    let influencerPayableMinor: bigint;

    if (plan.taxInclusive) {
      // Tax is already inside the fee total; hold it back for the authority.
      taxAmountMinor = percentOf(plan.taxPercent, totalFeeMinor);
      influencerPayableMinor = base - totalFeeMinor;
    } else {
      taxAmountMinor = percentOf(plan.taxPercent, totalFeeMinor);
      influencerPayableMinor = base - totalFeeMinor - taxAmountMinor;
    }

    if (influencerPayableMinor <= 0n) {
      throw new BadRequestException(
        `Fee configuration for plan ${plan.id} leaves no payable amount`,
      );
    }

    const platformNetRevenueMinor = totalFeeMinor - taxAmountMinor;

    const snapshot: Record<string, unknown> = {
      feePlanId: plan.id,
      currency,
      baseAmountMinor: base.toString(),
      plan: {
        platformFeePercent: plan.platformFeePercent,
        platformFeeFixedMinor: plan.platformFeeFixedMinor,
        paymentFeePercent: plan.paymentFeePercent,
        paymentFeeFixedMinor: plan.paymentFeeFixedMinor,
        serviceFeePercent: plan.serviceFeePercent,
        serviceFeeFixedMinor: plan.serviceFeeFixedMinor,
        taxPercent: plan.taxPercent,
        taxInclusive: plan.taxInclusive,
      },
      computed: {
        platformFeeMinor: platformFeeMinor.toString(),
        paymentFeeMinor: paymentFeeMinor.toString(),
        serviceFeeMinor: serviceFeeMinor.toString(),
        totalFeeMinor: totalFeeMinor.toString(),
        taxAmountMinor: taxAmountMinor.toString(),
        influencerPayableMinor: influencerPayableMinor.toString(),
        platformNetRevenueMinor: platformNetRevenueMinor.toString(),
      },
      computedAt: new Date().toISOString(),
    };

    return {
      baseAmountMinor: base,
      platformFeeMinor,
      paymentFeeMinor,
      serviceFeeMinor,
      totalFeeMinor,
      taxAmountMinor,
      influencerPayableMinor,
      platformNetRevenueMinor,
      currency,
      snapshot,
    };
  }

  /**
   * Recomputes a split from a stored snapshot. Used by reconciliation and
   * audit tooling to prove a historical figure still reconciles (TRD §48).
   */
  verifySnapshot(snapshot: any): boolean {
    try {
      const plan = this.getPlan(snapshot?.feePlanId, snapshot?.currency);
      const recomputed = this.calculate({
        baseAmountMinor: BigInt(snapshot.baseAmountMinor),
        planId: plan.id,
        currency: snapshot.currency,
      });
      const expected = snapshot.computed ?? {};
      return (
        expected.totalFeeMinor === recomputed.totalFeeMinor.toString() &&
        expected.influencerPayableMinor === recomputed.influencerPayableMinor.toString() &&
        expected.taxAmountMinor === recomputed.taxAmountMinor.toString()
      );
    } catch (error) {
      this.logger.warn(`Fee snapshot verification failed: ${(error as Error).message}`);
      return false;
    }
  }
}
