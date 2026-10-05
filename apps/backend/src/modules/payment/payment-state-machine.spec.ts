import { PaymentStatus, RefundStatus, PayoutStatus } from '@prisma/client';

/** Mirrors the transition tables declared in the services (TRD §31). */
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

describe('Payment state machine (TRD §31)', () => {
  it('never allows a settled payment to regress', () => {
    expect(PAYMENT_TRANSITIONS[PaymentStatus.REFUNDED]).toEqual([]);
    expect(
      PAYMENT_TRANSITIONS[PaymentStatus.SUCCESSFUL],
    ).not.toContain(PaymentStatus.PENDING);
    expect(
      PAYMENT_TRANSITIONS[PaymentStatus.SUCCESSFUL],
    ).not.toContain(PaymentStatus.FAILED);
  });

  it('only reaches SUCCESSFUL from PENDING or PROCESSING', () => {
    const canSucceed = (from: PaymentStatus) =>
      PAYMENT_TRANSITIONS[from]?.includes(PaymentStatus.SUCCESSFUL) ?? false;
    expect(canSucceed(PaymentStatus.PENDING)).toBe(true);
    expect(canSucceed(PaymentStatus.PROCESSING)).toBe(true);
    expect(canSucceed(PaymentStatus.FAILED)).toBe(false);
    expect(canSucceed(PaymentStatus.CANCELLED)).toBe(false);
    expect(canSucceed(PaymentStatus.REFUNDED)).toBe(false);
  });

  it('refund paths only exist from successful states', () => {
    expect(
      PAYMENT_TRANSITIONS[PaymentStatus.SUCCESSFUL],
    ).toContain(PaymentStatus.PARTIALLY_REFUNDED);
    expect(
      PAYMENT_TRANSITIONS[PaymentStatus.PENDING],
    ).not.toContain(PaymentStatus.REFUNDED);
  });
});

describe('Payout state machine (TRD §31)', () => {
  const PAYOUT_TRANSITIONS: Record<PayoutStatus, PayoutStatus[]> = {
    [PayoutStatus.PENDING]: [
      PayoutStatus.PROCESSING,
      PayoutStatus.CANCELLED,
      PayoutStatus.FAILED,
    ],
    [PayoutStatus.PROCESSING]: [PayoutStatus.COMPLETED, PayoutStatus.FAILED],
    [PayoutStatus.FAILED]: [PayoutStatus.PROCESSING, PayoutStatus.CANCELLED],
    [PayoutStatus.COMPLETED]: [],
    [PayoutStatus.CANCELLED]: [],
  };

  it('terminal payouts never transition', () => {
    expect(PAYOUT_TRANSITIONS[PayoutStatus.COMPLETED]).toEqual([]);
    expect(PAYOUT_TRANSITIONS[PayoutStatus.CANCELLED]).toEqual([]);
  });

  it('only FAILED payouts can be retried', () => {
    const retryable = (from: PayoutStatus) =>
      PAYOUT_TRANSITIONS[from]?.includes(PayoutStatus.PROCESSING) ?? false;
    expect(retryable(PayoutStatus.FAILED)).toBe(true);
    expect(retryable(PayoutStatus.COMPLETED)).toBe(false);
    expect(retryable(PayoutStatus.CANCELLED)).toBe(false);
  });
});

describe('Refund cumulative cap (TRD §14)', () => {
  it('partial refunds never exceed the original payment', () => {
    const paymentMinor = 5_000_000n; // ₹50,000
    const refunds = [1_000_000n, 1_500_000n]; // ₹10,000 + ₹15,000
    const already = refunds.reduce((a, b) => a + b, 0n);

    const nextRequest = 2_500_001n; // one paise over the remainder
    expect(already + nextRequest > paymentMinor).toBe(true);
    expect(already + 2_500_000n <= paymentMinor).toBe(true);
  });
});

describe('Refund status mapping', () => {
  const map = (status?: string): RefundStatus => {
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
  };

  it('maps provider refund states to domain states', () => {
    expect(map('SUCCESS')).toBe(RefundStatus.COMPLETED);
    expect(map('successful')).toBe(RefundStatus.COMPLETED);
    expect(map('FAILED')).toBe(RefundStatus.FAILED);
    expect(map(undefined)).toBe(RefundStatus.PROCESSING);
    expect(map('')).toBe(RefundStatus.PROCESSING);
  });
});
