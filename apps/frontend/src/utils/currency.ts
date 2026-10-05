/**
 * Unified Global Currency Localization & Conversion Utilities for Zerify
 * Implements Zerify Global Currency PRD v1.0 specifications
 */

export type SupportedCurrency =
  | 'USD'
  | 'INR'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'AED'
  | 'SGD'
  | 'CHF'
  | 'CNY'
  | 'BRL'
  | 'ZAR'
  | 'SEK'
  | 'NZD'
  | 'KRW'
  | 'THB'
  | 'IDR'
  | 'MYR'
  | 'PHP'
  | 'SAR'
  | 'TRY'
  | 'MXN'
  | string;

export interface CurrencyDetails {
  code: string;
  symbol: string;
  name: string;
  decimalDigits: number;
  flag?: string;
  exchangeRateToUSD: number; // 1 USD = X Currency
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyDetails> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimalDigits: 2, flag: '🇺🇸', exchangeRateToUSD: 1 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimalDigits: 2, flag: '🇮🇳', exchangeRateToUSD: 95.82 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimalDigits: 2, flag: '🇪🇺', exchangeRateToUSD: 0.88 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimalDigits: 2, flag: '🇬🇧', exchangeRateToUSD: 0.75 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimalDigits: 2, flag: '🇨🇦', exchangeRateToUSD: 1.41 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimalDigits: 2, flag: '🇦🇺', exchangeRateToUSD: 1.42 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimalDigits: 0, flag: '🇯🇵', exchangeRateToUSD: 157.5 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', decimalDigits: 2, flag: '🇦🇪', exchangeRateToUSD: 3.67 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimalDigits: 2, flag: '🇸🇬', exchangeRateToUSD: 1.28 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimalDigits: 2, flag: '🇨🇭', exchangeRateToUSD: 0.83 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimalDigits: 2, flag: '🇨🇳', exchangeRateToUSD: 6.71 },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimalDigits: 2, flag: '🇧🇷', exchangeRateToUSD: 5.18 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', decimalDigits: 2, flag: '🇿🇦', exchangeRateToUSD: 16.3 },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimalDigits: 2, flag: '🇸🇪', exchangeRateToUSD: 9.9 },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', decimalDigits: 2, flag: '🇳🇿', exchangeRateToUSD: 1.76 },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimalDigits: 0, flag: '🇰🇷', exchangeRateToUSD: 1355.0 },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', decimalDigits: 2, flag: '🇹🇭', exchangeRateToUSD: 33.35 },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimalDigits: 0, flag: '🇮🇩', exchangeRateToUSD: 17914.0 },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', decimalDigits: 2, flag: '🇲🇾', exchangeRateToUSD: 4.07 },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', decimalDigits: 2, flag: '🇵🇭', exchangeRateToUSD: 62.48 },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', decimalDigits: 2, flag: '🇸🇦', exchangeRateToUSD: 3.75 },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', decimalDigits: 2, flag: '🇹🇷', exchangeRateToUSD: 48.9 },
  MXN: { code: 'MXN', symbol: '$', name: 'Mexican Peso', decimalDigits: 2, flag: '🇲🇽', exchangeRateToUSD: 17.7 },
};

export const DEFAULT_CURRENCY: SupportedCurrency = 'INR';

/**
 * Resolves a currency string or falls back to 'INR'
 */
export function normalizeCurrency(currency?: string | null): SupportedCurrency {
  if (!currency) return DEFAULT_CURRENCY;
  const upper = currency.toUpperCase().trim();
  if (SUPPORTED_CURRENCIES[upper]) return upper;
  if (upper === '$') return 'USD';
  if (upper === '₹') return 'INR';
  if (upper === '€') return 'EUR';
  if (upper === '£') return 'GBP';
  if (upper === '¥') return 'JPY';
  return DEFAULT_CURRENCY;
}

/**
 * Returns the currency symbol (e.g., '₹', '$', '€', '£', etc.)
 */
export function getCurrencySymbol(currency?: string | null): string {
  const norm = normalizeCurrency(currency);
  return SUPPORTED_CURRENCIES[norm]?.symbol || norm;
}

/**
 * Returns currency decimals (e.g. 0 for JPY/KRW, 2 for others)
 */
export function getCurrencyDecimals(currency?: string | null): number {
  const norm = normalizeCurrency(currency);
  return SUPPORTED_CURRENCIES[norm]?.decimalDigits ?? 2;
}

/**
 * Converts value between currencies using either live rates or baseline rates
 * PRD §20, §21, §46
 */
export function convertCurrency(
  amount: number,
  from: string | null | undefined,
  to: string | null | undefined,
  rates?: Record<string, number> | null
): number {
  if (!amount || isNaN(amount)) return 0;
  const fromNorm = normalizeCurrency(from);
  const toNorm = normalizeCurrency(to);

  // Same-currency optimization (PRD §21)
  if (fromNorm === toNorm) return amount;

  // Use rates dictionary (base USD) or fallback
  const getRateToUSD = (curr: string) => {
    if (rates && rates[curr] && rates[curr] > 0) return rates[curr];
    return SUPPORTED_CURRENCIES[curr]?.exchangeRateToUSD || 1;
  };

  const fromRate = getRateToUSD(fromNorm);
  const toRate = getRateToUSD(toNorm);

  // Rate: 1 FROM = (toRate / fromRate) TO
  const crossRate = toRate / fromRate;
  const converted = amount * crossRate;

  const decimals = getCurrencyDecimals(toNorm);
  const factor = Math.pow(10, decimals);
  return Math.round(converted * factor) / factor;
}

/**
 * Formats a monetary number into a localized string with symbol
 * e.g. formatCurrency(958200, 'INR') => "₹9,58,200"
 *      formatCurrency(10000, 'USD') => "$10,000"
 * PRD §30, §31, §32
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
  const symbol = getCurrencySymbol(normCurrency);

  // Compact notation for large numbers
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
      if (Math.abs(num) >= 1000000000) {
        return `${symbol}${(num / 1000000000).toFixed(1)}B${options?.suffix ? ` ${options.suffix}` : ''}`;
      }
      if (Math.abs(num) >= 1000000) {
        return `${symbol}${(num / 1000000).toFixed(1)}M${options?.suffix ? ` ${options.suffix}` : ''}`;
      }
      if (Math.abs(num) >= 1000) {
        return `${symbol}${(num / 1000).toFixed(1)}K${options?.suffix ? ` ${options.suffix}` : ''}`;
      }
    }
  }

  const defaultDecimals = getCurrencyDecimals(normCurrency);
  const maximumFractionDigits = options?.showDecimals ? defaultDecimals : 0;
  const minimumFractionDigits = options?.showDecimals ? (num % 1 === 0 ? 0 : defaultDecimals) : 0;

  // Localized number format
  const localeMap: Record<string, string> = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    CAD: 'en-CA',
    AUD: 'en-AU',
    JPY: 'ja-JP',
    AED: 'ar-AE',
    SGD: 'en-SG',
    CHF: 'de-CH',
  };
  const locale = localeMap[normCurrency] || 'en-US';

  const formattedNum = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(num);

  return `${symbol}${formattedNum}${options?.suffix ? ` ${options.suffix}` : ''}`;
}

/**
 * Dynamically converts and formats budget range strings (e.g. "$5,000 – $20,000", "$25,000+", "₹4,00,000")
 * to the target selected currency using rates.
 */
export function formatBudgetString(
  budgetString: string | null | undefined,
  targetCurrency: string | null | undefined = 'INR',
  rates?: Record<string, number> | null
): string {
  const norm = normalizeCurrency(targetCurrency);
  if (!budgetString) {
    return norm === 'INR' ? '₹4,00,000 – ₹15,00,000' : '$5,000 – $20,000';
  }

  // Detect original currency in the string
  let sourceCurrency = 'USD';
  if (budgetString.includes('₹') || budgetString.toUpperCase().includes('INR')) {
    sourceCurrency = 'INR';
  } else if (budgetString.includes('€') || budgetString.toUpperCase().includes('EUR')) {
    sourceCurrency = 'EUR';
  } else if (budgetString.includes('£') || budgetString.toUpperCase().includes('GBP')) {
    sourceCurrency = 'GBP';
  } else if (budgetString.includes('¥') || budgetString.toUpperCase().includes('JPY')) {
    sourceCurrency = 'JPY';
  }

  const isPlus = budgetString.includes('+');

  // Extract all numbers inside the string
  const rawNumbers =
    budgetString
      .match(/[\d,.]+/g)
      ?.map((s) => parseFloat(s.replace(/,/g, '')))
      .filter((n) => !isNaN(n) && n > 0) || [];

  if (rawNumbers.length === 0) return budgetString;

  const converted = rawNumbers.map((val) => {
    return convertCurrency(val, sourceCurrency, norm, rates);
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

/**
 * Formats a budget range or amount string into a compact, human-readable format.
 * E.g., >= 1,000,000 formats as 1.93M / 48.2M, and >= 1,000 (such as 100,000) formats as 100K / 481.5K.
 */
export function formatBudgetCompact(
  budgetString: string | null | undefined,
  targetCurrency: string | null | undefined = 'INR',
  rates?: Record<string, number> | null
): string {
  const norm = normalizeCurrency(targetCurrency);
  const symbol = getCurrencySymbol(norm);

  if (!budgetString) {
    return norm === 'INR' ? '₹400K – ₹1.5M' : '$5K – $20K';
  }

  // Detect original currency in the string
  let sourceCurrency = 'USD';
  if (budgetString.includes('₹') || budgetString.toUpperCase().includes('INR')) {
    sourceCurrency = 'INR';
  } else if (budgetString.includes('€') || budgetString.toUpperCase().includes('EUR')) {
    sourceCurrency = 'EUR';
  } else if (budgetString.includes('£') || budgetString.toUpperCase().includes('GBP')) {
    sourceCurrency = 'GBP';
  } else if (budgetString.includes('¥') || budgetString.toUpperCase().includes('JPY')) {
    sourceCurrency = 'JPY';
  }

  const isPlus = budgetString.includes('+');
  const isUnder = budgetString.toLowerCase().includes('under');

  // Extract all numbers inside the string
  const rawNumbers =
    budgetString
      .match(/[\d,.]+/g)
      ?.map((s) => parseFloat(s.replace(/,/g, '')))
      .filter((n) => !isNaN(n) && n > 0) || [];

  if (rawNumbers.length === 0) return budgetString;

  const converted = rawNumbers.map((val) => {
    return convertCurrency(val, sourceCurrency, norm, rates);
  });

  const formatCompact = (num: number): string => {
    if (Math.abs(num) >= 1_000_000_000) {
      const val = num / 1_000_000_000;
      return `${symbol}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace(/\.0$/, '')}B`;
    }
    if (Math.abs(num) >= 1_000_000) {
      const val = num / 1_000_000;
      const formatted = val >= 10 ? val.toFixed(1) : val.toFixed(2);
      return `${symbol}${formatted.replace(/\.?0+$/, '')}M`;
    }
    if (Math.abs(num) >= 1_000) {
      const val = num / 1_000;
      const formatted = val >= 100 ? (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) : val.toFixed(1);
      return `${symbol}${formatted.replace(/\.?0+$/, '')}K`;
    }
    return `${symbol}${Math.round(num)}`;
  };

  const prefix = isUnder ? 'Under ' : '';
  const suffix = isPlus ? '+' : '';

  if (converted.length === 1) {
    return `${prefix}${formatCompact(converted[0])}${suffix}`;
  }

  if (converted.length >= 2) {
    return `${prefix}${formatCompact(converted[0])} – ${formatCompact(converted[1])}${suffix}`;
  }

  return budgetString;
}

