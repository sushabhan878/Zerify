# Security Guidelines — Zerify

## 1. Authentication

### JWT Configuration
- **Algorithm**: HS256 (via `@nestjs/passport` + `passport-jwt`)
- **Token expiry**: 7 days (configured in `auth.module.ts`)
- **Token payload**: `{ sub: userId, email, role }`
- **Extraction**: `Authorization: Bearer <token>` header
- **Validation**: Every authenticated request performs a DB lookup to verify user existence

### Token Storage (Frontend)
- **Primary**: `localStorage` key `zerify_token`
- **Secondary**: Cookie `zerify_token` with 7-day expiry (used by middleware for SSR redirects)
- **No refresh token mechanism** — single long-lived access token

### Password Hashing
- **Algorithm**: bcrypt with 10 salt rounds
- **Location**: `auth.service.ts` — `bcrypt.hash(password, 10)` on registration, `bcrypt.compare()` on login
- **Response sanitization**: `sanitizeUser()` strips `password` field from all user objects before returning

### OAuth Token Encryption
- **Algorithm**: AES-256-GCM for encrypting OAuth access/refresh tokens at rest
- **Key derivation**: SHA-256 hash of `SOCIAL_ENCRYPTION_SECRET` (falls back to `JWT_SECRET`)
- **Used for**: Meta, Instagram, YouTube, LinkedIn, X/Twitter, Threads OAuth tokens
- **Location**: `social/utils/crypto.util.ts`
- **PKCE**: Supported for X/Twitter OAuth flow

---

## 2. Authorization

### Role-Based Access Control
Three roles defined in `UserRole` enum: `ADMIN`, `BRAND`, `INFLUENCER`

### Guards (Backend)

| Guard | Purpose | File |
|-------|---------|------|
| `JwtAuthGuard` | Standard JWT authentication | `auth/guards/jwt-auth.guard.ts` |
| `OptionalJwtAuthGuard` | Auth optional — returns null if no token | `auth/guards/optional-jwt-auth.guard.ts` |
| `CampaignOwnerGuard` | Verifies user owns the campaign (via brand profile). Admin bypasses. | `campaign/guards/campaign-owner.guard.ts` |
| `ApplicationOwnerGuard` | Verifies user owns the application | `campaign/guards/application-owner.guard.ts` |
| `ConversationParticipantGuard` | Verifies user is a conversation member. Uniform error messages prevent probing. | `messaging/guards/conversation-participant.guard.ts` |
| `AdminGuard` | Role check: `user.role === 'ADMIN'` | `payment/guards/admin.guard.ts` |
| `PaymentOwnerGuard` | Payment ownership verification | `payment/guards/payment-owner.guard.ts` |
| `CampaignBrandGuard` | Brand ownership for campaign payments | `payment/guards/campaign-brand.guard.ts` |
| `PayoutAccessGuard` | Payout access control | `payment/guards/payout-access.guard.ts` |
| `DisputeAccessGuard` | Dispute access control | `payment/guards/dispute-access.guard.ts` |

### WebSocket Authentication
- Manual JWT verification during Socket.IO handshake (Passport guards don't run on WS connections)
- Token extracted from `auth.token`, `query.token`, or `Authorization` header
- Unauthenticated sockets are disconnected immediately
- **Location**: `messaging.gateway.ts` lines 64-98

---

## 3. Input Validation

### Global Validation Pipe
```typescript
new ValidationPipe({
  whitelist: true,              // Strips unknown properties
  transform: true,              // Auto-transforms to DTO classes
  forbidNonWhitelisted: false,  // Does NOT throw on unknown properties
})
```

### DTO Validation (class-validator)
All API DTOs use `class-validator` decorators:
- `@IsEmail()`, `@IsString()`, `@MinLength()`, `@IsEnum()`, `@IsOptional()`
- `@IsArray()`, `@ValidateNested()`, `@IsInt()`, `@Min()`, `@Max()`
- `@IsIn()` for whitelist validation

---

## 4. Data Protection

### Sensitive Data Handling
- **Passwords**: Never returned in API responses (`sanitizeUser()` strips them)
- **OAuth tokens**: Encrypted with AES-256-GCM before database storage
- **Payment details**: `InfluencerPaymentDetails` stores bank account numbers (production concern — consider tokenization)
- **API keys/secrets**: Stored in `.env` (see Critical Issues below)

### Financial Data
- **Monetary values**: Stored in minor units (paise for INR) as `BigInt` in production payment tables
- **Idempotency keys**: All payment mutations require unique idempotency keys (`ZerifyPayment`, `ZerifyRefund`, `LedgerTransaction`, `ZerifyPayout`)
- **Audit trail**: `FinancialAuditLog` records every financial operation with actor, action, status changes, IP, and user agent
- **Double-entry ledger**: Full double-entry bookkeeping with `FinancialAccount`, `LedgerTransaction`, `LedgerEntry`

### Webhook Security
- **Signature verification**: SHA-256 signature validation on incoming webhooks before processing
- **Event deduplication**: SHA-256 hash of `provider + eventType + providerEventId` stored as unique constraint
- **Dead-letter queue**: Events that fail 5 times are moved to `DEAD_LETTER` status
- **Raw body preservation**: Custom JSON parser preserves `req.rawBody` for signature verification
- **Location**: `payment/webhook.controller.ts`, `main.ts` lines 18-26

### OAuth State Tokens
- Encrypted with timestamp nonce (15-minute expiry) to prevent replay attacks
- **Location**: `social/utils/crypto.util.ts`

---

## 5. Transport Security

### CORS Configuration
```typescript
app.enableCors(); // Currently wide open — see Critical Issues
```
- **WebSocket CORS**: `{ origin: '*' }` on both messaging and social gateways

### Security Headers
- `helmet` is installed (`package.json`) but **not activated** in `main.ts`
- Next.js `next.config.js` sets: `X-DNS-Prefetch-Control: off`, `X-Frame-Options: SAMEORIGIN`

### Rate Limiting
- `express-rate-limit` is installed but **not used** on HTTP endpoints
- Messaging gateway has custom sliding-window rate limiter: 60 messages/60 seconds per socket

---

## 6. Critical Security Issues

### Immediate Action Required

| Issue | Severity | Location | Recommendation |
|-------|----------|----------|----------------|
| **`.env` committed with real secrets** | CRITICAL | `apps/backend/.env` | Rotate all keys immediately. Move to secret manager (AWS Secrets Manager, Vault, etc.) |
| **Hardcoded JWT fallback secrets** | CRITICAL | `auth.module.ts:17`, `jwt.strategy.ts:18`, `messaging.gateway.ts:72`, `influencer.controller.ts:24` | Remove all hardcoded fallbacks. Fail fast if `JWT_SECRET` is missing |
| **CORS fully open** | HIGH | `main.ts:30`, WebSocket gateways | Restrict to `FRONTEND_URL` origin |
| **No HTTP rate limiting** | HIGH | `main.ts` | Activate `express-rate-limit` on auth and sensitive endpoints |
| **No Helmet security headers** | HIGH | `main.ts` | Add `app.use(helmet())` |
| **7-day JWT without refresh tokens** | MEDIUM | `auth.module.ts` | Implement refresh token rotation |
| **`forbidNonWhitelisted: false`** | MEDIUM | `main.ts:35` | Set to `true` to reject unknown properties |
| **No token revocation** | MEDIUM | Architecture | Implement token blacklist or short-lived tokens with refresh |
| **InfluencerController manual JWT decode** | LOW | `influencer.controller.ts:22-26` | Refactor to use `JwtAuthGuard` consistently |
| **`strictNullChecks: false`** | LOW | `tsconfig.json` | Enable TypeScript strict mode |

### Dependency Concerns
- `express-rate-limit`, `helmet`, `cookie-parser` installed but unused
- `stripe` installed but Cashfree is the actual payment provider
- `@nestjs/bullmq`, `bullmq`, `ioredis`, `@upstash/redis` installed but no job queues in use
- `@google/genai`, `resend` installed but unused

---

## 7. WebSocket Security

- **Namespace isolation**: Messaging and social sync use separate WebSocket gateways
- **No anonymous access**: Unauthenticated connections are immediately rejected
- **Rate limiting**: 60 messages per 60 seconds per socket connection
- **Conversation-level access control**: `ConversationParticipantGuard` verifies membership
- **Uniform error messages**: "not found" and "not a member" return identical errors to prevent user enumeration

---

## 8. Recommendations

### Short Term
1. Rotate all secrets in `.env` and remove from version control
2. Add `.env` to `.gitignore` and verify it's not tracked
3. Remove hardcoded JWT fallback secrets — fail if `JWT_SECRET` is unset
4. Enable `helmet()` middleware
5. Enable `express-rate-limit` on auth endpoints (`/auth/login`, `/auth/register`)
6. Set CORS to `process.env.FRONTEND_URL`
7. Enable `forbidNonWhitelisted: true` in ValidationPipe

### Medium Term
8. Implement JWT refresh token rotation
9. Enable TypeScript `strict: true` and `strictNullChecks: true`
10. Set up automated secret scanning (e.g., `gitleaks`, `trufflehog`)
11. Add Content Security Policy headers
12. Implement CSRF protection for cookie-based auth

### Long Term
13. Migrate secrets to a vault solution (AWS Secrets Manager, HashiCorp Vault)
14. Implement short-lived access tokens (15 min) with rotating refresh tokens
15. Add API key authentication for service-to-service calls
16. Conduct formal security audit / penetration testing
17. Implement request signing for webhook endpoints
