# Contributing Guidelines — Zerify

## 1. Getting Started

### Prerequisites
- **Node.js** >= 18.x
- **pnpm** (recommended) or npm
- **PostgreSQL** (Neon account or local)
- **Cloudinary** account (for file uploads)
- **Git**

### Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/zerify.git
cd zerify

# 2. Install dependencies
cd apps/backend && npm install
cd ../frontend && npm install

# 3. Set up environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# Edit .env files with your credentials

# 4. Initialize database
cd apps/backend
npx prisma db push
npx prisma generate

# 5. Seed review questions (optional)
npx ts-node prisma/seed-review-questions.ts

# 6. Start development servers
# Terminal 1 (Backend)
cd apps/backend && npm run dev

# Terminal 2 (Frontend)
cd apps/frontend && npm run dev
```

### Available Scripts

**Backend** (`apps/backend/`):
| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `nest start --watch` | Development with hot reload |
| `build` | `prisma generate && nest build` | Production build |
| `start` | `node dist/main` | Production start |
| `lint` | `eslint "{src,apps,libs,test}/**/*.ts"` | Lint TypeScript |
| `test` | `jest` | Run unit tests |
| `prisma:generate` | `prisma generate` | Generate Prisma client |
| `prisma:migrate` | `prisma migrate dev` | Run migrations |

**Frontend** (`apps/frontend/`):
| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Development server |
| `build` | `next build` | Production build |
| `start` | `next start` | Production start |
| `lint` | `next lint` | Lint Next.js code |

---

## 2. Branch Strategy

### Branch Naming
```
main                    # Production-ready code
dev                     # Development integration
feature/description     # New features
fix/description         # Bug fixes
hotfix/description      # Urgent production fixes
refactor/description    # Code refactoring
docs/description        # Documentation changes
```

### Workflow
1. Create a feature branch from `dev`
2. Make changes and commit
3. Push branch and create a Pull Request
4. Request review from at least one team member
5. Merge into `dev` after approval
6. `dev` → `main` for production releases

---

## 3. Commit Conventions

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code refactoring (no feature change) |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, no logic change) |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, config |
| `perf` | Performance improvements |

### Examples
```
feat(campaign): add campaign review system
fix(auth): prevent JWT token leak in error responses
refactor(messaging): extract WebSocket event handlers
docs(api): add review endpoints documentation
test(auth): add unit tests for login validation
```

---

## 4. Code Review Checklist

### Before Submitting
- [ ] Code compiles without TypeScript errors
- [ ] No console.log statements left in production code
- [ ] All new endpoints have Swagger decorators
- [ ] DTOs have class-validator decorators
- [ ] Database changes have corresponding Prisma schema updates
- [ ] No secrets or API keys hardcoded

### Review Focus Areas
- [ ] Security: Input validation, auth checks, SQL injection prevention
- [ ] Performance: N+1 queries, missing indexes, unnecessary re-renders
- [ ] Error handling: Proper HTTP status codes, user-friendly messages
- [ ] Consistency: Follows existing patterns and naming conventions
- [ ] Testing: New code has corresponding tests

---

## 5. Backend Guidelines

### Adding a New Module
1. Create directory: `src/modules/<module-name>/`
2. Create files following the standard pattern:
   ```
   <module-name>.module.ts
   <module-name>.controller.ts
   <module-name>.service.ts
   <module-name>.repository.ts
   dto/
   guards/
   ```
3. Register in `app.module.ts`
4. Add Swagger decorators to controller
5. Update API documentation

### Adding a New Endpoint
```typescript
// 1. Create DTO with validators
export class CreateThingDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;
}

// 2. Add controller method
@Post()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Create a new thing' })
async create(@Req() req: any, @Body() dto: CreateThingDto) {
  return this.thingService.create(req.user.id, dto);
}

// 3. Add service method
async create(userId: string, dto: CreateThingDto) {
  // Business logic here
  return this.thingRepository.create(data);
}

// 4. Add repository method (if needed)
async create(data: Prisma.ThingCreateInput) {
  return this.prisma.thing.create({ data });
}
```

### Database Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma validate`
3. Run `npx prisma db push --skip-generate`
4. Run `npx prisma generate` (when dev server is stopped)
5. Commit schema changes

---

## 6. Frontend Guidelines

### Adding a New Component
1. Create in appropriate directory:
   - Generic UI: `src/components/ui/`
   - Dashboard section: `src/components/dashboard/<role>-views/`
   - Modal: Co-located with parent component
2. Use `'use client'` directive
3. Follow the modal pattern (createPortal + framer-motion)
4. Use Tailwind utility classes (no CSS modules)

### Adding a New Page
1. Create route in `src/app/<route>/page.tsx`
2. Add to middleware matcher if auth-protected
3. Update navigation in dashboard views

### Adding a New Service
1. Create `src/services/<name>.service.ts`
2. Use `apiRequest()` from `./api`
3. Export as object literal with async methods
4. Define TypeScript interfaces for request/response

### Adding a New Context
1. Create `src/context/<Name>Context.tsx`
2. Export provider component and `use<Name>` hook
3. Add to provider tree in `layout.tsx` or `dashboard/page.tsx`

---

## 7. Testing Guidelines

### Backend Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.service.spec.ts

# Run with coverage
npm test -- --coverage
```

### Test File Structure
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { SomeService } from './some.service';
import { PrismaService } from '../../database/prisma.service';

describe('SomeService', () => {
  let service: SomeService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SomeService, PrismaService],
    }).compile();

    service = module.get<SomeService>(SomeService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### What to Test
- Service business logic
- DTO validation
- Guard authorization
- Repository queries (with mocked Prisma)

---

## 8. Documentation

### When to Update Docs
- Adding new API endpoints → Update `docs/API.md`
- Changing database schema → Update `docs/Database.md`
- Adding new modules → Update `docs/Architecture.md`
- Changing security patterns → Update `docs/Security.md`
- Updating design patterns → Update `docs/DesignStyle.md`
- Changing code conventions → Update `docs/CodeStyle.md`

### Swagger Decorators
All new endpoints must include:
```typescript
@ApiTags('module-name')
@ApiOperation({ summary: 'Description of endpoint' })
@ApiBearerAuth()  // if authenticated
@ApiResponse({ status: 200, description: 'Success' })
@ApiResponse({ status: 400, description: 'Bad request' })
```

---

## 9. Common Issues

### Prisma Client Locked
If `prisma generate` fails with EPERM:
```bash
# Stop the dev server first
# Then run:
npx prisma generate
```

### CORS Errors
Ensure `FRONTEND_URL` is set in backend `.env` and matches your frontend URL.

### WebSocket Connection Failed
Ensure Socket.IO CORS is configured for your frontend URL in:
- `messaging.gateway.ts`
- `social.gateway.ts`

### TypeScript Strict Mode
Frontend has `strict: true` — all new code must handle null/undefined explicitly.

---

## 10. Getting Help

- **Documentation**: Check `docs/` directory first
- **API Reference**: See `docs/API.md`
- **Architecture**: See `docs/Architecture.md`
- **Database**: See `docs/Database.md`
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
