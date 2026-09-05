/**
 * Unified Currency Localization & Conversion Utilities for Zerify
 * Base Currency: INR (₹)
 * Secondary Currency: USD ($)
 */

export type SupportedCurrency = 'INR' | 'USD';

export interface CurrencyDetails {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  exchangeRateToINR: number; // 1 USD = 83.5 INR
}

export const SUPPORTED_CURRENCIES: Record<SupportedCurrency, CurrencyDetails> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    exchangeRateToINR: 1,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    exchangeRateToINR: 83.5,
  },
};

export const DEFAULT_CURRENCY: SupportedCurrency = 'INR';

/**
 * Resolves a currency string or falls back to 'INR'
 */
export function normalizeCurrency(currency?: string | null): SupportedCurrency {
  if (!currency) return DEFAULT_CURRENCY;
  const upper = currency.toUpperCase().trim();
  if (upper === 'USD' || upper === '$') return 'USD';
  return 'INR';
}

/**
 * Returns the currency symbol ('₹' or '$')
 */
export function getCurrencySymbol(currency?: string | null): string {
  const norm = normalizeCurrency(currency);
  return SUPPORTED_CURRENCIES[norm]?.symbol || '₹';
}

/**
 * Converts value between INR and USD using the exchange rate
 */
export function convertCurrency(
  amount: number,
  from: string | null | undefined,
  to: string | null | undefined
): number {
  if (!amount || isNaN(amount)) return 0;
  const fromNorm = normalizeCurrency(from);
  const toNorm = normalizeCurrency(to);

  if (fromNorm === toNorm) return amount;

  const rateUSD = SUPPORTED_CURRENCIES.USD.exchangeRateToINR;

  if (fromNorm === 'INR' && toNorm === 'USD') {
    return Math.round((amount / rateUSD) * 100) / 100;
  }
  if (fromNorm === 'USD' && toNorm === 'INR') {
    return Math.round(amount * rateUSD);
  }

  return amount;
}

/**
 * Formats a monetary number into a localized string with symbol
 * e.g. formatCurrency(250000, 'INR') => "₹2,50,000"
 *      formatCurrency(2500, 'USD') => "$2,500"
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string | null | undefined = 'INR',
  options?: {
    compact?: boolean;
    showDecimals?: boolean;
    suffix?: string;
  }
): string {
  if (amount === undefined || amount === null || amount === '') {
    return `${getCurrencySymbol(currency)}0${options?.suffix ? ` ${options.suffix}` : ''}`;
  }

  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;
  if (isNaN(num)) {
    return `${getCurrencySymbol(currency)}0${options?.suffix ? ` ${options.suffix}` : ''}`;
  }

  const normCurrency = normalizeCurrency(currency);
  const locale = normCurrency === 'INR' ? 'en-IN' : 'en-US';

  const maximumFractionDigits = options?.showDecimals ? 2 : 0;
  const minimumFractionDigits = options?.showDecimals ? (num % 1 === 0 ? 0 : 2) : 0;

  if (options?.compact && Math.abs(num) >= 1000) {
    if (normCurrency === 'INR') {
      if (Math.abs(num) >= 10000000) {
        return `₹${(num / 10000000).toFixed(1)}Cr${options?.suffix ? ` ${options.suffix}` : ''}`;
      }
      if (Math.abs(num) >= 100000) {
        return `₹${(num / 100000).toFixed(1)}L${options?.suffix ? ` ${options.suffix}` : ''}`;
      }
      if (Math.abs(num) >= 1000) {
        return `₹${(num / 1000).toFixed(1)}K${options?.suffix ? ` ${options.suffix}` : ''}`;
      }
    } else {
      if (Math.abs(num) >= 1000000) {
        return `$${(num / 1000000).toFixed(1)}M${options?.suffix ? ` ${options.suffix}` : ''}`;
      }
      if (Math.abs(num) >= 1000) {
        return `$${(num / 1000).toFixed(1)}K${options?.suffix ? ` ${options.suffix}` : ''}`;
      }
    }
  }

  const formattedNum = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(num);

  const symbol = getCurrencySymbol(normCurrency);
  return `${symbol}${formattedNum}${options?.suffix ? ` ${options.suffix}` : ''}`;
}

/**
 * Dynamically converts and formats budget range strings (e.g. "$5,000 – $20,000", "$25,000+", "$50,000")
 * to the target selected currency.
 */
export function formatBudgetString(
  budgetString: string | null | undefined,
  targetCurrency: string | null | undefined = 'INR'
): string {
  const norm = normalizeCurrency(targetCurrency);
  if (!budgetString) {
    return norm === 'INR' ? '₹4,00,000 – ₹15,00,000' : '$5,000 – $20,000';
  }

  const isUSD = budgetString.includes('$');
  const isINR = budgetString.includes('₹') || budgetString.toUpperCase().includes('INR');
  const isPlus = budgetString.includes('+');

  // Extract all numbers inside the string
  const rawNumbers = budgetString.match(/[\d,]+/g)?.map((s) => parseFloat(s.replace(/,/g, ''))).filter((n) => !isNaN(n)) || [];

  if (rawNumbers.length === 0) return budgetString;

  const converted = rawNumbers.map((val) => {
    if (norm === 'INR' && (isUSD || (!isINR && val <= 50000))) {
      // Convert USD to INR and round nicely
      return Math.round((val * 83.5) / 10000) * 10000;
    }
    if (norm === 'USD' && (isINR || (!isUSD && val > 50000))) {
      // Convert INR to USD and round nicely
      return Math.round((val / 83.5) / 100) * 100;
    }
    return val;
  });

  if (converted.length === 1) {
    const formatted = formatCurrency(converted[0], norm);
    return isPlus ? `${formatted}+` : formatted;
  }

  if (converted.length >= 2) {
    const f1 = formatCurrency(converted[0], norm);
    const f2 = formatCurrency(converted[1], norm);
    return `${f1} – ${f2}${isPlus ? '+' : ''}`;
  }

  return budgetString;
}
