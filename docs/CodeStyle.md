# Code Style Guidelines — Zerify

## 1. Project Structure

### Monorepo Layout
```
Zerify/
├── apps/
│   ├── backend/          # NestJS API server
│   └── frontend/         # Next.js 14 App Router
├── packages/
│   ├── ui/               # Shared UI components (monorepo)
│   ├── types/            # Shared TypeScript types
│   └── shared-utils/     # Shared utility functions
└── docs/                 # Project documentation
```

### Backend Module Structure (`apps/backend/src/modules/`)
Each domain follows a consistent module pattern:
```
module-name/
├── dto/                    # Data Transfer Objects
│   ├── create-thing.dto.ts
│   └── update-thing.dto.ts
├── guards/                 # Route guards
│   └── thing-owner.guard.ts
├── interfaces/             # TypeScript interfaces
├── validators/             # Custom validators
├── thing.module.ts         # Module definition
├── thing.controller.ts     # HTTP handlers
├── thing.service.ts        # Business logic
├── thing.repository.ts     # Data access (Prisma)
└── thing.gateway.ts        # WebSocket (if applicable)
```

### Frontend Component Structure (`apps/frontend/src/`)
```
components/
├── ui/                     # Generic reusable primitives
├── auth/                   # Authentication components
├── landing/                # Public landing page sections
├── dashboard/              # Dashboard components
│   ├── brand-sidebar/
│   ├── influencer-sidebar/
│   ├── brand-views/        # Brand-specific sections
│   ├── influencer-views/   # Influencer-specific sections
│   ├── messaging/          # Real-time messaging
│   ├── payment-views/      # Payment components
│   ├── settings-tabs/      # Settings components
│   ├── subcomponents/      # Shared dashboard primitives
│   └── sub-views/          # Shared dashboard views
├── onboarding/             # Onboarding wizards
└── social/                 # Social integration components
```

---

## 2. Naming Conventions

### Backend (NestJS)

| Element | Convention | Example |
|---------|-----------|---------|
| Files | `kebab-case` | `campaign.service.ts`, `jwt-auth.guard.ts` |
| Classes | `PascalCase` | `CampaignService`, `JwtAuthGuard` |
| Methods | `camelCase` | `createCampaign`, `handleMetaCallback` |
| Variables | `camelCase` | `brandProfile`, `hashedPassword` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_MESSAGE_LENGTH`, `WS_IN` |
| DTOs | `PascalCase` + `Dto` suffix | `CreateCampaignDto`, `LoginDto` |
| Guards | `PascalCase` + `Guard` suffix | `JwtAuthGuard`, `CampaignOwnerGuard` |
| Strategies | `PascalCase` + `Strategy` suffix | `JwtStrategy` |
| DB Tables | `snake_case` via `@@map` | `"users"`, `"campaign_applications"` |
| Enums (Prisma) | `PascalCase` | `UserRole`, `CampaignStatus` |
| Enum values | `SCREAMING_SNAKE_CASE` | `BRAND_AWARENESS`, `UNDER_REVIEW` |

### Frontend (Next.js / React)

| Element | Convention | Example |
|---------|-----------|---------|
| Component files | `PascalCase.tsx` | `CampaignCard.tsx`, `LoginModal.tsx` |
| Service files | `camelCase.service.ts` | `campaign.service.ts` |
| Hook files | `use` prefix + `camelCase` | `useMessagingSocket.ts` |
| Context files | `PascalCase` + `Context` suffix | `ThemeContext.tsx` |
| Utility files | `camelCase.ts` | `currency.ts` |
| Type definition files | `camelCase.ts` or `*.d.ts` | `naics.d.ts` |
| CSS modules | `*.module.css` (not used — Tailwind only) | — |
| Directory names | `kebab-case` | `brand-views/`, `subcomponents/` |

---

## 3. TypeScript Configuration

### Backend (`apps/backend/tsconfig.json`)
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2021",
    "strictNullChecks": false,
    "noImplicitAny": false,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "incremental": true,
    "skipLibCheck": true
  }
}
```
**Note**: All strict mode options are currently disabled.

### Frontend (`apps/frontend/tsconfig.json`)
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es5",
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

---

## 4. Backend Code Patterns

### Dependency Injection
- Standard NestJS constructor injection
- Constructor parameters: `private readonly serviceName: ServiceName`
- Symbol-based injection for provider abstraction: `@Inject(PAYMENT_PROVIDER)`

### Repository Pattern
Services delegate data access to repositories:
```
Controller → Service → Repository → PrismaService
```
- Repositories encapsulate all Prisma queries
- Services contain business logic and validation
- Controllers handle HTTP concerns only

**Exceptions**: Some services (`ReviewService`, `VipAccessService`) use `PrismaService` directly.

### Error Handling
Services throw NestJS HTTP exceptions:
```typescript
throw new NotFoundException('Resource not found');
throw new BadRequestException('Invalid input');
throw new ConflictException('Already exists');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('Not authorized');
```
Controllers do not catch — NestJS global exception handler returns structured JSON.

### DTO Pattern
```typescript
import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@email.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}
```

### Transaction Pattern
Critical multi-table writes use Prisma interactive transactions:
```typescript
await this.prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  const profile = await tx.brandProfile.create({ data: profileData });
  return { user, profile };
});
```

---

## 5. Frontend Code Patterns

### Component Pattern
All components use `'use client'` directive (no Server Components used):
```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

interface ComponentProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ComponentName({ onClose, onSuccess }: ComponentProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>{/* content */}</AnimatePresence>,
    document.body,
  );
}
```

### Service Pattern
Services export object literals with async methods:
```typescript
export const CampaignService = {
  async getBrandCampaigns(): Promise<CampaignItem[]> {
    return apiRequest('/campaigns');
  },
  async createCampaign(data: any): Promise<CampaignItem> {
    return apiRequest('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
```
**Exception**: `ReviewService` uses a `class` with `static` methods.

### Context Pattern
```typescript
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  // ... logic
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### Modal Pattern
Modals use `createPortal` + `framer-motion`:
```tsx
const modalContent = (
  <div onClick={onClose} className="fixed inset-0 z-[9999] ...">
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="bg-[#090D16] border border-purple-500/25 rounded-3xl ..."
    >
      {/* content */}
    </motion.div>
  </div>
);

return createPortal(
  <AnimatePresence>{mounted && modalContent}</AnimatePresence>,
  document.body,
);
```

### State Management
- **Primary**: React `useState` for component-local state
- **Shared state**: React Context API (CurrencyContext, ThemeContext, MessagingContext)
- **Cross-component communication**: Custom DOM events (`window.dispatchEvent(new Event('zerify_auth_change'))`)
- **Real-time state**: Socket.IO via `useMessagingSocket` hook + MessagingContext
- **Installed but unused**: `zustand`, `@tanstack/react-query`

---

## 6. API Conventions

### Route Structure
All routes are prefixed with `/api/v1/` (set in `main.ts`).

### Request/Response
- **Content-Type**: `application/json` for all requests
- **Auth**: `Authorization: Bearer <token>` header
- **No standardized response envelope** — formats vary by controller:
  - Auth: `{ accessToken, user }`
  - Social: `{ statusCode, data }`
  - VIP: `{ success, message, data }`
  - Others: Raw data

### HTTP Methods
- `GET` — Read operations
- `POST` — Create or action operations
- `PATCH` — Update operations
- `DELETE` — Delete operations

### Swagger Decorators
All controllers use Swagger decorators:
```typescript
@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignController {
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new campaign' })
  async createCampaign(@Req() req: any, @Body() dto: CreateCampaignDto) { ... }
}
```

---

## 7. CSS / Styling Conventions

### Tailwind Usage
- **No CSS modules** — all styling via Tailwind utility classes
- **No component library** (no shadcn/ui, Radix, MUI)
- **Dark theme default** with light mode via CSS class overrides

### Color Tokens
```javascript
// tailwind.config.js
colors: {
  background: '#07090E',
  surface: '#0F172A',
  surfaceBorder: 'rgba(255, 255, 255, 0.08)',
  brand: { 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA' },
  accent: { pink: '#EC4899', purple: '#8B5CF6', cyan: '#06B6D4', emerald: '#10B981' },
}
```

### Recurring Class Patterns
```tsx
// Primary button
"rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"

// Secondary button
"px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white"

// Card
"p-5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-xl"

// Input
"w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"

// Glass modal
"bg-[#090D16] border border-purple-500/25 rounded-3xl shadow-2xl backdrop-blur-2xl"
```

### Animation Patterns
- **Page transitions**: `framer-motion` `initial/animate/exit` with opacity + y-offset
- **Modals**: `scale: 0.96 → 1` with opacity fade
- **Ambient glows**: Infinite floating spheres with `motion.div` animate
- **Progress bars**: Animated width with `motion.div`
- **Spring success**: `type: 'spring', stiffness: 200, damping: 15`

---

## 8. Import Conventions

### Path Aliases
- **Backend**: Relative imports (`../../database/prisma.service`)
- **Frontend**: `@/*` maps to `./src/*` (`@/services/api`, `@/components/ui/Toast`)

### Import Order (Backend)
```typescript
// 1. NestJS decorators & core
import { Injectable, NotFoundException } from '@nestjs/common';

// 2. Prisma types
import { CampaignStatus, Prisma } from '@prisma/client';

// 3. Internal modules
import { PrismaService } from '../../database/prisma.service';
import { SomeDto } from './dto/some.dto';
```

### Import Order (Frontend)
```typescript
// 1. React
import React, { useState, useEffect } from 'react';

// 2. Next.js / React DOM
import { createPortal } from 'react-dom';

// 3. Third-party libraries
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';

// 4. Internal services
import { CampaignService } from '@/services/campaign.service';

// 5. Internal components
import LottieLoader from '@/components/ui/LottieLoader';
```

---

## 9. Testing Conventions

### Backend
- **Framework**: Jest (`ts-jest`)
- **Pattern**: `*.spec.ts` files co-located with source
- **Test structure**: `describe()` blocks with `it()` / `test()` cases
- **Mocking**: `@nestjs/testing` `Test.createTestingModule()`
- **Location**: `src/**/*.spec.ts`

### Frontend
- **No test files found** — testing infrastructure not yet established

---

## 10. Git Conventions

### Branch Naming
- `main` — production
- `dev` — development
- Feature branches: `feature/description`
- Bug fixes: `fix/description`

### Commit Messages
- Use imperative mood ("Add feature" not "Added feature")
- Keep first line under 72 characters
- Reference issue numbers when applicable
