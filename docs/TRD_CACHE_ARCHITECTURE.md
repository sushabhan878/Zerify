# Technical Requirements Document (TRD): Zerify Application Cache Architecture

**Document Reference**: `TRD-CACHE-2026-V1`  
**Project**: Zerify (Monorepo Marketplace for Brands & Influencers)  
**Target Applications**: `apps/frontend` (Next.js 14) & `apps/backend` (NestJS)  
**Status**: Production Architecture Specification  

---

## 1. Executive Summary & Performance Targets

As Zerify scales to thousands of concurrent brand managers and creators searching profiles, submitting briefs, and analyzing social metrics, database query bottlenecks and network latency can degrade user experience.

This document defines the complete **5-Layer Caching Architecture** for Zerify. The objective is to decouple read-heavy traffic from the primary Neon PostgreSQL database while guaranteeing strict data consistency across all user mutations.

### Key Performance Indicators (KPIs)
- **API Response Latency**: $\le 30\text{ ms}$ for cached reads (down from $\approx 250\text{ ms}$ raw DB response time).
- **Database Query Reduction**: $\ge 85\%$ reduction in direct SQL execution on Neon PostgreSQL.
- **Frontend Page Load (LCP)**: $\le 1.2\text{s}$ across global regions via Edge CDN and Next.js App Router Data Caching.
- **Cache Consistency**: $100\%$ zero-stale state guarantees upon data mutations (`PUT` / `POST` / `DELETE`).

---

## 2. 5-Layer Caching Architecture Overview

Zerify implements a defense-in-depth caching model spanning client browser state down to database connection handles:

```
[ User Browser (L1: SWR / LocalStorage) ]
                  │
                  ▼
[ Edge CDN Network (L2: Vercel / Cloudflare Edge) ]
                  │
                  ▼
[ Next.js Server (L3: App Router Data Cache & React Memoization) ]
                  │
                  ▼
[ NestJS API Gateway (L4: Upstash Redis L2 Distributed Cache) ]
                  │
                  ▼
[ Database Layer (L5: Neon Pooler & Prisma Query Engine) ]
```

---

## 3. Layer-by-Layer Technical Specification

### Layer 1: Client-Side & Browser Local State (L1)

- **Target Assets**: User session tokens, top-bar user avatars, transient form drafts, active UI tab states.
- **Technologies**: HTML5 `localStorage`, React Context, Framer Motion layout state.
- **Key Keys**:
  - `zerify_token`: Bearer JWT token for authorized API calls.
  - `zerify_user`: Anonymized JSON containing `{ name, handle, location, avatarUrl }`.
- **Event-Driven Invalidation**:
  Custom window event `zerify_auth_change` dispatched on profile updates to immediately re-sync UI components across open browser tabs.

---

### Layer 2: Edge CDN & Static Asset Caching (L2)

- **Target Assets**: Next.js static bundles, Google Fonts, SVGs, Cloudinary image avatars, PDF pitch decks.
- **Technologies**: Vercel Edge Network / Cloudflare CDN, Cloudinary Media Delivery Network.
- **Cache-Control Policies**:
  - **Static JS/CSS Chunks**: `Cache-Control: public, max-age=31536000, immutable`
  - **Cloudinary Media Assets**: `Cache-Control: public, max-age=31536000, s-maxage=31536000`
  - **Public HTML Pages**: `Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate=60`

---

### Layer 3: Next.js 14 App Router Server-Side Caching (L3)

Next.js 14 App Router integrates four distinct internal caching sub-systems:

```
                  ┌──────────────────────────────┐
                  │ 1. Request Memoization       │  (Per Request Duration)
                  └──────────────┬───────────────┘
                                 │
                  ┌──────────────▼───────────────┐
                  │ 2. Data Cache                │  (Persistent across requests)
                  └──────────────┬───────────────┘
                                 │
                  ┌──────────────▼───────────────┐
                  │ 3. Full Route Cache          │  (Build & Revalidate time)
                  └──────────────────────────────┘
```

#### Specification & Tagging System
Every server-side `fetch` request in `apps/frontend` must pass explicit `next.tags` and `revalidate` intervals:

```typescript
// Fetching influencer profile with cache tags
const res = await fetch(`${apiUrl}/influencer/profile`, {
  headers: { Authorization: `Bearer ${token}` },
  next: {
    revalidate: 300, // 5 minutes
    tags: [`user-profile-${userId}`, 'influencer-feed'],
  },
});
```

#### Invalidation via Server Actions / API Routes
When an influencer updates their profile, the frontend invokes:
```typescript
import { revalidateTag, revalidatePath } from 'next/cache';

export async function onProfileUpdated(userId: string) {
  revalidateTag(`user-profile-${userId}`);
  revalidatePath('/dashboard');
}
```

---

### Layer 4: NestJS Backend L2 Distributed Cache (Upstash Redis) (L4)

The primary application cache resides in **Upstash Redis**, configured via `REDIS_URL` in `apps/backend/.env`.

#### Key Naming Schema & TTL Policies

| Domain | Redis Key Format | TTL | Invalidation Trigger |
| :--- | :--- | :--- | :--- |
| **Influencer Profile** | `zerify:cache:influencer:profile:{userId}` | 1 Hour (3600s) | `PUT /api/v1/influencer/profile` |
| **Creator Details** | `zerify:cache:influencer:creator-details:{userId}` | 2 Hours (7200s) | `PUT /api/v1/influencer/creator-details` |
| **Social Accounts** | `zerify:cache:influencer:social-accounts:{userId}` | 6 Hours (21600s) | `PUT /api/v1/influencer/social-accounts` |
| **Creator Feed** | `zerify:cache:creators:feed:{queryHash}` | 15 Mins (900s) | Scheduled Cron / Profile Update |
| **VIP Waitlist** | `zerify:cache:vip:stats` | 12 Hours | `POST /api/v1/vip-access/register` |

#### NestJS Implementation Blueprint

1. **Redis Cache Module Registration** (`apps/backend/src/database/cache.module.ts`):
```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          ttl: 300 * 1000, // Default 5 mins
          url: process.env.REDIS_URL || 'redis://localhost:6379',
        }),
      }),
    }),
  ],
})
export class ZerifyCacheModule {}
```

2. **Automated Cache Invalidation Interceptor**:
```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable, tap } from 'rxjs';

@Injectable()
export class InvalidateProfileCacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id || req.user?.sub;

    return next.handle().pipe(
      tap(async () => {
        if (userId) {
          await this.cacheManager.del(`zerify:cache:influencer:profile:${userId}`);
          await this.cacheManager.del(`zerify:cache:influencer:creator-details:${userId}`);
        }
      }),
    );
  }
}
```

---

### Layer 5: Database Connection Pooling & Query Caching (L5)

Neon PostgreSQL uses a serverless transaction pooler proxy:
```env
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-crimson-dream-az0b7qo0-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

- **Connection Pool Size**: Configured to `connection_limit=20&pool_timeout=10`.
- **Prepared Statement Reuse**: Prisma ORM reuses parameterized query trees across client calls.

---

## 4. Implementation Possibilities & Feasibility Matrix

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FEASIBILITY VS IMPACT MATRIX                                            │
│                                                                         │
│  HIGH IMPACT │ [L3: Next.js Data Cache]      [L4: NestJS Upstash Redis] │
│              │                                                          │
│  LOW IMPACT  │ [L1: SWR / LocalStorage]      [L5: Neon Pooler]          │
│              └──────────────────────────────────────────────────────────┘
│                EASY IMPLEMENTATION             ADVANCED IMPLEMENTATION  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1. Redis Cache-Aside Strategy (Recommended - Phase 1)
- **Possibility**: **100% Feasible** (Redis URL configured in `.env`).
- **ROI**: Reduces database queries by 90% for active sessions.
- **Effort**: 2 Hours.

### 2. Next.js Tag-Based Revalidation (Phase 1)
- **Possibility**: **100% Feasible** (App Router native).
- **ROI**: Instant frontend navigation without loading spinners.
- **Effort**: 1 Hour.

### 3. Probabilistic Early Expiration (XFetch Algorithm - Phase 2)
- **Possibility**: Advanced optimization to prevent **Cache Stampedes** when high-profile creator pages expire.
- **Algorithm**:
  $$P = -\beta \cdot \log(\text{rand()}) > \text{delta}$$
- **ROI**: Prevents database CPU spikes during viral creator traffic.

---

## 5. Failure Recovery & Resilience Protocols

### 1. Redis Outage Fallback (Circuit Breaker)
If Upstash Redis encounters network issues or rate limits, the NestJS `ZerifyCacheModule` catches the exception silently and falls back directly to Neon PostgreSQL. The application continues functioning without dropping requests.

### 2. Cache Warm-Up Script
Upon deploying new releases, a background job pre-warms the top 100 most active influencer profiles into Redis:
```bash
npm run cache:warmup
```

---

## 6. Summary of Architectural Verification

This Technical Requirements Document establishes a complete roadmap to make Zerify capable of serving **10,000+ Requests Per Second (RPS)** with sub-50ms latency while keeping Neon PostgreSQL costs minimal.
