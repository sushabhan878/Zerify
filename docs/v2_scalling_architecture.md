# Zerify — V2 Scaling Architecture

**Trigger for migration:** 10,000+ paying brands, or the engineering team has grown large enough that a single NestJS monolith becomes a bottleneck for independent deployment and ownership.

**Core promise:** The frontend does not change. It still talks to `api.zerify.com`. Everything below the API Gateway is what changes.

---

## 1. Why This Migration Is Incremental, Not a Rewrite

In V1, every domain (auth, users, brands, influencers, campaigns, payments, AI, search, chat, analytics, notifications) was already built as an **isolated NestJS module** with its own controller/service/repository/dto/entities. That module boundary *is* the future service boundary.

```mermaid
flowchart LR
    subgraph V1["V1 — Modular Monolith"]
        direction TB
        Mod1[Auth Module — Neon Auth]
        Mod2[User Module]
        Mod3[Influencer Module]
        Mod4[Brand Module]
        Mod5[Campaign Module]
        Mod6[Payment Module]
        Mod7[AI Module]
        Mod8[Search Module]
        Mod9[Chat Module]
        Mod10[Analytics Module]
        Mod11[Notification Module]
    end

    subgraph V2["V2 — Microservices"]
        direction TB
        Svc1[Auth Service — Neon Auth]
        Svc2[User Service]
        Svc3[Influencer Service]
        Svc4[Brand Service]
        Svc5[Campaign Service]
        Svc6[Payment Service]
        Svc7[AI Service]
        Svc8[Search Service]
        Svc9[Chat Service]
        Svc10[Analytics Service]
        Svc11[Notification Service]
    end

    Mod1 -.lift & shift.-> Svc1
    Mod2 -.lift & shift.-> Svc2
    Mod3 -.lift & shift.-> Svc3
    Mod4 -.lift & shift.-> Svc4
    Mod5 -.lift & shift.-> Svc5
    Mod6 -.lift & shift.-> Svc6
    Mod7 -.lift & shift.-> Svc7
    Mod8 -.lift & shift.-> Svc8
    Mod9 -.lift & shift.-> Svc9
    Mod10 -.lift & shift.-> Svc10
    Mod11 -.lift & shift.-> Svc11
```

Each module already exposes a clean internal API surface (its `service.ts`), so extraction means: give it its own `main.ts`, its own deployable process, its own datastore access, and a network boundary — the business logic barely changes.

---

## 2. Target High-Level Architecture

```mermaid
flowchart TB
    Internet((Internet)) --> FE[Frontend / Admin<br/>Next.js — unchanged]
    FE --> GW[API Gateway]

    GW --> Auth[Auth Service — Neon Auth]
    GW --> User[User Service]
    GW --> Influencer[Influencer Service]
    GW --> Brand[Brand Service]
    GW --> Campaign[Campaign Service]
    GW --> Payment[Payment Service]
    GW --> AI[AI Service]
    GW --> Search[Search Service]
    GW --> Chat[Chat Service]
    GW --> Analytics[Analytics Service]
    GW --> Notification[Notification Service]

    Auth --> AuthDB[(Auth DB — Neon)]
    User --> UserDB[(User DB — Neon / Prisma)]
    Influencer --> InfDB[(Influencer DB — Neon / Prisma)]
    Brand --> BrandDB[(Brand DB — Neon / Prisma)]
    Campaign --> CampDB[(Campaign DB — Neon / Prisma)]
    Payment --> PayDB[(Payment DB — Neon / Prisma)]
    Analytics --> AnalyticsDB[(Analytics DB / Warehouse)]

    AI --> VectorDB[(Vector DB)]
    Search --> OS[(OpenSearch Cluster)]
    Chat --> ChatDB[(Chat DB)]

    GW --> Bus[[Event Bus — Kafka / NATS]]
    Auth -.publishes/subscribes.-> Bus
    User -.publishes/subscribes.-> Bus
    Influencer -.publishes/subscribes.-> Bus
    Brand -.publishes/subscribes.-> Bus
    Campaign -.publishes/subscribes.-> Bus
    Payment -.publishes/subscribes.-> Bus
    Notification -.publishes/subscribes.-> Bus
    Analytics -.publishes/subscribes.-> Bus
    AI -.publishes/subscribes.-> Bus
```

---

## 3. API Gateway Responsibilities

The gateway becomes the single entry point and absorbs what used to be shared middleware in the monolith:

```mermaid
flowchart TB
    GW[API Gateway] --> R1[Routing to correct service]
    GW --> R2[Neon Auth Verification]
    GW --> R3[Rate Limiting]
    GW --> R4[Request Aggregation<br/>BFF-style composition]
    GW --> R5[Circuit Breaking / Retries]
    GW --> R6[Observability<br/>tracing, logging, metrics]
```

Options: Kong, AWS API Gateway, or a lightweight NestJS gateway service using `@nestjs/microservices`.

---

## 4. Service Boundaries & Data Ownership

Each service **owns its own data** — no service reaches into another service's database directly.

| Service | Owns | Talks to |
|---|---|---|
| Auth Service | Neon Auth Integration, session validation | User Service (on signup) |
| User Service | User profiles, org membership | Auth, Notification |
| Brand Service | Brand profiles, org data | User, Campaign |
| Influencer Service | Influencer profiles, social stats | Search, AI, Analytics |
| Campaign Service | Campaigns, applications, contracts | Brand, Influencer, Payment, Notification |
| Payment Service | Transactions, subscriptions, invoices, payouts | Stripe, Campaign, Billing events |
| AI Service | Recommendations, rankings, fraud scoring | Influencer, Campaign (via events, read replicas, or async requests) |
| Search Service | Search indices | Influencer, Brand, Campaign (via events) |
| Chat Service | Messages, threads | User, Notification |
| Analytics Service | Aggregated metrics, reports | All services (via event stream) |
| Notification Service | Delivery of email/SMS/push/in-app | All services (event consumer) |

---

## 5. Inter-Service Communication

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant GW as API Gateway
    participant Camp as Campaign Service
    participant Brand as Brand Service
    participant Inf as Influencer Service
    participant Bus as Event Bus
    participant Notif as Notification Service
    participant Analytics as Analytics Service

    FE->>GW: POST /campaigns
    GW->>Camp: Create campaign (gRPC/REST)
    Camp->>Brand: Validate brand (sync call)
    Camp->>Inf: Fetch matching influencers (sync call)
    Camp-->>GW: Campaign created
    GW-->>FE: 201 Created

    Camp->>Bus: publish "campaign.created"
    Bus-->>Notif: consume event → send notifications
    Bus-->>Analytics: consume event → update metrics
```

---

## 6. Database Strategy: From Shared to Per-Service

```mermaid
flowchart LR
    subgraph V1DB["V1 — Single Neon PostgreSQL (Prisma)"]
        Users
        Orgs[Organizations]
        Brands
        Influencers
        Campaigns
        Transactions
        Messages
    end

    subgraph V2DB["V2 — Database-per-Service"]
        direction TB
        AuthPG[(Auth DB — Neon)]
        UserPG[(User PG — Prisma)]
        BrandPG[(Brand PG — Prisma)]
        InfPG[(Influencer PG — Prisma)]
        CampPG[(Campaign PG — Prisma)]
        PayPG[(Payment PG — Prisma)]
        ChatPG[(Chat PG)]
        AnalyticsWH[(Analytics Warehouse)]
    end

    V1DB -. "strangler-fig migration<br/>table-by-table" .-> V2DB
```

---

## 7. Recommended Migration Order

```mermaid
flowchart TD
    P1["Phase 1: Extract low-risk, stateless services<br/>Notification, Analytics"] --> P2
    P2["Phase 2: Extract read-heavy services<br/>Search, AI Recommendation"] --> P3
    P3["Phase 3: Extract domain-core services<br/>Influencer, Brand, Campaign"] --> P4
    P4["Phase 4: Extract high-risk, transactional services<br/>Payment, Auth (Neon Auth)"] --> P5
    P5["Phase 5: Decompose the monolith into a thin<br/>orchestration/gateway layer only"]
```

---

## 8. Deployment & Infrastructure

```mermaid
flowchart TB
    DNS[Cloudflare DNS] --> FE[Frontend — Vercel]
    DNS --> GW[API Gateway — Kubernetes Ingress]

    GW --> K8s[Kubernetes Cluster]

    subgraph K8s Cluster
        AuthPod[Auth Service Pods — Neon Auth]
        UserPod[User Service Pods]
        InfPod[Influencer Service Pods]
        BrandPod[Brand Service Pods]
        CampPod[Campaign Service Pods]
        PayPod[Payment Service Pods]
        AIPod[AI Service Pods]
        SearchPod[Search Service Pods]
        ChatPod[Chat Service Pods]
        AnalyticsPod[Analytics Service Pods]
        NotifPod[Notification Service Pods]
    end

    K8s --> BusInfra[[Kafka / NATS Cluster]]
    K8s --> Databases[(Per-Service Databases — Neon)]
    K8s --> Cloudinary[Cloudinary Media Storage]
    K8s --> Stripe
    K8s --> OS[(OpenSearch Cluster)]

    subgraph Observability
        Tracing[Distributed Tracing — OpenTelemetry]
        Logs[Centralized Logging]
        Metrics[Metrics / Dashboards]
    end

    K8s --> Observability
```

---

## 9. Cross-Cutting Concerns at Scale

| Concern | V1 (Monolith) | V2 (Microservices) |
|---|---|---|
| Auth | Neon Auth integration | Neon Auth validation at API Gateway & Services |
| Rate limiting | Redis, in-process | Enforced at API Gateway, per-client/per-route |
| Caching | Shared Redis | Redis per service |
| Storage | Cloudinary | Cloudinary |
| Database | Neon PostgreSQL + Prisma | Per-service Neon databases + Prisma |

---

## 10. Summary

1. **Trigger:** 10,000+ paying brands or team size demands independent deployability.
2. **Strategy:** Strangler Fig — extract module-by-module behind the existing API Gateway.
3. **Data:** Move from single Neon PostgreSQL database to per-service Neon databases via Prisma ORM.
4. **Auth & Media:** Retain **Neon Auth** and **Cloudinary** media storage across microservices.
