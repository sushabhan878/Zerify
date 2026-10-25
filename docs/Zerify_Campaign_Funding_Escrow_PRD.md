# ZERIFY
## Product Requirements Document (PRD)
**Campaign Funding, Escrow Allocation & Creator Payout Workflow**
*Version 1.0 | 26 October 2026*

> Implementation note: This PRD defines Zerify's intended product workflow. Cashfree product availability, escrow structure, and permitted funds flows must be confirmed with Cashfree and legal/compliance advisers before production.

## 1. Executive Summary
This PRD defines the end-to-end campaign funding and escrow workflow for Zerify, an influencer-marketing platform connecting brands and creators. When a brand clicks Start Campaign, Zerify must calculate the funding requirement, allow the brand to fund the campaign through an approved existing balance or direct payment, verify funding server-side, allocate funds to each creator, activate the campaign only when funding requirements are satisfied, and manage creator-level approvals, releases, refunds, and reconciliation.

Recommended default: one campaign-level escrow arrangement where supported by the approved provider setup, with separate creator-level allocations and independent deliverable, dispute, and payout records. This is a product and technical recommendation—not an assertion that an internal database allocation is itself legally segregated escrow.

Cashfree is the intended provider candidate. Cashfree Payment Gateway may be used for payment collection, and Cashfree One Escrow should be evaluated for the actual escrow arrangement. Any wallet-like balance, funds flow, release capability, settlement model, fees, and compliance requirements must be confirmed with Cashfree and qualified legal/compliance advisers before production.


## 2. Goals and Non-Goals
### Goals
- Give brands a clear funding experience after Start Campaign.
- Support direct payment through Cashfree and, only if the underlying arrangement is approved, use of an eligible Zerify Wallet balance.
- Track campaign-level funding and separate creator-level allocations.
- Permit independent creator releases when that creator's contractual release conditions are satisfied, without unnecessarily blocking unrelated creators.
- Prevent duplicate charges, duplicate allocations, and duplicate payouts.
- Maintain auditable financial records and reconcile Zerify records against provider records.
### Non-goals for the initial release
- Building a regulated payment gateway or independently holding customer funds in Zerify's ordinary operating bank account.
- Representing a database balance as legally protected escrow without an approved funds-holding arrangement.
- Automated dispute adjudication or automatic creator payment without the agreed approval/release rules.
- Supporting every payment provider or every currency in the first release.

## 3. Actors and Permissions
| Actor | Key permissions |
|---|---|
| Brand owner / authorised brand user | Create campaign; review funding breakdown; choose an available funding method; pay; view funding and creator statuses; approve deliverables or raise a dispute as allowed by contract. |
| Creator / influencer | View accepted campaign terms; submit deliverables; respond to revision requests; view their own allocation and payout status. |
| Zerify operations / finance admin | View funding and reconciliation exceptions; perform authorised review actions; record decisions with audit trails; initiate permitted refunds or payout retries. |
| Zerify backend / provider integration | Create funding intents and payment orders; verify provider results; update state through idempotent processing; request approved escrow operations; reconcile and record outcomes. |


## 4. Core Product Decisions
- Default model: one campaign funding/escrow arrangement with a separate allocation record for each creator, subject to provider support and the approved escrow agreement.
- Creator allocations are not independent legal escrow accounts unless the provider's account structure and agreement explicitly establish that.
- A campaign becomes ACTIVE only after the full required funding is confirmed as secured. If partial funding is supported later, it must be an explicit campaign setting and policy.
- A successful checkout or browser redirect alone must never activate a campaign. Verify payment server-side and confirm the required escrow credit/funding status.
- Release and refund actions must follow campaign terms, creator agreements, applicable law, and the provider's actual capabilities.
- Wallet funding is conditional. Do not launch a stored-value wallet or permit arbitrary withdrawals until the legal/compliance structure and provider support are confirmed.
- Use integer minor units (paise for INR) for all monetary calculations and store currency on each financial record.

## 5. User Journey: Start Campaign
### Step 1 — Validate campaign
- Brand clicks Start Campaign.
- Backend checks the brand's permissions, campaign completeness, creator selection/acceptance, deliverables, dates, compensation terms, and any required agreements.
- Create or retrieve a single active funding intent for the campaign; prevent accidental duplicate funding attempts.
### Step 2 — Calculate funding requirement
- Freeze a pricing snapshot for this funding attempt: creator compensation, Zerify platform fee, applicable taxes, provider/payment charges if passed to the customer, discounts, and total due.
- Clearly disclose what the platform fee is calculated on and which charges are estimates versus final checkout amounts.
- Show a per-creator allocation breakdown and the total amount due before the brand proceeds.
### Step 3 — Choose funding method
- Direct payment: create a Cashfree order on the server and open the supported checkout experience using the returned session/token.
- Eligible balance: show this option only if an approved wallet/balance model is enabled. Check available and unreserved balance atomically; reserve it before initiating the escrow transfer.
- If the balance is insufficient, either disable the wallet-only option or show a clearly calculated split-funding option only if split funding is explicitly supported.
### Step 4 — Verify and secure funding
- Process server-side payment status and provider webhooks. Verify signatures and query the provider where needed.
- Record payment success separately from escrow funding success.
- Request or confirm the supported escrow funding/credit operation and await provider-confirmed status.
- If payment succeeds but escrow credit is pending or fails, keep the campaign unfunded; show a pending/review status, reconcile, and do not charge again automatically.
### Step 5 — Activate campaign
- When the funding requirement is met and secured, update campaign status to ACTIVE in a database transaction.
- Notify the brand and creators as appropriate and expose a clear funding receipt/summary.

## 6. Creator Allocation and Delivery Workflow
- Each selected creator has a separate allocation linked to the campaign, creator, contract/agreement, and funding record.
- Allocation fields include agreed compensation, allocated amount, released amount, refundable amount, currency, and status.
- Each creator has their own deliverables, due dates, submissions, revision requests, approval decisions, and dispute state.
- Approval of Creator A must not automatically approve Creator B or release Creator B's funds.
- Where permitted by the escrow agreement, one creator's approved allocation can be released independently while another creator's allocation remains frozen due to a dispute or missed deliverable.
- If one creator fails to deliver, follow the documented agreement for cure periods, cancellation, partial payment, refund, and dispute escalation. Do not invent automatic forfeiture rules.
- Any campaign budget change after funding must use a controlled amendment flow, updated agreement where needed, and an auditable additional-funding/refund operation.

## 7. Creator Release and Payout
- Release eligibility is based on the agreed terms—for example, deliverable submitted, brand approval or timeout rule satisfied, dispute absent, and any required evidence stored.
- An authorised release request must be idempotent and tied to a specific creator allocation and amount.
- Keep escrow release/transfer status separate from payout status. A release request being accepted does not necessarily mean the creator's bank/UPI payout is complete.
- Only use a payout product and funding source approved for the actual escrow setup. Confirm with Cashfree whether One Escrow handles the required disbursement or whether an additional product/integration is needed.
- On successful payout, record provider reference, amount, timestamp, and final status. On failure, retain the obligation and reconcile before retrying.
- Platform commission must be accounted for according to the provider arrangement, contract, tax treatment, and approved settlement flow.

## 8. Cancellation, Refunds, Disputes and Failures
| Scenario | Expected behaviour |
|---|---|
| Checkout abandoned / payment pending | Keep funding attempt pending; expire or reconcile according to provider status. Do not activate campaign. |
| Payment failed | Mark attempt failed after verified status; allow a new attempt without duplicating successful prior payments. |
| Payment succeeded; escrow funding pending | Keep campaign unfunded; reconcile and retry only the permitted escrow operation. Do not create a second charge automatically. |
| Duplicate webhook | Acknowledge safely and do not repeat financial side effects. |
| Partial/short payment | Do not activate unless partial funding is explicitly enabled and the required threshold is met. |
| Campaign cancellation before work starts | Calculate eligible refund under contract/provider rules; initiate refund through approved flow and track final status. |
| Creator dispute | Freeze only the affected release where supported; keep unrelated creator allocations progressing if contract and provider rules permit. |
| Payout failed | Keep payout obligation outstanding; investigate/reconcile before retry to avoid double payment. |
| Provider timeout / unknown status | Set a pending or reconciliation-required state. Query provider and resolve before any duplicate operation. |
| Overpayment | Record excess amount as a separate exception and handle under approved refund/credit policy; do not silently alter ledger entries. |

All money movement exceptions must create an operations-visible case with timestamps, provider references, reason, owner, and resolution history.


## 9. Cashfree Integration Requirements
- Payment Gateway: use sandbox credentials during development; create orders server-side; use supported checkout; verify payment status server-side; validate webhook signatures using current Cashfree documentation.
- One Escrow: obtain provider confirmation on eligibility, onboarding, agreements, account/ledger structure, campaign-level funding, multiple creator allocations, partial releases, disputes, refunds, payout path, settlement, and reconciliation APIs.
- Payouts or Easy Split: do not assume either is required or sufficient. Ask Cashfree which product combination supports the approved funds flow and commission/disbursement model.
- Environment separation: sandbox and production credentials, endpoints, webhook secrets, and provider references must be isolated.
- Never expose secret keys in frontend code, logs, client bundles, or error messages.
- Use current provider API versions and official documentation; do not hard-code guessed API endpoints or status values.
- Maintain a provider adapter/interface so provider-specific code is not spread through campaign logic.
Suggested onboarding questions for Cashfree: Can one campaign-level escrow arrangement support multiple creator beneficiaries? Are creator-level sub-ledgers/allocations available? Can one creator be released while another remains disputed? How is the escrow funded from Payment Gateway proceeds? Which API confirms escrow credit? Which product performs releases and creator payouts? What KYC, contracts, settlement timelines, fees, refund rules and compliance requirements apply?


## 10. Proposed State Models
| Object | Suggested states |
|---|---|
| Campaign | DRAFT, AWAITING_FUNDING, ACTIVE, COMPLETED, CANCELLED |
| Funding intent | CREATED, PAYMENT_PENDING, PAYMENT_SUCCESS, PAYMENT_FAILED, RECONCILIATION_REQUIRED, EXPIRED |
| Escrow funding | PENDING, FUNDING_IN_PROGRESS, FUNDED, FUNDING_FAILED, RECONCILIATION_REQUIRED |
| Creator allocation | PENDING, ALLOCATED, PARTIALLY_RELEASED, RELEASED, DISPUTED, REFUND_PENDING, REFUNDED |
| Deliverable | NOT_STARTED, SUBMITTED, REVISION_REQUESTED, APPROVED, DISPUTED, CANCELLED |
| Payout | NOT_READY, READY, PROCESSING, PAID, FAILED, REVERSED |
| Refund | REQUESTED, PROCESSING, REFUNDED, FAILED, RECONCILIATION_REQUIRED |

These are proposed internal states, not Cashfree's literal API status values. Map provider statuses explicitly and preserve the raw provider status/reference for support and reconciliation.


## 11. Data Model (Logical)
| Table | Purpose / key fields |
|---|---|
| campaign_funding | id, campaign_id, currency, required_amount_minor, funded_amount_minor, pricing_snapshot, status, created_by, timestamps |
| payment_orders | id, funding_id, provider, provider_order_id, provider_payment_id, amount_minor, currency, status, idempotency_key, verified_at |
| escrow_accounts | id, provider, external_account_or_agreement_ref, currency, status, metadata; do not store secrets here |
| escrow_allocations | id, funding_id, campaign_id, creator_id, agreement_id, allocated_amount_minor, released_amount_minor, refundable_amount_minor, status |
| financial_ledger_entries | id, transaction_group_id, account/ledger reference, entry_type, amount_minor, currency, direction, source_reference, idempotency_key, created_at |
| creator_payouts | id, allocation_id, creator_id, amount_minor, provider_transfer_id, status, failure_code, paid_at |
| payment_webhook_events | id, provider_event_id, event_type, signature_verified, received_at, processed_at, processing_status, payload_reference |
| refunds | id, funding_id, allocation_id nullable, amount_minor, reason, provider_refund_id, status |
| reconciliation_runs | id, provider, started_at, completed_at, result_status, discrepancy_count, report_reference |
| audit_events | id, actor_type, actor_id, action, entity_type, entity_id, before/after reference, timestamp, correlation_id |

Use foreign keys, unique constraints for provider IDs/event IDs/idempotency keys, and transactions for state transitions. Store sensitive provider payloads securely with restricted access and retention controls. Avoid duplicating source-of-truth profile or campaign data in financial tables; use stable foreign keys.


## 12. API Surface (Proposed)
| Endpoint | Purpose |
|---|---|
| POST /api/v1/campaigns/:campaignId/funding | Validate campaign and create/retrieve funding intent; return breakdown and available methods. |
| GET /api/v1/funding/:fundingId | Return funding status and safe customer-facing details. |
| POST /api/v1/payments/cashfree/webhook | Verify and process Cashfree webhook events idempotently. |
| GET /api/v1/campaigns/:campaignId/funding-status | Return campaign-level and creator-level funding status. |
| POST /api/v1/campaigns/:campaignId/escrow/reconcile | Restricted operational action to reconcile provider and internal state. |
| POST /api/v1/creator-allocations/:allocationId/release | Authorise release after eligibility checks; require permission and idempotency. |
| POST /api/v1/creator-payouts/:payoutId/retry | Restricted retry after status reconciliation confirms no successful payout. |
| POST /api/v1/refunds | Create a refund request after policy/permission checks. |

These endpoints are proposed Zerify endpoints, not provider endpoints. Apply authentication, role-based authorisation, rate limiting, request validation, CSRF protection where relevant, and audit logging.


## 13. Security, Reliability and Compliance
- Use authenticated, authorised backend operations for all financial state changes.
- Verify provider webhook signatures and use provider event IDs/idempotency keys to avoid duplicate effects.
- Never trust a client-side success page as payment proof.
- Use database transactions and row-level locking/atomic updates for wallet reservations, funding state changes, allocation totals, and release eligibility.
- Maintain an append-only financial ledger; correct errors with compensating entries rather than editing historical completed entries.
- Reconcile provider payments, escrow balances/credits/debits, refunds, and payouts on a scheduled basis and on demand for exceptions.
- Encrypt secrets and sensitive data, restrict operational permissions, redact logs, and maintain an audit trail for approvals and money movement.
- Obtain legal/compliance review for escrow, stored balances, payment aggregation, creator payouts, refunds, GST/tax invoicing, KYC/AML obligations, and consumer disclosures in India.
- Do not describe the product as legally protected escrow or a regulated wallet until the provider and legal structure support those claims.

## 14. Non-Functional Requirements
- Reliability: provider timeouts and duplicate events must not create duplicate financial effects.
- Consistency: financial state changes must be transactional; asynchronous provider operations must use durable jobs/outbox patterns where appropriate.
- Observability: structured logs with correlation IDs, metrics for payment success/failure, webhook lag, reconciliation discrepancies, and payout failures.
- Performance: funding screens should return promptly; slow provider operations should be handled asynchronously and surfaced as pending rather than blocking indefinitely.
- Accessibility and UX: show clear amounts, fee breakdown, funding status, pending states, and next actions; never show success prematurely.
- Auditability: retain agreement version, pricing snapshot, approval actor/time, provider references, and state transition history.

## 15. Acceptance Criteria
- Clicking Start Campaign creates or resumes one funding intent and displays an itemised funding breakdown.
- The user can choose only currently supported funding methods.
- Direct payment orders are created server-side for the exact amount and currency.
- A browser redirect alone cannot set payment or escrow status to successful.
- Valid webhook events are processed once logically; invalid signatures are rejected and logged safely.
- Campaign stays AWAITING_FUNDING until the required amount is confirmed secured under the approved arrangement.
- Each creator has an independently queryable allocation, deliverable state, release state, and payout state.
- A creator's approval does not automatically release another creator's allocation.
- A creator dispute can block the affected release without silently changing unrelated creator records.
- Duplicate funding requests, webhooks, release requests, refunds, and payout retries do not cause duplicate financial operations.
- All failed/unknown provider operations enter a retry or reconciliation workflow; no automatic second charge is created.
- Finance/admin users can view discrepancies and resolve them with an auditable history.
- No wallet feature is exposed in production until its permitted funds flow and balance semantics are approved.

## 16. Test Plan
- Happy path: direct payment → verified success → escrow funded → campaign active → creator approval → release → payout paid.
- Wallet path (only if enabled): sufficient eligible balance → atomic reserve → escrow credit → campaign active.
- Insufficient balance and concurrent funding attempts.
- Checkout abandoned, payment failed, delayed payment, and duplicate payment events.
- Payment successful while escrow funding fails or times out.
- Duplicate and out-of-order webhook deliveries.
- One creator completes while another is disputed; verify independent release behaviour.
- Refund before work starts, partial refund, refund failure, and reconciliation-required refund.
- Payout failure, timeout, retry, and provider reports payout successful after an initial timeout.
- Campaign budget change after funding; ensure amendments and additional funding/refund are auditable.
- Sandbox/production credential isolation and security checks.

## 17. Implementation Plan
| Phase | Scope | Exit condition |
|---|---|---|
| Phase 0 — Provider confirmation | Confirm One Escrow eligibility, account/ledger model, payment-to-escrow funds flow, independent partial releases, payouts, refunds, fees, KYC and legal requirements. | Written provider guidance and approved funds-flow diagram. |
| Phase 1 — Funding foundation | Funding UI, pricing snapshot, funding intent, Cashfree sandbox checkout, webhook verification, internal states and audit log. | Sandbox payments reconcile and never activate campaign from redirect alone. |
| Phase 2 — Escrow and allocations | Provider escrow adapter, campaign funding confirmation, creator allocations, release eligibility and exception states. | Provider confirms supported flows; multi-creator tests pass. |
| Phase 3 — Payouts/refunds | Approved release/payout integration, refunds, retries, admin exceptions and reconciliation jobs. | No duplicate payout/refund in failure tests. |
| Phase 4 — Optional wallet | Approved balance model, atomic reservations, top-ups/credits, allocation to campaigns and refund handling. | Legal/provider approval and complete ledger reconciliation. |
| Phase 5 — Production readiness | Security review, monitoring, operational runbooks, access controls and production onboarding. | Go-live checklist approved by engineering, finance, operations and compliance. |


## 18. Open Questions / Decisions Required
- Does Cashfree approve One Escrow for Zerify's business model and campaign/creator funds flow?
- Can one campaign-level arrangement support multiple creators and independent partial releases?
- Which provider product/API funds the escrow and which operation confirms the funds are secured?
- Does Zerify need Easy Split or Payouts, or does the approved One Escrow integration handle the required release and disbursement?
- Will the initial release require full campaign funding or allow partial funding? Default: full funding.
- What exactly is the platform fee base, and how are GST and payment processing charges disclosed and invoiced?
- Will an existing wallet balance be supported at launch? Default: no, until approved.
- What are the contractual cancellation, revision, dispute, timeout, partial payment, and refund rules?
- Who is authorised to approve a deliverable, and will there be any contractual auto-approval after a deadline?

## 19. References
Cashfree One Escrow: https://www.cashfree.com/escrow-account/

Cashfree documentation: https://www.cashfree.com/docs/

Cashfree developer studio / checkout guide: https://www.cashfree.com/devstudio/

Provider-specific APIs, products, account eligibility, funds flow and compliance must be confirmed against current official documentation and the signed provider agreement before production implementation.
