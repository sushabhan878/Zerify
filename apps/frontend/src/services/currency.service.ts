const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface CurrencyItem {
  code: string;
  name: string;
  symbol: string;
  decimalDigits: number;
  flag?: string;
}

export interface RatesResponse {
  base: string;
  rates: Record<string, number>;
  provider: string;
  rateTimestamp: string;
  isCached: boolean;
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

class CurrencyApiService {
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('zerify_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  async getCurrencies(): Promise<CurrencyItem[]> {
    try {
      const res = await fetch(`${API_URL}/currencies`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.currencies || [];
      }
    } catch (e) {}
    return [];
  }

  async getRates(base: string = 'USD'): Promise<RatesResponse | null> {
    try {
      const res = await fetch(`${API_URL}/currencies/rates?base=${encodeURIComponent(base)}`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return null;
  }

  async convert(amount: number | string, from: string, to: string): Promise<ConversionResponse | null> {
    try {
      const res = await fetch(`${API_URL}/currency/convert`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ amount, from, to }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return null;
  }

  async getUserCurrencyPreference(): Promise<string | null> {
    try {
      const res = await fetch(`${API_URL}/me/preferences/currency`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.currency || null;
      }
    } catch (e) {}
    return null;
  }

  async updateUserCurrencyPreference(currency: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/me/preferences/currency`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ currency }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }
}

export const currencyService = new CurrencyApiService();
