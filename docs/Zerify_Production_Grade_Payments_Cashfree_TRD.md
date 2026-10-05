# Zerify Production-Grade Payments & Financial Architecture

## Cashfree Integration, Ledger, Campaign Funding, Payouts, Refunds, Reconciliation & Compliance

**Document Type:** Technical Requirements Document (TRD)\
**Product:** Zerify Influencer Marketing Marketplace\
**Primary Payment Provider:** Cashfree\
**Target Market:** India\
**Status:** Production Architecture\
**Version:** 1.0

------------------------------------------------------------------------

# 1. Executive Summary

Zerify should **not build a payment gateway or payment processor from
scratch**.

Instead, Zerify should build its own production-grade **Payments &
Financials domain** and use Cashfree as the regulated payment
infrastructure/provider.

The architecture must separate:

1.  Payment processing
2.  Zerify's internal financial ledger
3.  Campaign financial state
4.  Influencer payout state
5.  Refunds
6.  Platform fees
7.  Tax-related accounting
8.  Reconciliation
9.  Audit trails
10. Webhook/event processing

The critical principle is:

> Cashfree is the payment infrastructure. Zerify owns the business
> financial logic.

Zerify must never treat a frontend success callback as proof of payment.
Payment state must be confirmed server-side using verified provider
events/API responses.

------------------------------------------------------------------------

# 2. Goals

## 2.1 Primary Goals

The system must support:

-   Brand payment collection
-   Campaign funding
-   Campaign-level financial tracking
-   Platform/service fees
-   Influencer payable calculation
-   Influencer payouts
-   Refunds
-   Partial refunds where supported
-   Payment failures
-   Payout failures and retries
-   Webhook processing
-   Idempotent financial operations
-   Immutable financial records
-   Double-entry-style ledger principles
-   Reconciliation
-   Financial audit history
-   Admin financial operations
-   Tax-related transaction metadata
-   Provider abstraction
-   Horizontal scalability

## 2.2 Non-Goals

Zerify should not initially attempt to become:

-   A payment gateway
-   A card processor
-   A UPI network
-   A bank
-   A payment aggregator
-   A wallet issuer
-   A regulated escrow provider unless separately structured and legally
    approved

------------------------------------------------------------------------

# 3. High-Level Architecture

``` text
                         ZERIFY
                            |
                  +---------v----------+
                  | Payment API        |
                  | & Financial Domain |
                  +---------+----------+
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
         Order Service   Ledger       Payout Service
              |          Service           |
              |             |               |
              +-------------+---------------+
                            |
                  Provider Abstraction
                            |
                  +---------v----------+
                  | Cashfree Adapter   |
                  +---------+----------+
                            |
                     +------v------+
                     |  Cashfree   |
                     +------+------+
                            |
              +-------------+-------------+
              |             |             |
             UPI          Cards      Other Methods
```

------------------------------------------------------------------------

# 4. Provider Abstraction

Do not couple business logic directly to Cashfree-specific APIs.

Create:

``` text
PaymentProvider
├── createOrder()
├── getOrder()
├── getPayment()
├── createRefund()
├── getRefund()
├── createPayout()
├── getPayout()
└── verifyWebhook()
```

Implementation:

``` text
PaymentProvider
    |
    +-- CashfreePaymentProvider
```

Future providers can be added without rewriting the Payments domain.

Example:

``` text
PaymentProviderFactory
        |
        +-- CASHFREE
        +-- FUTURE_PROVIDER
```

------------------------------------------------------------------------

# 5. Core Services

## 5.1 Payment Service

Responsible for:

-   Creating payment orders
-   Maintaining payment state
-   Provider references
-   Payment verification
-   Refund initiation
-   Payment lifecycle

## 5.2 Ledger Service

Responsible for:

-   Immutable financial entries
-   Account balances
-   Campaign financial movements
-   Platform revenue
-   Influencer payable
-   Refund accounting
-   Ledger consistency

## 5.3 Campaign Finance Service

Responsible for:

-   Campaign budget
-   Funding status
-   Approved influencer compensation
-   Platform fees
-   Payable amounts
-   Release rules

## 5.4 Payout Service

Responsible for:

-   Influencer payout creation
-   Beneficiary validation
-   Payout status
-   Retry logic
-   Failure handling
-   Payout reconciliation

## 5.5 Reconciliation Service

Responsible for comparing:

``` text
Zerify internal records
        VS
Cashfree transactions
        VS
Cashfree settlements
```

and generating discrepancies.

## 5.6 Webhook Service

Responsible for:

-   Receiving provider events
-   Signature verification
-   Raw event persistence
-   Deduplication
-   Event ordering
-   Queueing
-   Processing
-   Retry/dead-letter handling

------------------------------------------------------------------------

# 6. Payment Lifecycle

``` text
CAMPAIGN_CREATED
      |
      v
PAYMENT_ORDER_CREATED
      |
      v
PAYMENT_PENDING
      |
      +----> PAYMENT_FAILED
      |
      v
PAYMENT_SUCCESSFUL
      |
      v
CAMPAIGN_FUNDED
      |
      v
CAMPAIGN_ACTIVE
      |
      v
DELIVERABLE_SUBMITTED
      |
      v
DELIVERABLE_APPROVED
      |
      v
PAYOUT_PENDING
      |
      v
PAYOUT_PROCESSING
      |
      +----> PAYOUT_FAILED
      |
      v
PAYOUT_COMPLETED
```

Payment and campaign status must remain separate.

For example:

``` text
payment_status = SUCCESS
campaign_status = ACTIVE
payout_status = PENDING
```

Never combine all financial state into one status field.

------------------------------------------------------------------------

# 7. Database Design

## 7.1 payments

``` sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    brand_id UUID,
    campaign_id UUID,
    provider VARCHAR(50) NOT NULL,
    provider_order_id VARCHAR(255) UNIQUE,
    provider_payment_id VARCHAR(255),
    amount_minor BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(100),
    failure_code VARCHAR(255),
    failure_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

Always store monetary values in the smallest currency unit.

For INR:

``` text
₹10,000 = 1000000 paise
```

Never use floating-point numbers for money.

------------------------------------------------------------------------

# 8. Financial Ledger

The ledger is one of the most important components.

Do not maintain money using only:

``` text
user.balance += amount
```

Instead record immutable financial entries.

## 8.1 accounts

``` sql
CREATE TABLE financial_accounts (
    id UUID PRIMARY KEY,
    owner_type VARCHAR(50) NOT NULL,
    owner_id UUID,
    account_type VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL
);
```

Example account types:

``` text
BRAND_FUNDS
CAMPAIGN_FUNDS
INFLUENCER_PAYABLE
PLATFORM_REVENUE
REFUNDS
TAX_PAYABLE
FEES
```

## 8.2 ledger_transactions

``` sql
CREATE TABLE ledger_transactions (
    id UUID PRIMARY KEY,
    reference_type VARCHAR(100) NOT NULL,
    reference_id UUID NOT NULL,
    description TEXT,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL
);
```

## 8.3 ledger_entries

``` sql
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY,
    transaction_id UUID NOT NULL,
    account_id UUID NOT NULL,
    direction VARCHAR(10) NOT NULL,
    amount_minor BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL
);
```

Every financial transaction must balance.

Example:

``` text
Brand funds campaign with ₹10,000

DEBIT:
Brand/Payment Clearing       ₹10,000

CREDIT:
Campaign Funds               ₹10,000
```

Later:

``` text
Campaign completed

DEBIT:
Campaign Funds               ₹10,000

CREDIT:
Influencer Payable            ₹8,000

CREDIT:
Zerify Revenue                ₹2,000
```

The exact accounting treatment must be finalized with Zerify's
accountant/tax advisor based on the actual contractual and regulatory
model.

------------------------------------------------------------------------

# 9. Campaign Financial Model

Every campaign should have an explicit financial object.

``` text
CampaignFinance
├── campaign_id
├── gross_budget
├── funded_amount
├── committed_amount
├── influencer_payable
├── platform_fee
├── tax_amount
├── refunded_amount
├── paid_out_amount
├── remaining_amount
└── currency
```

Example:

``` text
Campaign Budget:        ₹100,000
Platform Fee:            ₹10,000
Influencer Payable:      ₹90,000
```

Do not derive historical financial values only from mutable campaign
records.

Financial history must come from the ledger.

------------------------------------------------------------------------

# 10. Payment Creation

Recommended flow:

``` text
Brand
  |
  v
POST /campaigns/{id}/payments
  |
  v
Zerify validates:
- campaign ownership
- campaign status
- amount
- currency
- duplicate payment
  |
  v
Create local payment record
  |
  v
Create Cashfree order
  |
  v
Persist provider order ID
  |
  v
Return payment session information
```

Use an idempotency key.

Example:

``` http
Idempotency-Key: campaign_123_funding_v1
```

A repeated request must not create duplicate payment orders.

------------------------------------------------------------------------

# 11. Payment Verification

Frontend callbacks are not authoritative.

Correct model:

``` text
Frontend
   |
   | payment completed
   v
Zerify frontend
   |
   v
Backend
   |
   +--> Provider API verification
   |
   +--> Verified webhook
   |
   v
Mark payment successful
```

Only the backend can transition:

``` text
PAYMENT_PENDING
        ->
PAYMENT_SUCCESSFUL
```

after sufficient server-side verification.

------------------------------------------------------------------------

# 12. Webhook Architecture

``` text
Cashfree
   |
   v
/api/v1/webhooks/cashfree
   |
   +-- Verify signature
   |
   +-- Store raw event
   |
   +-- Generate event hash
   |
   +-- Check duplicate
   |
   v
Message Queue
   |
   v
Webhook Worker
   |
   +-- Payment Processor
   +-- Refund Processor
   +-- Payout Processor
   |
   v
Ledger
```

## Webhook requirements

Every webhook must:

1.  Verify authenticity/signature according to the provider's current
    documentation.
2.  Be stored before processing where practical.
3.  Have a unique event identifier/hash.
4.  Be idempotent.
5.  Support retries.
6.  Support dead-letter processing.
7.  Never trust event ordering blindly.
8.  Record processing status.

Example:

``` sql
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    provider_event_id VARCHAR(255),
    payload JSONB NOT NULL,
    signature_valid BOOLEAN NOT NULL,
    processing_status VARCHAR(50) NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    received_at TIMESTAMP NOT NULL,
    processed_at TIMESTAMP
);
```

------------------------------------------------------------------------

# 13. Idempotency

Every financial mutation must be idempotent.

Example:

``` text
Cashfree webhook arrives
        |
        v
event_id = abc123
        |
        v
Already processed?
    /          \
  YES           NO
   |             |
Ignore       Process
                |
                v
          Save event state
```

Never allow:

``` text
same payment event
        ->
two ledger credits
```

Never allow:

``` text
same payout request
        ->
two payouts
```

------------------------------------------------------------------------

# 14. Refund Architecture

Refund flow:

``` text
Brand/Admin
    |
    v
POST /payments/{id}/refund
    |
    v
Validate refundable amount
    |
    v
Create refund record
    |
    v
Cashfree refund
    |
    v
Webhook/status verification
    |
    v
Refund successful
    |
    v
Ledger reversal
```

Support:

-   Full refund
-   Partial refund
-   Refund pending
-   Refund failed
-   Refund completed

Example:

``` text
Original Payment = ₹50,000
Previous Refund  = ₹10,000
Maximum Refund   = ₹40,000
```

Never allow cumulative refunds to exceed the refundable amount.

------------------------------------------------------------------------

# 15. Payout Architecture

Payouts must be separated from payment collection.

``` text
Campaign approved
      |
      v
Calculate influencer payable
      |
      v
Create payout instruction
      |
      v
Validate beneficiary
      |
      v
Send payout request to provider
      |
      v
PAYOUT_PROCESSING
      |
      +----> PAYOUT_FAILED
      |
      v
PAYOUT_COMPLETED
```

Payout record:

``` sql
CREATE TABLE payouts (
    id UUID PRIMARY KEY,
    influencer_id UUID NOT NULL,
    campaign_id UUID,
    provider VARCHAR(50) NOT NULL,
    provider_payout_id VARCHAR(255),
    amount_minor BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL,
    failure_code VARCHAR(255),
    failure_reason TEXT,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

------------------------------------------------------------------------

# 16. Influencer KYC / Beneficiary Data

Before payouts, Zerify should collect whatever information is required
by its chosen payout architecture and applicable regulations.

Store sensitive information securely.

Recommended pattern:

``` text
Influencer
   |
   v
Payout Profile
   |
   +-- KYC status
   +-- Beneficiary status
   +-- Bank account token/reference
   +-- Verification status
```

Do not unnecessarily store raw bank credentials.

Use provider-supported secure beneficiary/token/reference mechanisms
wherever available.

------------------------------------------------------------------------

# 17. Taxes

The system must be designed to support tax metadata without hard-coding
assumptions into the payment gateway layer.

Potential financial metadata can include:

``` text
gross_amount
platform_fee
tax_amount
tds_amount
net_payout
tax_category
invoice_reference
```

Tax treatment can vary depending on:

-   Contractual structure
-   Who is supplying the service
-   Influencer legal status
-   GST registration
-   TDS applicability
-   Campaign structure
-   Platform fee structure

Therefore:

> Tax calculations and withholding rules must be finalized with a
> qualified Indian tax professional before production launch.

The database should nevertheless be capable of storing the required tax
components.

------------------------------------------------------------------------

# 18. Invoice Architecture

Create an invoice subsystem.

``` text
Invoice
├── invoice_number
├── entity_type
├── entity_id
├── customer
├── seller/platform entity
├── line_items
├── subtotal
├── tax
├── total
├── currency
├── status
├── issue_date
└── document_reference
```

Invoice numbers should be unique and generated server-side.

------------------------------------------------------------------------

# 19. Reconciliation

Production financial systems need reconciliation.

Daily reconciliation:

``` text
                  +-------------------+
                  | Zerify Ledger     |
                  +---------+---------+
                            |
                            | compare
                            v
                  +---------+---------+
                  | Cashfree Records  |
                  +---------+---------+
                            |
                            v
                     Reconciliation
                            |
                +-----------+-----------+
                |                       |
             MATCH                  MISMATCH
                |                       |
              Close              Investigation
```

Reconciliation categories:

``` text
PAYMENT_MISSING
PAYMENT_AMOUNT_MISMATCH
REFUND_MISSING
REFUND_AMOUNT_MISMATCH
PAYOUT_MISSING
PAYOUT_AMOUNT_MISMATCH
SETTLEMENT_MISMATCH
DUPLICATE_TRANSACTION
UNKNOWN_PROVIDER_TRANSACTION
```

Create a reconciliation table:

``` sql
CREATE TABLE reconciliation_records (
    id UUID PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    provider_reference VARCHAR(255),
    internal_reference VARCHAR(255),
    expected_amount_minor BIGINT,
    actual_amount_minor BIGINT,
    status VARCHAR(50) NOT NULL,
    discrepancy_type VARCHAR(100),
    resolved_by UUID,
    resolved_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL
);
```

------------------------------------------------------------------------

# 20. Settlement Tracking

Payment success does not necessarily mean settlement has occurred.

Maintain separate concepts:

``` text
PAYMENT_SUCCESS
        |
        v
SETTLEMENT_PENDING
        |
        v
SETTLED
```

Track:

-   Settlement reference
-   Settlement amount
-   Fees
-   Taxes/adjustments where applicable
-   Settlement date
-   Provider reference
-   Reconciliation status

------------------------------------------------------------------------

# 21. Admin Financial Dashboard

Admin should have access to:

## Payments

-   Total collected
-   Successful
-   Pending
-   Failed
-   Refunded

## Payouts

-   Pending
-   Processing
-   Completed
-   Failed

## Reconciliation

-   Matched
-   Unmatched
-   Investigating
-   Resolved

## Revenue

-   Gross transaction volume
-   Platform fees
-   Refunds
-   Payouts
-   Net platform revenue

## Campaign Finance

-   Funded campaigns
-   Unfunded campaigns
-   Committed funds
-   Payables

------------------------------------------------------------------------

# 22. Audit Trail

Every important financial action must create an audit event.

Examples:

``` text
PAYMENT_CREATED
PAYMENT_CONFIRMED
PAYMENT_FAILED
REFUND_REQUESTED
REFUND_COMPLETED
PAYOUT_CREATED
PAYOUT_FAILED
PAYOUT_COMPLETED
LEDGER_TRANSACTION_CREATED
MANUAL_ADJUSTMENT_CREATED
RECONCILIATION_EXCEPTION_CREATED
RECONCILIATION_RESOLVED
```

Audit record:

``` sql
CREATE TABLE financial_audit_logs (
    id UUID PRIMARY KEY,
    actor_type VARCHAR(50),
    actor_id UUID,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    before_state JSONB,
    after_state JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL
);
```

Financial records should not be silently edited or deleted.

------------------------------------------------------------------------

# 23. Manual Adjustments

Admin financial adjustments must never directly modify balances.

Wrong:

``` text
UPDATE account
SET balance = balance + 1000;
```

Correct:

``` text
Admin Adjustment
      |
      v
Approval / authorization
      |
      v
Ledger transaction
      |
      v
Balance derived from ledger
```

For high-value adjustments, require maker-checker approval.

------------------------------------------------------------------------

# 24. Security Requirements

## Authentication

-   OAuth/session/JWT architecture as used by Zerify
-   MFA for financial administrators
-   Short-lived privileged sessions

## Authorization

Use role-based access control.

Example:

``` text
FINANCE_ADMIN
FINANCE_VIEWER
SUPER_ADMIN
SUPPORT_AGENT
```

Only authorized roles may:

-   Issue refunds
-   Retry payouts
-   Create manual adjustments
-   Resolve reconciliation exceptions

## Secrets

Never store provider secrets in source code.

Use:

``` text
AWS Secrets Manager
GCP Secret Manager
Azure Key Vault
or equivalent
```

## Logs

Never log:

-   API secrets
-   Full bank account numbers
-   Authentication credentials
-   Sensitive payment information

------------------------------------------------------------------------

# 25. Reliability

Use:

-   Database transactions
-   Idempotency
-   Queues
-   Retries
-   Dead-letter queues
-   Circuit breakers
-   Timeouts
-   Provider status polling where necessary
-   Distributed tracing
-   Structured logs

Retry policy should use exponential backoff.

Example:

``` text
1st retry: 5 sec
2nd retry: 30 sec
3rd retry: 2 min
4th retry: 10 min
5th retry: 30 min
```

Exact retry timings can be tuned based on provider behavior.

------------------------------------------------------------------------

# 26. Database Transaction Rules

Financial mutations should be atomic.

Example:

``` text
BEGIN TRANSACTION

1. Lock payment
2. Validate current state
3. Create ledger transaction
4. Create ledger entries
5. Update payment status
6. Record audit event

COMMIT
```

If any step fails:

``` text
ROLLBACK
```

Never create a ledger entry while leaving the related financial state
ambiguous.

------------------------------------------------------------------------

# 27. Concurrency Protection

Prevent:

``` text
Two workers
     |
     +--> process same webhook
     |
     +--> create two payouts
```

Use:

-   Unique constraints
-   Idempotency keys
-   Row locks where appropriate
-   Optimistic locking/version columns
-   Queue-level deduplication where available

------------------------------------------------------------------------

# 28. API Design

Base:

``` text
/api/v1
```

## Payments

``` http
POST   /payments/orders
GET    /payments/{paymentId}
GET    /payments/{paymentId}/status
POST   /payments/{paymentId}/refund
GET    /payments/{paymentId}/refunds
```

## Campaign Finance

``` http
GET    /campaigns/{campaignId}/finance
POST   /campaigns/{campaignId}/fund
GET    /campaigns/{campaignId}/transactions
```

## Payouts

``` http
POST   /payouts
GET    /payouts/{payoutId}
POST   /payouts/{payoutId}/retry
```

## Reconciliation

``` http
GET    /admin/reconciliation
GET    /admin/reconciliation/{id}
POST   /admin/reconciliation/{id}/resolve
```

## Webhooks

``` http
POST /webhooks/cashfree
```

------------------------------------------------------------------------

# 29. API Response Principles

Never return provider-specific internals unless needed.

Instead of:

``` json
{
  "cashfree_status": "..."
}
```

return:

``` json
{
  "payment_id": "...",
  "status": "SUCCESS",
  "amount": 100000,
  "currency": "INR"
}
```

Provider-specific data should remain inside the provider adapter/domain
integration layer.

------------------------------------------------------------------------

# 30. Money Representation

Use:

``` text
BIGINT amount_minor
```

Never:

``` text
FLOAT
DOUBLE
```

For INR:

``` text
₹1      = 100 paise
₹99.50  = 9950 paise
₹10,000 = 1000000 paise
```

Currency must always be stored with the amount.

------------------------------------------------------------------------

# 31. Financial State Machine

## Payment

``` text
CREATED
  |
PENDING
  |
  +--> FAILED
  |
  +--> SUCCESS
           |
           +--> PARTIALLY_REFUNDED
           |
           +--> FULLY_REFUNDED
```

State transitions must be explicitly validated.

For example:

``` text
FAILED -> SUCCESS
```

should only occur through a verified provider event/API state and not
through a frontend request.

------------------------------------------------------------------------

# 32. Provider Failure Handling

Provider timeout does not automatically mean payment failure.

Example:

``` text
Zerify -> Cashfree
       |
       X timeout
```

Correct status:

``` text
PAYMENT_UNKNOWN
```

Then:

``` text
Provider status lookup
        |
        +--> SUCCESS
        +--> FAILED
        +--> PENDING
```

Do not immediately create another order without checking the previous
one.

This prevents duplicate charges.

------------------------------------------------------------------------

# 33. Double Payment Protection

Before creating a payment order:

``` text
Check:
- campaign
- amount
- currency
- active funding attempt
- existing successful payment
```

If a successful payment already exists:

``` text
return existing payment
```

Do not create another payment.

------------------------------------------------------------------------

# 34. Double Payout Protection

Before initiating payout:

``` text
Check:
- campaign approved
- influencer payable exists
- payout not already completed
- no payout currently processing
- idempotency key unused
```

Then create payout.

------------------------------------------------------------------------

# 35. Event-Driven Architecture

Recommended events:

``` text
PaymentCreated
PaymentSucceeded
PaymentFailed

CampaignFunded
CampaignCompleted

RefundCreated
RefundSucceeded
RefundFailed

PayoutCreated
PayoutProcessing
PayoutSucceeded
PayoutFailed

SettlementReceived
ReconciliationMismatchDetected
ReconciliationResolved
```

Events should not replace the source-of-truth database.

Use them to propagate state changes safely.

------------------------------------------------------------------------

# 36. Recommended Infrastructure

A production deployment can use:

``` text
Frontend
   |
API Gateway / Load Balancer
   |
Backend Services
   |
PostgreSQL
   |
Redis
   |
Message Queue
   |
Workers
   |
Cashfree
```

Recommended components:

``` text
PostgreSQL       -> financial source of truth
Redis            -> caching/rate limiting/short-lived locks
Queue            -> webhook and async processing
Object Storage   -> invoices/financial documents
Secrets Manager  -> credentials
Monitoring       -> metrics
Tracing          -> distributed tracing
```

Do not store financial truth in Redis.

------------------------------------------------------------------------

# 37. Observability

Track metrics such as:

``` text
payments_created_total
payments_success_total
payments_failed_total
payment_verification_latency
webhook_received_total
webhook_processing_failures
refunds_total
payouts_total
payout_failures
reconciliation_mismatches
ledger_transaction_failures
```

Set alerts for:

-   Sudden payment failure increase
-   Webhook processing failures
-   Payout failure spikes
-   Reconciliation mismatches
-   Provider outage
-   Ledger imbalance
-   Duplicate event attempts

------------------------------------------------------------------------

# 38. Testing Strategy

## Unit Tests

Test:

-   Payment state transitions
-   Ledger calculations
-   Fee calculations
-   Refund limits
-   Payout calculations
-   Idempotency
-   Tax metadata
-   Currency calculations

## Integration Tests

Test:

``` text
Zerify -> Cashfree sandbox
Cashfree -> webhook
Webhook -> Queue
Queue -> Ledger
Ledger -> Campaign
```

## Failure Tests

Simulate:

-   Duplicate webhook
-   Out-of-order webhook
-   Provider timeout
-   Payment success after timeout
-   Database failure
-   Queue failure
-   Duplicate payout request
-   Duplicate refund request
-   Partial refund
-   Provider API unavailable

## Load Tests

Test at least:

``` text
100 payments/sec
500 webhooks/sec
100 payout operations/sec
```

Actual production capacity should be determined through load testing and
expected traffic.

------------------------------------------------------------------------

# 39. Disaster Recovery

Maintain:

-   Automated PostgreSQL backups
-   Point-in-time recovery
-   Multi-zone deployment where appropriate
-   Queue durability
-   Object storage versioning
-   Secret backup/recovery process
-   Documented recovery procedures

Define:

``` text
RPO
RTO
```

for the production system.

------------------------------------------------------------------------

# 40. Data Retention

Financial records generally need longer retention than ordinary
application data.

Do not automatically delete financial transactions because a user
deletes their account.

Instead:

``` text
User deletion
     |
     +--> Personal data anonymization where legally appropriate
     |
     +--> Financial records retained according to applicable requirements
```

Retention periods should be confirmed with Zerify's legal/accounting
advisors.

------------------------------------------------------------------------

# 41. Production Deployment Strategy

Use environments:

``` text
development
staging
production
```

Each environment must have separate:

-   Database
-   Cashfree credentials
-   Webhook endpoints
-   Secrets
-   Storage
-   Queues

Never use production payment credentials in development.

------------------------------------------------------------------------

# 42. Cashfree Configuration

The integration should support environment variables such as:

``` env
CASHFREE_CLIENT_ID=
CASHFREE_CLIENT_SECRET=
CASHFREE_ENVIRONMENT=sandbox
CASHFREE_API_VERSION=
CASHFREE_WEBHOOK_SECRET=
CASHFREE_RETURN_URL=
CASHFREE_WEBHOOK_URL=
```

The exact variable names and required configuration must match the
current Cashfree documentation and the selected Cashfree products.

Do not hard-code API versions or endpoint assumptions; keep them
configurable and verify them against current provider documentation
before deployment.

------------------------------------------------------------------------

# 43. Webhook Endpoint Security

Webhook endpoint:

``` text
POST /api/v1/webhooks/cashfree
```

Requirements:

-   HTTPS only
-   Signature verification
-   Raw request body preserved for verification if required
-   Rate limiting
-   Payload validation
-   Event deduplication
-   Audit logging
-   No unauthenticated business-state mutation

Webhook processing should return an appropriate success response only
after safely accepting the event for processing.

------------------------------------------------------------------------

# 44. Financial Invariants

The following must always remain true.

## Payment

``` text
successful_payment_amount
=
provider_confirmed_amount
```

## Refund

``` text
total_refunded
<=
total_successful_payment
```

## Payout

``` text
total_completed_payout
<=
available_payable_amount
```

## Ledger

For every balanced transaction:

``` text
SUM(debits) = SUM(credits)
```

## Campaign

``` text
paid_out
+
reserved
+
remaining
=
funded_amount
```

Exact business definitions should be finalized according to Zerify's
campaign model.

------------------------------------------------------------------------

# 45. Financial Reconciliation Job

Run scheduled reconciliation.

Example:

``` text
Every night
     |
     v
Fetch provider transactions
     |
     v
Compare with Zerify
     |
     +--> MATCH
     |
     +--> MISMATCH
              |
              v
       Create exception
              |
              v
       Notify finance admin
```

Do not automatically modify financial balances to force a match.

Investigate discrepancies.

------------------------------------------------------------------------

# 46. Admin Approval Workflow

For sensitive operations:

``` text
Finance Admin A
      |
      v
Creates refund/adjustment
      |
      v
Pending Approval
      |
      v
Finance Admin B
      |
      v
Approved
      |
      v
Execution
```

Use maker-checker for:

-   Large refunds
-   Manual ledger adjustments
-   Manual payout overrides
-   High-value financial corrections

Thresholds should be configurable.

------------------------------------------------------------------------

# 47. Fees

Zerify should have a fee engine rather than hard-coded fee calculations.

``` text
FeeEngine
   |
   +-- Platform Fee
   +-- Payment Fee
   +-- Service Fee
   +-- Optional Campaign Fee
```

Example:

``` text
Campaign amount = ₹100,000

Platform fee = configured percentage/fixed amount
Payment fee  = provider/contract dependent
Tax          = calculated according to applicable rules
```

Store the exact fee calculation used for every transaction so historical
transactions remain reproducible.

------------------------------------------------------------------------

# 48. Fee Versioning

Do not simply change:

``` text
platform_fee_percent = 10
```

and assume historical transactions will remain correct.

Use fee versions:

``` text
FeePlan v1
FeePlan v2
FeePlan v3
```

Every transaction stores:

``` text
fee_plan_id
fee_rate
fee_amount
calculation_snapshot
```

This allows historical reconstruction.

------------------------------------------------------------------------

# 49. Financial Documents

Store references to:

-   Invoices
-   Credit notes
-   Refund documents
-   Settlement reports
-   Reconciliation reports

Use object storage.

Example:

``` text
s3://zerify-financial-documents/
    invoices/
    credit-notes/
    settlements/
    reconciliation/
```

Never expose private storage URLs permanently.

Generate signed URLs where appropriate.

------------------------------------------------------------------------

# 50. Recommended Repository Structure

``` text
backend/
├── modules/
│   ├── payments/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── dto/
│   │   └── providers/
│   │       └── cashfree/
│   │
│   ├── ledger/
│   ├── campaign-finance/
│   ├── payouts/
│   ├── refunds/
│   ├── reconciliation/
│   ├── invoices/
│   └── financial-audit/
│
├── workers/
│   ├── webhook-worker/
│   ├── payout-worker/
│   └── reconciliation-worker/
│
└── shared/
    ├── money/
    ├── idempotency/
    ├── events/
    └── security/
```

------------------------------------------------------------------------

# 51. Implementation Order

## Phase 1 --- Foundation

Build:

-   Provider abstraction
-   Payment model
-   Payment API
-   Cashfree adapter
-   Environment configuration
-   Idempotency
-   Webhook ingestion

## Phase 2 --- Ledger

Build:

-   Financial accounts
-   Ledger transactions
-   Ledger entries
-   Balance queries
-   Audit logs

## Phase 3 --- Campaign Finance

Build:

-   Campaign funding
-   Budget tracking
-   Fee engine
-   Financial state machine

## Phase 4 --- Refunds

Build:

-   Refund model
-   Refund API
-   Provider integration
-   Ledger reversal
-   Refund reconciliation

## Phase 5 --- Payouts

Build:

-   Influencer payout profile
-   Beneficiary integration
-   Payout service
-   Payout worker
-   Retry handling

## Phase 6 --- Reconciliation

Build:

-   Provider transaction importer
-   Matching engine
-   Discrepancy detection
-   Admin resolution workflow

## Phase 7 --- Financial Admin

Build:

-   Financial dashboard
-   Transaction explorer
-   Refund controls
-   Payout controls
-   Reconciliation dashboard
-   Audit explorer

## Phase 8 --- Production Hardening

Add:

-   Load testing
-   Security testing
-   Disaster recovery
-   Monitoring
-   Alerts
-   Runbooks
-   Operational documentation

------------------------------------------------------------------------

# 52. Definition of Done

The payment system is production-ready only when:

-   [ ] Cashfree sandbox integration works
-   [ ] Production credentials are securely managed
-   [ ] Payment creation is idempotent
-   [ ] Payment verification is server-side
-   [ ] Webhook signatures are verified
-   [ ] Webhooks are persisted
-   [ ] Webhooks are idempotent
-   [ ] Duplicate payments are prevented
-   [ ] Refunds are idempotent
-   [ ] Payouts are idempotent
-   [ ] Ledger is immutable
-   [ ] Ledger transactions balance
-   [ ] Financial amounts use integer minor units
-   [ ] Audit trail exists
-   [ ] Reconciliation exists
-   [ ] Settlement tracking exists
-   [ ] Admin authorization exists
-   [ ] Sensitive data is protected
-   [ ] Provider failures are handled
-   [ ] Retry/dead-letter mechanisms exist
-   [ ] Monitoring and alerting exist
-   [ ] Database backups exist
-   [ ] Disaster recovery is tested
-   [ ] Load testing is completed
-   [ ] Security testing is completed
-   [ ] Tax/accounting treatment has been reviewed professionally
-   [ ] Applicable payment/regulatory structure has been reviewed
    professionally

------------------------------------------------------------------------

# 53. Critical Architectural Rule

The most important rule for the engineering team is:

``` text
Cashfree is NOT Zerify's source of truth.
```

Cashfree is the external payment provider.

Zerify's internal financial system must maintain:

``` text
Payment
   +
Ledger
   +
Campaign Finance
   +
Refund
   +
Payout
   +
Settlement
   +
Reconciliation
   +
Audit Trail
```

Cashfree provider data should be mapped into these domain models.

------------------------------------------------------------------------

# 54. Final Recommended Architecture

``` text
                         ZERIFY PLATFORM
                                |
                 +--------------+--------------+
                 |                             |
                 v                             v
           Campaign Service              User Service
                 |
                 v
        Campaign Finance Service
                 |
        +--------+---------+
        |                  |
        v                  v
 Payment Service      Ledger Service
        |                  |
        |                  |
        v                  |
 Cashfree Adapter          |
        |                  |
        v                  |
    Cashfree               |
        |                  |
        +--------+---------+
                 |
                 v
           Webhook Service
                 |
                 v
              Queue
                 |
        +--------+--------+
        |        |        |
        v        v        v
     Payment   Refund   Payout
     Worker    Worker   Worker
        |        |        |
        +--------+--------+
                 |
                 v
             Ledger
                 |
                 v
          Reconciliation
                 |
                 v
          Finance Admin
```

------------------------------------------------------------------------

# 55. Final Engineering Recommendation

For Zerify:

> **Do not build payment processing from scratch. Build the financial
> operating system around a regulated payment provider.**

Use Cashfree for:

-   Payment collection
-   Supported payment methods
-   Provider-side payment processing
-   Supported refunds
-   Supported payouts
-   Provider transaction/settlement infrastructure

Build in Zerify:

-   Payment domain
-   Campaign funding
-   Ledger
-   Fee engine
-   Financial state machines
-   Refund orchestration
-   Payout orchestration
-   Reconciliation
-   Settlement tracking
-   Financial audit trail
-   Admin controls
-   Reporting
-   Financial document management
-   Provider abstraction

This architecture gives Zerify control over its **marketplace economics
and financial state** without taking on the enormous responsibility of
becoming a payment processor.

**Important:** Before production launch, verify Cashfree's current
product capabilities, API/webhook requirements, pricing,
settlement/payout model, and the Indian regulatory/tax implications of
Zerify's specific marketplace flow. The exact legal treatment of holding
campaign funds, collecting on behalf of influencers, platform fees, GST,
TDS, and any escrow-like arrangement should be reviewed with qualified
Indian legal/accounting professionals.
