# Database Guidelines — Zerify

## 1. Overview

| Property | Value |
|----------|-------|
| **Engine** | PostgreSQL (Neon Serverless) |
| **ORM** | Prisma 5.12 |
| **Schema location** | `apps/backend/prisma/schema.prisma` |
| **Total models** | 46 |
| **Total enums** | 33 |
| **Total tables** | 46 (all mapped via `@@map`) |
| **Primary keys** | UUID (`@default(uuid())`) on all models |
| **Schema lines** | 1,784 |

---

## 2. Connection

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

- **Provider**: `postgresql` (Neon PostgreSQL)
- **Connection URL**: `DATABASE_URL` environment variable
- **Driver**: `@prisma/client` (Prisma Client JS)
- **Global module**: `PrismaModule` is `@Global()` — available to all modules without explicit import
- **Service**: `PrismaService` extends `PrismaClient`, implements `OnModuleInit` and `OnModuleDestroy`

---

## 3. Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Models | PascalCase singular | `Campaign`, `InfluencerProfile`, `ZerifyPayment` |
| Tables | snake_case plural via `@@map` | `"campaigns"`, `"influencer_profiles"` |
| Enums | PascalCase | `UserRole`, `CampaignStatus` |
| Enum values | SCREAMING_SNAKE_CASE | `BRAND_AWARENESS`, `UNDER_REVIEW` |
| Fields | camelCase | `brandProfileId`, `minPricePerReel` |
| Foreign keys | `<modelName>Id` | `userId`, `campaignId` |
| Join tables | Named for relationship | `SavedCreator`, `ConversationParticipant` |
| Boolean flags | `is`/`has` prefix | `isVerified`, `isOnboardingCompleted`, `hasFreeProduct` |
| Timestamps | `createdAt`/`updatedAt` | Universal across all models |
| Monetary (production) | `*Minor` suffix | `amountMinor`, `grossBudgetMinor` |
| Currency | `currency` or `*Currency` | `currency`, `budgetCurrency` |

---

## 4. Data Types

### Type Usage Guide

| Prisma Type | PostgreSQL Type | When to Use |
|-------------|----------------|-------------|
| `String` | `TEXT` | IDs (UUID), names, URLs, emails, short text |
| `String` @db.Text | `TEXT` (explicit) | Long-form text (comments, descriptions, error messages) |
| `String[]` | `TEXT[]` | Multi-select values (hashtags, niches, platforms) |
| `Int` | `INTEGER` | Counts, quantities, versions, retry counts |
| `Float` | `DOUBLE PRECISION` | Ratings, percentages, non-production monetary values |
| `BigInt` | `BIGINT` | **Production monetary values** (minor units/paise) |
| `Boolean` | `BOOLEAN` | Flags and toggles |
| `DateTime` | `TIMESTAMP` | All timestamps (created, updated, submitted, etc.) |
| `Json` | `JSONB` | Flexible/schemaless data, snapshots, API payloads |

### Important: Monetary Values
- **Production payments**: Always use `BigInt` with `*Minor` suffix (paise for INR, cents for USD)
- **Non-production amounts**: `Float` is acceptable for display-only values (budget estimates, proposed amounts)
- **Never use `Float` for financial calculations or ledger entries**

---

## 5. Model Reference

### User & Auth
| Model | Table | Purpose |
|-------|-------|---------|
| `User` | `users` | Core user entity (admin, brand, influencer) |
| `Organization` | `organizations` | Organization entity (minimal) |
| `VipAccess` | `vip_access` | VIP early-access email whitelist |

### Brand
| Model | Table | Purpose |
|-------|-------|---------|
| `BrandProfile` | `brand_profiles` | Brand/company profile with onboarding |
| `BrandProduct` | `brand_products` | Products/services a brand offers |
| `SavedCreator` | `saved_creators` | M:N — brands saving influencer creators |

### Influencer
| Model | Table | Purpose |
|-------|-------|---------|
| `InfluencerProfile` | `influencer_profiles` | Influencer profile with niches, pricing |
| `InfluencerPastDeliverable` | `influencer_past_deliverables` | Portfolio items |
| `InfluencerPaymentDetails` | `influencer_payment_details` | Bank/UPI/PayPal details |

### Social Integration
| Model | Table | Purpose |
|-------|-------|---------|
| `SocialAccount` | `social_accounts` | Connected social media accounts with OAuth |
| `SocialProfileMetadata` | `social_profile_metadata` | 1:1 extended profile metadata |
| `SocialAudienceGender` | `social_audience_genders` | Gender distribution |
| `SocialAudienceAge` | `social_audience_age_groups` | Age distribution |
| `SocialAudienceCountry` | `social_audience_countries` | Country distribution |
| `SocialAudienceCity` | `social_audience_cities` | City distribution |
| `SocialAudienceLocale` | `social_audience_locales` | Language distribution |
| `SocialAccountPerformance` | `social_account_performance` | Time-series engagement snapshots |
| `SocialMediaContent` | `social_media_contents` | Individual posts with engagement |
| `SocialSyncState` | `social_sync_states` | Sync orchestration state |

### Campaign
| Model | Table | Purpose |
|-------|-------|---------|
| `Campaign` | `campaigns` | Core campaign entity |
| `CampaignProduct` | `campaign_products` | Product/service (1:1) |
| `CampaignRequirement` | `campaign_requirements` | Eligibility criteria (1:1) |
| `CampaignDeliverable` | `campaign_deliverables` | Deliverable templates |
| `CampaignApplication` | `campaign_applications` | Influencer applications |
| `CampaignOffer` | `campaign_offers` | Brand offers to applicants |
| `CampaignParticipant` | `campaign_participants` | Confirmed participants |
| `ParticipantDeliverable` | `participant_deliverables` | Per-participant deliverables |
| `DeliverableRevision` | `deliverable_revisions` | Revision audit trail |
| `CampaignPayment` | `campaign_payments` | Payment allocations |

### Reviews
| Model | Table | Purpose |
|-------|-------|---------|
| `Review` | `reviews` | Profile-level testimonials |
| `ReviewQuestion` | `review_questions` | Predefined review questions |
| `CampaignReview` | `campaign_reviews` | Campaign-level bidirectional reviews |
| `ReviewRating` | `review_ratings` | Individual question ratings |

### Messaging
| Model | Table | Purpose |
|-------|-------|---------|
| `Conversation` | `conversations` | Real-time messaging conversations |
| `ConversationParticipant` | `conversation_participants` | User membership |
| `Message` | `messages` | Individual messages |
| `MessageAttachment` | `message_attachments` | File/media attachments |
| `OutboxEvent` | `outbox_events` | Transactional outbox pattern |

### Payments & Finance
| Model | Table | Purpose |
|-------|-------|---------|
| `ZerifyPayment` | `zerify_payments` | Provider-level payment orders |
| `ZerifyRefund` | `zerify_refunds` | Refund records |
| `FinancialAccount` | `financial_accounts` | Double-entry ledger accounts |
| `LedgerTransaction` | `ledger_transactions` | Ledger transactions |
| `LedgerEntry` | `ledger_entries` | Individual DEBIT/CREDIT entries |
| `CampaignFinance` | `campaign_finances` | Campaign financial summary |
| `PayoutBeneficiary` | `payout_beneficiaries` | KYC/beneficiary details |
| `ZerifyPayout` | `zerify_payouts` | Influencer payout records |
| `WebhookEvent` | `webhook_events` | Webhook event log |
| `Dispute` | `disputes` | Payment disputes |
| `FinancialAuditLog` | `financial_audit_logs` | Immutable audit trail |

### Network
| Model | Table | Purpose |
|-------|-------|---------|
| `InfluencerBrandPartner` | `influencer_brand_partners` | M:N partner network |

---

## 6. Relations

### Delete Behaviors

| Behavior | Count | When to Use |
|----------|-------|-------------|
| **Cascade** | ~45 | Child depends entirely on parent (profile → user, products → profile) |
| **SetNull** | ~10 | Optional reference — child survives, reference cleared |
| **Restrict** | 4 | Financial records — prevent deletion of referenced payments |

### Cascade Rules
- Deleting a `User` cascades to `BrandProfile`, `InfluencerProfile`, `SocialAccount`, etc.
- Deleting a `Campaign` cascades to all applications, offers, participants, deliverables, payments
- Deleting a `CampaignParticipant` cascades to deliverables, revisions, payments
- Deleting a `SocialAccount` cascades to all audience data, performance, content, sync states

### SetNull Rules
- `Review.brandProfileId` — brand can be deleted, review remains
- `CampaignReview` reviewer/reviewee fields — flexible review ownership
- `Conversation.campaignId` — campaign can be deleted, conversation remains
- `Message.senderId` — user can be deleted, message remains (system messages)

### Restrict Rules
- `ZerifyPayment.userId` — cannot delete user with payment history
- `ZerifyRefund.paymentId` — cannot delete payment with refunds
- `LedgerEntry.accountId` — cannot delete account with ledger entries
- `Dispute.paymentId` — cannot delete payment with disputes

---

## 7. Indexes

### Unique Constraints (30)
Key compound unique constraints:
- `SocialAccount`: `[userId, platform, platformUserId]`
- `CampaignApplication`: `[campaignId, socialAccountId]`
- `CampaignParticipant`: `[campaignId, influencerProfileId]`
- `Message`: `[conversationId, senderId, clientMessageId]`
- `CampaignReview`: `[campaignId, reviewerUserId, reviewType]`
- All payment models: `idempotencyKey` (unique)

### Performance Indexes (38)
Key indexes for common query patterns:
- `Campaign`: `[brandProfileId, status]`, `[status, applicationDeadline]`
- `CampaignApplication`: `[campaignId, status]`, `[influencerProfileId, createdAt]`
- `Message`: `[conversationId, sequenceNumber]`, `[conversationId, createdAt]`
- `ZerifyPayment`: `[userId, status]`, `[campaignId, status]`, `[status, createdAt]`
- `Conversation`: `[lastMessageAt]`

---

## 8. Design Patterns

### Polymorphic Relations (String-based)
Three models use string-based polymorphic references:
- `FinancialAccount`: `ownerType` + `ownerId` (BRAND, INFLUENCER, CAMPAIGN, PLATFORM)
- `LedgerTransaction`: `referenceType` + `referenceId` (PAYMENT, REFUND, PAYOUT, FEE, ADJUSTMENT)
- `FinancialAuditLog`: `actorType` + `entityType`

### Transactional Outbox Pattern
`OutboxEvent` ensures reliable event publishing within database transactions:
```
PENDING → PROCESSING → PROCESSED | FAILED → DEAD_LETTER
```

### Double-Entry Bookkeeping
Financial domain uses proper double-entry:
- `FinancialAccount` (chart of accounts)
- `LedgerTransaction` (transaction header)
- `LedgerEntry` (DEBIT/CREDIT entries with `amountMinor` BigInt)

### Snapshot/Immutability
- `matchSnapshot` / `profileSnapshot` on `CampaignApplication`
- `termsSnapshot` on `CampaignOffer`
- `feeCalculationSnapshot` on `CampaignFinance`
- Snapshots are frozen at creation time for auditability

### Template → Instance
- `CampaignDeliverable` = template (what brand expects)
- `ParticipantDeliverable` = instance (per-participant tracking)
- `DeliverableRevision` = versioned history

### Monotonic Sequence
`Conversation.messageSequence` provides ordering and missed-message sync (avoids timestamp issues).

---

## 9. Migrations

### Safe Migration Workflow
```bash
# 1. Validate schema
npx prisma validate

# 2. Push to database (dev)
npx prisma db push --skip-generate

# 3. Generate client (when dev server is stopped)
npx prisma generate

# 4. Create migration (production)
npx prisma migrate dev --name description
```

### Rules
- Never modify production database directly
- Always validate schema before pushing
- Use `--skip-generate` during hot-reload dev to avoid file locks
- Run `prisma generate` when dev server is stopped
- Seed scripts in `prisma/seed*.ts`

---

## 10. Seeding

### Available Seed Scripts
| Script | Purpose |
|--------|---------|
| `prisma/seed.ts` | Base seed data |
| `prisma/seed-review-questions.ts` | Review questions (6 per direction) |
| `prisma/seed-fake-influencers.ts` | Fake influencer data |
| `prisma/seed-fake-companies.ts` | Fake company data |

### Running Seeds
```bash
npx ts-node prisma/seed-review-questions.ts
```

---

## 11. Performance Considerations

- **Heavy includes**: Some queries have 4+ levels of nested includes — monitor query performance
- **BigInt serialization**: Custom `BigInt.prototype.toJSON` in `main.ts` handles JSON serialization
- **No connection pooling config**: Neon serverless handles this, but monitor under load
- **JSONB fields**: 17 models use `Json` fields — index specific JSON paths if query patterns emerge
- **Array fields**: 20+ models use `String[]` — PostgreSQL arrays don't support efficient full-text search
