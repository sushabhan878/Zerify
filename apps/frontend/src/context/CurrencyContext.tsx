'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  SupportedCurrency,
  DEFAULT_CURRENCY,
  normalizeCurrency,
  getCurrencySymbol,
  formatCurrency,
  convertCurrency,
  formatBudgetString,
} from '@/utils/currency';

interface CurrencyContextType {
  currency: SupportedCurrency;
  symbol: string;
  setCurrency: (curr: SupportedCurrency) => void;
  format: (amount: number | string | null | undefined, options?: { compact?: boolean; showDecimals?: boolean; suffix?: string }) => string;
  formatBudget: (budgetString: string | null | undefined) => string;
  convert: (amount: number, fromCurrency?: string) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: DEFAULT_CURRENCY,
  symbol: '₹',
  setCurrency: () => {},
  format: (amount) => formatCurrency(amount, DEFAULT_CURRENCY),
  formatBudget: (budgetString) => formatBudgetString(budgetString, DEFAULT_CURRENCY),
  convert: (amount) => amount,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(DEFAULT_CURRENCY);

  // Hydrate currency from user cache or localStorage on mount
  useEffect(() => {
    const updateCurrencyFromStorage = () => {
      if (typeof window === 'undefined') return;

      // 1. Check local preference
      const storedPref = localStorage.getItem('zerify_preferred_currency');
      if (storedPref) {
        setCurrencyState(normalizeCurrency(storedPref));
        return;
      }

      // 2. Check cached user / brand / influencer profiles
      try {
        const brandCache = localStorage.getItem('zerify_brand_profile_cache');
        if (brandCache) {
          const parsed = JSON.parse(brandCache);
          if (parsed.currency) {
            setCurrencyState(normalizeCurrency(parsed.currency));
            return;
          }
        }

        const influencerCache = localStorage.getItem('zerify_influencer_profile_cache');
        if (influencerCache) {
          const parsed = JSON.parse(influencerCache);
          if (parsed.currency) {
            setCurrencyState(normalizeCurrency(parsed.currency));
            return;
          }
        }
      } catch (e) {}

      // 3. Fallback to INR
      setCurrencyState(DEFAULT_CURRENCY);
    };

    updateCurrencyFromStorage();

    window.addEventListener('zerify_currency_change', updateCurrencyFromStorage);
    window.addEventListener('zerify_auth_change', updateCurrencyFromStorage);
    window.addEventListener('zerify_brand_profile_update', updateCurrencyFromStorage);
    window.addEventListener('zerify_influencer_profile_update', updateCurrencyFromStorage);

    return () => {
      window.removeEventListener('zerify_currency_change', updateCurrencyFromStorage);
      window.removeEventListener('zerify_auth_change', updateCurrencyFromStorage);
      window.removeEventListener('zerify_brand_profile_update', updateCurrencyFromStorage);
      window.removeEventListener('zerify_influencer_profile_update', updateCurrencyFromStorage);
    };
  }, []);

  const setCurrency = (newCurrency: SupportedCurrency) => {
    const norm = normalizeCurrency(newCurrency);
    setCurrencyState(norm);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zerify_preferred_currency', norm);
      window.dispatchEvent(new Event('zerify_currency_change'));
    }
  };

  const symbol = getCurrencySymbol(currency);

  const format = (
    amount: number | string | null | undefined,
    options?: { compact?: boolean; showDecimals?: boolean; suffix?: string }
  ) => {
    return formatCurrency(amount, currency, options);
  };

  const formatBudget = (budgetString: string | null | undefined) => {
    return formatBudgetString(budgetString, currency);
  };

  const convert = (amount: number, fromCurrency?: string) => {
    return convertCurrency(amount, fromCurrency || 'INR', currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        symbol,
        setCurrency,
        format,
        formatBudget,
        convert,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
