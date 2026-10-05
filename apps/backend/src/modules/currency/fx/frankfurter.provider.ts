import { Injectable, Logger } from '@nestjs/common';
import { FXProvider, FXRatesResult } from './fx-provider.interface';

@Injectable()
export class FrankfurterProvider implements FXProvider {
  readonly name = 'frankfurter';
  private readonly logger = new Logger(FrankfurterProvider.name);

  async isAvailable(): Promise<boolean> {
    return true; // Public free API
  }

  async getRates(baseCurrency: string = 'USD'): Promise<FXRatesResult> {
    const urls = [
      `https://api.frankfurter.dev/v1/latest?base=${encodeURIComponent(baseCurrency)}`,
      `https://api.frankfurter.app/latest?from=${encodeURIComponent(baseCurrency)}`,
    ];

    let lastError: any = null;

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const rates: Record<string, number> = {
            ...(data.rates || {}),
            [baseCurrency]: 1,
          };

          return {
            base: data.base || baseCurrency,
            date: data.date || new Date().toISOString(),
            rates,
            provider: this.name,
          };
        }
      } catch (err) {
        lastError = err;
      }
    }

    this.logger.warn(`Frankfurter provider fetch failed: ${lastError?.message || 'unknown'}`);
    throw lastError || new Error('Frankfurter provider unavailable');
  }
}
