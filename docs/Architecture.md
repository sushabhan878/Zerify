# Architecture — Zerify

## 1. System Overview

Zerify is an influencer marketing platform connecting brands with content creators. It handles campaign management, real-time messaging, social media integrations, and payment processing.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Next.js Web  │  │  Mobile App  │  │  Admin Panel │          │
│  │  (Frontend)   │  │  (Future)    │  │  (Future)    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NESTJS API SERVER                             │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐          │
│  │  Auth    │ │ Campaign │ │ Payment  │ │  Social    │          │
│  │ Module   │ │ Module   │ │ Module   │ │  Module    │          │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘          │
│       │           │            │              │                  │
│  ┌────┴────┐ ┌────┴─────┐ ┌───┴──────┐ ┌─────┴──────┐          │
│  │Messaging│ │ Review   │ │ File     │ │  Search    │          │
│  │ Module  │ │ Module   │ │ Upload   │ │  Module    │          │
│  └────┬────┘ └────┬─────┘ └───┬──────┘ └─────┬──────┘          │
│       │           │           │               │                  │
│  ┌────┴───────────┴───────────┴───────────────┴──────┐          │
│  │              PrismaService (Global)                │          │
│  └──────────────────────┬────────────────────────────┘          │
└─────────────────────────┼───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   PostgreSQL  │ │   Cloudinary │ │   Cashfree   │
│   (Neon)      │ │   (Storage)  │ │   (Payments) │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 2. Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **NestJS 10** | Framework (Express-based) |
| **TypeScript 5.4** | Language |
| **Prisma 5.12** | ORM (PostgreSQL) |
| **Passport + JWT** | Authentication |
| **Socket.IO** | WebSocket (messaging) |
| **class-validator** | Input validation |
| **@nestjs/swagger** | API documentation |
| **Cloudinary** | File storage |
| **Cashfree** | Payment processing |
| **AES-256-GCM** | OAuth token encryption |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | Framework (App Router) |
| **React 18** | UI library |
| **TypeScript 5.4** | Language |
| **Tailwind CSS** | Styling |
| **Framer Motion 11** | Animations |
| **Lucide React** | Icons |
| **Socket.IO Client** | Real-time messaging |
| **Cloudinary React** | Image management |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| **Neon PostgreSQL** | Database (serverless) |
| **Cloudinary** | CDN / file storage |
| **Cashfree** | Payment gateway |
| **Upstash Redis** | Caching (installed, limited use) |

---

## 3. Backend Architecture

### Module Structure

```
src/
├── main.ts                    # Bootstrap, middleware, global config
├── app.module.ts              # Root module
├── app.controller.ts          # Health check
├── database/
│   ├── prisma.service.ts      # PrismaClient wrapper
│   └── prisma.module.ts       # Global Prisma module
└── modules/
    ├── auth/                  # Authentication & authorization
    ├── brand/                 # Brand profiles
    ├── campaign/              # Campaigns, applications, offers, deliverables
    ├── file-upload/           # Cloudinary file uploads
    ├── influencer/            # Influencer profiles & network
    ├── messaging/             # Real-time messaging (WebSocket + REST)
    ├── notification/          # Notifications
    ├── organization/          # Organizations
    ├── payment/               # Payments, payouts, disputes, webhooks
    ├── review/                # Bidirectional campaign reviews
    ├── search/                # Search functionality
    ├── social/                # Social account integrations
    └── vip-access/            # VIP waitlist
```

### Request Flow

```
HTTP Request
    │
    ▼
main.ts (JSON parser, global pipes, CORS)
    │
    ▼
Controller (@Controller, @UseGuards)
    │
    ▼
Service (business logic, validation)
    │
    ▼
Repository (data access, Prisma queries)
    │
    ▼
PrismaService (global, @Global module)
    │
    ▼
PostgreSQL (Neon)
```

### WebSocket Flow (Messaging)

```
Socket.IO Connection
    │
    ▼
messaging.gateway.ts (handshake JWT verification)
    │
    ▼
Event Handlers (join_conversation, send_message, etc.)
    │
    ▼
MessagingRepository (data access)
    │
    ▼
OutboxEvent (transactional outbox for reliability)
```

---

## 4. Frontend Architecture

### Component Hierarchy

```
layout.tsx (root)
├── CurrencyProvider
│   └── ToastProvider
│       └── {children}
│
dashboard/page.tsx
├── ThemeProvider
│   └── MessagingProvider
│       └── DashboardContent
│           ├── BrandSidebar / InfluencerSidebar
│           └── BrandDashboardView / InfluencerDashboardView
│               └── switch(activeRoute) → Section Component
```

### State Management

```
┌─────────────────────────────────────────────┐
│              State Layers                     │
├─────────────────────────────────────────────┤
│ 1. Component State (useState)                │
│    - UI state, form data, loading states     │
│                                              │
│ 2. Context API                               │
│    - CurrencyContext (currency preferences)   │
│    - ThemeContext (dark/light mode)           │
│    - MessagingContext (conversations, msgs)   │
│                                              │
│ 3. Custom DOM Events                         │
│    - zerify_auth_change                       │
│    - zerify_currency_change                   │
│    - zerify_brand_profile_update              │
│    - zerify_influencer_profile_update         │
│                                              │
│ 4. localStorage                              │
│    - zerify_token (auth)                      │
│    - zerify_theme (theme preference)          │
│    - zerify_preferred_currency                │
│                                              │
│ 5. Socket.IO (real-time)                     │
│    - Messages, typing indicators, presence    │
└─────────────────────────────────────────────┘
```

### API Communication

```
Frontend Component
    │
    ▼
Service Layer (campaign.service.ts, etc.)
    │
    ▼
apiRequest() (src/services/api.ts)
    │
    ├─► Attaches Authorization: Bearer <token>
    ├─► Sets Content-Type: application/json
    ├─► Resolves relative URLs to API_BASE
    │
    ▼
fetch() → Backend API
```

---

## 5. Data Flow

### Campaign Lifecycle

```
DRAFT → OPEN → FILLING → ACTIVE → COMPLETED
  │       │        │        │         │
  │       │        │        │         └─► Review popup appears
  │       │        │        │
  │       │        │        └─► Deliverables submitted & verified
  │       │        │
  │       │        └─► Applications received
  │       │
  │       └─► Published, applications open
  │
  └─► Created by brand

Any state → CANCELLED
    └─► Review popup appears
```

### Payment Flow

```
Brand creates campaign
    │
    ▼
Brand funds campaign (Cashfree order)
    │
    ▼
ZerifyPayment created (PENDING → PROCESSING → SUCCESSFUL)
    │
    ▼
CampaignFinance updated (fundedAmountMinor++)
    │
    ▼
Offer sent to influencer
    │
    ▼
Influencer accepts → CampaignParticipant created
    │
    ▼
CampaignPayment allocated (PARTICIPANT_ALLOCATION)
    │
    ▼
Deliverables completed & verified
    │
    ▼
ZerifyPayout processed (PENDING → PROCESSING → COMPLETED)
    │
    ▼
LedgerTransaction + LedgerEntry recorded (double-entry)
    │
    ▼
CampaignFinance updated (paidOutAmountMinor++)
```

### Messaging Flow

```
User A sends message
    │
    ▼
Socket.IO emit('send_message')
    │
    ▼
MessagingGateway.handleSendMessage()
    │
    ├─► Validate conversation membership
    ├─► Rate limit check (60/60s)
    ├─► Create Message record
    ├─► Update Conversation.lastMessageAt
    ├─► Increment ConversationParticipant.unreadCount
    ├─► Create OutboxEvent (system event)
    │
    ▼
Socket.IO broadcast to conversation room
    │
    ▼
User B receives 'new_message' event
```

---

## 6. External Integrations

### Social Media OAuth

```
User clicks "Connect Instagram"
    │
    ▼
GET /social/instagram/auth-url → Returns OAuth URL with encrypted state
    │
    ▼
User authorizes on Instagram
    │
    ▼
GET /social/instagram/callback?code=...&state=...
    │
    ├─► Verify state token (encrypted, 15-min expiry)
    ├─► Exchange code for access/refresh tokens
    ├─► Encrypt tokens with AES-256-GCM
    ├─► Store in SocialAccount
    │
    ▼
Initial sync: profile metadata, audience demographics, content
```

### Supported Platforms
- Meta (Facebook)
- Instagram
- YouTube
- LinkedIn
- X (Twitter)
- Threads

### Payment Processing (Cashfree)

```
Brand clicks "Fund Campaign"
    │
    ▼
POST /payments/create-order → Cashfree API
    │
    ├─► Create ZerifyPayment (PENDING)
    ├─► Return payment_session_id
    │
    ▼
Cashfree Checkout Widget (frontend)
    │
    ▼
Webhook: POST /payments/webhook/cashfree
    │
    ├─► Verify signature (SHA-256)
    ├─► Deduplicate (eventHash)
    ├─► Update ZerifyPayment status
    ├─► Update CampaignFinance
    ├─► Record LedgerTransaction + LedgerEntry
    ├─► Create FinancialAuditLog entry
    │
    ▼
Return { received: true, status: 'PROCESSED' }
```

---

## 7. Security Architecture

### Authentication Layers

```
Layer 1: HTTP Request
    │
    ▼
Layer 2: Global ValidationPipe (whitelist, transform)
    │
    ▼
Layer 3: JwtAuthGuard (Passport JWT strategy)
    │
    ▼
Layer 4: Role-based guards (CampaignOwnerGuard, AdminGuard, etc.)
    │
    ▼
Layer 5: Service-level validation (business rules)
```

### WebSocket Security

```
Socket.IO Connection
    │
    ▼
Handshake: Manual JWT verification
    │
    ├─► Extract token from auth.token / query.token / Authorization header
    ├─► Verify JWT signature
    ├─► Fetch user from DB
    ├─► Reject if invalid → disconnect
    │
    ▼
Event: ConversationParticipantGuard
    │
    ├─► Verify user is conversation member
    ├─► Uniform error messages (prevent probing)
    │
    ▼
Rate Limit: 60 messages/60s per socket
```

---

## 8. Key Design Patterns

| Pattern | Usage | Location |
|---------|-------|----------|
| **Repository** | Data access abstraction | All modules (`*.repository.ts`) |
| **Transactional Outbox** | Reliable event publishing | `OutboxEvent` model + messaging |
| **Double-Entry Ledger** | Financial accounting | `FinancialAccount`, `LedgerTransaction`, `LedgerEntry` |
| **Template → Instance** | Deliverable creation | `CampaignDeliverable` → `ParticipantDeliverable` |
| **Snapshot/Immutability** | Audit trail | `matchSnapshot`, `termsSnapshot`, `feeCalculationSnapshot` |
| **State Machine** | Campaign/deliverable lifecycle | Status enums with defined transitions |
| **Provider Abstraction** | Payment processing | `PAYMENT_PROVIDER` symbol + interface |
| **Polymorphic Relations** | Financial references | `ownerType`/`ownerId` string-based |
| **AES-256-GCM Encryption** | OAuth token storage | `crypto.util.ts` |
| **Sliding Window Rate Limit** | WebSocket protection | `messaging.gateway.ts` |

---

## 9. Monorepo Structure

```
Zerify/
├── apps/
│   ├── backend/           # NestJS API (port 4000)
│   └── frontend/          # Next.js (port 3000)
├── packages/
│   ├── ui/                # Shared UI components (scanned by Tailwind)
│   ├── types/             # Shared TypeScript types
│   └── shared-utils/      # Shared utility functions
└── docs/                  # Project documentation
```

### Shared Packages
- `@zerify/ui` — Referenced in `tailwind.config.js` for class scanning
- `@zerify/types` — Shared TypeScript type definitions
- `@zerify/shared-utils` — Common utility functions

---

## 10. Future Architecture Considerations

### Recommended Improvements
1. **API Response Envelope**: Standardize all responses to `{ success, data, message, meta }`
2. **Refresh Token Rotation**: Implement short-lived access tokens with rotating refresh tokens
3. **Event Bus**: Replace custom DOM events with a proper event bus or state management (zustand is installed)
4. **Server Components**: Leverage Next.js App Router Server Components for initial data fetching
5. **API Versioning**: Current `v1` prefix is good; plan for `v2` breaking changes
6. **Microservices**: Consider splitting payment and messaging into separate services at scale
7. **Queue System**: BullMQ is installed — implement for background jobs (email, sync, webhooks)
8. **Caching Layer**: Implement Redis caching for frequently accessed data (campaign lists, profiles)
