import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  CreateOrderInput,
  CreateOrderResult,
  CreatePayoutInput,
  CreatePayoutResult,
  CreateRefundInput,
  CreateRefundResult,
  OrderStatusResult,
  PaymentProvider,
  PayoutStatusResult,
  VerifyWebhookInput,
  VerifyWebhookResult,
} from '../../payment-provider.interface';

/** Cashfree order-level status values (PG API v2023-08-01). */
const ORDER_STATUS_PAID = 'PAID';
const ORDER_STATUS_ACTIVE = 'ACTIVE';
const ORDER_STATUS_EXPIRED = 'EXPIRED';
const ORDER_STATUS_TERMINATED = 'TERMINATED';

/** Cashfree per-payment status values. */
const PAYMENT_STATUS_SUCCESS = 'SUCCESS';
const PAYMENT_STATUS_PENDING = 'PENDING';
const PAYMENT_STATUS_NOT_ATTEMPTED = 'NOT_ATTEMPTED';

const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Cashfree provider adapter.
 *
 * Implements the Payments-domain provider contract against Cashfree's REST
 * API. Provider-specific shapes (status strings, field names, auth headers)
 * are normalized here so nothing outside this file needs to know Cashfree
 * exists (TRD §4, §29).
 *
 * Configuration (see .env.example):
 *   CASHFREE_CLIENT_ID, CASHFREE_CLIENT_SECRET, CASHFREE_ENVIRONMENT,
 *   CASHFREE_API_VERSION, CASHFREE_WEBHOOK_SECRET, CASHFREE_RETURN_URL
 *
 * ASSUMPTIONS TO VERIFY before production (TRD §42):
 *   - Payment Gateway endpoints do not require a separate token exchange;
 *     they authenticate per-request via x-client-id / x-client-secret.
 *   - The Payouts product uses a bearer token from /payout/v1/authorize.
 *   - Webhook signature is base64(HMAC-SHA256(timestamp + rawBody, secret))
 *     delivered in the `x-webhook-signature` header alongside
 *     `x-webhook-timestamp`.
 * Each of these must be confirmed against current Cashfree documentation and
 * exercised in sandbox with real credentials before go-live.
 */
@Injectable()
export class CashfreePaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(CashfreePaymentProvider.name);

  private readonly baseUrl: string;
  private readonly payoutBaseUrl: string;
  private readonly apiVersion: string;

  /** Cached payout bearer token. */
  private payoutTokenCache: { token: string; expiresAt: number } | null = null;

  /** Single-flight guard so concurrent callers don't stampede the auth endpoint. */
  private payoutTokenInFlight: Promise<string> | null = null;

  constructor(private readonly configService: ConfigService) {
    const environment = this.configService.get<string>('CASHFREE_ENVIRONMENT', 'sandbox');
    const isProduction = environment === 'production';

    this.baseUrl = isProduction
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';
    this.payoutBaseUrl = isProduction
      ? 'https://api.cashfree.com/payout'
      : 'https://sandbox.cashfree.com/payout';

    this.apiVersion = this.configService.get<string>('CASHFREE_API_VERSION', '2023-08-01');
  }

  private get clientId(): string {
    return this.configService.get<string>('CASHFREE_CLIENT_ID', '');
  }

  private get clientSecret(): string {
    return this.configService.get<string>('CASHFREE_CLIENT_SECRET', '');
  }

  private get webhookSecret(): string {
    return this.configService.get<string>('CASHFREE_WEBHOOK_SECRET', '');
  }

  private get returnUrl(): string {
    return this.configService.get<string>(
      'CASHFREE_RETURN_URL',
      'http://localhost:3000/payment/callback',
    );
  }

  // ------------------------------------------------------------------ http

  /**
   * Performs an HTTP request with a hard timeout and structured error
   * surfacing. Provider timeouts must NOT be interpreted as payment failure
   * by callers — they surface as an error here and the caller resolves the
   * true state via {@link getOrder} (TRD §32).
   */
  private async request<T>(
    url: string,
    init: RequestInit & { headers: Record<string, string> },
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      const text = await response.text();

      let body: any = null;
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }
      }

      if (!response.ok) {
        const message =
          (body && typeof body === 'object' && (body.message || body.error)) ||
          (typeof body === 'string' ? body : '') ||
          response.statusText;

        this.logger.error(
          `Cashfree ${init.method ?? 'GET'} ${url} failed [${response.status}]: ${message}`,
        );
        throw new InternalServerErrorException(
          `Cashfree request failed (${response.status}): ${message}`,
        );
      }

      return body as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error(`Cashfree request timed out after ${REQUEST_TIMEOUT_MS}ms: ${url}`);
        throw new InternalServerErrorException('Cashfree request timed out');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /** Standard PG request headers — authenticated per-request. */
  private pgHeaders(): Record<string, string> {
    return {
      'x-client-id': this.clientId,
      'x-client-secret': this.clientSecret,
      'x-api-version': this.apiVersion,
      'Content-Type': 'application/json',
    };
  }

  // ------------------------------------------------------------------ orders

  /**
   * Creates a Cashfree order and returns the checkout session id.
   *
   * `paymentId` doubles as the provider order id, which makes the mapping
   * back to our own record unambiguous and lets us look an order up without
   * storing a second identifier.
   */
  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const body = {
      order_id: input.paymentId,
      order_amount: Number((input.amountMinor / 100).toFixed(2)),
      order_currency: input.currency,
      order_note: input.orderDescription ?? undefined,
      order_meta: {
        return_url: input.returnUrl || this.returnUrl,
      },
    };

    const response = await this.request<any>(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: this.pgHeaders(),
      body: JSON.stringify(body),
    });

    const providerOrderId = response?.order_id ?? input.paymentId;
    const paymentSessionId = response?.payment_session_id ?? undefined;

    if (!paymentSessionId) {
      this.logger.warn(
        `Cashfree order ${providerOrderId} returned no payment_session_id; checkout cannot start`,
      );
    }

    return {
      providerOrderId,
      paymentSessionId,
      // Cashfree's JS SDK consumes payment_session_id; no redirect URL needed.
      paymentUrl: undefined,
    };
  }

  /**
   * Resolves an order's true state from Cashfree.
   *
   * Cashfree reports status at two levels: a coarse `order_status` and a list
   * of per-attempt payments. We prefer the most recent successful payment so
   * a failed first attempt followed by a successful retry reports SUCCESSFUL.
   */
  async getOrder(providerOrderId: string): Promise<OrderStatusResult> {
    const order = await this.request<any>(`${this.baseUrl}/orders/${providerOrderId}`, {
      method: 'GET',
      headers: this.pgHeaders(),
    });

    const orderStatus: string = order?.order_status ?? '';
    const orderAmountMinor =
      order?.order_amount !== undefined ? Math.round(Number(order.order_amount) * 100) : undefined;

    // A paid order is unambiguous — no need to inspect individual payments.
    if (orderStatus === ORDER_STATUS_PAID) {
      const payments = await this.getOrderPayments(providerOrderId);
      const successful = payments.find((p) => p.payment_status === PAYMENT_STATUS_SUCCESS);

      return {
        providerOrderId,
        providerPaymentId: successful?.cf_payment_id
          ? String(successful.cf_payment_id)
          : undefined,
        status: 'SUCCESSFUL',
        amountMinor: successful?.payment_amount
          ? Math.round(Number(successful.payment_amount) * 100)
          : orderAmountMinor,
        currency: order?.order_currency,
        paymentMethod: successful?.payment_group,
      };
    }

    if (orderStatus === ORDER_STATUS_ACTIVE) {
      return {
        providerOrderId,
        status: 'PENDING',
        amountMinor: orderAmountMinor,
        currency: order?.order_currency,
      };
    }

    if (orderStatus === ORDER_STATUS_EXPIRED || orderStatus === ORDER_STATUS_TERMINATED) {
      return {
        providerOrderId,
        status: 'FAILED',
        amountMinor: orderAmountMinor,
        currency: order?.order_currency,
        failureCode: orderStatus,
        failureReason: `Cashfree order ${orderStatus.toLowerCase()}`,
      };
    }

    return {
      providerOrderId,
      status: 'UNKNOWN',
      amountMinor: orderAmountMinor,
      currency: order?.order_currency,
    };
  }

  private async getOrderPayments(providerOrderId: string): Promise<any[]> {
    const payments = await this.request<any[]>(
      `${this.baseUrl}/orders/${providerOrderId}/payments`,
      { method: 'GET', headers: this.pgHeaders() },
    );
    return Array.isArray(payments) ? payments : [];
  }

  // ------------------------------------------------------------------ refunds
  /**
   * Creates a refund against a successful payment.
   *
   * `refundId` must be unique per refund attempt — Cashfree rejects a reused
   * refund id, which is what makes a retried request safe.
   */
  async createRefund(input: CreateRefundInput): Promise<CreateRefundResult> {
    const body = {
      refund_amount: Number((input.amountMinor / 100).toFixed(2)),
      refund_id: input.refundId,
      refund_note: input.note ?? undefined,
    };

    const response = await this.request<any>(
      `${this.baseUrl}/orders/${input.providerOrderId}/refunds`,
      {
        method: 'POST',
        headers: this.pgHeaders(),
        body: JSON.stringify(body),
      },
    );

    const status: string = response?.refund_status ?? '';
    return {
      providerRefundId: String(response?.cf_refund_id ?? response?.refund_id ?? input.refundId),
      status:
        status === 'SUCCESS' ? 'SUCCESSFUL' : status === 'PENDING' ? 'PENDING' : 'FAILED',
    };
  }

  // ------------------------------------------------------------------ payouts

  /** Fetches (and caches) a payouts bearer token, coalescing concurrent callers. */
  private async getPayoutAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.payoutTokenCache && this.payoutTokenCache.expiresAt > now + 30_000) {
      return this.payoutTokenCache.token;
    }
    if (this.payoutTokenInFlight) {
      return this.payoutTokenInFlight;
    }

    this.payoutTokenInFlight = this.fetchPayoutAccessToken().finally(() => {
      this.payoutTokenInFlight = null;
    });
    return this.payoutTokenInFlight;
  }

  private async fetchPayoutAccessToken(): Promise<string> {
    const response = await this.request<any>(`${this.payoutBaseUrl}/v1/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-version': this.apiVersion },
      body: JSON.stringify({ clientId: this.clientId, clientSecret: this.clientSecret }),
    });

    const token: string = response?.data?.token ?? response?.token;
    if (!token) {
      throw new InternalServerErrorException('Cashfree payout authorization returned no token');
    }

    this.payoutTokenCache = { token, expiresAt: Date.now() + 25 * 60 * 1000 };
    return token;
  }

  private async payoutHeaders(): Promise<Record<string, string>> {
    return {
      Authorization: `Bearer ${await this.getPayoutAccessToken()}`,
      'Content-Type': 'application/json',
      'x-api-version': this.apiVersion,
    };
  }

  async createPayout(input: CreatePayoutInput): Promise<CreatePayoutResult> {
    const body = {
      transferId: input.payoutId,
      amount: Number((input.amountMinor / 100).toFixed(2)),
      currency: input.currency,
      // Provider-side beneficiary reference; never a raw bank credential.
      beneficiaryId: input.beneficiaryReference,
    };

    const response = await this.request<any>(`${this.payoutBaseUrl}/v1/transfers`, {
      method: 'POST',
      headers: await this.payoutHeaders(),
      body: JSON.stringify(body),
    });

    const status: string = response?.data?.status ?? response?.status ?? 'PENDING';

    return {
      providerPayoutId: String(
        response?.data?.referenceId ?? response?.referenceId ?? input.payoutId,
      ),
      status: this.normalizePayoutStatus(status),
    };
  }

  async getPayout(providerPayoutId: string): Promise<PayoutStatusResult> {
    const response = await this.request<any>(
      `${this.payoutBaseUrl}/v1/transfers/${providerPayoutId}`,
      { method: 'GET', headers: await this.payoutHeaders() },
    );

    const data = response?.data ?? response;
    const status: string = data?.status ?? '';

    return {
      providerPayoutId,
      status: this.normalizePayoutStatus(status),
      failureCode: data?.statusCode ?? undefined,
      failureReason: data?.statusDescription ?? undefined,
    };
  }

  private normalizePayoutStatus(
    status: string,
  ): 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'UNKNOWN' {
    switch ((status || '').toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'COMPLETED';
      case 'PENDING':
        return 'PENDING';
      case 'PROCESSING':
      case 'IN_PROGRESS':
        return 'PROCESSING';
      case 'FAILED':
      case 'REVERSED':
      case 'REJECTED':
        return 'FAILED';
      default:
        return 'UNKNOWN';
    }
  }

  // ------------------------------------------------------------------ webhooks

  /**
   * Verifies a webhook's authenticity using the shared secret.
   *
   * Cashfree signs `x-webhook-timestamp` concatenated with the raw request
   * body, base64-encoding the HMAC-SHA256 digest. Verification MUST run over
   * the raw bytes — re-serializing the parsed JSON changes the payload and
   * breaks the digest (TRD §43).
   *
   * The comparison is timing-safe to avoid leaking the expected signature
   * through response timing.
   */
  verifyWebhook(input: VerifyWebhookInput): VerifyWebhookResult {
    const { rawBody, signature, timestamp } = input;

    if (!this.webhookSecret) {
      this.logger.error('CASHFREE_WEBHOOK_SECRET is not configured; rejecting webhook');
      return { valid: false };
    }
    if (!signature || !timestamp) {
      this.logger.warn('Webhook missing signature or timestamp header; rejecting');
      return { valid: false };
    }

    const expected = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(timestamp + rawBody)
      .digest('base64');

    const expectedBuffer = Buffer.from(expected, 'utf8');
    const receivedBuffer = Buffer.from(signature, 'utf8');

    // Length check first: timingSafeEqual throws on mismatched lengths.
    if (expectedBuffer.length !== receivedBuffer.length) {
      this.logger.warn('Webhook signature length mismatch; rejecting');
      return { valid: false };
    }
    if (!crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      this.logger.warn('Webhook signature mismatch; rejecting');
      return { valid: false };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      this.logger.error('Webhook signature valid but body is not valid JSON');
      return { valid: false };
    }

    const eventType: string = parsed?.type ?? parsed?.event ?? '';
    // Cashfree's payload carries the semantic event; providerEventId must be
    // stable across redeliveries of the same event so dedup works.
    const providerEventId: string = String(
      parsed?.data?.order?.order_id ??
        parsed?.data?.refund?.refund_id ??
        parsed?.data?.transfer?.referenceId ??
        parsed?.id ??
        `${parsed?.type ?? 'event'}_${JSON.stringify(parsed?.data ?? {}).length}`,
    );

    return {
      valid: true,
      event: {
        eventType,
        providerEventId,
        data: (parsed?.data ?? {}) as Record<string, unknown>,
      },
    };
  }
}
