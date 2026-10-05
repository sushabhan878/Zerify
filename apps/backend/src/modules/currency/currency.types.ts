export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalDigits: number;
  flag?: string;
}

export interface ExchangeRateResult {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  provider: string;
  rateTimestamp: string;
  isCached?: boolean;
}

export interface ConversionResponse {
  original: {
    amount: string;
    currency: string;
  };
  display: {
    amount: string;
    currency: string;
  };
  conversion: {
    rate: string;
    provider: string;
    rateTimestamp: string;
    fetchedAt: string;
    isCached: boolean;
  };
}
