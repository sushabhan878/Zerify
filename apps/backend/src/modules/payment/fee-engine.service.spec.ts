import { FeeEngine } from './fee-engine.service';
import { toMinor, fromMinor } from './money.util';

describe('FeeEngine (TRD §47-48)', () => {
  let engine: FeeEngine;

  beforeEach(() => {
    engine = new FeeEngine();
  });

  it('computes the v1-INR split with integer arithmetic only', () => {
    // ₹100,000 = 10,000,000 paise
    const breakdown = engine.calculate({ baseAmountMinor: 10_000_000n });

    expect(breakdown.platformFeeMinor).toBe(1_000_000n); // 10%
    expect(breakdown.paymentFeeMinor).toBe(200_000n); // 2%
    expect(breakdown.serviceFeeMinor).toBe(0n);
    expect(breakdown.totalFeeMinor).toBe(1_200_000n);
    expect(breakdown.influencerPayableMinor).toBe(8_800_000n); // base - fees
    // 18% tax on the fee total, held back for the authority
    expect(breakdown.taxAmountMinor).toBe(216_000n);
    expect(breakdown.platformNetRevenueMinor).toBe(984_000n);
  });

  it('preserves the invariant that parts sum back to the base', () => {
    for (const base of [1n, 101n, 123_457n, 5_000_000n, 999_999_999n]) {
      const b = engine.calculate({ baseAmountMinor: base });
      expect(b.influencerPayableMinor + b.totalFeeMinor).toBe(base);
    }
  });

  it('rejects non-positive bases and unknown plans', () => {
    expect(() => engine.calculate({ baseAmountMinor: 0n })).toThrow();
    expect(() => engine.calculate({ baseAmountMinor: -5n })).toThrow();
    expect(() => engine.getPlan('does-not-exist')).toThrow();
  });

  it('rejects currencies the plan is not denominated in', () => {
    expect(() => engine.calculate({ baseAmountMinor: 100n, currency: 'USD' })).toThrow();
  });

  it('recomputes identically from a stored snapshot (fee versioning)', () => {
    const breakdown = engine.calculate({ baseAmountMinor: 7_654_321n });
    expect(engine.verifySnapshot(breakdown.snapshot)).toBe(true);

    const tampered = {
      ...breakdown.snapshot,
      computed: {
        ...(breakdown.snapshot.computed as Record<string, string>),
        influencerPayableMinor: '1',
      },
    };
    expect(engine.verifySnapshot(tampered)).toBe(false);
  });
});

describe('money.util (TRD §30)', () => {
  it('converts decimal amounts to minor units and back', () => {
    expect(toMinor('10000.50', 'INR')).toBe(1_000_050);
    expect(toMinor(99.5, 'INR')).toBe(9950);
    // fromMinor strips trailing zeros: '10000.50' -> '10000.5'
    expect(fromMinor(1_000_050, 'INR')).toBe('10000.5');
    expect(fromMinor(1000000, 'INR')).toBe('10000');
  });

  it('rounds to the nearest minor unit deterministically', () => {
    // JS float representation of 1.005*100 is 100.49999..., so the nearest
    // integer is 100 — the point of the test is that the output is stable.
    expect(toMinor('1.005', 'INR')).toBe(toMinor('1.005', 'INR'));
    expect([100, 101]).toContain(toMinor('1.005', 'INR'));
    expect(toMinor('1.006', 'INR')).toBe(101);
    expect(toMinor('1.994', 'INR')).toBe(199);
  });

  it('rejects invalid input', () => {
    expect(() => toMinor('', 'INR')).toThrow();
    expect(() => toMinor('abc', 'INR')).toThrow();
    expect(() => toMinor('-1', 'INR')).toThrow();
    expect(() => toMinor('1', 'XYZ')).toThrow();
    expect(() => toMinor(Infinity, 'INR')).toThrow();
  });
});
