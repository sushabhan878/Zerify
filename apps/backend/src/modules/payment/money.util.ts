/**
 * Money helpers for the Payments domain.
 *
 * All monetary values stored in the database are integer minor units
 * (paise for INR). Never store or compute money as a Float/Double.
 *
 * Usage:
 *   const paise = toMinor('10000.50', 'INR'); // 1000050
 *   const inr   = fromMinor(1000050, 'INR');  // '10000.50'
 */

/** Smallest-unit multiplier per currency. Extend as currencies are added. */
const MINOR_UNIT: Record<string, number> = {
  INR: 100, // ₹1 = 100 paise
  USD: 100, // $1 = 100 cents
};

function minorUnit(currency: string): number {
  const unit = MINOR_UNIT[currency.toUpperCase()];
  if (!unit) {
    throw new Error(`Unsupported currency for minor-unit conversion: ${currency}`);
  }
  return unit;
}

/**
 * Convert a decimal string (e.g. '10000.50') to minor units.
 * Rejects NaN/Infinity and negative values.
 */
export function toMinor(amount: string | number, currency: string = 'INR'): number {
  const unit = minorUnit(currency);
  const value = typeof amount === 'number' ? amount.toString() : amount;

  if (value.trim() === '') {
    throw new Error('toMinor: amount is empty');
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`toMinor: amount is not a finite number: ${value}`);
  }
  if (parsed < 0) {
    throw new Error(`toMinor: amount cannot be negative: ${value}`);
  }

  // Scale by the unit multiplier, then round to the nearest integer.
  const scaled = Math.round(parsed * unit);
  if (!Number.isSafeInteger(scaled)) {
    throw new Error(`toMinor: amount exceeds safe integer range: ${value}`);
  }
  return scaled;
}

/** Convert minor units back to a decimal string (e.g. 1000050 -> '10000.50'). */
export function fromMinor(amountMinor: number, currency: string = 'INR'): string {
  const unit = minorUnit(currency);
  const value = (amountMinor / unit).toFixed(2);
  // Strip trailing zeros to avoid '10000.00'.
  return value.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}
