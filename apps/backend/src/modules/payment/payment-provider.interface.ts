/**
 * Provider abstraction for the Payments domain.
 *
 * Business logic depends only on this interface. Concrete provider
 * integrations (Cashfree, future providers) implement it and are selected
 * via {@link PaymentProviderFactory}. This keeps provider-specific APIs out
 * of the service layer, per the TRD §4.
 */

export interface CreateOrderInput {
  /** Internal payment record id (Zerify-controlled). */
  paymentId: string;
  /** Amount in minor units (paise for INR). */
  amountMinor: number;
  currency: string;
  /** Human-readable order/reference for the payer.*/
  orderDescription?: string;
  /** Absolute return URL the provider must redirect to after payment. */
  returnUrl: string;
  /** ISO-8601 timestamp after which the order should expire. */
  expiresAt?: string;
}

export interface CreateOrderResult {
  providerOrderId: string;
  /** Provider session/checkout identifier, if any. */
  paymentSessionId?: string;
  /** URL the client should open to complete payment. */
  paymentUrl?: string;
}

export interface OrderStatusResult {
  providerOrderId: string;
  providerPaymentId?: string;
  /** Provider-reported status, normalized to the domain enum in the adapter. */
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'UNKNOWN';
  amountMinor?: number;
  currency?: string;
  paymentMethod?: string;
  failureCode?: string;
  failureReason?: string;
  /** How this status reached Zerify — 'webhook' or 'api' — for audit attribution. */
  source?: 'webhook' | 'api';
}

export interface CreateRefundInput {
  /** Internal refund record id; also serves as the provider refund id. */
  refundId: string;
  providerOrderId: string;
  amountMinor: number;
  currency: string;
  note?: string;
}

export interface CreateRefundResult {
  providerRefundId: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
}

export interface CreatePayoutInput {
  payoutId: string;
  /** Beneficiary reference/token on the provider side. */
  beneficiaryReference: string;
  amountMinor: number;
  currency: string;
}

export interface CreatePayoutResult {
  providerPayoutId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'UNKNOWN';
}

export interface PayoutStatusResult {
  providerPayoutId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'UNKNOWN';
  failureCode?: string;
  failureReason?: string;
}

export interface VerifyWebhookInput {
  /** Raw, unmodified request body. */
  rawBody: string;
  /** Provider-signature header value. */
  signature: string | null;
  /** RFC-3339 timestamp header, when the provider supplies one. */
  timestamp?: string | null;
}

export interface VerifyWebhookResult {
  valid: boolean;
  /** Parsed event payload once the signature is verified. */
  event?: {
    eventType: string;
    providerEventId: string;
    data: Record<string, unknown>;
  };
}

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');

/**
 * The contract every payment provider adapter must satisfy.
 *
 * Business services depend on this interface (injected via
 * {@link PAYMENT_PROVIDER}), never on a concrete adapter — so adding a second
 * provider means writing one class and one factory branch.
 */
export interface PaymentProvider {
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  getOrder(providerOrderId: string): Promise<OrderStatusResult>;

  createRefund(input: CreateRefundInput): Promise<CreateRefundResult>;

  createPayout(input: CreatePayoutInput): Promise<CreatePayoutResult>;
  getPayout(providerPayoutId: string): Promise<PayoutStatusResult>;

  verifyWebhook(input: VerifyWebhookInput): VerifyWebhookResult;
}
