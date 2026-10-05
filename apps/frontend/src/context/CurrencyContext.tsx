'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  SupportedCurrency,
  DEFAULT_CURRENCY,
  normalizeCurrency,
  getCurrencySymbol,
  formatCurrency,
  convertCurrency,
  formatBudgetString,
  formatBudgetCompact,
  SUPPORTED_CURRENCIES,
} from '@/utils/currency';
import { currencyService, CurrencyItem } from '@/services/currency.service';

interface CurrencyContextType {
  currency: SupportedCurrency;
  symbol: string;
  rates: Record<string, number>;
  currencies: CurrencyItem[];
  setCurrency: (curr: SupportedCurrency) => Promise<void>;
  format: (
    amount: number | string | null | undefined,
    options?: { compact?: boolean; showDecimals?: boolean; suffix?: string }
  ) => string;
  formatBudget: (budgetString: string | null | undefined) => string;
  formatBudgetCompact: (budgetString: string | null | undefined) => string;
  convert: (amount: number, fromCurrency?: string) => number;
  isLoading: boolean;
  lastUpdated: string | null;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: DEFAULT_CURRENCY,
  symbol: '₹',
  rates: {},
  currencies: [],
  setCurrency: async () => {},
  format: (amount) => formatCurrency(amount, DEFAULT_CURRENCY),
  formatBudget: (budgetString) => formatBudgetString(budgetString, DEFAULT_CURRENCY),
  formatBudgetCompact: (budgetString) => formatBudgetCompact(budgetString, DEFAULT_CURRENCY),
  convert: (amount) => amount,
  isLoading: false,
  lastUpdated: null,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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

  // Fetch remote user preference and live exchange rates (PRD §27 & §29)
  useEffect(() => {
    async function loadRemoteCurrencyData() {
      setIsLoading(true);

      // Check cached rates in localStorage
      try {
        const localCachedRates = localStorage.getItem('zerify_cached_fx_rates');
        if (localCachedRates) {
          const parsed = JSON.parse(localCachedRates);
          if (parsed.rates) {
            setRates(parsed.rates);
            setLastUpdated(parsed.timestamp || null);
          }
        }
      } catch (e) {}

      try {
        // Fetch active currencies list & rates in parallel
        const [currList, ratesData, userPref] = await Promise.all([
          currencyService.getCurrencies(),
          currencyService.getRates('USD'),
          currencyService.getUserCurrencyPreference(),
        ]);

        if (currList && currList.length > 0) {
          setCurrencies(currList);
        } else {
          // Fallback to local supported currencies list
          setCurrencies(Object.values(SUPPORTED_CURRENCIES));
        }

        if (ratesData?.rates) {
          setRates(ratesData.rates);
          setLastUpdated(ratesData.rateTimestamp || new Date().toISOString());
          try {
            localStorage.setItem(
              'zerify_cached_fx_rates',
              JSON.stringify({
                rates: ratesData.rates,
                timestamp: ratesData.rateTimestamp,
              })
            );
          } catch (e) {}
        }

        // If user preference found in database profile, apply it directly (PRD §24)
        if (userPref) {
          const norm = normalizeCurrency(userPref);
          setCurrencyState(norm);
          try {
            localStorage.setItem('zerify_preferred_currency', norm);
          } catch (e) {}
        }
      } catch (err) {
        // Soft fallback
      } finally {
        setIsLoading(false);
      }
    }

    loadRemoteCurrencyData();
  }, []);

  const setCurrency = useCallback(async (newCurrency: SupportedCurrency) => {
    const norm = normalizeCurrency(newCurrency);
    setCurrencyState(norm);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zerify_preferred_currency', norm);
      window.dispatchEvent(new Event('zerify_currency_change'));
    }
    // Sync with backend asynchronously
    await currencyService.updateUserCurrencyPreference(norm);
  }, []);

  const symbol = getCurrencySymbol(currency);

  const format = useCallback(
    (
      amount: number | string | null | undefined,
      options?: { compact?: boolean; showDecimals?: boolean; suffix?: string }
    ) => {
      return formatCurrency(amount, currency, options);
    },
    [currency]
  );

  const formatBudget = useCallback(
    (budgetString: string | null | undefined) => {
      return formatBudgetString(budgetString, currency, rates);
    },
    [currency, rates]
  );

  const formatBudgetCompactVal = useCallback(
    (budgetString: string | null | undefined) => {
      return formatBudgetCompact(budgetString, currency, rates);
    },
    [currency, rates]
  );

  const convert = useCallback(
    (amount: number, fromCurrency?: string) => {
      return convertCurrency(amount, fromCurrency || 'USD', currency, rates);
    },
    [currency, rates]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        symbol,
        rates,
        currencies,
        setCurrency,
        format,
        formatBudget,
        formatBudgetCompact: formatBudgetCompactVal,
        convert,
        isLoading,
        lastUpdated,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
