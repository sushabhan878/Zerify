import { Injectable, Logger } from '@nestjs/common';
import { FXProvider, FXRatesResult } from './fx-provider.interface';

@Injectable()
export class OpenExchangeRatesProvider implements FXProvider {
  readonly name = 'openexchangerates';
  private readonly logger = new Logger(OpenExchangeRatesProvider.name);

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.OPEN_EXCHANGE_RATES_APP_ID);
  }

  async getRates(baseCurrency: string = 'USD'): Promise<FXRatesResult> {
    const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID;
    if (!appId) {
      throw new Error('OPEN_EXCHANGE_RATES_APP_ID not configured');
    }

    const url = `https://openexchangerates.org/api/latest.json?app_id=${encodeURIComponent(appId)}&base=${encodeURIComponent(baseCurrency)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`OpenExchangeRates error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        base: data.base || 'USD',
        date: data.timestamp ? new Date(data.timestamp * 1000).toISOString() : new Date().toISOString(),
        rates: data.rates || {},
        provider: this.name,
      };
    } catch (err: any) {
      clearTimeout(timeout);
      this.logger.warn(`OpenExchangeRates request failed: ${err.message}`);
      throw err;
    }
  }
}
