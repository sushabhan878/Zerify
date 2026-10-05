import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentProvider } from '../payment-provider.interface';
import { CashfreePaymentProvider } from './cashfree/cashfree.provider';

export const SUPPORTED_PAYMENT_PROVIDERS = ['CASHFREE'] as const;
export type SupportedPaymentProvider = (typeof SUPPORTED_PAYMENT_PROVIDERS)[number];

/**
 * Resolves a provider id (as stored on payment/payout rows) to its adapter.
 *
 * Keeping resolution here means adding a provider is one new adapter plus one
 * factory branch — no changes anywhere in the service layer (TRD §4).
 */
@Injectable()
export class PaymentProviderFactory {
  constructor(private readonly cashfree: CashfreePaymentProvider) {}

  getProvider(provider: string): PaymentProvider {
    const normalized = (provider || '').toUpperCase();

    switch (normalized) {
      case 'CASHFREE':
        return this.cashfree;
      default:
        throw new BadRequestException(`Unsupported payment provider: ${provider}`);
    }
  }
}
