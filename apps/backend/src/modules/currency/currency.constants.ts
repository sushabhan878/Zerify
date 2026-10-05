export interface CurrencyMeta {
  code: string;
  name: string;
  symbol: string;
  decimalDigits: number;
  flag?: string;
}

export const SUPPORTED_CURRENCIES: CurrencyMeta[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', decimalDigits: 2, flag: '🇺🇸' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalDigits: 2, flag: '🇮🇳' },
  { code: 'EUR', name: 'Euro', symbol: '€', decimalDigits: 2, flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimalDigits: 2, flag: '🇬🇧' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalDigits: 2, flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalDigits: 2, flag: '🇦🇺' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalDigits: 0, flag: '🇯🇵' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimalDigits: 2, flag: '🇦🇪' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalDigits: 2, flag: '🇸🇬' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimalDigits: 2, flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalDigits: 2, flag: '🇨🇳' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimalDigits: 2, flag: '🇧🇷' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimalDigits: 2, flag: '🇿🇦' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimalDigits: 2, flag: '🇸🇪' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimalDigits: 2, flag: '🇳🇿' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimalDigits: 0, flag: '🇰🇷' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', decimalDigits: 2, flag: '🇹🇭' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimalDigits: 0, flag: '🇮🇩' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimalDigits: 2, flag: '🇲🇾' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimalDigits: 2, flag: '🇵🇭' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimalDigits: 2, flag: '🇸🇦' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimalDigits: 2, flag: '🇹🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimalDigits: 2, flag: '🇲🇽' },
];

/**
 * Baseline fallback exchange rates against USD (1 USD = X Currency)
 * Used if live providers are temporarily unreachable (PRD §44 & §125)
 */
export const BASELINE_USD_RATES: Record<string, number> = {
  USD: 1,
  INR: 86.85,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.38,
  AUD: 1.54,
  JPY: 154.2,
  AED: 3.67,
  SGD: 1.34,
  CHF: 0.88,
  CNY: 7.24,
  BRL: 5.75,
  ZAR: 18.15,
  SEK: 10.65,
  NZD: 1.68,
  KRW: 1395.0,
  THB: 34.5,
  IDR: 15850.0,
  MYR: 4.45,
  PHP: 58.2,
  SAR: 3.75,
  TRY: 34.8,
  MXN: 20.1,
};

export const DEFAULT_PLATFORM_CURRENCY = 'USD';
export const DEFAULT_USER_CURRENCY = 'INR';
export const FX_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL
