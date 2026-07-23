# 1. Use Neon Serverless PostgreSQL with Prisma ORM

- **Status:** Accepted
- **Date:** 2026-07-23
- **Authors:** Product & Engineering

## Context & Problem Statement

Zerify requires a reliable relational database that scales serverless, supports connection pooling for microservices / edge lambdas, and seamlessly integrates with Prisma ORM in a Node.js/NestJS environment.

## Decision Drivers

- Serverless scalability and branching features for testing.
- Type-safe database queries and migration support via Prisma ORM.
- Direct connection pooling compatibility (`@neondatabase/serverless`).

## Decision Outcome

Chosen option: **Neon Serverless PostgreSQL + Prisma ORM**, because it provides strong ACID compliance, rapid branching for dev/staging environments, and effortless integration with NestJS services via `PrismaClient`.

### Positive Consequences

- Type safety across backend entities.
- Zero infrastructure overhead for serverless database hosting.
- Easy schema evolution with `prisma db push` and `prisma migrate`.
