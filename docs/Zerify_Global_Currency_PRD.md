# Zerify — Global Currency & Multi-Currency Display System
## Product Requirements Document (PRD)

**Document Status:** Draft / Production Specification  
**Product:** Zerify  
**Feature:** Global Currency Preference + Cross-Currency Conversion  
**Primary Users:** Brands and Influencers/Creators  
**Platforms:** Web Dashboard / API / Admin  
**Priority:** High  
**Version:** 1.0

---

## 1. Executive Summary

Zerify is a two-sided influencer marketing platform where Brands and Influencers may operate in different countries and therefore use different currencies.

This feature introduces a **global currency preference at the account/profile level** for both sides of the platform:

- An Influencer selects a preferred dashboard currency while creating or completing their profile.
- A Brand selects a preferred dashboard currency while creating or completing their brand profile.
- The selected currency becomes the **default display currency across the entire corresponding dashboard**.
- The original currency of every financial record is preserved.
- When a financial value is shown to another user whose preferred currency differs from the original currency, Zerify dynamically converts the value using an exchange rate from the configured FX provider.
- Exchange rates are cached and timestamped to avoid excessive API calls and inconsistent rendering.
- All supported currencies exposed by the configured FX provider should be available for selection, subject to Zerify's supported-currency policy.
- Currency conversion is a **display/presentation concern by default**. It must not silently alter the actual settlement currency of a campaign, payout, invoice, escrow, or transaction.

### Example

A Brand chooses **USD** and creates a campaign with a budget of:

> **10,000 USD**

An Influencer whose dashboard currency is **INR** views the campaign.

If the current USD → INR rate is `95.67`, Zerify displays approximately:

> **₹956,700 INR**

The system must retain the original:

> `10000.00 USD`

and the conversion metadata:

> `USD → INR @ 95.67`

so the displayed amount is reproducible and auditable.

---

# 2. Problem Statement

Currently, Zerify can display monetary values using the currency associated with a particular transaction or feature, but there is no unified currency experience across the dashboard.

This creates several problems:

1. Users may see different currencies on different pages.
2. Brands and influencers operating in different countries cannot easily understand campaign values.
3. Campaign budgets, payouts, fees and analytics may become confusing when users have different local currencies.
4. Currency conversion logic can become duplicated across frontend components.
5. Financial data can become unsafe if converted values overwrite original values.
6. Exchange-rate API calls can become expensive or rate-limited if every UI component independently fetches rates.
7. Historical financial records can become difficult to audit if the exchange rate used for a display is not recorded.

The system needs one centralized currency architecture that works consistently across the complete Zerify application.

---

# 3. Goals

## 3.1 Primary Goals

### G1 — Global Dashboard Currency

Allow every Brand and Influencer to select one preferred display currency.

### G2 — Consistent UI

The selected currency must be applied consistently to:

- Dashboard
- Campaigns
- Campaign discovery
- Campaign details
- Applications
- Offers
- Contracts
- Escrow
- Payments
- Payouts
- Earnings
- Wallet
- Fees
- Invoices
- Analytics
- Reports
- Transactions
- Notifications containing monetary values
- Profile financial information
- Search/filter controls involving monetary values
- Exports

### G3 — Cross-Currency Display

When the stored/original currency differs from the viewer's preferred currency, convert the amount using the configured FX provider.

### G4 — Preserve Financial Truth

Never overwrite the original financial amount or transaction currency merely because a user changes their dashboard currency.

### G5 — Provider Independence

Implement an FX provider abstraction so Zerify can replace or add providers without rewriting application-level currency logic.

### G6 — Auditable Conversion

Store enough metadata to determine:

- Source currency
- Target/display currency
- Rate used
- Rate timestamp
- Provider
- Conversion timestamp
- Whether the displayed value is live or cached

### G7 — Production Reliability

Currency conversion should continue functioning during temporary FX-provider failures using cached rates where appropriate.

---

# 4. Non-Goals

This feature does **not** automatically change:

- Bank account settlement currency
- Payment gateway settlement currency
- Escrow settlement currency
- Tax jurisdiction
- Legal invoice currency
- Accounting ledger currency
- Payment provider currency
- Actual amount charged to a customer

Changing a dashboard currency is not equivalent to changing the currency of a financial transaction.

---

# 5. Core Product Principle

## Store once, display many ways.

Every financial object must have an authoritative amount and currency.

For example:

```text
Campaign Budget
----------------
amount: 10000.00
currency: USD
```

The user interface may display:

```text
Brand dashboard:
$10,000 USD

INR Influencer dashboard:
₹956,700 INR

EUR user:
€8,720 EUR
```

The database must still retain:

```text
10000.00 USD
```

unless a real financial transaction actually occurred in another currency.

---

# 6. User Types

## 6.1 Brand

A Brand has:

```text
brand.preferred_currency
```

Example:

```text
USD
```

All financial information on the Brand dashboard defaults to USD.

---

## 6.2 Influencer

An Influencer has:

```text
influencer.preferred_currency
```

Example:

```text
INR
```

All financial information on the Influencer dashboard defaults to INR.

---

## 6.3 Platform/Admin

Admins require a platform-level default currency for:

- Internal reporting
- Revenue analytics
- Platform fees
- GMV
- Financial dashboards

Recommended:

```text
platform.default_currency = USD
```

This must be configurable.

---

# 7. Currency Selection

## 7.1 When Currency Is Selected

Currency should be requested during:

### Influencer onboarding

```text
Create Profile
      ↓
Basic Information
      ↓
Location
      ↓
Preferred Currency
      ↓
Complete Profile
```

### Brand onboarding

```text
Create Brand Profile
      ↓
Business Information
      ↓
Country
      ↓
Preferred Currency
      ↓
Complete Profile
```

The field should also be available under:

```text
Settings
→ Preferences
→ Currency
```

---

# 8. Currency Selector UX

The selector should support:

- Search
- ISO code
- Currency name
- Currency symbol
- Country/region examples where useful

Example:

```text
Search currency...

🇺🇸 USD — United States Dollar ($)
🇮🇳 INR — Indian Rupee (₹)
🇪🇺 EUR — Euro (€)
🇬🇧 GBP — British Pound (£)
🇯🇵 JPY — Japanese Yen (¥)
🇨🇦 CAD — Canadian Dollar (C$)
🇦🇺 AUD — Australian Dollar (A$)
```

Do not rely only on symbols because several currencies share symbols.

---

# 9. Currency Data Source

Zerify should maintain a normalized internal currency table.

The application should not hard-code the entire currency list inside frontend components.

Recommended source:

```text
FX Provider
     ↓
Currency Sync Job
     ↓
Zerify currencies table
     ↓
Currency Selector API
     ↓
Frontend
```

This makes currency availability dynamic.

---

# 10. Recommended FX Provider

## Production Default: Open Exchange Rates

Open Exchange Rates provides:

- Latest FX rates
- Historical rates
- Currency list endpoint
- ISO-style currency codes
- Multiple currencies
- JSON API
- Configurable base currency on eligible plans
- Specific-currency filtering

Its current Developer plan documents 195 world currencies, hourly updates, historical data, up to 10,000 requests/month, and unlimited base currencies. citeturn0search1turn0search6turn0search9

Currency metadata is available through its `/currencies.json` endpoint. citeturn0search4

Official API documentation describes its rates as blended from multiple reliable sources. citeturn0search12

### Important terminology

For Zerify, the phrase **"live exchange rate"** should mean:

> The latest available rate from the configured FX provider, subject to that provider's update frequency.

It should not imply that Zerify receives tick-by-tick foreign-exchange market prices.

---

# 11. Secondary/Fallback Provider

## Frankfurter

Frankfurter is a useful secondary provider/reference source.

It currently exposes a public API without requiring an API key and tracks rates from central banks and official institutions. Its documentation states that it covers 206 currencies and that latest rates are updated according to provider publication schedules. citeturn0search7turn0search13

It also provides:

```text
/v2/rates
/v2/rate/{base}/{quote}
/v2/currencies
```

and supports provider-specific rates. citeturn0search7

However, Frankfurter's default data is reference-rate oriented rather than a high-frequency trading feed. Therefore it should not be represented in the UI as a real-time market quote.

---

# 12. Provider Abstraction

Do not call Open Exchange Rates directly from React/Next.js components.

Implement:

```text
CurrencyService
      ↓
FXProvider interface
      ↓
OpenExchangeRatesProvider
FrankfurterProvider
FutureProvider
```

Example interface:

```typescript
interface FXProvider {
  getCurrencies(): Promise<Currency[]>

  getLatestRates(
    baseCurrency: string,
    quoteCurrencies?: string[]
  ): Promise<ExchangeRateResult>

  getRate(
    baseCurrency: string,
    quoteCurrency: string
  ): Promise<ExchangeRateResult>

  getHistoricalRate(
    baseCurrency: string,
    quoteCurrency: string,
    date: Date
  ): Promise<ExchangeRateResult>
}
```

---

# 13. Architecture

```text
                    ┌─────────────────────┐
                    │   FX Provider       │
                    │ Open Exchange Rates │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Currency Service    │
                    │ Provider Abstraction│
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
        ┌─────────────────┐        ┌──────────────────┐
        │ Redis FX Cache  │        │ PostgreSQL       │
        │ Latest Rates    │        │ Currency/Rates   │
        └────────┬────────┘        └────────┬─────────┘
                 │                          │
                 └────────────┬─────────────┘
                              ▼
                   ┌──────────────────────┐
                   │ Zerify Backend API   │
                   │ CurrencyService      │
                   └──────────┬───────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Brand Dashboard     Influencer Dashboard
              Preferred: USD      Preferred: INR
```

---

# 14. Database Design

## 14.1 User/Account Preferences

Recommended centralized table:

```sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    preferred_currency CHAR(3) NOT NULL DEFAULT 'USD',
    timezone VARCHAR(100),
    locale VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

If Zerify has separate Brand and Influencer entities, the preference can instead live directly on the corresponding profile table.

Recommended architecture:

```text
user_preferences
    preferred_currency
```

rather than duplicating the same preference field in many unrelated tables.

---

# 15. Currency Table

```sql
CREATE TABLE currencies (
    code CHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20),
    numeric_code VARCHAR(10),
    decimal_digits SMALLINT NOT NULL DEFAULT 2,
    symbol_position VARCHAR(10),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    provider VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Examples:

```text
USD | United States Dollar | $   | 2
INR | Indian Rupee         | ₹   | 2
EUR | Euro                 | €   | 2
JPY | Japanese Yen         | ¥   | 0
KWD | Kuwaiti Dinar        | د.ك | 3
```

The `decimal_digits` field is important because currencies do not all use two decimal places.

---

# 16. Exchange Rate Table

Recommended:

```sql
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY,
    base_currency CHAR(3) NOT NULL,
    quote_currency CHAR(3) NOT NULL,
    rate NUMERIC(24,12) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    rate_timestamp TIMESTAMP NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP,
    UNIQUE (
        base_currency,
        quote_currency,
        provider,
        rate_timestamp
    )
);
```

Indexes:

```sql
CREATE INDEX idx_exchange_rates_pair
ON exchange_rates(base_currency, quote_currency);

CREATE INDEX idx_exchange_rates_timestamp
ON exchange_rates(rate_timestamp);
```

---

# 17. Financial Data Model

Every monetary record should contain an authoritative currency.

Example:

```sql
campaigns
---------
budget_amount DECIMAL(20,8)
budget_currency CHAR(3)
```

Do not store only:

```text
budget = 10000
```

Store:

```text
budget_amount = 10000
budget_currency = USD
```

---

# 18. Fields That Require Currency Awareness

Currency metadata must be reviewed across the complete Zerify schema.

At minimum:

### Campaigns

```text
budget_amount
budget_currency
```

### Campaign applications

```text
proposed_amount
proposed_currency
```

### Offers

```text
offer_amount
offer_currency
```

### Contracts

```text
contract_amount
contract_currency
```

### Escrow

```text
escrow_amount
escrow_currency
```

### Payments

```text
payment_amount
payment_currency
```

### Payouts

```text
payout_amount
payout_currency
```

### Platform fees

```text
fee_amount
fee_currency
```

### Invoices

```text
subtotal_amount
tax_amount
total_amount
currency
```

### Wallet

```text
balance_amount
balance_currency
```

### Transactions

```text
amount
currency
```

### Refunds

```text
refund_amount
refund_currency
```

---

# 19. Do Not Duplicate Converted Amounts

Avoid this design:

```text
campaign
----------------
budget_usd
budget_inr
budget_eur
budget_gbp
budget_jpy
...
```

This creates:

- data duplication
- stale conversions
- schema explosion
- reconciliation problems

Instead:

```text
budget_amount = 10000
budget_currency = USD
```

and calculate display values dynamically.

---

# 20. Currency Conversion Formula

For:

```text
amount = 10000
source = USD
target = INR
rate = 95.67
```

Conversion:

```text
converted_amount = amount × rate
```

Therefore:

```text
10000 × 95.67
= 956700 INR
```

If the provider gives the rate in the opposite direction, Zerify must invert it:

```text
USD → INR
= 1 / (INR → USD)
```

The CurrencyService should handle this internally.

---

# 21. Same-Currency Optimization

If:

```text
sourceCurrency === targetCurrency
```

do not call the FX API.

Return:

```text
amount unchanged
rate = 1
```

Example:

```text
10000 USD → USD
10000 USD
```

---

# 22. Conversion Response

Backend response:

```json
{
  "original": {
    "amount": "10000.00",
    "currency": "USD"
  },
  "display": {
    "amount": "956700.00",
    "currency": "INR"
  },
  "conversion": {
    "rate": "95.67",
    "provider": "openexchangerates",
    "rateTimestamp": "2026-09-26T10:00:00Z",
    "fetchedAt": "2026-09-26T10:02:00Z",
    "isCached": true
  }
}
```

---

# 23. API Design

## GET /api/v1/currencies

Returns all active currencies.

Example:

```http
GET /api/v1/currencies
```

Response:

```json
{
  "currencies": [
    {
      "code": "USD",
      "name": "United States Dollar",
      "symbol": "$",
      "decimalDigits": 2
    },
    {
      "code": "INR",
      "name": "Indian Rupee",
      "symbol": "₹",
      "decimalDigits": 2
    }
  ]
}
```

---

# 24. User Currency Preference API

## GET

```http
GET /api/v1/me/preferences/currency
```

Response:

```json
{
  "currency": "INR"
}
```

## PATCH

```http
PATCH /api/v1/me/preferences/currency
```

Request:

```json
{
  "currency": "INR"
}
```

Response:

```json
{
  "currency": "INR",
  "updated": true
}
```

---

# 25. Conversion API

## POST /api/v1/currency/convert

Request:

```json
{
  "amount": "10000",
  "from": "USD",
  "to": "INR"
}
```

Response:

```json
{
  "amount": "956700",
  "currency": "INR",
  "rate": "95.67",
  "sourceCurrency": "USD",
  "targetCurrency": "INR",
  "provider": "openexchangerates",
  "rateTimestamp": "2026-09-26T10:00:00Z"
}
```

---

# 26. Prefer Server-Side Conversion

Do not expose the FX provider API key to the frontend.

Bad:

```text
React → OpenExchangeRates
```

Correct:

```text
React
  ↓
Zerify API
  ↓
CurrencyService
  ↓
Redis
  ↓
FX Provider
```

Benefits:

- API key security
- centralized caching
- rate limiting
- provider replacement
- consistent rates
- observability

---

# 27. Redis Caching

Currency rates should be cached.

Example key:

```text
fx:USD:INR
```

Value:

```json
{
  "rate": "95.67",
  "provider": "openexchangerates",
  "rateTimestamp": "2026-09-26T10:00:00Z"
}
```

Recommended TTL:

```text
1–6 hours
```

The exact TTL should be configurable according to the provider's update frequency and Zerify's product requirements.

Open Exchange Rates documents hourly updates on its Developer plan, while Frankfurter's latest rates follow central-bank/provider publication schedules. citeturn0search1turn0search2

---

# 28. Do Not Fetch Rates Per Component

Incorrect:

```text
CampaignCard → API
BudgetCard → API
WalletCard → API
AnalyticsCard → API
```

Correct:

```text
Dashboard request
      ↓
Currency context
      ↓
Required currency rates
      ↓
All components consume same rate cache
```

---

# 29. Currency Context

Frontend should have one global currency context/store.

Example:

```typescript
interface CurrencyContext {
  currency: string;
  currencies: Currency[];
  rates: Record<string, number>;
  isLoading: boolean;
  lastUpdated?: string;
}
```

Possible implementation:

```text
React Context
or
Zustand
or
TanStack Query
```

Recommended:

```text
TanStack Query + server-side CurrencyService
```

if TanStack Query is already used in Zerify.

---

# 30. Formatting Service

Create a shared formatter:

```typescript
formatMoney({
  amount,
  currency,
  locale
})
```

Example:

```typescript
formatMoney({
  amount: 956700,
  currency: "INR"
})
```

Result:

```text
₹9,56,700
```

For USD:

```text
$10,000
```

For JPY:

```text
¥10,000
```

---

# 31. International Formatting

Use the browser/Node internationalization API:

```typescript
Intl.NumberFormat
```

Example:

```typescript
new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR"
})
```

The formatter must respect the currency's standard number of decimal places.

---

# 32. Currency Display Rules

## Standard amount

```text
₹9,56,700
```

## Precise financial amount

```text
₹9,56,700.00
```

## Compact analytics

```text
₹9.57L
```

The UI must define when compact notation is permitted.

Never use compact notation for:

- Payment confirmation
- Invoice totals
- Escrow settlement
- Contract amounts
- Legal documents

---

# 33. Original + Converted Display

For important financial records, show both currencies where helpful.

Example:

```text
Campaign Budget

₹9,56,700 INR
≈ $10,000 USD
```

This is especially recommended for:

- Campaign details
- Offers
- Contracts
- Escrow
- Payment confirmations
- Invoices

The original currency should be visually identifiable.

---

# 34. Campaign Example

Brand:

```text
Preferred Currency: USD
Campaign Budget: $10,000 USD
```

Influencer:

```text
Preferred Currency: INR
```

Influencer sees:

```text
Campaign Budget
₹9,56,700 INR

Original:
$10,000 USD

FX:
1 USD = ₹95.67
```

The influencer must not interpret ₹9,56,700 as the actual payment settlement amount unless the campaign's contractual currency is INR.

---

# 35. Critical Distinction: Display Currency vs Settlement Currency

Every campaign should distinguish:

```text
display_currency
```

from:

```text
settlement_currency
```

Example:

```text
Campaign:
budget = 10000
settlement_currency = USD
```

Influencer:

```text
display_currency = INR
```

Display:

```text
₹956,700
```

Settlement:

```text
$10,000 USD
```

---

# 36. Escrow Requirements

Escrow is a financial transaction and must not be silently converted merely because the dashboard currency changes.

Example:

```text
Escrow:
10,000 USD
```

Influencer dashboard:

```text
≈ ₹956,700 INR
```

Actual escrow ledger:

```text
10,000 USD
```

The payment provider should receive the actual settlement currency.

---

# 37. Payment Requirements

The following values must be immutable after a completed payment:

```text
payment amount
payment currency
provider transaction ID
exchange rate if FX was actually part of settlement
```

Changing dashboard currency after payment must not alter historical payment records.

---

# 38. Historical Display Policy

Two different policies should be supported.

## Policy A — Current-Rate Display

Use today's/latest available rate.

Example:

```text
Historical payment:
$10,000 USD

Today:
₹9,56,700 INR
```

Label:

```text
Converted using latest available rate
```

## Policy B — Transaction-Date Rate

For accounting/financial reporting, use the exchange rate that applied to the transaction date.

Example:

```text
Transaction:
$10,000 USD

Transaction-date rate:
₹83.20

Historical equivalent:
₹8,32,000
```

### Recommendation

Use:

- **Current rate** for normal dashboard visualization.
- **Transaction-date/persisted rate** for financial reports, invoices, accounting and settlement-related records.

---

# 39. Exchange Rate Provenance

For every converted value used in a financial context, expose:

```text
Rate:
95.67

Source:
Open Exchange Rates

Updated:
26 Sep 2026, 10:00 UTC
```

Optional tooltip:

```text
Converted from USD using the latest available exchange rate.
```

---

# 40. Exchange Rate Precision

Store FX rates at high precision:

```text
NUMERIC(24,12)
```

Do not store rates as JavaScript floating-point values in financial persistence.

Use:

```text
Decimal
```

or:

```text
BigInt / integer minor units
```

where appropriate.

Recommended backend libraries:

```text
decimal.js
big.js
Prisma Decimal
```

---

# 41. Money Storage

For transactional money, preferably use integer minor units where practical:

```text
10000 USD
→ 1,000,000 cents
```

However, because currencies have different minor-unit rules, the currency metadata must define decimal precision.

Alternative:

```text
DECIMAL(20,8)
```

is acceptable for application-level financial amounts when implemented consistently.

---

# 42. Rate Refresh Strategy

Recommended architecture:

```text
Cron / Worker
     ↓
Fetch provider rates
     ↓
Validate response
     ↓
Update Redis
     ↓
Persist latest snapshot
```

Suggested schedule:

```text
Hourly
```

or aligned with the selected provider's published update cadence.

Do not make every user request trigger an external provider request.

---

# 43. Cache-Aside Fallback

When a rate is requested:

```text
1. Check Redis
2. If fresh → return
3. If missing/stale → check database
4. If valid database rate exists → return + async refresh
5. If no usable rate → provider request
6. If provider succeeds → cache + persist
7. If provider fails → use last known acceptable rate
```

---

# 44. FX Failure Handling

If provider is unavailable:

### Preferred behavior

Show:

```text
₹9,56,700 INR
```

with:

```text
Using latest available exchange rate
```

Do not display:

```text
₹0
```

Do not display:

```text
₹NaN
```

Do not silently assume:

```text
1 USD = 1 INR
```

---

# 45. No-Rate Scenario

If no rate exists:

```text
$10,000 USD
```

and:

```text
INR conversion unavailable
```

The original value must remain visible.

The user should never lose access to the authoritative amount.

---

# 46. Unsupported Currency Pair

If:

```text
USD → XYZ
```

is unavailable directly, CurrencyService may calculate through a common base currency.

Example:

```text
USD → EUR
EUR → INR
```

Then:

```text
USD → INR
=
USD→EUR × EUR→INR
```

This should happen inside the backend service.

---

# 47. Rate Validation

Before accepting a provider response:

Validate:

- Currency exists
- Rate is numeric
- Rate > 0
- Timestamp is valid
- Provider response is not malformed
- Currency is active
- Base/quote are different unless rate = 1

Reject suspicious responses.

---

# 48. Rate Anomaly Detection

Optional production safeguard:

Flag if:

```text
new_rate / previous_rate
```

changes beyond a configured threshold.

Example:

```text
USD/INR changed > 10% in one update
```

Do not automatically overwrite the previous rate until the anomaly is reviewed or policy permits it.

---

# 49. Currency Preference Change

If a user changes:

```text
INR → USD
```

all dashboard displays should update.

However:

- Historical transactions remain unchanged.
- Campaign settlement currency remains unchanged.
- Invoices remain unchanged.
- Payment records remain unchanged.
- Escrow records remain unchanged.

Only display values change unless the user explicitly performs a supported financial action.

---

# 50. Dashboard Currency State

Frontend startup:

```text
Authentication
     ↓
Load user preferences
     ↓
Read preferred_currency
     ↓
Initialize CurrencyContext
     ↓
Load currency metadata
     ↓
Load required FX rates
     ↓
Render dashboard
```

Avoid rendering arbitrary default currency after the preference has already been loaded.

---

# 51. Loading State

Instead of:

```text
₹0
```

show:

```text
Loading currency...
```

or render the original amount until conversion is ready.

Example:

```text
$10,000 USD
≈ Loading INR...
```

---

# 52. API Response Strategy

Backend APIs should ideally return both:

```json
{
  "amount": "10000.00",
  "currency": "USD"
}
```

and optionally:

```json
{
  "displayAmount": "956700.00",
  "displayCurrency": "INR",
  "exchangeRate": "95.67"
}
```

However, the authoritative backend model should remain the original amount/currency.

---

# 53. Preferred API Pattern

For dashboard APIs:

```http
GET /api/v1/brand/campaigns?displayCurrency=INR
```

or derive it automatically from authenticated user preferences.

Recommended:

```text
Authenticated user's preferred currency
```

should be the default.

Allow an explicit override only where useful.

---

# 54. Avoid Client-Controlled Financial Currency

Do not trust:

```http
POST /payment
{
  "amount": 956700,
  "currency": "INR"
}
```

just because the dashboard displays INR.

Payment amounts must come from authoritative server-side financial records.

---

# 55. Campaign Creation

When Brand creates a campaign:

```text
Brand preferred currency = USD
```

Campaign creation form defaults to:

```text
Currency: USD
Budget: 10,000
```

Store:

```text
budget_amount = 10000
budget_currency = USD
```

---

# 56. Campaign Viewing by Influencer

Influencer preferred currency:

```text
INR
```

Backend:

```text
10000 USD
      ↓
USD → INR
      ↓
95.67
      ↓
956700 INR
```

UI:

```text
Campaign Budget
₹9,56,700

Original campaign budget:
$10,000 USD
```

---

# 57. Campaign Application

If an Influencer submits:

```text
Proposal:
₹500,000 INR
```

and the campaign is denominated in USD, Zerify should explicitly preserve:

```text
proposal_amount = 500000
proposal_currency = INR
```

The Brand can see:

```text
₹5,00,000 INR
≈ $5,224 USD
```

using the applicable latest rate.

Do not silently rewrite the proposal to USD in the database.

---

# 58. Negotiation

During negotiation, each monetary value must show its currency.

Example:

```text
Influencer Offer
₹5,00,000 INR
≈ $5,224 USD
```

Brand counteroffer:

```text
$5,500 USD
≈ ₹5,26,185 INR
```

Both original amounts remain distinct.

---

# 59. Analytics

Analytics should support normalized reporting.

For example:

```text
Total Campaign Spend
$250,000 USD

Your Dashboard Currency:
₹2.39 Cr INR
```

The report must state the conversion methodology.

Example:

```text
Converted using latest available FX rates.
```

For financial-period reporting, use period-specific/historical rates where required.

---

# 60. Filters

If users filter:

```text
Campaigns above ₹5,00,000
```

the backend must know whether this means:

```text
display-equivalent threshold
```

Recommended behavior:

```text
Filter in user's selected display currency.
```

Backend:

```text
campaign amount
→ convert to user's currency
→ compare
```

For large datasets, use normalized reporting values or optimized FX joins rather than converting thousands of records independently.

---

# 61. Sorting

If sorting by:

```text
Budget: High → Low
```

the system must sort by values converted to the same target currency.

Never sort:

```text
$10,000
₹500,000
€8,000
```

as raw numeric values.

---

# 62. Pagination Consideration

For paginated lists, conversion should occur before sorting/filtering when the operation is based on display currency.

Otherwise page ordering can become incorrect.

Recommended options:

1. Normalize using a reporting/base currency.
2. Use database-level conversion for supported reports.
3. Retrieve the relevant records and convert before sorting for smaller datasets.

---

# 63. Search

Search should not require currency conversion unless the search explicitly contains a monetary filter.

Example:

```text
Budget > ₹10 lakh
```

should be parsed as:

```text
targetCurrency = INR
threshold = 1000000
```

---

# 64. Notifications

Notifications containing financial information must use the recipient's preferred currency where appropriate.

Example:

```text
Your campaign payment of ₹50,000 INR has been released.
```

But the notification detail page should preserve:

```text
Original settlement amount:
$600 USD
```

if USD was the settlement currency.

---

# 65. Email

Emails should use the user's preferred display currency when they are informational.

For legally/financially authoritative emails:

```text
Amount: $600 USD
```

should remain the contractual/transaction currency.

Optionally:

```text
Approximate value in your dashboard currency:
₹57,402 INR
```

---

# 66. Invoices

Invoices must not dynamically change based on the viewer's dashboard currency.

Invoice currency must be immutable:

```text
Invoice total:
$10,000 USD
```

Optional:

```text
Approximate INR equivalent:
₹956,700 INR
```

but this must not replace the invoice currency.

---

# 67. Exports

CSV/XLSX/PDF exports should include:

```text
Original Amount
Original Currency
Display Amount
Display Currency
FX Rate
FX Rate Timestamp
```

Example:

| Original Amount | Original Currency | Display Amount | Display Currency | FX Rate |
|---:|---|---:|---|---:|
| 10000.00 | USD | 956700.00 | INR | 95.67 |

For accounting exports, the original financial currency should remain authoritative.

---

# 68. Admin Dashboard

Admin should have:

```text
Platform Default Currency
```

and optionally:

```text
Reporting Currency
```

These are separate concepts from the user's personal dashboard currency.

Admin reporting should be able to choose:

```text
USD
INR
EUR
GBP
...
```

without modifying individual users' preferences.

---

# 69. Platform Revenue

Suppose Zerify earns:

```text
7% platform fee
```

on:

```text
$10,000 USD
```

The authoritative platform fee is:

```text
$700 USD
```

If admin reporting currency is INR:

```text
≈ ₹66,969 INR
```

Both must be traceable.

---

# 70. Currency and Existing Payment Architecture

Currency conversion must sit above the payment/escrow layer.

```text
                Dashboard
                    │
            Display Currency
                    │
                    ▼
            Currency Service
                    │
       ┌────────────┴────────────┐
       │                         │
Financial Records          FX Provider
       │
       ▼
Payment / Escrow
```

The FX service must never mutate payment provider settlement instructions.

---

# 71. Supported Currency Policy

The product should expose currencies returned by the configured provider only if they meet Zerify's validation rules.

Recommended status:

```text
ACTIVE
SUPPORTED
DISPLAY_ONLY
UNSUPPORTED_FOR_SETTLEMENT
```

This distinction is important.

A currency may be:

```text
available for dashboard display
```

but:

```text
not supported by Cashfree/Stripe/payment provider for settlement.
```

---

# 72. Display Currency vs Payment Currency Matrix

| Currency | Dashboard Display | Campaign | Escrow | Settlement |
|---|---:|---:|---:|---:|
| USD | Yes | Yes | Yes* | Provider-dependent |
| INR | Yes | Yes | Yes* | Provider-dependent |
| EUR | Yes | Yes | Yes* | Provider-dependent |
| GBP | Yes | Yes | Yes* | Provider-dependent |
| Other supported FX currencies | Yes | Yes | Only if payment architecture supports it | Provider-dependent |

`*` means the application may display the currency, but actual payment/escrow support depends on the payment provider and Zerify's legal/payment configuration.

---

# 73. Currency Metadata Sync

Create a scheduled job:

```text
syncCurrencies()
```

Process:

```text
Provider currencies endpoint
       ↓
Validate ISO code
       ↓
Normalize name/symbol
       ↓
Upsert currencies
       ↓
Deactivate currencies no longer supported
```

Open Exchange Rates exposes a dedicated currency-list endpoint whose contents mirror currencies available from its latest-rate data. citeturn0search4

---

# 74. Currency Provider Configuration

Environment variables:

```env
FX_PROVIDER=openexchangerates

OPEN_EXCHANGE_RATES_APP_ID=
OPEN_EXCHANGE_RATES_BASE_URL=https://openexchangerates.org/api

FX_CACHE_TTL_SECONDS=3600
FX_MAX_STALE_SECONDS=86400
FX_DEFAULT_CURRENCY=USD
```

Fallback:

```env
FX_FALLBACK_PROVIDER=frankfurter
```

---

# 75. Recommended Backend Module

For NestJS:

```text
src/
└── modules/
    └── currency/
        ├── currency.module.ts
        ├── currency.controller.ts
        ├── currency.service.ts
        ├── currency.repository.ts
        ├── currency.types.ts
        ├── currency.constants.ts
        ├── fx/
        │   ├── fx-provider.interface.ts
        │   ├── open-exchange-rates.provider.ts
        │   └── frankfurter.provider.ts
        ├── dto/
        │   ├── convert-currency.dto.ts
        │   └── update-currency.dto.ts
        └── jobs/
            ├── sync-rates.job.ts
            └── sync-currencies.job.ts
```

For a FastAPI service, use the equivalent service/repository/provider separation.

---

# 76. Frontend Architecture

Recommended:

```text
src/
├── components/
│   └── currency/
│       ├── CurrencySelector.tsx
│       ├── Money.tsx
│       ├── ConvertedAmount.tsx
│       └── RateTooltip.tsx
├── hooks/
│   ├── useCurrency.ts
│   └── useMoney.ts
├── services/
│   └── currency.service.ts
└── stores/
    └── currency.store.ts
```

---

# 77. Money Component

Create a single reusable component:

```tsx
<Money
  amount={campaign.budgetAmount}
  currency={campaign.budgetCurrency}
/>
```

The component should:

1. Read user's preferred currency.
2. Detect original currency.
3. Skip conversion if identical.
4. Retrieve cached rate.
5. Convert.
6. Format.
7. Optionally display original value.
8. Expose rate metadata through tooltip.

---

# 78. Example Component Behavior

Input:

```text
amount = 10000
currency = USD
userCurrency = INR
```

Output:

```text
₹9,56,700
```

Tooltip:

```text
Original: $10,000 USD
Rate: 1 USD = ₹95.67
Updated: 26 Sep 2026, 10:00 UTC
```

---

# 79. Global Currency Setting UI

Settings:

```text
Preferences
────────────────────────

Currency

[ 🇮🇳 INR — Indian Rupee       ▼ ]

This currency will be used to display
monetary values throughout your dashboard.

Changing this setting does not change
the currency of existing payments,
campaigns, invoices or contracts.
```

---

# 80. Onboarding UI

Example:

```text
What currency do you primarily use?

This will be used throughout your Zerify dashboard.

[ Search currencies... ]

🇮🇳 INR — Indian Rupee (₹)

[ Continue ]
```

For Brand:

```text
What currency do you use for campaign budgets?

[ USD — United States Dollar ($) ]
```

---

# 81. Country Does Not Automatically Determine Currency

Do not assume:

```text
Country = currency
```

Instead:

```text
Country
+
Preferred Currency
```

Country can preselect a suggested currency, but the user must be able to change it.

Example:

```text
Country: India

Suggested:
INR — Indian Rupee
```

User can still select:

```text
USD
EUR
GBP
```

---

# 82. Locale vs Currency

Do not couple:

```text
locale
```

and:

```text
currency
```

A user may have:

```text
locale = en-IN
currency = USD
```

Formatting should therefore use:

```text
locale + explicit currency
```

rather than allowing locale to silently override the currency preference.

---

# 83. Multiple Accounts

If a user has both:

```text
Brand profile
Influencer profile
```

the preference should be scoped according to the active dashboard/profile if Zerify supports multiple roles.

Example:

```text
Brand dashboard → USD
Influencer dashboard → INR
```

This is preferable to forcing one global user-level currency when the same account can operate in two distinct contexts.

Recommended model:

```text
profile_preferences
-------------------
profile_id
preferred_currency
```

rather than only:

```text
user_preferences
```

if multi-profile accounts are supported.

---

# 84. Recommended Data Model for Zerify

If Brand and Influencer are separate profiles:

```text
users
  │
  ├── brand_profiles
  │       └── preferred_currency
  │
  └── influencer_profiles
          └── preferred_currency
```

This directly supports the requested behavior.

---

# 85. Currency Resolution Algorithm

For every dashboard request:

```text
1. Identify authenticated user.
2. Identify active profile.
3. Read profile.preferred_currency.
4. Read financial record's original currency.
5. Compare currencies.
6. If equal → return original.
7. If different → request CurrencyService conversion.
8. CurrencyService checks cache.
9. If fresh → use cached rate.
10. Otherwise fetch/update provider data.
11. Convert amount.
12. Format for requested locale.
13. Return original + display information.
```

---

# 86. Currency Resolution Priority

Recommended priority:

```text
Explicit request override
        ↓
Active profile preferred currency
        ↓
User preference
        ↓
Platform default
        ↓
USD
```

An explicit override should only be permitted for read/display operations.

---

# 87. Security Requirements

Never expose:

```text
OPEN_EXCHANGE_RATES_APP_ID
```

to the browser.

Use:

```text
Backend environment variable
```

Protect currency preference endpoints with authentication.

Validate currency codes server-side.

Do not allow users to alter:

```text
transaction_currency
settlement_currency
invoice_currency
```

through a generic dashboard preference endpoint.

---

# 88. Rate Limiting

Currency API endpoints should be rate-limited.

Example:

```text
GET /currencies
60 requests/minute/user

POST /currency/convert
60 requests/minute/user
```

Actual values should be tuned based on usage.

The frontend should rely primarily on cached/batched rates.

---

# 89. Batch Rate Endpoint

For dashboards with multiple currencies:

```http
GET /api/v1/currency/rates?base=INR&quotes=USD,EUR,GBP,AUD,CAD
```

Response:

```json
{
  "base": "INR",
  "rates": {
    "USD": 0.01045,
    "EUR": 0.00923,
    "GBP": 0.00782
  }
}
```

This is preferable to one request per card.

---

# 90. Rate Cache Strategy

Recommended Redis structure:

```text
fx:rates:{base}:{date/hour}
```

or:

```text
fx:{provider}:{base}
```

Example:

```text
fx:openexchangerates:USD
```

Value:

```json
{
  "timestamp": "...",
  "rates": {
    "INR": 95.67,
    "EUR": 0.872,
    "GBP": 0.748
  }
}
```

One base-rate payload can serve many conversions.

---

# 91. Observability

Track:

```text
fx_requests_total
fx_provider_requests_total
fx_cache_hits_total
fx_cache_misses_total
fx_provider_errors_total
fx_conversion_errors_total
fx_stale_rate_usage_total
fx_latency_ms
```

Recommended dashboard:

```text
FX Provider Health
------------------
Provider: Open Exchange Rates
Last successful sync: ...
Currencies: ...
Cache hit rate: ...
Provider errors: ...
Stale-rate usage: ...
```

---

# 92. Logging

Every provider failure should log:

```text
provider
endpoint
status
currency pair
timestamp
request duration
error code
```

Never log:

```text
API key
```

---

# 93. Alerting

Alert when:

- Provider unavailable repeatedly
- Currency sync fails
- Rate sync has exceeded acceptable staleness
- Currency count unexpectedly changes
- FX response contains invalid values
- Cache has no usable rates
- Provider latency spikes

---

# 94. Testing Strategy

## Unit Tests

Test:

```text
USD → USD
USD → INR
INR → USD
USD → EUR
EUR → INR
JPY → INR
KWD → INR
```

Test:

```text
zero amount
negative amount
very large amount
decimal amount
missing rate
stale rate
provider error
```

---

# 95. Integration Tests

Test:

```text
Brand currency = USD
Influencer currency = INR
Campaign budget = 10000 USD
```

Expected:

```text
Influencer dashboard = converted INR value
```

Test reverse:

```text
Influencer proposal = 500000 INR
Brand dashboard = converted USD value
```

---

# 96. End-to-End Test

Scenario:

```text
1. Create Brand.
2. Set USD.
3. Create campaign.
4. Set budget 10,000 USD.
5. Create Influencer.
6. Set INR.
7. Open campaign discovery.
8. Verify INR conversion.
9. Change Influencer currency to EUR.
10. Refresh.
11. Verify EUR conversion.
12. Verify campaign remains 10,000 USD.
```

---

# 97. Currency Change Test

Before:

```text
Preferred currency = INR
```

After:

```text
Preferred currency = USD
```

Expected:

- All dashboard financial displays update.
- Original financial records remain unchanged.
- No payment is created.
- No transaction is modified.
- No campaign settlement currency changes.

---

# 98. FX Provider Failure Test

Simulate:

```text
Open Exchange Rates → 500
```

Expected:

```text
Use cached rate
```

If cached rate exceeds maximum staleness:

```text
Show original amount
+ conversion unavailable notice
```

---

# 99. Acceptance Criteria

### AC-01

A Brand can select a preferred currency during onboarding.

### AC-02

An Influencer can select a preferred currency during onboarding.

### AC-03

The selected currency persists after logout/login.

### AC-04

All dashboard monetary values use the selected currency by default.

### AC-05

Different Brand and Influencer currencies are supported.

### AC-06

Campaign budgets are stored with original currency.

### AC-07

Cross-currency campaign values are converted using the configured FX service.

### AC-08

Currency changes do not mutate original financial records.

### AC-09

Same-currency values do not require an FX API call.

### AC-10

FX rates are cached.

### AC-11

FX provider credentials never reach the browser.

### AC-12

Users can search and select supported currencies.

### AC-13

Currency formatting respects currency-specific decimal precision.

### AC-14

Invoices and financial documents retain authoritative transaction currency.

### AC-15

Escrow settlement currency remains independent from display currency.

### AC-16

Provider failure does not cause monetary values to become zero or NaN.

### AC-17

The UI can indicate the rate timestamp/source when conversion transparency is required.

### AC-18

Historical financial records remain reproducible.

### AC-19

Currency APIs are authenticated and rate-limited where appropriate.

### AC-20

Currency conversion logic is centralized in one backend service.

---

# 100. Migration Plan

## Phase 1 — Audit Existing Schema

Find all fields containing:

```text
amount
price
budget
fee
cost
payment
payout
balance
earning
revenue
tax
commission
```

For every field determine:

```text
Does it already have a currency?
```

---

# 101. Phase 2 — Add Currency Fields

For every financial table that lacks currency:

```text
amount_currency CHAR(3)
```

Backfill using the existing business rules.

Do not guess historical currencies if the source data cannot establish them.

---

# 102. Phase 3 — Currency Tables

Create:

```text
currencies
exchange_rates
profile_preferences
```

Seed currencies from the provider.

---

# 103. Phase 4 — Currency Service

Implement:

```text
CurrencyService
FXProvider
OpenExchangeRatesProvider
Redis cache
```

---

# 104. Phase 5 — Frontend

Implement:

```text
CurrencySelector
CurrencyContext
Money component
ConvertedAmount
RateTooltip
```

Replace scattered currency formatting logic with the centralized components.

---

# 105. Phase 6 — Dashboard Integration

Integrate in this order:

```text
1. Campaigns
2. Campaign discovery
3. Offers
4. Applications
5. Wallet
6. Earnings
7. Payments
8. Escrow
9. Transactions
10. Analytics
11. Invoices
12. Notifications
13. Exports
```

---

# 106. Phase 7 — QA

Test:

```text
USD
INR
EUR
GBP
JPY
AUD
CAD
AED
SGD
CHF
CNY
KRW
```

plus additional currencies exposed by the provider.

Open Exchange Rates currently documents a broad supported-currency list, including INR, USD, EUR, GBP, JPY, AUD, CAD and many others. citeturn0search0

---

# 107. Performance Requirements

Target:

```text
Cached conversion:
< 10 ms service overhead

Database conversion:
< 100 ms

Provider fetch:
dependent on provider

Dashboard currency initialization:
< 300 ms target excluding network latency
```

Currency data should not become the bottleneck for dashboard rendering.

---

# 108. Scalability

The architecture must support:

```text
10,000 users
100,000 users
1M+ users
```

without generating one external FX API request per monetary UI element.

The primary scaling mechanism is:

```text
Provider fetch
     ↓
Central cache
     ↓
Thousands of conversions
```

---

# 109. Cost Control

The application must not perform:

```text
10,000 users
×
20 currency components
=
200,000 FX API requests
```

Instead:

```text
One provider rate snapshot
        ↓
Redis
        ↓
many dashboard conversions
```

Open Exchange Rates specifically recommends limiting requested currencies when possible to reduce response size. citeturn0search6

---

# 110. Rate Update Policy

Recommended:

```text
Background synchronization:
Hourly

Redis TTL:
1 hour

Maximum acceptable stale rate:
24 hours

Historical rates:
Persist/cached permanently where required
```

The exact values should be configurable.

Frankfurter's own documentation similarly recommends caching latest rates for a short TTL because rates update according to provider publication schedules. citeturn0search10

---

# 111. Important Financial Rule

### Never use display conversion as a payment conversion.

This distinction must be enforced at code level.

Bad:

```typescript
payment.amount = convert(
  campaign.budget,
  user.preferredCurrency
);
```

Correct:

```typescript
payment.amount = campaign.budgetAmount;
payment.currency = campaign.budgetCurrency;
```

Display:

```typescript
displayAmount = currencyService.convert(
  campaign.budgetAmount,
  campaign.budgetCurrency,
  user.preferredCurrency
);
```

---

# 112. Example Full Flow

## Brand

```text
Country:
United States

Preferred Currency:
USD
```

Creates:

```text
Campaign:
Summer Creator Campaign

Budget:
10000 USD
```

Database:

```text
budget_amount = 10000
budget_currency = USD
```

---

## Influencer

```text
Country:
India

Preferred Currency:
INR
```

Views campaign.

CurrencyService:

```text
source = USD
target = INR
amount = 10000
```

Rate:

```text
1 USD = 95.67 INR
```

Calculation:

```text
10000 × 95.67
= 956700
```

UI:

```text
Campaign Budget

₹9,56,700 INR

Original:
$10,000 USD
```

---

# 113. Another Example

Influencer proposes:

```text
₹5,00,000 INR
```

Database:

```text
amount = 500000
currency = INR
```

Brand currency:

```text
USD
```

Rate:

```text
1 USD = 95.67 INR
```

Conversion:

```text
500000 / 95.67
≈ 5226.40 USD
```

Brand sees:

```text
₹5,00,000 INR
≈ $5,226 USD
```

The proposal remains:

```text
500000 INR
```

---

# 114. Currency Tooltip

Every converted amount can optionally expose:

```text
₹9,56,700 INR
```

Tooltip:

```text
Original amount: $10,000 USD
Exchange rate: 1 USD = ₹95.67
Rate source: Open Exchange Rates
Rate updated: 26 Sep 2026, 10:00 UTC
```

---

# 115. UX Warning

When changing currency:

```text
Change dashboard currency?

This changes how monetary values are displayed.
It does not change existing campaign, payment,
escrow, invoice, or settlement currencies.

[Cancel] [Change Currency]
```

This prevents users from assuming they are changing actual payment currency.

---

# 116. Accessibility

Currency selector must support:

- Keyboard navigation
- Search
- Screen readers
- Clear selected state
- Currency code and name
- Accessible labels
- No reliance on color alone

Example accessible label:

```text
Currency: Indian Rupee, INR
```

not:

```text
₹
```

alone.

---

# 117. Localization

Currency formatting must support locale-aware formatting.

Examples:

```text
en-IN + INR
₹9,56,700

en-US + USD
$10,000

de-DE + EUR
10.000,00 €
```

The currency preference and locale preference are independent.

---

# 118. Mobile/Responsive Behavior

On small screens:

```text
₹9.57L
```

may be used for dashboard analytics.

For transaction details:

```text
₹9,56,700 INR
```

should remain visible.

---

# 119. Admin Controls

Admin settings:

```text
Settings
→ Finance
→ Currency

Default platform currency: USD

FX provider:
[ Open Exchange Rates ]

Fallback provider:
[ Frankfurter ]

Rate refresh:
[ 1 hour ]

Maximum stale rate:
[ 24 hours ]
```

---

# 120. Feature Flags

Rollout through:

```text
global_currency_enabled
currency_conversion_enabled
multi_currency_campaigns_enabled
historical_fx_enabled
```

This allows gradual deployment.

---

# 121. Rollout Strategy

### Stage 1

Internal/admin testing.

### Stage 2

10% of users.

### Stage 3

25%.

### Stage 4

50%.

### Stage 5

100%.

Monitor:

```text
conversion errors
provider failures
dashboard latency
cache hit rate
incorrect currency reports
payment inconsistencies
```

---

# 122. Definition of Done

The feature is complete when:

- Currency can be selected during Brand onboarding.
- Currency can be selected during Influencer onboarding.
- Currency is persisted at profile level.
- Currency can be changed in settings.
- All dashboard monetary UI uses the profile currency.
- Original financial currency is preserved.
- Cross-currency conversion works.
- Exchange rates come from a centralized provider service.
- Rates are cached.
- Provider failures are handled.
- All supported currencies are dynamically available.
- Payment/escrow settlement remains independent.
- Invoices retain authoritative currency.
- Analytics correctly normalize currencies.
- Filters and sorting work with display currency.
- Exports expose original and converted amounts where applicable.
- Tests cover major currency pairs and failure modes.
- Monitoring is implemented.

---

# 123. Recommended Technology Stack

Given Zerify's existing architecture, the implementation can use:

```text
Frontend:
Next.js
React
TypeScript
Intl.NumberFormat
TanStack Query / existing state manager

Backend:
Node.js
NestJS / Express
TypeScript

Database:
PostgreSQL
Prisma

Cache:
Redis

FX:
Open Exchange Rates

Fallback/reference:
Frankfurter

Precision:
Prisma Decimal / decimal.js

Scheduling:
BullMQ / existing worker / cron

Monitoring:
Prometheus + Grafana
```

---

# 124. Final Recommended Architecture

```text
                         ┌───────────────────────┐
                         │    Open Exchange      │
                         │       Rates           │
                         └───────────┬───────────┘
                                     │
                         ┌───────────▼───────────┐
                         │     FX Provider       │
                         │      Adapter          │
                         └───────────┬───────────┘
                                     │
                         ┌───────────▼───────────┐
                         │    Currency Service   │
                         └───────┬───────┬───────┘
                                 │       │
                       ┌─────────▼─┐   ┌─▼─────────────┐
                       │   Redis   │   │  PostgreSQL   │
                       │   Cache   │   │ currencies +  │
                       │           │   │ exchange_rates│
                       └──────┬────┘   └──────┬────────┘
                              │               │
                              └───────┬───────┘
                                      ▼
                            ┌────────────────────┐
                            │    Zerify API      │
                            └─────────┬──────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
             ┌──────▼──────┐                     ┌──────▼──────┐
             │ Brand       │                     │ Influencer  │
             │ Dashboard   │                     │ Dashboard   │
             │ USD         │                     │ INR         │
             └─────────────┘                     └─────────────┘
```

---

# 125. Key Design Decisions

| Decision | Recommendation |
|---|---|
| Dashboard currency | Profile-level preference |
| Brand currency | Independent from Influencer |
| Original transaction currency | Always preserved |
| Conversion | Backend CurrencyService |
| FX provider | Open Exchange Rates |
| Fallback/reference | Frankfurter |
| Provider API key | Backend only |
| Cache | Redis |
| Currency metadata | PostgreSQL |
| FX precision | Decimal |
| Same currency | No FX request |
| Historical financial data | Preserve original + applicable historical rate |
| Dashboard visualization | Latest available rate |
| Payment settlement | Never automatically changed |
| Escrow settlement | Never automatically changed |
| Invoice currency | Immutable |
| Currency list | Dynamically synchronized |
| Frontend formatting | Intl.NumberFormat |
| Financial components | Shared `<Money />` component |
| Provider architecture | Adapter/interface |
| Failure mode | Cached/stale rate, then original amount if unavailable |

---

# 126. Product Requirement Summary

Zerify should treat currency as a **global presentation preference**, while treating financial currency as an **immutable property of the financial record**.

The complete system therefore follows:

```text
Profile Currency
       ↓
Dashboard Display Currency
       ↓
Currency Service
       ↓
Live/Latest FX Rate
       ↓
Converted Display Value
```

while preserving:

```text
Original Amount
       +
Original Currency
       +
Transaction/Settlement Currency
```

This architecture allows:

```text
Brand → USD
Influencer → INR
Campaign → 10,000 USD
Display → ₹956,700 INR
Settlement → 10,000 USD
```

without mixing presentation-layer currency conversion with actual payment or escrow settlement.

---

## External Provider References

- Open Exchange Rates API documentation: supported currencies, currency list, latest rates, base currencies and plans. citeturn0search0turn0search1turn0search4turn0search9
- Frankfurter API documentation: latest rates, currencies, providers and caching guidance. citeturn0search7turn0search10turn0search13
