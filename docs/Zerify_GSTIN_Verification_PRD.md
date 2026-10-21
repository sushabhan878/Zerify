# Zerify GSTIN Verification Integration — PRD

**Product:** Zerify — Influencer Marketing Marketplace  
**Feature:** GSTIN Verification using Cashfree Verification API  
**Backend:** NestJS  
**Database:** PostgreSQL + Prisma ORM  
**Provider:** Cashfree Verification Suite  
**API documentation:** https://www.cashfree.com/docs/api-reference/vrs/v2/gstin/verify-gstin  
**Status:** Proposed — pending Cashfree API access and production configuration

---

## 1. Executive Summary

Zerify needs a GSTIN verification feature that allows brands and eligible creators to submit their Indian GST Identification Number (GSTIN), verify it through Cashfree, and reuse verified registration details for billing, invoicing, onboarding, and compliance workflows.

The system will integrate Cashfree's GSTIN Verification API through the NestJS backend. GSTINs, verification outcomes, provider references, and relevant registration details will be stored in PostgreSQL using Prisma.

The feature must support:

- GSTIN entry and verification for brand businesses.
- GSTIN entry and verification for creators who have a GST registration.
- Retrieval of registration details from Cashfree.
- Legal-name and business-profile comparison.
- Verification status tracking and re-verification.
- Multiple GST registrations for businesses operating across states.
- Secure use of provider credentials.
- Audit history, error handling, and rate limiting.
- Reuse of verified billing information when generating invoices.
- Separation of GSTIN verification from payment processing and tax calculation.

**Important:** Cashfree verifies GSTIN information. It does not determine Zerify's GST liability, guarantee a customer's eligibility for input tax credit (ITC), generate Zerify's tax invoices automatically, or establish that Zerify's marketplace settlement structure is legally approved.

## 2. Problem Statement

Businesses using Zerify may need their legal business details and GSTIN recorded correctly to support expense accounting and applicable GST credit claims.

Without a verification workflow, Zerify risks:

- Incorrect or mistyped GSTINs.
- Business names that do not match the GST registration.
- Inactive registrations being used for billing.
- Incorrect billing addresses or state details.
- Duplicate and inconsistent tax information across brand and campaign records.
- Inadequate audit records for invoice disputes.
- Frontend users falsely claiming that a GSTIN has been verified.

Zerify needs a single backend-controlled verification service that can be reused throughout the platform.

## 3. Goals

1. Verify submitted GSTINs through Cashfree's official API.
2. Retrieve and persist relevant registration details.
3. Show the user the result and allow corrections where necessary.
4. Associate each GSTIN with the correct brand or creator billing profile.
5. Prevent unauthorized users from changing or viewing another account's tax details.
6. Maintain historical verification records.
7. Make verified details available to the invoice-generation service.
8. Keep verification independent of Cashfree Payment Gateway integration.
9. Make the integration resilient to provider failures, duplicate requests, and timeouts.

## 4. Non-Goals

The initial release will not:

- Calculate all Indian GST liabilities automatically.
- Guarantee ITC eligibility for a brand.
- File GST returns or submit GSTR data.
- Automatically determine the correct GST rate for every campaign.
- Replace CA or legal review of marketplace taxation.
- Verify PAN, bank accounts, or director identities through this endpoint.
- Treat GSTIN verification as a substitute for business authorization or KYC.
- Hold, release, or split campaign funds.
- Automatically issue compliant invoices solely because a GSTIN was verified.

These can be separate integrations or future features.

## 5. User Roles and Permissions

### 5.1 Brand owner or authorized brand member

Can add and verify GST registrations for billing profiles they are authorized to manage, view verification results, and select a billing profile for an applicable transaction.

### 5.2 Creator

Can optionally submit and verify their GSTIN, maintain creator billing details, and provide the appropriate invoice or tax documentation where applicable.

A GSTIN must not be mandatory for every creator. Tax registration and documentation requirements depend on the applicable rules and the creator's circumstances.

### 5.3 Zerify administrator or compliance operator

Can inspect verification status and audit history according to a restricted permission policy. Any manual override must record the operator, reason, timestamp, and previous status.

### 5.4 Backend system

Only the backend may call Cashfree, store authoritative verification results, and transition records into a verified state.

The frontend must never be trusted to declare a GSTIN verified.

## 6. User Stories

- As a brand owner, I want to submit my GSTIN so Zerify can retrieve and validate my registered business details.
- As a brand owner, I want to see the legal name returned by Cashfree so I can identify a mismatch.
- As a creator, I want to add my GSTIN if I am registered under GST.
- As a business operating in multiple states, I want to maintain multiple GST registrations.
- As a user, I want a clear message when verification is unavailable so I can retry without losing my information.
- As an authorized billing user, I want to select the appropriate GST registration for an invoice.
- As a Zerify administrator, I want an audit trail of verification attempts and changes.
- As the invoice service, I want to use a snapshot of verified billing details when issuing an invoice.

## 7. Functional Requirements

### FR-01: GSTIN entry

Provide a GST section under the relevant account settings:

- Brand: Settings → Business & Tax Details.
- Creator: Settings → Tax and Billing Details.

The form must support:

- GSTIN.
- Business or legal name entered by the user.
- Billing-profile association.
- Registered address, where required.
- State or registration jurisdiction.
- Verification status.
- Last verification date.

GSTIN and legal name must be collected as inputs to verification. Other fields may be retrieved from Cashfree or supplied by the user, depending on the provider response and the billing requirements.

### FR-02: Input validation

Before calling Cashfree:

1. Trim leading and trailing whitespace.
2. Convert the GSTIN to uppercase.
3. Validate its expected 15-character structure.
4. Reject malformed input.
5. Enforce a maximum business-name length of 200 characters, as documented by Cashfree.
6. Apply request-size limits and rate limiting.

Format validation is not proof that the GSTIN exists or is active.

### FR-03: Cashfree verification API

Cashfree documents the following request:

**Method:** `POST`

**Sandbox endpoint shown in the documentation:**

`https://sandbox.cashfree.com/verification/gstin`

**Headers:**

- `Content-Type: application/json`
- `x-client-id: <API client ID>`
- `x-client-secret: <API client secret>`

**Request body:**

```json
{
  "GSTIN": "29AAICP2912R1ZR",
  "business_name": "UJJIVAN SMALL FINANCE BANK"
}
```

The GSTIN and business name above are from Cashfree's published example, not a Zerify customer record.

The backend must use the exact field names and endpoint supported by the current Cashfree API documentation. Confirm the production endpoint, credentials, and API access with Cashfree before production deployment.

### FR-04: Parse and normalize provider response

Cashfree's documented response may include:

- `reference_id`
- `GSTIN`
- `legal_name_of_business`
- `trade_name_of_business`
- `center_jurisdiction`
- `state_jurisdiction`
- `date_of_registration`
- `constitution_of_business`
- `taxpayer_type`
- `gst_in_status`
- `last_update_date`
- `nature_of_business_activities`
- `principal_place_address`
- `principal_place_split_address`
- `additional_address_array`
- `valid`
- `message`

Store the fields that Zerify actually needs. Preserve the original provider response only if required for audit or troubleshooting, and apply access controls and data-retention rules.

### FR-05: Verification status

Use a controlled internal status model:

- `UNVERIFIED`: No completed verification.
- `PENDING`: Verification is in progress.
- `VERIFIED`: Provider returned a valid GSTIN and Zerify's acceptance rules passed.
- `INACTIVE`: Registration is not active under Zerify's defined status mapping.
- `MISMATCH`: Submitted business details require correction or review.
- `FAILED`: A definitive verification attempt failed.
- `REVIEW_REQUIRED`: The result requires a manual decision.

A provider timeout or temporary server error must not automatically mark a previously verified registration inactive.

Store the provider's actual GST status separately from Zerify's internal verification status.

### FR-06: Name comparison

Compare the user-entered business name with the provider's legal and trade names.

The comparison should support case-insensitive matching and normalization of whitespace and common punctuation.

Do not reject a registration solely because of harmless formatting differences. Conversely, do not silently treat a material mismatch as a successful match.

If a mismatch occurs:

1. Display the provider-returned legal name.
2. Ask the user to confirm or correct their submitted details.
3. Permit a new verification attempt when appropriate.
4. Require manual review when the mismatch cannot be resolved safely.

Name comparison is a Zerify business rule, not a decision returned automatically by Cashfree.

### FR-07: Multiple registrations

A brand may maintain multiple GST registrations, potentially across different states.

Therefore:

- GST registrations must belong to billing profiles, not directly to a single login.
- One brand can have multiple billing profiles.
- A billing profile may have multiple GST registrations if the business requirements allow it.
- An invoice must reference the specific registration selected for that invoice.
- Old invoices must retain the details captured when they were issued.

### FR-08: Verification history

Record each attempt with:

- GST registration record ID.
- Provider reference ID, if returned.
- Attempt timestamp.
- Outcome.
- Sanitized error code.
- Requesting user or system actor.
- Relevant response metadata.
- Provider name.
- Duration and retry count where useful.

Do not expose credentials, sensitive raw provider responses, or internal diagnostic details to the frontend.

### FR-09: Re-verification

Provide a Verify or Re-verify action.

Re-verification should be triggered when:

- The GSTIN is changed.
- The associated legal entity changes.
- An administrator requests a fresh verification.
- A configurable policy requires a freshness check before a transaction or invoice.

Do not repeatedly call Cashfree on every page load.

### FR-10: Invoice integration

The invoice service may consume verified billing-profile data, but it must independently determine the applicable supplier, recipient, supply classification, tax treatment, and invoice requirements.

When an invoice is issued, save an immutable snapshot of the relevant supplier and recipient details. Later profile edits must not silently modify an issued invoice.

GSTIN verification alone must not trigger tax calculation or prove that ITC is available.

## 8. Proposed Architecture

```text
Brand / Creator Frontend
          |
          v
NestJS Billing Controller
          |
          v
Authentication + Authorization
          |
          v
GSTIN Verification Service
          |
          +---- Validate GSTIN and input
          |
          +---- Create verification attempt
          |
          v
Cashfree GSTIN Verification API
          |
          v
Normalize and validate provider response
          |
          v
PostgreSQL via Prisma
          |
          +---- GST registration
          +---- Verification history
          +---- Billing profile
          |
          v
Frontend displays verified details
          |
          v
Invoice service uses selected billing profile
```

Cashfree credentials must be stored in server-side secrets management. The frontend must never call the verification API directly.

## 9. API Design

All endpoints must require authentication unless explicitly designed for a public use case. The initial feature should be private to the authenticated brand or creator.

### 9.1 Create a billing profile

`POST /api/v1/billing-profiles`

Creates a billing profile and associates it with the authenticated account.

### 9.2 Add a GST registration

`POST /api/v1/billing-profiles/:profileId/gst-registrations`

Example body:

```json
{
  "gstin": "29AAICP2912R1ZR",
  "businessName": "Example Business"
}
```

The endpoint validates the input and creates or updates a registration record in an unverified state.

### 9.3 Verify a GSTIN

`POST /api/v1/billing-profiles/:profileId/gst-registrations/:registrationId/verify`

The backend:

1. Authenticates the caller.
2. Confirms ownership or authorized access to the billing profile.
3. Validates the registration.
4. Creates a verification-attempt record.
5. Calls Cashfree.
6. Normalizes the response.
7. Updates the registration and attempt records.
8. Returns a sanitized result.

### 9.4 Retrieve registration details

`GET /api/v1/billing-profiles/:profileId/gst-registrations`

Returns the authorized user's registrations and their current internal and provider statuses.

### 9.5 Retrieve verification history

`GET /api/v1/billing-profiles/:profileId/gst-registrations/:registrationId/history`

Returns authorized verification history without exposing secrets or unnecessary sensitive provider data.

### 9.6 Remove or detach a registration

`DELETE /api/v1/billing-profiles/:profileId/gst-registrations/:registrationId`

This should detach or deactivate the registration according to the data-retention policy. It must not delete historical invoice snapshots or required audit records.

## 10. Database Design

Use the existing Zerify user, brand, and creator models. Do not create duplicate account models.

### 10.1 `BillingProfile`

Recommended fields:

- `id`
- `ownerType` or equivalent account association
- `ownerId`
- `legalName`
- `billingAddress`
- `stateCode`
- `countryCode`
- `createdAt`
- `updatedAt`

Use relations consistent with Zerify's current schema.

### 10.2 `GstRegistration`

Recommended fields:

- `id`
- `billingProfileId`
- `gstin`
- `legalName`
- `tradeName`
- `providerGstStatus`
- `taxpayerType`
- `businessConstitution`
- `registrationDate`
- `lastProviderUpdateDate`
- `principalPlaceAddress`
- `principalPlaceAddressJson`, if structured data is needed
- `internalVerificationStatus`
- `providerReferenceId`
- `verifiedAt`
- `lastAttemptAt`
- `createdAt`
- `updatedAt`

### 10.3 `GstVerificationAttempt`

Recommended fields:

- `id`
- `gstRegistrationId`
- `provider`
- `providerReferenceId`
- `status`
- `failureCode`
- `sanitizedMessage`
- `responseMetadata`
- `initiatedByUserId`
- `startedAt`
- `completedAt`
- `createdAt`

Apply appropriate retention and access-control policies.

### 10.4 Data integrity

- Normalize GSTIN to uppercase.
- Add appropriate uniqueness constraints.
- Use foreign keys and indexes.
- Scope all queries to the authenticated account's authorization.
- Avoid storing duplicated GSTIN fields in brand, creator, campaign, and invoice tables.
- Snapshot supplier and recipient details on issued invoices rather than relying on live profile relations.

## 11. Error Handling

| Condition | Expected behavior |
|---|---|
| Invalid GSTIN format | Return validation error without calling Cashfree |
| GSTIN does not exist | Mark the attempt failed and show a safe message |
| Inactive registration | Record the provider status and require the appropriate action |
| Name mismatch | Show the registered name and request correction or review |
| Invalid credentials | Alert operations; do not expose credentials or provider internals |
| Rate limit | Apply bounded retry/backoff where appropriate |
| Provider timeout | Mark the attempt as pending or retryable; preserve the previous verified state |
| Cashfree server error | Return a retryable error to the frontend |
| Duplicate request | Prevent unnecessary repeated provider calls using an idempotency or in-flight request strategy |
| Unauthorized billing profile | Return an authorization error and do not call Cashfree |
| Malformed provider response | Record a sanitized failure and avoid marking the registration verified |

Do not blindly retry every failed request. Retry only transient failures and respect Cashfree's documented rate limits and retry guidance.

## 12. Security and Compliance

- Keep Cashfree client ID and secret in server-side environment variables or a managed secret store.
- Use separate sandbox and production credentials.
- Restrict production secrets to the backend service.
- Enforce authorization at every billing-profile endpoint.
- Apply request rate limits to verification endpoints.
- Avoid logging raw credentials or unnecessary personal/business data.
- Validate provider responses before updating internal status.
- Record privileged actions in an audit trail.
- Apply a documented retention and deletion policy.
- Provide a clear privacy notice explaining why GSTIN information is collected and how it is used.
- Obtain appropriate legal review for personal-data processing and GST compliance.
- Do not represent verification as legal certification of the business or proof of ITC eligibility.

## 13. Frontend UX Requirements

The verification interface should display:

- GSTIN input.
- Business name input.
- Verify GSTIN button.
- Loading indicator while verification is in progress.
- Registered legal name and trade name returned by Cashfree.
- Provider GST status.
- Taxpayer type and registration date where available.
- Registered address where appropriate.
- Last verified timestamp.
- Clear mismatch, inactive, error, and retry states.

Suggested user-facing messages:

- **Verified:** “GSTIN verified. Please confirm that the registered business details match your organization.”
- **Mismatch:** “The registered business name differs from the details you entered. Review the returned details before continuing.”
- **Inactive:** “This registration is not currently active according to the verification result.”
- **Temporary failure:** “We couldn't verify this GSTIN right now. Your information has been saved; please try again later.”

Do not show “GST compliant” or “eligible for GST credit” merely because verification succeeded.

## 14. Acceptance Criteria

The feature is accepted when:

1. Authorized users can create and manage their billing profiles.
2. A valid GSTIN can be submitted to the NestJS backend.
3. The backend can call Cashfree using server-side credentials.
4. The response is parsed into Zerify's internal schema.
5. A successful valid response results in the appropriate internal status.
6. Inactive registrations and mismatches are handled separately from successful verification.
7. Provider failures do not corrupt previously verified data.
8. Verification history is persisted.
9. Users cannot verify or access another account's registration without authorization.
10. Multiple registrations can be associated with the appropriate business.
11. The invoice service can use the selected billing profile and snapshot the required details.
12. Cashfree secrets never reach the frontend or appear in logs.
13. Sandbox and production configuration are separated.
14. Duplicate and concurrent requests are handled safely.
15. Automated tests cover normal, failure, authorization, and provider-error scenarios.

## 15. Testing Plan

### Unit tests

- GSTIN normalization and format validation.
- Business-name comparison.
- Provider response mapping.
- Provider-status to internal-status mapping.
- Retryable versus non-retryable error handling.
- Permission checks.

### Integration tests

- Valid GSTIN verification using Cashfree sandbox test data.
- Invalid GSTIN test case.
- Inactive-registration test case, where supported by the provider's test data.
- Provider timeout and server error.
- Database persistence and history creation.
- Duplicate verification requests.
- Multiple GST registrations for one business.
- Unauthorized access to another profile.
- Invoice snapshot creation.

Cashfree's documentation provides sandbox test data for testing verification behavior. Use that test data rather than real customer information in automated tests.

### Security tests

- Frontend cannot submit a verified status.
- Frontend cannot access provider credentials.
- User cannot alter another brand's registration.
- Sensitive fields are not included in ordinary logs.
- Rate limiting and request validation are enforced.

## 16. Deployment Plan

### Stage 1 — Sandbox

- Obtain Cashfree Verification API credentials.
- Configure sandbox environment variables.
- Run verification test cases.
- Confirm response mapping and status handling.

### Stage 2 — Internal testing

- Connect the brand and creator settings pages.
- Test account authorization and multiple registrations.
- Validate audit history and error states.
- Connect the invoice service to the billing-profile model.

### Stage 3 — Production readiness

- Confirm production endpoint and credentials with Cashfree.
- Review access control, logging, retention, and privacy.
- Have the invoice and tax workflows reviewed by an Indian CA.
- Set up monitoring for provider failures and excessive error rates.
- Enable production access only after the verification feature passes acceptance testing.

## 17. Dependencies and Open Questions

Before implementation is finalized, confirm:

1. Cashfree Verification Suite API access is enabled for Zerify's account.
2. Production endpoint and credentials are available.
3. Current rate limits, pricing, and provider retry requirements.
4. Current Zerify user, brand, creator, and billing-profile schema.
5. Whether creator GST verification is optional or required for particular onboarding and payment flows.
6. Which billing profile is selected for each invoice.
7. How long verification history and provider response data should be retained.
8. The GST treatment of platform fees, creator services, marketplace transactions, and refunds.
9. Whether additional marketplace tax obligations apply.
10. Whether an existing invoice or accounting service should be integrated.

## 18. Implementation Deliverables

- NestJS GSTIN verification module.
- Cashfree API client/service.
- DTOs and validation rules.
- Prisma migrations and models.
- Billing-profile and GST-registration endpoints.
- Verification-history endpoint.
- Frontend integration for brand and creator settings.
- Provider response normalization and error mapping.
- Unit and integration tests.
- Environment configuration and deployment instructions.
- Audit logging and monitoring.
- Documentation for production operations.

## 19. Recommended Delivery Order

1. Review the existing Prisma schema and authentication model.
2. Obtain Cashfree API access and verify sandbox credentials.
3. Implement the database migration.
4. Implement and test the Cashfree verification service.
5. Implement the authenticated NestJS endpoints.
6. Connect the frontend.
7. Integrate billing profiles with invoice generation.
8. Complete security and failure testing.
9. Obtain CA review of invoice and tax workflows.
10. Enable production credentials and monitor the rollout.

## Definition of Done

An authorized Zerify brand or creator can submit a GSTIN, have the backend verify it through Cashfree, see the returned registration details, and maintain an auditable registration record that can be selected for appropriate billing workflows—without exposing credentials or falsely promising tax-credit eligibility.
