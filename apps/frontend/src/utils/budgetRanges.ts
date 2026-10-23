/**
 * Industry-Standard Campaign Budget Ranges by Currency for Zerify
 * Covers standard influencer marketing tiers: Starter/Micro, Growth, Mid-Tier, Scaling, and Enterprise/Celebrity.
 */

import { getCurrencySymbol } from './currency';

export interface BudgetRangeOption {
  value: string;
  label: string;
  tierDescription?: string;
}

export const CURRENCY_BUDGET_RANGES: Record<string, BudgetRangeOption[]> = {
  INR: [
    { value: '< ₹25,000', label: '< ₹25,000', tierDescription: 'Nano & Micro creator starter deals' },
    { value: '₹25,000 – ₹1,00,000', label: '₹25,000 – ₹1,00,000', tierDescription: 'Growing brand activations' },
    { value: '₹1,00,000 – ₹5,00,000', label: '₹1,00,000 – ₹5,00,000', tierDescription: 'Mid-scale multi-influencer campaigns' },
    { value: '₹5,00,000 – ₹20,00,000', label: '₹5,00,000 – ₹20,00,000', tierDescription: 'High-impact regional & national campaigns' },
    { value: '₹20,00,000 – ₹50,00,000', label: '₹20,00,000 – ₹50,00,000', tierDescription: 'Large-scale brand launches' },
    { value: '₹50,00,000+', label: '₹50,00,000+', tierDescription: 'Enterprise & Celebrity partnerships' },
  ],
  USD: [
    { value: '< $1,000', label: '< $1,000', tierDescription: 'Micro creators & seeding' },
    { value: '$1,000 – $5,000', label: '$1,000 – $5,000', tierDescription: 'Emerging brand campaigns' },
    { value: '$5,000 – $20,000', label: '$5,000 – $20,000', tierDescription: 'Standard commercial activations' },
    { value: '$20,000 – $50,000', label: '$20,000 – $50,000', tierDescription: 'Multi-creator growth sprints' },
    { value: '$50,000 – $100,000', label: '$50,000 – $100,000', tierDescription: 'High-scale brand marketing' },
    { value: '$100,000+', label: '$100,000+', tierDescription: 'Enterprise marquee campaigns' },
  ],
  EUR: [
    { value: '< €1,000', label: '< €1,000', tierDescription: 'Micro creators & seeding' },
    { value: '€1,000 – €5,000', label: '€1,000 – €5,000', tierDescription: 'Emerging brand campaigns' },
    { value: '€5,000 – €20,000', label: '€5,000 – €20,000', tierDescription: 'Standard commercial activations' },
    { value: '€20,000 – €50,000', label: '€20,000 – €50,000', tierDescription: 'Multi-creator growth sprints' },
    { value: '€50,000 – €100,000', label: '€50,000 – €100,000', tierDescription: 'High-scale brand marketing' },
    { value: '€100,000+', label: '€100,000+', tierDescription: 'Enterprise marquee campaigns' },
  ],
  GBP: [
    { value: '< £1,000', label: '< £1,000', tierDescription: 'Micro creators & seeding' },
    { value: '£1,000 – £5,000', label: '£1,000 – £5,000', tierDescription: 'Emerging brand campaigns' },
    { value: '£5,000 – £20,000', label: '£5,000 – £20,000', tierDescription: 'Standard commercial activations' },
    { value: '£20,000 – £50,000', label: '£20,000 – £50,000', tierDescription: 'Multi-creator growth sprints' },
    { value: '£50,000 – £100,000', label: '£50,000 – £100,000', tierDescription: 'High-scale brand marketing' },
    { value: '£100,000+', label: '£100,000+', tierDescription: 'Enterprise marquee campaigns' },
  ],
  AED: [
    { value: '< د.إ 5,000', label: '< د.إ 5,000', tierDescription: 'Micro creators & seeding' },
    { value: 'د.إ 5,000 – د.إ 20,000', label: 'د.إ 5,000 – د.إ 20,000', tierDescription: 'Emerging brand campaigns' },
    { value: 'د.إ 20,000 – د.إ 75,000', label: 'د.إ 20,000 – د.إ 75,000', tierDescription: 'Regional UAE & GCC campaigns' },
    { value: 'د.إ 75,000 – د.إ 200,000', label: 'د.إ 75,000 – د.إ 200,000', tierDescription: 'High-impact brand pushes' },
    { value: 'د.إ 200,000+', label: 'د.إ 200,000+', tierDescription: 'Enterprise luxury activations' },
  ],
  CAD: [
    { value: '< C$1,500', label: '< C$1,500' },
    { value: 'C$1,500 – C$7,500', label: 'C$1,500 – C$7,500' },
    { value: 'C$7,500 – C$25,000', label: 'C$7,500 – C$25,000' },
    { value: 'C$25,000 – C$70,000', label: 'C$25,000 – C$70,000' },
    { value: 'C$70,000+', label: 'C$70,000+' },
  ],
  AUD: [
    { value: '< A$1,500', label: '< A$1,500' },
    { value: 'A$1,500 – A$7,500', label: 'A$1,500 – A$7,500' },
    { value: 'A$7,500 – A$30,000', label: 'A$7,500 – A$30,000' },
    { value: 'A$30,000 – A$75,000', label: 'A$30,000 – A$75,000' },
    { value: 'A$75,000+', label: 'A$75,000+' },
  ],
  SGD: [
    { value: '< S$1,500', label: '< S$1,500' },
    { value: 'S$1,500 – S$7,500', label: 'S$1,500 – S$7,500' },
    { value: 'S$7,500 – S$25,000', label: 'S$7,500 – S$25,000' },
    { value: 'S$25,000 – S$70,000', label: 'S$25,000 – S$70,000' },
    { value: 'S$70,000+', label: 'S$70,000+' },
  ],
  JPY: [
    { value: '< ¥150,000', label: '< ¥150,000' },
    { value: '¥150,000 – ¥750,000', label: '¥150,000 – ¥750,000' },
    { value: '¥750,000 – ¥3,000,000', label: '¥750,000 – ¥3,000,000' },
    { value: '¥3,000,000 – ¥7,500,000', label: '¥3,000,000 – ¥7,500,000' },
    { value: '¥7,500,000+', label: '¥7,500,000+' },
  ],
};

/**
 * Returns industry standard campaign budget ranges for a given currency code.
 * Defaults to INR ranges.
 */
export function getIndustryBudgetRanges(currencyCode: string = 'INR'): BudgetRangeOption[] {
  const norm = (currencyCode || 'INR').toUpperCase().trim();
  if (CURRENCY_BUDGET_RANGES[norm]) {
    return CURRENCY_BUDGET_RANGES[norm];
  }

  // Fallback for other currencies using their symbol
  const sym = getCurrencySymbol(norm);
  return [
    { value: `< ${sym}1,000`, label: `< ${sym}1,000` },
    { value: `${sym}1,000 – ${sym}5,000`, label: `${sym}1,000 – ${sym}5,000` },
    { value: `${sym}5,000 – ${sym}20,000`, label: `${sym}5,000 – ${sym}20,000` },
    { value: `${sym}20,000 – ${sym}50,000`, label: `${sym}20,000 – ${sym}50,000` },
    { value: `${sym}50,000+`, label: `${sym}50,000+` },
  ];
}

/**
 * Normalizes an incoming budget string (which might have been saved in USD or another format)
 * to match one of the available options for the active currency.
 */
export function normalizeBudgetForCurrency(currentBudget: string | undefined | null, currencyCode: string = 'INR'): string {
  const options = getIndustryBudgetRanges(currencyCode);
  const defaultOption = options[2]?.value || options[0]?.value; // e.g. '₹1,00,000 – ₹5,00,000' for INR

  if (!currentBudget) return defaultOption;

  const trimmed = currentBudget.trim();
  // Exact match
  if (options.some((o) => o.value === trimmed)) {
    return trimmed;
  }

  // If currency is INR and incoming value was from old USD presets:
  if (currencyCode === 'INR') {
    if (trimmed.includes('<$1,000') || trimmed.includes('< $1,000')) return '< ₹25,000';
    if (trimmed.includes('$1,000') || trimmed.includes('5,000')) return '₹25,000 – ₹1,00,000';
    if (trimmed.includes('$5,000') || trimmed.includes('20,000')) return '₹1,00,000 – ₹5,00,000';
    if (trimmed.includes('$20,000') || trimmed.includes('50,000')) return '₹5,00,000 – ₹20,00,000';
    if (trimmed.includes('$50,000+')) return '₹20,00,000 – ₹50,00,000';
  }

  return defaultOption;
}
