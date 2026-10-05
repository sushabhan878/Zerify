export interface FXRatesResult {
  base: string;
  date: string;
  rates: Record<string, number>;
  provider: string;
}

export interface FXProvider {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  getRates(baseCurrency: string): Promise<FXRatesResult>;
}
