<div align="center">

# ⚡ Zerify

### The Fastest & Easiest Way for Brands & Influencers to Connect

Zerify connects brands directly with creators. Send briefs, manage invitations, track campaign reach, and automate payouts — without ad agency overhead.

![Zerify Platform Hero](./zerify-hero.png)

[![Turborepo](https://img.shields.io/badge/Turborepo-v2.0-ef4444?style=flat-square&logo=turborepo)](https://turbo.build/)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-v10-e0234e?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-v5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-4169E1?style=flat-square&logo=postgresql)](https://neon.tech/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 🌟 Features Overview

- 🎯 **Direct Brand-Creator Marketplace**: Connect brands directly with vetted influencers across Instagram, YouTube, TikTok, X, and LinkedIn.
- 🎨 **Glassmorphic & Animated Interface**: Next.js 14 frontend built with TailwindCSS, Framer Motion direction-aware tab animations, and custom scrollbars.
- 🏗️ **NestJS Modular Architecture**: Enterprise-ready backend API (`/api/v1`) using Dependency Injection, `class-validator` DTOs, and global exception filters.
- 🗄️ **Neon PostgreSQL & Prisma ORM**: Relational schema powering User Authentication, Influencer Profiles, Connected Accounts, Past Deliverables, and Payment Details.
- ☁️ **Cloudinary Media Engine**: High-performance image uploads (avatars) and PDF pitch deck proposal uploads up to 20MB.
- 💼 **Influencer Profile Management**: 5-step interactive profile setup suite with real-time database synchronization:
  - **Basic Info**: Avatar image upload, handle, bio, location suggestions, contact & date of birth.
  - **Creator Details**: Content categories, language fluency tags, minimum reel rates, currency selection, and response time.
  - **Social Accounts**: Normalized connected account tracking with follower counts and engagement metrics.
  - **Portfolio**: Showcase past brand deliverables and 20MB pitch deck proposals.
  - **Payment & Payouts**: Escrow-protected payout preferences and direct bank transfer settings.

---

## 📂 Monorepo Architecture

Zerify is structured as a Turbo monorepo:

```text
Zerify/
├── apps/
│   ├── backend/                 # NestJS REST API Server (Port 4000)
│   │   ├── prisma/              # Prisma Schema & Neon Database Migrations
│   │   ├── src/
│   │   │   ├── database/        # PrismaService Provider
│   │   │   └── modules/
│   │   │       ├── auth/        # JWT Auth & Registration Module
│   │   │       ├── file-upload/ # Cloudinary File Upload Module
│   │   │       ├── influencer/  # Influencer Profile & Accounts Module
│   │   │       └── vip-access/  # VIP Waitlist Module
│   │   └── test/                # Jest Integration Tests
│   │
│   └── frontend/                # Next.js 14 Frontend App (Port 3000)
│       ├── public/              # Static Assets & Hero Banners
│       └── src/
│           ├── app/             # App Router Pages (/dashboard, /auth, etc.)
│           └── components/      # UI Design System & Settings Tabs
│
├── packages/                    # Shared TypeScript Configs & Components
└── package.json                 # Monorepo Workspace Config
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **PostgreSQL Database**: Neon PostgreSQL URL (`postgresql://...`)

---

### Installation

1. **Clone the repository**:
   ```bash
   git clone git@github.com:sushabhan878/Zerify.git
   cd Zerify
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

---

### Environment Setup

#### 1. Backend Environment (`apps/backend/.env`)
Create an `.env` file inside `apps/backend/`:

```env
# Database Connection (Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-crimson-dream-az0b7qo0-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# NestJS Server Settings
PORT=4000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# JWT Authentication
JWT_SECRET="zerify-dev-secret-key-super-secure"

# Cloudinary Storage Credentials
CLOUDINARY_CLOUD_NAME="v5ebsj5p"
CLOUDINARY_API_KEY="484824411815543"
CLOUDINARY_API_SECRET="YOUR_CLOUDINARY_SECRET"
```

#### 2. Frontend Environment (`apps/frontend/.env`)
Create an `.env` file inside `apps/frontend/`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
```

---

### Database Setup & Migration

Push the Prisma schema to your PostgreSQL database and generate the Prisma Client:

```bash
cd apps/backend
npx prisma db push
npx prisma generate
```

---

### Running Locally

Start both the frontend and backend servers concurrently using TurboRepo:

```bash
# Run from the root directory
npm run dev
```

- **Frontend**: Accessible at `http://localhost:3000`
- **Backend API**: Accessible at `http://localhost:4000/api/v1`

---

## 🛠️ API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/influencer/register` | Register a new creator account |
| `POST` | `/api/v1/auth/login` | Authenticate user & return JWT token |
| `GET` | `/api/v1/influencer/profile` | Retrieve creator profile & connected details |
| `PUT` | `/api/v1/influencer/profile` | Update basic info (name, handle, bio, avatar) |
| `PUT` | `/api/v1/influencer/creator-details` | Update rates, niches, and languages |
| `PUT` | `/api/v1/influencer/social-accounts` | Sync connected social accounts & metrics |
| `PUT` | `/api/v1/influencer/portfolio` | Update past deliverables & proposal links |
| `POST` | `/api/v1/file-upload/upload` | Upload media image / 20MB PDF pitch deck to Cloudinary |

---

## 🧪 Testing & Quality Assurance

Run the Jest unit and integration test suite:

```bash
npm --prefix apps/backend run test
```

Run TypeScript compilation checks across the monorepo:

```bash
npx tsc --noEmit -p apps/backend/tsconfig.json
npx tsc --noEmit -p apps/frontend/tsconfig.json
```

---

## 📄 License

This project is licensed under the MIT License.
