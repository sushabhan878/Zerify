/**
 * Card Validation Utilities for Zerify Checkout
 * Performs client-side Luhn checks, expiration date calculations,
 * and card network detection.
 */

export function detectCardBrand(cardNumber: string): 'VISA' | 'MASTERCARD' | 'RUPAY' | null {
  const clean = cardNumber.replace(/\D/g, '');
  if (clean.startsWith('4')) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD';
  if (/^(60|65|81|82)/.test(clean)) return 'RUPAY';
  return null;
}

/**
 * Standard Luhn Algorithm Check
 */
export function validateLuhn(cleanNumber: string): boolean {
  if (!cleanNumber || cleanNumber.length < 13 || cleanNumber.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);
    if (isNaN(digit)) return false;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function validateCardNumber(cardNumber: string): { isValid: boolean; error?: string } {
  const clean = cardNumber.replace(/\D/g, '');
  if (!clean) {
    return { isValid: false, error: 'Card number is required' };
  }
  if (clean.length < 15 || clean.length > 16) {
    return { isValid: false, error: 'Card number must be 15 or 16 digits' };
  }
  // If sandbox test card, accept valid format
  if (validateLuhn(clean)) {
    return { isValid: true };
  }
  // Soft error for test cards or unverified ranges
  return { isValid: false, error: 'Invalid card number checksum' };
}

export function validateExpiry(expiry: string): { isValid: boolean; error?: string } {
  if (!expiry || !expiry.trim()) {
    return { isValid: false, error: 'Expiry date is required (MM / YY)' };
  }
  const parts = expiry.split('/').map((s) => s.trim());
  if (parts.length !== 2) {
    return { isValid: false, error: 'Enter expiry as MM / YY' };
  }

  const month = parseInt(parts[0], 10);
  let year = parseInt(parts[1], 10);

  if (isNaN(month) || month < 1 || month > 12) {
    return { isValid: false, error: 'Month must be between 01 and 12' };
  }

  if (isNaN(year)) {
    return { isValid: false, error: 'Year is invalid' };
  }

  // 2-digit to 4-digit year
  if (year < 100) {
    year += 2000;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { isValid: false, error: 'Card has expired' };
  }

  return { isValid: true };
}

export function validateCvv(cvv: string): { isValid: boolean; error?: string } {
  const clean = cvv.replace(/\D/g, '');
  if (!clean) {
    return { isValid: false, error: 'CVV security code is required' };
  }
  if (clean.length < 3 || clean.length > 4) {
    return { isValid: false, error: 'CVV must be 3 or 4 digits' };
  }
  return { isValid: true };
}

export function validateCardHolder(name: string): { isValid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Cardholder name is required' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must have at least 2 characters' };
  }
  return { isValid: true };
}
