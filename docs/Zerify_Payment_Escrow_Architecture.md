# Zerify Payment & Escrow Architecture

## 1. Purpose

This document defines the payment architecture for Zerify's initial India-first marketplace launch.

The immediate payment provider will be **Cashfree**. The architecture is intentionally provider-agnostic so that Zerify can later add **Stripe Connect** or another marketplace provider without rewriting the campaign, escrow, ledger, or business logic.

> **Important:** Zerify should not implement a self-managed escrow wallet by receiving customer money into a normal Zerify bank account and tracking a "locked balance" in MongoDB. The exact legal/payment structure for escrow, split settlement, holds, refunds, and releases must be confirmed with Cashfree for Zerify's business model before production launch.

---

# 2. Product Payment Model

Zerify is an influencer marketing marketplace.

A typical campaign works as follows:

```text
COMPANY
   |
   | 1. Select influencer
   | 2. Define campaign
   | 3. Define deliverables
   | 4. Define payment terms
   v
ESCROW CONTRACT
   |
   | Influencer reviews and accepts
   v
INFLUENCER
   |
   | Payout/KYC onboarding
   v
COMPANY FUNDS CAMPAIGN
   |
   v
CASHFREE
   |
   | Funds handled according to approved
   | Cashfree marketplace/escrow structure
   v
CAMPAIGN ACTIVE
   |
   | Influencer submits work
   v
COMPANY REVIEW
   |
   +---- Request revision
   |
   +---- Raise dispute
   |
   +---- Approve
            |
            v
       RELEASE FUNDS
            |
            v
       INFLUENCER
```

---

# 3. Core Business Flow

## 3.1 Company

The company should be able to:

1. Create a campaign.
2. Select an influencer.
3. Define deliverables.
4. Define campaign deadlines.
5. Define campaign compensation.
6. Define revision limits.
7. Define approval window.
8. Define cancellation/refund terms.
9. Review the complete campaign contract.
10. Send the campaign offer.
11. Fund the campaign after the influencer accepts.

---

## 3.2 Influencer

The influencer should be able to:

1. Receive a campaign offer.
2. Review all campaign terms.
3. Review compensation.
4. Connect/complete payout onboarding.
5. Accept or reject the campaign.
6. Submit deliverables.
7. Request payment release after satisfying the campaign conditions.
8. Raise a dispute when appropriate.
9. View payment and payout history.

---

# 4. Escrow Contract

Do not store escrow terms as one large text field.

Use structured fields.

Example:

```text
Campaign Value:             ₹50,000

Zerify Platform Fee:         ₹5,000

Payment Processing Fee:      ₹X

Company Total:              ₹55,000 + processing fees

Influencer Receives:        ₹50,000

Deliverables:
- Instagram Reel × 2
- Instagram Story × 3

Submission Deadline:
September 10, 2026

Approval Window:
48 hours

Maximum Revisions:
2

Release Condition:
Company approval after successful delivery

Dispute Window:
72 hours
```

The contract should have a version.

Example:

```text
termsVersion: 3
termsHash: "..."
```

If the company changes the amount or terms after acceptance, do not silently update the existing contract. Create a new version.

---

# 5. Payment Provider Architecture

Do not tightly couple Zerify's business logic to Cashfree.

Recommended architecture:

```text
                         ZERIFY
                            |
                     PaymentService
                            |
                    PaymentProvider
                            |
                 +----------+----------+
                 |                     |
          CashfreeProvider       StripeProvider
              (NOW)               (FUTURE)
```

Initially:

```text
PaymentService
      |
CashfreeProvider
      |
Cashfree APIs
```

Later:

```text
PaymentService
      |
 +----+----------------+
 |                     |
CashfreeProvider   StripeProvider
```

The campaign and escrow systems should not need to know which provider is being used.

---

# 6. Provider Interface

Create a provider abstraction.

Example:

```ts
interface PaymentProvider {
  createCustomer(input: CreateCustomerInput): Promise<Customer>;

  createPayoutAccount(
    input: CreatePayoutAccountInput
  ): Promise<PayoutAccount>;

  createPayment(
    input: CreatePaymentInput
  ): Promise<Payment>;

  getPayment(
    providerPaymentId: string
  ): Promise<Payment>;

  refundPayment(
    input: RefundPaymentInput
  ): Promise<Refund>;

  releaseFunds(
    input: ReleaseFundsInput
  ): Promise<Payout>;

  handleWebhook(
    payload: unknown,
    signature: string
  ): Promise<WebhookResult>;
}
```

The initial implementation:

```text
CashfreeProvider
```

Later:

```text
StripeProvider
```

---

# 7. Recommended Backend Modules

For a NestJS backend:

```text
src/
├── payments/
│   ├── payments.module.ts
│   ├── payments.controller.ts
│   ├── payments.service.ts
│   ├── providers/
│   │   ├── payment-provider.interface.ts
│   │   └── cashfree/
│   │       ├── cashfree.provider.ts
│   │       ├── cashfree.client.ts
│   │       └── cashfree.mapper.ts
│   └── dto/
│
├── escrow/
│   ├── escrow.module.ts
│   ├── escrow.controller.ts
│   ├── escrow.service.ts
│   ├── escrow-state-machine.ts
│   └── dto/
│
├── payouts/
│   ├── payouts.module.ts
│   ├── payouts.service.ts
│   └── dto/
│
├── disputes/
│   ├── disputes.module.ts
│   ├── disputes.service.ts
│   └── dto/
│
├── ledger/
│   ├── ledger.module.ts
│   ├── ledger.service.ts
│   └── dto/
│
├── webhooks/
│   ├── webhooks.module.ts
│   ├── webhooks.controller.ts
│   └── webhook.service.ts
│
└── campaigns/
    ├── campaigns.module.ts
    ├── campaigns.service.ts
    └── ...
```

---

# 8. MongoDB Data Model

## 8.1 PaymentAccount

```ts
{
  _id,

  userId,

  provider: "cashfree",

  providerCustomerId,
  providerAccountId,

  type: "PAYER" | "PAYOUT",

  status:
    "PENDING" |
    "ACTIVE" |
    "RESTRICTED" |
    "DISABLED",

  country,
  currency,

  onboardingStatus,

  createdAt,
  updatedAt
}
```

Never store raw:

- card numbers
- CVV
- bank passwords
- UPI PINs
- other payment credentials

Store provider references instead.

---

# 9. EscrowContract Schema

```ts
{
  _id,

  campaignId,

  companyId,
  influencerId,

  currency: "INR",

  totalAmount,

  platformFee,
  processingFee,

  influencerAmount,

  termsVersion,
  termsHash,

  deliverables,

  deadline,

  approvalWindowHours,

  maximumRevisions,

  cancellationPolicy,
  refundPolicy,
  disputePolicy,

  companyAcceptedAt,
  influencerAcceptedAt,

  status,

  createdAt,
  updatedAt
}
```

---

# 10. Escrow Status Machine

Use a strict state machine.

```text
DRAFT
  |
  v
OFFER_SENT
  |
  v
ACCEPTED
  |
  v
AWAITING_PAYMENT
  |
  +---- PAYMENT_FAILED
  |
  v
ESCROW_FUNDED
  |
  v
IN_PROGRESS
  |
  v
SUBMITTED
  |
  v
UNDER_REVIEW
  |
  +---- REVISION_REQUESTED
  |           |
  |           +---- SUBMITTED
  |
  +---- DISPUTED
  |
  v
APPROVED
  |
  v
RELEASE_PENDING
  |
  v
RELEASED
  |
  v
COMPLETED
```

Alternative terminal states:

```text
CANCELLED
REFUNDED
PARTIALLY_REFUNDED
DISPUTED
PAYMENT_FAILED
```

---

# 11. Campaign State Machine

Campaign state and payment state should not be identical.

Recommended:

```text
DRAFT
OFFER_SENT
ACCEPTED
PAYMENT_PENDING
ACTIVE
CONTENT_SUBMITTED
UNDER_REVIEW
REVISION_REQUIRED
COMPLETED
CANCELLED
DISPUTED
```

Payment state:

```text
UNPAID
PAYMENT_PROCESSING
PAID
ESCROW_FUNDED
RELEASE_PENDING
PARTIALLY_RELEASED
RELEASED
REFUND_PENDING
REFUNDED
FAILED
```

This separation prevents payment and campaign logic from becoming tightly coupled.

---

# 12. Milestones

Zerify should support milestones.

Example:

```text
Campaign Value: ₹100,000

Milestone 1
Content Creation       ₹30,000

Milestone 2
Content Approval        ₹20,000

Milestone 3
Publication             ₹30,000

Milestone 4
Campaign Completion     ₹20,000
```

Schema:

```ts
{
  _id,

  escrowContractId,

  title,
  description,

  amount,

  dueDate,

  status,

  submittedAt,
  approvedAt,
  releasedAt
}
```

Possible milestone states:

```text
PENDING
SUBMITTED
UNDER_REVIEW
REVISION_REQUIRED
APPROVED
RELEASE_PENDING
RELEASED
DISPUTED
REFUNDED
```

Before implementing milestone releases, confirm that the selected Cashfree product supports the exact required hold/release behavior.

---

# 13. Payment Schema

```ts
{
  _id,

  escrowContractId,

  provider: "cashfree",

  providerPaymentId,
  providerOrderId,

  amount,
  currency,

  status,

  paidAt,
  failedAt,
  refundedAt,

  metadata,

  createdAt,
  updatedAt
}
```

Provider-specific IDs should be kept inside payment/payout records rather than spread throughout campaign documents.

---

# 14. Payout Schema

```ts
{
  _id,

  escrowContractId,
  milestoneId,

  influencerId,

  provider: "cashfree",

  providerTransferId,

  amount,
  currency,

  status,

  initiatedAt,
  completedAt,
  failedAt,

  failureReason,

  createdAt,
  updatedAt
}
```

---

# 15. Ledger

Create an immutable financial ledger.

Example:

```text
Campaign #ZF-10291

COMPANY PAYMENT
+ ₹55,000

INFLUENCER LIABILITY
- ₹50,000

ZERIFY PLATFORM FEE
- ₹5,000
```

When released:

```text
INFLUENCER LIABILITY
+ ₹50,000

INFLUENCER PAYOUT
- ₹50,000
```

Ledger records should never be deleted or silently modified.

Use compensating entries for corrections.

Example:

```ts
{
  _id,

  campaignId,
  escrowContractId,

  type:
    "PAYMENT_RECEIVED" |
    "PLATFORM_FEE" |
    "PAYOUT" |
    "REFUND" |
    "ADJUSTMENT",

  direction: "CREDIT" | "DEBIT",

  amount,
  currency,

  referenceType,
  referenceId,

  createdAt
}
```

---

# 16. Webhook Architecture

Payment status must be driven by verified Cashfree webhooks/API responses.

Do not rely on frontend redirects.

Example:

```text
Cashfree
   |
   | webhook
   v
POST /webhooks/cashfree
   |
   v
WebhookService
   |
   v
Verify signature
   |
   v
Check event idempotency
   |
   v
PaymentService
   |
   +---- Update payment
   |
   +---- Update escrow
   |
   +---- Update ledger
   |
   +---- Publish domain event
```

---

# 17. Webhook Idempotency

Webhook providers may retry events.

Create a collection:

```ts
WebhookEvent
```

```ts
{
  _id,

  provider: "cashfree",

  providerEventId,

  eventType,

  payloadHash,

  processed,

  processedAt,

  error,

  createdAt
}
```

Processing logic:

```ts
const existing = await webhookEvent.findOne({
  provider: "cashfree",
  providerEventId: eventId
});

if (existing?.processed) {
  return;
}

await processEvent();

await markProcessed();
```

Never process the same payment event twice.

---

# 18. Company Payment Setup

Company UI:

```text
Settings
  |
  v
Payments & Billing
  |
  +-- Payment Account
  |
  +-- Default Payment Method
  |
  +-- Billing Details
  |
  +-- GST Details
```

Sensitive payment details should be collected through Cashfree-hosted/provider-controlled interfaces where applicable.

Zerify stores provider identifiers and status.

---

# 19. Influencer Payout Setup

Influencer UI:

```text
Settings
  |
  v
Payouts
  |
  v
Connect Bank Account
  |
  v
KYC / Verification
  |
  v
Payout Account Active
```

Store:

```text
provider = cashfree
providerAccountId = ...
status = ACTIVE
```

Do not store raw bank credentials unless Cashfree's approved integration explicitly requires a provider-managed reference rather than Zerify storing the underlying credentials.

---

# 20. Campaign Creation Flow

Company:

```text
Create Campaign
      |
      v
Select Influencer
      |
      v
Set Deliverables
      |
      v
Set Compensation
      |
      v
Set Deadline
      |
      v
Set Approval Window
      |
      v
Set Revision Policy
      |
      v
Set Cancellation/Refund Terms
      |
      v
Review
      |
      v
Send Offer
```

---

# 21. Influencer Acceptance

The influencer sees:

```text
NEW CAMPAIGN OFFER

Brand:
ABC Fashion

Campaign:
Summer Collection

Compensation:
₹50,000

Deliverables:
2 Reels
3 Stories

Deadline:
September 10

Approval Window:
48 hours

Revisions:
2

Payment:
Funds handled through Zerify's
approved payment/escrow flow.

[View Full Terms]

[Accept Campaign]
```

Record:

```ts
{
  influencerAcceptedAt,
  influencerId,
  termsVersion,
  termsHash
}
```

For stronger auditability, also consider recording the acceptance timestamp, authenticated user identity, and relevant audit metadata.

---

# 22. Funding Flow

After the influencer accepts:

```text
ACCEPTED
   |
   v
AWAITING_PAYMENT
   |
   v
Company clicks "Fund Campaign"
   |
   v
Create Cashfree payment/order
   |
   v
Company completes payment
   |
   v
Cashfree confirms payment
   |
   v
Webhook
   |
   v
Verify
   |
   v
Update Payment
   |
   v
Update Escrow
   |
   v
Update Ledger
   |
   v
Campaign ACTIVE
```

The frontend should never directly mark the escrow as funded.

---

# 23. Submission and Approval

Influencer:

```text
Campaign Active
      |
      v
Submit Deliverables
```

Company:

```text
Under Review
    |
    +---- Request Revision
    |
    +---- Raise Dispute
    |
    +---- Approve
```

Approval:

```text
APPROVED
    |
    v
RELEASE_PENDING
    |
    v
Cashfree release/payout flow
    |
    v
PAYOUT_COMPLETED
    |
    v
COMPLETED
```

The exact release API and timing depend on the Cashfree product and contractual structure approved for Zerify.

---

# 24. Dispute Flow

```text
Company
   |
   | Reject / Dispute
   v
DISPUTED
   |
   v
Zerify Admin Review
   |
   +------------------+
   |                  |
   v                  v
Refund Company     Release Influencer
   |                  |
   v                  v
REFUNDED           RELEASED
```

Dispute schema:

```ts
{
  _id,

  escrowContractId,

  openedBy,

  reason,
  description,

  evidence: [],

  requestedResolution,

  status,

  adminDecision,

  resolvedAt,

  createdAt
}
```

Possible statuses:

```text
OPEN
UNDER_REVIEW
WAITING_FOR_COMPANY
WAITING_FOR_INFLUENCER
RESOLVED
CLOSED
```

---

# 25. Refund Flow

Refunds must be handled through the payment provider.

Do not simply:

```text
payment.status = REFUNDED
```

without actually performing the provider refund.

Correct flow:

```text
Refund Requested
      |
      v
Validate eligibility
      |
      v
Cashfree refund API
      |
      v
Cashfree confirmation/webhook
      |
      v
Update payment
      |
      v
Update escrow
      |
      v
Ledger adjustment
      |
      v
Notify company/influencer
```

Support:

```text
FULL_REFUND
PARTIAL_REFUND
```

where supported by the provider and business terms.

---

# 26. API Design

Recommended endpoints:

## Company

```text
POST /payments/customers
GET  /payments/account
POST /payments/method
```

## Campaign payment

```text
POST /campaigns/:campaignId/payment
GET  /campaigns/:campaignId/payment
POST /campaigns/:campaignId/refund
```

## Escrow

```text
POST /escrows
GET  /escrows/:id
POST /escrows/:id/accept
POST /escrows/:id/fund
POST /escrows/:id/approve
POST /escrows/:id/release
POST /escrows/:id/dispute
```

## Payout

```text
POST /payout-accounts/onboard
GET  /payout-accounts/me
GET  /payouts
GET  /payouts/:id
```

## Webhooks

```text
POST /webhooks/cashfree
```

Admin:

```text
GET  /admin/payments
GET  /admin/escrows
GET  /admin/disputes
POST /admin/disputes/:id/resolve
POST /admin/escrows/:id/refund
POST /admin/escrows/:id/release
```

All admin financial actions must be authenticated, authorized, and audit logged.

---

# 27. Security Requirements

## Never store

```text
Card number
CVV
UPI PIN
Net banking password
Bank login password
Payment provider secret keys in source code
```

## Use

```text
Environment variables
Secret manager
HTTPS
Webhook signature verification
Role-based access control
Idempotency keys
Audit logs
Database transactions where appropriate
```

---

# 28. Environment Variables

Example:

```env
CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
CASHFREE_ENVIRONMENT=sandbox

CASHFREE_API_BASE_URL=
CASHFREE_WEBHOOK_SECRET=
```

Never commit production secrets to Git.

Use:

```text
.env.local
.env.production
Cloud secret manager
```

depending on deployment environment.

---

# 29. Notifications

Payment-related events should trigger notifications.

Examples:

```text
Company:
"Your campaign payment was successful."

Influencer:
"Campaign funding has been confirmed."

Company:
"Creator submitted campaign deliverables."

Influencer:
"Company approved your deliverables."

Influencer:
"₹50,000 payout has been initiated."

Company:
"Refund has been initiated."
```

Use a domain-event approach:

```text
PaymentSucceeded
EscrowFunded
DeliverablesSubmitted
CampaignApproved
PayoutInitiated
PayoutCompleted
RefundInitiated
DisputeOpened
DisputeResolved
```

---

# 30. Admin Dashboard

Create:

```text
Admin
 |
 +-- Payments
 |
 +-- Escrows
 |
 +-- Payouts
 |
 +-- Refunds
 |
 +-- Disputes
 |
 +-- Ledger
 |
 +-- Webhooks
```

Payment table:

```text
ID        Company       Influencer     Amount    Status
ZF-1001   ABC Fashion   @creator1      ₹50K      Funded
ZF-1002   XYZ Foods     @creator2      ₹25K      Disputed
ZF-1003   Brand A       @creator3      ₹15K      Released
```

Payment detail:

```text
Escrow #ZF-1001

Company
ABC Fashion

Influencer
@creator1

Campaign
Summer Collection

Amount
₹50,000

Platform Fee
₹5,000

Provider
Cashfree

Payment
Successful

Terms Version
3

Timeline
----------------------------
Offer Created
Influencer Accepted
Payment Received
Campaign Started
Content Submitted
Company Approved
Payout Released
```

---

# 31. Audit Logging

Every financial state transition should be logged.

Example:

```ts
{
  actorId,

  action: "ESCROW_APPROVED",

  entityType: "ESCROW",

  entityId,

  previousStatus: "UNDER_REVIEW",

  newStatus: "APPROVED",

  metadata,

  createdAt
}
```

Important events:

```text
CAMPAIGN_CREATED
TERMS_UPDATED
TERMS_ACCEPTED
PAYMENT_CREATED
PAYMENT_SUCCEEDED
PAYMENT_FAILED
ESCROW_FUNDED
DELIVERABLE_SUBMITTED
REVISION_REQUESTED
ESCROW_APPROVED
PAYOUT_INITIATED
PAYOUT_COMPLETED
REFUND_REQUESTED
REFUND_COMPLETED
DISPUTE_OPENED
DISPUTE_RESOLVED
```

---

# 32. Cashfree Integration Strategy

Cashfree offers multiple products relevant to marketplace payments, including Payment Gateway, Easy Split, Payouts and Escrow-related solutions.

For Zerify, do not assume that the standard Payment Gateway alone provides the required marketplace escrow behavior.

The Cashfree product/use case must be selected based on the exact required flow:

```text
Company pays
     |
     v
Funds protected/held according to
approved Cashfree structure
     |
     v
Campaign completion
     |
     v
Release
     |
     v
Influencer payout
```

Cashfree Easy Split is positioned for marketplaces and supports vendor onboarding, commission/split settlement and related marketplace operations.

Cashfree also provides an Escrow product intended for structures where funds are held and disbursed according to an escrow agreement.

Before production implementation, obtain confirmation from Cashfree that Zerify's exact influencer marketplace flow is supported.

---

# 33. Cashfree Onboarding Questions

Before finalizing the implementation, ask Cashfree:

1. Can Zerify operate as an influencer marketplace using Cashfree?
2. Which product should Zerify use: Easy Split, Escrow, Payouts, or a combination?
3. Can campaign funds be held until company approval?
4. Can Zerify programmatically release funds?
5. Can Zerify support milestone-based releases?
6. Can Zerify deduct a platform commission?
7. Can influencers be onboarded/KYC'd through APIs?
8. Can companies pay through cards, UPI and net banking?
9. What are the refund rules?
10. How are disputes handled?
11. What happens when a campaign is cancelled?
12. What are the settlement timelines?
13. What are the transaction and payout fees?
14. What business documents are required?
15. What restrictions apply to influencer/marketplace payments?
16. Is the proposed escrow structure legally supported for Zerify's exact business model?

---

# 34. Payment Provider Migration Strategy

Zerify should be designed for Cashfree now and Stripe later.

Do not build:

```text
Campaign
  |
  +-- cashfreeOrderId
  +-- cashfreeVendorId
  +-- cashfreeSettlementId
```

throughout the entire application.

Instead:

```text
Campaign
   |
EscrowContract
   |
Payment
   |
PaymentProvider
```

Payment:

```ts
{
  provider: "cashfree",
  providerPaymentId: "...",
  providerOrderId: "..."
}
```

Future Stripe:

```ts
{
  provider: "stripe",
  providerPaymentId: "pi_...",
  providerOrderId: "..."
}
```

---

# 35. Running Cashfree and Stripe Together Later

The long-term architecture can be:

```text
                       ZERIFY
                          |
                    PaymentService
                          |
                 PaymentProvider
                          |
              +-----------+-----------+
              |                       |
        CashfreeProvider         StripeProvider
              |                       |
           India                  International
              |                       |
             INR                 USD / CAD / etc.
```

New campaigns can select the appropriate provider based on:

```text
Company country
Influencer country
Campaign currency
Payment availability
Provider capability
Business rules
```

---

# 36. Existing Campaign Migration

Do not migrate an active Cashfree payment to Stripe.

If a campaign has already been funded through Cashfree:

```text
Campaign #101
Provider: Cashfree
Status: ESCROW_FUNDED
```

let it finish through Cashfree.

New campaign:

```text
Campaign #102
Provider: Stripe
```

During migration:

```text
Existing campaigns
       |
       v
Cashfree

New campaigns
       |
       v
Stripe
```

Once all active Cashfree transactions are completed, Cashfree can become optional.

---

# 37. Why This Architecture Is Important

The biggest goal is:

> **Business logic should not depend on the payment provider.**

Zerify's core logic is:

```text
Campaign
Escrow Contract
Deliverables
Approval
Dispute
Refund
Payout
Ledger
```

Cashfree/Stripe is only responsible for:

```text
Payment collection
Payment status
KYC/payment account references
Fund movement
Refund processing
Payout processing
```

This separation makes future provider migration much easier.

---

# 38. Recommended Implementation Order

## Phase 1 — Database

Build:

```text
PaymentAccount
EscrowContract
EscrowMilestone
Payment
Payout
LedgerEntry
WebhookEvent
Dispute
AuditLog
```

---

## Phase 2 — Provider abstraction

Build:

```text
PaymentProvider interface
CashfreeProvider
CashfreeClient
CashfreeMapper
```

---

## Phase 3 — Company payment onboarding

Implement:

```text
Company → Payment Settings
Company → Cashfree setup
Company → Payment status
```

---

## Phase 4 — Influencer payout onboarding

Implement:

```text
Influencer → Payout Settings
Influencer → KYC/onboarding
Influencer → Payout status
```

---

## Phase 5 — Campaign contract

Implement:

```text
Create campaign
Set payment
Set terms
Version terms
Send offer
Accept/reject offer
```

---

## Phase 6 — Payment

Implement:

```text
Create payment
Cashfree checkout
Payment confirmation
Webhook
Idempotency
Escrow state transition
```

---

## Phase 7 — Deliverables

Implement:

```text
Submit
Review
Revision
Approve
Dispute
```

---

## Phase 8 — Release/payout

Implement:

```text
Release
Payout
Payout webhook/status
Ledger
Notifications
```

---

## Phase 9 — Refund/dispute

Implement:

```text
Refund
Partial refund
Dispute
Admin resolution
Ledger adjustments
```

---

## Phase 10 — Admin

Implement:

```text
Payment dashboard
Escrow dashboard
Payout dashboard
Dispute dashboard
Ledger
Webhook logs
Audit logs
```

---

# 39. MVP Scope

Do not build every advanced feature initially.

For the first Zerify payment MVP:

```text
✓ Company payment onboarding
✓ Influencer payout onboarding
✓ Campaign payment terms
✓ Influencer acceptance
✓ Payment collection
✓ Cashfree webhook
✓ Escrow/payment status
✓ Deliverable submission
✓ Company approval
✓ Payout/release
✓ Refund
✓ Basic dispute
✓ Ledger
✓ Admin payment dashboard
✓ Audit logs
```

Later:

```text
→ Milestones
→ Partial releases
→ Automated approval
→ Advanced disputes
→ Multi-currency
→ Multiple payment providers
→ Stripe Connect
→ International payouts
```

---

# 40. Final Architecture

```text
                             ZERIFY
                                |
             +------------------+------------------+
             |                  |                  |
         COMPANY            INFLUENCER          ADMIN
             |                  |                  |
             v                  v                  v
       Payment Setup       Payout Setup       Payment Admin
             |                  |                  |
             +--------+---------+------------------+
                      |
                      v
                CAMPAIGN SERVICE
                      |
                      v
                ESCROW SERVICE
                      |
          +-----------+-----------+
          |                       |
      CONTRACT                MILESTONES
          |
          v
                 PAYMENT SERVICE
                      |
              PaymentProvider
                      |
                CashfreeProvider
                      |
              +-------+-------+
              |               |
        Cashfree Gateway   Cashfree
                          Marketplace/
                          Escrow/Payout
                      |
                      v
                 WEBHOOK SERVICE
                      |
          +-----------+-----------+
          |           |           |
       Payment      Escrow      Payout
          |           |           |
          +-----------+-----------+
                      |
                      v
                   LEDGER
                      |
                      v
                 AUDIT LOG
```

---

# 41. Core Design Principle

The most important architectural decision for Zerify is:

```text
                    DO NOT BUILD

             Zerify-specific payment system
                         ❌

                    BUILD

             Zerify payment abstraction
                         |
              +----------+----------+
              |                     |
         CashfreeProvider      StripeProvider
              |                     |
              v                     v
           Cashfree               Stripe
```

Start with Cashfree because it is appropriate for the India-first phase, but keep the application completely provider-independent.

That gives Zerify a clean path from:

```text
India MVP
   ↓
Cashfree
   ↓
Indian campaigns
   ↓
Revenue + traction
   ↓
Stripe approval / international provider
   ↓
International marketplace
```

---

# 42. Compliance Reminder

This document describes the **technical architecture**, not legal or financial advice.

Before enabling real-money campaign escrow, Zerify should obtain confirmation from the selected payment provider and appropriate legal/accounting advisors regarding:

- Payment aggregation/marketplace structure
- Escrow structure
- KYC/KYB
- GST
- TDS
- International payments
- Refunds
- Chargebacks
- Consumer protection
- Influencer agreements
- Platform commission
- Accounting and reconciliation
- RBI requirements
- Data protection
- Record retention

In particular, do not represent Zerify as a regulated escrow provider unless the actual legal/payment structure supports that claim.
