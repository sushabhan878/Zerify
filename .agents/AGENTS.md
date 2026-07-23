# Zerify — AI Agent Rules & Engineering Standards

These rules govern all AI agent behaviors, code modifications, architectural patterns, and workflow processes within the Zerify monorepo workspace.

---

## 1. Monorepo Architecture Overview

Zerify is structured as a Turbo monorepo:
- **`apps/backend`**: NestJS application powering the API (`http://localhost:4000/api/v1`), using Prisma ORM connected to Neon PostgreSQL.
- **`apps/frontend`**: Next.js 14 application (`http://localhost:3000`) built with React 18, TailwindCSS, Lucide React, and Framer Motion.
- **`packages/`**: Shared utilities, TypeScript configurations, types, and reusable UI components.

---

## 2. Core Code Generation Rules

### 2.1 Backend (NestJS)
- Follow traditional NestJS modular architecture (`.module.ts`, `.controller.ts`, `.service.ts`, `.dto.ts`).
- Always use Dependency Injection via constructors (`private readonly`).
- Validate request payloads with `class-validator` DTOs.
- Isolate database interactions via `PrismaService`.
- Wrap API routes with standard HTTP Exception filters; never let unhandled exceptions leak stack traces to clients.

### 2.2 Frontend (Next.js)
- Maintain rich UI aesthetics: Glassmorphism, smooth gradients, dynamic animations (Framer Motion), and modern typography.
- Use Vanilla TailwindCSS utilities. Never hardcode inline arbitrary color hex values when tailwind color tokens are applicable.
- Ensure all interactive elements have hover effects, loading states (`Loader2` spinner), and accessible labels.
- Handle API errors gracefully with user-facing alerts/toasts rather than silent failures.

---

## 3. Verification & Safety Guidelines

- **Empirical Runtime Verification**: Never declare a task completed without building or testing the code (`npm run build` or running validation).
- **Database Safety**: Never run destructive database commands (`prisma migrate reset` or schema drops) without explicit user consent. Use `npx prisma db push --skip-generate` or `npx prisma migrate dev` when introducing new schema tables.
- **Environment Secrets**: Never commit real secret keys or database passwords to source code files. Always reference `.env` variables.
- **File Links**: When referencing code files in responses, use markdown links with `file://` URIs (e.g. `[schema.prisma](file:///c:/Users/susha/OneDrive/Desktop/Zerify/apps/backend/prisma/schema.prisma)`).
