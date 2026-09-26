import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../database/prisma.service';
import {
  SUPPORTED_CURRENCIES,
  BASELINE_USD_RATES,
  DEFAULT_PLATFORM_CURRENCY,
  DEFAULT_USER_CURRENCY,
  FX_CACHE_TTL_MS,
  CurrencyMeta,
} from './currency.constants';
import { OpenExchangeRatesProvider } from './fx/open-exchange-rates.provider';
import { FrankfurterProvider } from './fx/frankfurter.provider';
import { ConversionResponse } from './currency.types';

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  INR: '🇮🇳',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  CAD: '🇨🇦',
  AUD: '🇦🇺',
  JPY: '🇯🇵',
  AED: '🇦🇪',
  SGD: '🇸🇬',
  CHF: '🇨🇭',
  CNY: '🇨🇳',
  BRL: '🇧🇷',
  ZAR: '🇿🇦',
  SEK: '🇸🇪',
  NZD: '🇳🇿',
  KRW: '🇰🇷',
  THB: '🇹🇭',
  IDR: '🇮🇩',
  MYR: '🇲🇾',
  PHP: '🇵🇭',
  SAR: '🇸🇦',
  TRY: '🇹🇷',
  MXN: '🇲🇽',
};

@Injectable()
export class CurrencyService implements OnModuleInit {
  private readonly logger = new Logger(CurrencyService.name);

  // In-memory fallback cache
  private memoryRatesCache: {
    base: string;
    rates: Record<string, number>;
    provider: string;
    timestamp: string;
    fetchedAt: number;
  } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly oerProvider: OpenExchangeRatesProvider,
    private readonly frankfurterProvider: FrankfurterProvider,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async onModuleInit() {
    await this.seedCurrenciesIfEmpty();
  }

  /**
   * Seeds the currencies database table if empty
   */
  private async seedCurrenciesIfEmpty(): Promise<void> {
    try {
      const count = await this.prisma.currency.count();
      if (count === 0) {
        this.logger.log('Seeding initial currencies table in database...');
        for (const c of SUPPORTED_CURRENCIES) {
          await this.prisma.currency.upsert({
            where: { code: c.code },
            update: {
              name: c.name,
              symbol: c.symbol,
              decimalDigits: c.decimalDigits,
              isActive: true,
            },
            create: {
              code: c.code,
              name: c.name,
              symbol: c.symbol,
              decimalDigits: c.decimalDigits,
              symbolPosition: 'prefix',
              isActive: true,
              provider: 'system',
            },
          });
        }
        this.logger.log(`Seeded ${SUPPORTED_CURRENCIES.length} currencies into database.`);
      }
    } catch (err: any) {
      this.logger.error(`Error seeding currencies: ${err.message}`);
    }
  }

  /**
   * Returns list of all active currencies fetched directly from database (PRD §15 & §23)
   */
  async getCurrencies(): Promise<{ currencies: CurrencyMeta[] }> {
    try {
      const dbCurrencies = await this.prisma.currency.findMany({
        where: { isActive: true },
        orderBy: { code: 'asc' },
      });

      if (dbCurrencies && dbCurrencies.length > 0) {
        const formatted: CurrencyMeta[] = dbCurrencies.map((c) => ({
          code: c.code,
          name: c.name,
          symbol: c.symbol || c.code,
          decimalDigits: c.decimalDigits ?? 2,
          flag: CURRENCY_FLAGS[c.code] || '🌐',
        }));
        return { currencies: formatted };
      }

      // If DB was empty, seed and retry
      await this.seedCurrenciesIfEmpty();
      const rechecked = await this.prisma.currency.findMany({
        where: { isActive: true },
        orderBy: { code: 'asc' },
      });
      if (rechecked && rechecked.length > 0) {
        return {
          currencies: rechecked.map((c) => ({
            code: c.code,
            name: c.name,
            symbol: c.symbol || c.code,
            decimalDigits: c.decimalDigits ?? 2,
            flag: CURRENCY_FLAGS[c.code] || '🌐',
          })),
        };
      }
    } catch (err: any) {
      this.logger.error(`Failed to fetch currencies from database: ${err.message}`);
    }

    return { currencies: SUPPORTED_CURRENCIES };
  }

  /**
   * Fetches latest exchange rates against base currency (default USD)
   * Stored in and retrieved from exchange_rates table in DB (PRD §16)
   */
  async getRates(baseCurrency: string = DEFAULT_PLATFORM_CURRENCY): Promise<{
    base: string;
    rates: Record<string, number>;
    provider: string;
    rateTimestamp: string;
    isCached: boolean;
  }> {
    const baseUpper = (baseCurrency || 'USD').toUpperCase().trim();
    const cacheKey = `fx_rates_usd_v1`;

    let usdRatesData: {
      rates: Record<string, number>;
      provider: string;
      timestamp: string;
    } | null = null;
    let isCached = false;

    // 1. Check cache manager (Redis / memory)
    try {
      const cached = await this.cacheManager.get<string>(cacheKey);
      if (cached) {
        usdRatesData = typeof cached === 'string' ? JSON.parse(cached) : cached;
        isCached = true;
      }
    } catch (e) {
      // Ignore cache manager error
    }

    // 2. Check local memory cache if still fresh (< 1 hour)
    if (!usdRatesData && this.memoryRatesCache) {
      const age = Date.now() - this.memoryRatesCache.fetchedAt;
      if (age < FX_CACHE_TTL_MS) {
        usdRatesData = this.memoryRatesCache;
        isCached = true;
      }
    }

    // 3. Check database exchange_rates table for recent snapshot (< 1 hour)
    if (!usdRatesData) {
      try {
        const oneHourAgo = new Date(Date.now() - FX_CACHE_TTL_MS);
        const dbRates = await this.prisma.exchangeRate.findMany({
          where: {
            baseCurrency: 'USD',
            fetchedAt: { gte: oneHourAgo },
          },
          orderBy: { fetchedAt: 'desc' },
        });

        if (dbRates && dbRates.length >= 10) {
          const ratesMap: Record<string, number> = { USD: 1 };
          for (const item of dbRates) {
            ratesMap[item.quoteCurrency] = Number(item.rate);
          }
          usdRatesData = {
            rates: { ...BASELINE_USD_RATES, ...ratesMap },
            provider: dbRates[0].provider || 'database_cache',
            timestamp: dbRates[0].rateTimestamp.toISOString(),
          };
          isCached = true;
        }
      } catch (err: any) {
        this.logger.warn(`Could not read exchange rates from database: ${err.message}`);
      }
    }

    // 4. Fetch from live providers if cache & DB missed
    if (!usdRatesData) {
      try {
        if (await this.oerProvider.isAvailable()) {
          const res = await this.oerProvider.getRates('USD');
          usdRatesData = {
            rates: { ...BASELINE_USD_RATES, ...(res.rates || {}) },
            provider: res.provider,
            timestamp: res.date,
          };
        }
      } catch (err: any) {
        this.logger.warn(`OpenExchangeRates unavailable, attempting fallback: ${err.message}`);
      }

      if (!usdRatesData) {
        try {
          const res = await this.frankfurterProvider.getRates('USD');
          usdRatesData = {
            rates: { ...BASELINE_USD_RATES, ...(res.rates || {}) },
            provider: res.provider,
            timestamp: res.date,
          };
        } catch (err: any) {
          this.logger.warn(`Frankfurter fallback failed: ${err.message}`);
        }
      }

      // If both providers failed, use baseline rates
      if (!usdRatesData) {
        this.logger.warn('Using baseline fallback exchange rates');
        usdRatesData = {
          rates: BASELINE_USD_RATES,
          provider: 'baseline_fallback',
          timestamp: new Date().toISOString(),
        };
      }

      // Store in memory cache & cache manager
      this.memoryRatesCache = {
        base: 'USD',
        ...usdRatesData,
        fetchedAt: Date.now(),
      };

      try {
        await this.cacheManager.set(cacheKey, JSON.stringify(usdRatesData), FX_CACHE_TTL_MS);
      } catch (e) {}

      // Persist latest exchange rates to database asynchronously (PRD §16)
      const currentRatesData = usdRatesData;
      const rateTimestampDate = new Date(currentRatesData.timestamp);
      const safeTimestamp = isNaN(rateTimestampDate.getTime()) ? new Date() : rateTimestampDate;

      // Fire and forget rate persistence to avoid blocking request
      (async () => {
        try {
          for (const [quote, rateVal] of Object.entries(currentRatesData.rates)) {
            await this.prisma.exchangeRate.upsert({
              where: {
                baseCurrency_quoteCurrency_provider_rateTimestamp: {
                  baseCurrency: 'USD',
                  quoteCurrency: quote,
                  provider: currentRatesData.provider,
                  rateTimestamp: safeTimestamp,
                },
              },
              update: {
                rate: rateVal,
                fetchedAt: new Date(),
              },
              create: {
                baseCurrency: 'USD',
                quoteCurrency: quote,
                rate: rateVal,
                provider: currentRatesData.provider,
                rateTimestamp: safeTimestamp,
                fetchedAt: new Date(),
              },
            });
          }
        } catch (e: any) {
          // Ignore unique collision or transient DB error
        }
      })();
    }

    // If base currency is USD, return directly
    if (baseUpper === 'USD') {
      return {
        base: 'USD',
        rates: usdRatesData.rates,
        provider: usdRatesData.provider,
        rateTimestamp: usdRatesData.timestamp,
        isCached,
      };
    }

    // Cross-currency conversion for non-USD base (PRD §46)
    const baseToUsdRate = usdRatesData.rates[baseUpper];
    if (!baseToUsdRate || baseToUsdRate <= 0) {
      return {
        base: baseUpper,
        rates: usdRatesData.rates,
        provider: usdRatesData.provider,
        rateTimestamp: usdRatesData.timestamp,
        isCached,
      };
    }

    const rebasedRates: Record<string, number> = {};
    for (const [code, rateAgainstUsd] of Object.entries(usdRatesData.rates)) {
      rebasedRates[code] = Math.round((rateAgainstUsd / baseToUsdRate) * 1000000) / 1000000;
    }
    rebasedRates[baseUpper] = 1;

    return {
      base: baseUpper,
      rates: rebasedRates,
      provider: usdRatesData.provider,
      rateTimestamp: usdRatesData.timestamp,
      isCached,
    };
  }

  /**
   * Converts amount between currencies (PRD §20, §21, §22)
   */
  async convert(amount: number | string, fromCurrency: string, toCurrency: string): Promise<ConversionResponse> {
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;
    const cleanAmount = isNaN(numAmount) ? 0 : numAmount;

    const fromUpper = (fromCurrency || 'USD').toUpperCase().trim();
    const toUpper = (toCurrency || 'INR').toUpperCase().trim();

    // Same-currency optimization (PRD §21)
    if (fromUpper === toUpper) {
      const dec = SUPPORTED_CURRENCIES.find((c) => c.code === toUpper)?.decimalDigits ?? 2;
      const formattedAmt = cleanAmount.toFixed(dec);

      return {
        original: {
          amount: formattedAmt,
          currency: fromUpper,
        },
        display: {
          amount: formattedAmt,
          currency: toUpper,
        },
        conversion: {
          rate: '1.000000',
          provider: 'identity',
          rateTimestamp: new Date().toISOString(),
          fetchedAt: new Date().toISOString(),
          isCached: true,
        },
      };
    }

    // Get USD base rates
    const ratesData = await this.getRates('USD');
    const fromRateAgainstUsd = ratesData.rates[fromUpper] || BASELINE_USD_RATES[fromUpper] || 1;
    const toRateAgainstUsd = ratesData.rates[toUpper] || BASELINE_USD_RATES[toUpper] || 1;

    // Cross-rate: 1 FROM = X TO
    const crossRate = toRateAgainstUsd / fromRateAgainstUsd;
    const convertedAmount = cleanAmount * crossRate;

    const toDecimals = SUPPORTED_CURRENCIES.find((c) => c.code === toUpper)?.decimalDigits ?? 2;
    const fromDecimals = SUPPORTED_CURRENCIES.find((c) => c.code === fromUpper)?.decimalDigits ?? 2;

    return {
      original: {
        amount: cleanAmount.toFixed(fromDecimals),
        currency: fromUpper,
      },
      display: {
        amount: convertedAmount.toFixed(toDecimals),
        currency: toUpper,
      },
      conversion: {
        rate: crossRate.toFixed(6),
        provider: ratesData.provider,
        rateTimestamp: ratesData.rateTimestamp,
        fetchedAt: new Date().toISOString(),
        isCached: ratesData.isCached,
      },
    };
  }

  /**
   * Retrieves user currency preference from BrandProfile or InfluencerProfile (PRD §24)
   */
  async getUserCurrencyPreference(userId: string): Promise<{ currency: string }> {
    if (!userId) {
      return { currency: DEFAULT_USER_CURRENCY };
    }

    // Check influencer profile
    const influencer = await this.prisma.influencerProfile.findUnique({
      where: { userId },
      select: { currency: true },
    });
    if (influencer?.currency) {
      return { currency: influencer.currency };
    }

    // Check brand profile
    const brand = await this.prisma.brandProfile.findUnique({
      where: { userId },
      select: { currency: true },
    });
    if (brand?.currency) {
      return { currency: brand.currency };
    }

    return { currency: DEFAULT_USER_CURRENCY };
  }

  /**
   * Updates user currency preference on their profile (PRD §24)
   */
  async updateUserCurrencyPreference(userId: string, currency: string): Promise<{ currency: string; updated: boolean }> {
    const norm = (currency || 'INR').toUpperCase().trim();

    // Check if user has an influencer profile
    const influencer = await this.prisma.influencerProfile.findUnique({ where: { userId } });
    if (influencer) {
      await this.prisma.influencerProfile.update({
        where: { userId },
        data: { currency: norm },
      });
      return { currency: norm, updated: true };
    }

    // Check if user has a brand profile
    const brand = await this.prisma.brandProfile.findUnique({ where: { userId } });
    if (brand) {
      await this.prisma.brandProfile.update({
        where: { userId },
        data: { currency: norm },
      });
      return { currency: norm, updated: true };
    }

    return { currency: norm, updated: true };
  }
}
