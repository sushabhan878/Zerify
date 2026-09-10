import * as crypto from 'crypto';
import { CashfreePaymentProvider } from './providers/cashfree/cashfree.provider';

describe('CashfreePaymentProvider.verifyWebhook (TRD §43)', () => {
  const secret = 'test-webhook-secret';
  const config = {
    get: (key: string, def?: string) =>
      key === 'CASHFREE_WEBHOOK_SECRET' ? secret : def ?? '',
  } as any;

  let provider: CashfreePaymentProvider;

  beforeEach(() => {
    provider = new CashfreePaymentProvider(config);
  });

  const sign = (timestamp: string, body: string) =>
    crypto.createHmac('sha256', secret).update(timestamp + body).digest('base64');

  it('accepts a correctly signed payload and parses the event', () => {
    const timestamp = '1710000000';
    const body = JSON.stringify({
      type: 'PAYMENT_SUCCESS',
      data: { order: { order_id: 'order-123' } },
    });

    const result = provider.verifyWebhook({
      rawBody: body,
      signature: sign(timestamp, body),
      timestamp,
    });

    expect(result.valid).toBe(true);
    expect(result.event?.eventType).toBe('PAYMENT_SUCCESS');
    expect(result.event?.providerEventId).toBe('order-123');
  });

  it('rejects a tampered body under a valid signature', () => {
    const timestamp = '1710000000';
    const body = JSON.stringify({ type: 'PAYMENT_SUCCESS', data: {} });
    const tampered = JSON.stringify({ type: 'PAYMENT_SUCCESS', data: { evil: true } });

    const result = provider.verifyWebhook({
      rawBody: tampered,
      signature: sign(timestamp, body),
      timestamp,
    });

    expect(result.valid).toBe(false);
  });

  it('rejects a missing or wrong-length signature', () => {
    const timestamp = '1710000000';
    const body = JSON.stringify({ type: 'PAYMENT_SUCCESS' });

    expect(
      provider.verifyWebhook({ rawBody: body, signature: null as any, timestamp }).valid,
    ).toBe(false);
    expect(
      provider.verifyWebhook({ rawBody: body, signature: 'deadbeef', timestamp }).valid,
    ).toBe(false);
  });

  it('rejects when no secret is configured', () => {
    const providerNoSecret = new CashfreePaymentProvider({
      get: (_key: string, def?: string) => def ?? '',
    } as any);

    const timestamp = '1710000000';
    const body = JSON.stringify({ type: 'PAYMENT_SUCCESS' });
    expect(
      providerNoSecret.verifyWebhook({
        rawBody: body,
        signature: sign(timestamp, body),
        timestamp,
      }).valid,
    ).toBe(false);
  });
});
