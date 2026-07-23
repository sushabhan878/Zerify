---
name: NestJS Backend Architecture
description: Architecture guidelines and templates for building traditional NestJS features using Dependency Injection, Pipes, Guards, and Repositories in the Zerify backend.
---

# NestJS Backend Development Guidelines

When creating or modifying backend features in this workspace, follow these standard NestJS architectural patterns, design principles, and directories.

---

## 1. Directory Structure

Each feature or domain should reside in its own subdirectory under `apps/backend/src/modules/<feature-name>`.

```
modules/<feature-name>/
├── dto/
│   ├── create-<feature>.dto.ts
│   └── update-<feature>.dto.ts
├── entities/
│   └── <feature>.entity.ts
├── guards/
│   └── <feature>.guard.ts
├── pipes/
│   └── <feature-validation>.pipe.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── <feature>.repository.ts (optional, if isolating Prisma operations)
└── <feature>.module.ts
```

---

## 2. Dependency Injection (DI)

- Always design classes to be loosely coupled.
- Inject dependencies via the `constructor` using TypeScript's access modifiers (`private readonly`).
- Mark all services, repositories, and custom guards/pipes with the `@Injectable()` decorator.
- Avoid using the `new` keyword to instantiate services/injectables. Let NestJS's IoC container manage the lifecycle.

### Example:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

---

## 3. Data Transfer Objects (DTOs) & Pipes

- Validate all incoming request data (body, query, params) using DTOs.
- Use `class-validator` decorators (e.g., `@IsEmail()`, `@IsString()`, `@IsOptional()`) in the DTO files.
- Enable `ValidationPipe` globally (or use it at the controller level) to automatically validate and transform payloads.

### Example:
```typescript
// dto/create-user.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
```

---

## 4. Guards & Authorization

- Implement custom guards by implementing the `CanActivate` interface.
- Use guards for authentication checks (e.g., verifying JWTs, API keys) and role-based access control.
- Apply guards at the controller class level, or handler level using the `@UseGuards()` decorator.

### Example:
```typescript
// guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // Perform custom authorization check
    return user && user.role === 'ADMIN';
  }
}
```

---

## 5. Exception Handling & Filters

- Use built-in NestJS HTTP exceptions (`BadRequestException`, `NotFoundException`, `UnauthorizedException`, `InternalServerErrorException`) inside services.
- Keep business logic decoupled from HTTP responses, letting NestJS convert exceptions into appropriate HTTP responses.
- Write custom Exception Filters only when you need to change the default JSON response structure of exceptions or log specific types of database/ORM errors.

---

## 6. Repository Pattern (Database Isolation)

- Use a dedicated repository class for complex queries or when reusing prisma database query operations across different services.
- This isolates the database layer from the business logic layer, making unit testing simpler and mockable.

### Example:
```typescript
// user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
```
