/**
 * Presenter helpers that strip provider internals from API responses and
 * normalize money to decimal strings (TRD §29).
 */

export interface PaymentResponse {
  id: string;
  status: string;
  amount: string;
  currency: string;
  campaignId: string | null;
  provider: string;
  paymentSessionId: string | null;
  providerOrderId: string | null;
  paymentMethod: string | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayoutResponse {
  id: string;
  status: string;
  amount: string;
  grossAmount: string | null;
  tdsAmount: string | null;
  netPayout: string | null;
  currency: string;
  influencerProfileId: string;
  campaignId: string | null;
  provider: string;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundResponse {
  id: string;
  paymentId: string;
  status: string;
  amount: string;
  currency: string;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function presentPayment(payment: any, currency: string): PaymentResponse {
  return {
    id: payment.id,
    status: payment.status,
    amount: (Number(payment.amountMinor) / 100).toFixed(2),
    currency,
    campaignId: payment.campaignId ?? null,
    provider: payment.provider,
    paymentSessionId: payment.providerSessionId ?? null,
    providerOrderId: payment.providerOrderId ?? null,
    paymentMethod: payment.paymentMethod ?? null,
    failureReason: payment.failureReason ?? null,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

export function presentPayout(payout: any, currency: string): PayoutResponse {
  return {
    id: payout.id,
    status: payout.status,
    amount: (Number(payout.amountMinor) / 100).toFixed(2),
    grossAmount: payout.grossAmountMinor ? (Number(payout.grossAmountMinor) / 100).toFixed(2) : null,
    tdsAmount: payout.tdsAmountMinor !== null && payout.tdsAmountMinor !== undefined
      ? (Number(payout.tdsAmountMinor) / 100).toFixed(2)
      : null,
    netPayout: payout.netPayoutMinor ? (Number(payout.netPayoutMinor) / 100).toFixed(2) : null,
    currency,
    influencerProfileId: payout.influencerProfileId,
    campaignId: payout.campaignId ?? null,
    provider: payout.provider,
    failureReason: payout.failureReason ?? null,
    createdAt: payout.createdAt,
    updatedAt: payout.updatedAt,
  };
}

export function presentRefund(refund: any, currency: string): RefundResponse {
  return {
    id: refund.id,
    paymentId: refund.paymentId,
    status: refund.status,
    amount: (Number(refund.amountMinor) / 100).toFixed(2),
    currency,
    reason: refund.reason ?? null,
    createdAt: refund.createdAt,
    updatedAt: refund.updatedAt,
  };
}
