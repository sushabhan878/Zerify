---
name: Prisma Database Management
description: Workflow rules for Prisma schema edits, Neon PostgreSQL migrations, seeding mock data, and executing queries in Zerify.
---

# Prisma Database & Seeding Guidelines

---

## 1. Schema Conventions & Rules

- **Schema Location:** `apps/backend/prisma/schema.prisma`
- **Database Provider:** `postgresql` (Neon PostgreSQL)
- **Naming Conventions:**
  - Enums: PascalCase (e.g., `UserRole`, `VipType`)
  - Models: PascalCase singular (e.g., `User`, `BrandProfile`, `VipAccess`)
  - Table Mapping: Use `@@map("table_name")` in snake_case plural (e.g., `@@map("vip_access")`)

---

## 2. Safe Migration & Generation Workflow

When modifying `schema.prisma`:

1. Validate the schema format:
   ```bash
   npx prisma validate
   ```
2. If hot-reloading dev server is active and locking client engine files:
   ```bash
   npx prisma db push --skip-generate
   ```
3. Generate client when server is stopped:
   ```bash
   npx prisma generate
   ```

---

## 3. Database Seeding Script

- Seed script location: `apps/backend/prisma/seed.ts`
- Run seeding command:
  ```bash
  npx ts-node prisma/seed.ts
  ```
