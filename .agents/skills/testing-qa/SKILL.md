---
name: Testing & Quality Assurance
description: Guidelines and examples for writing Jest unit tests and integration tests in NestJS and React applications.
---

# Testing & Quality Assurance Standards

---

## 1. NestJS Controller & Service Testing

- **File Naming:** `<feature>.controller.spec.ts` or `<feature>.service.spec.ts`
- **Framework:** Jest & `@nestjs/testing`
- **Isolation Principle:**
  - Mock external dependencies (e.g., `PrismaService`, external HTTP clients) using `jest.fn()` or mock objects.
  - Never call real external network APIs or live databases in unit test suites.

---

## 2. Running Test Commands

- **Backend Unit Tests:**
  ```bash
  npm --prefix apps/backend run test
  ```
- **Monorepo Tests:**
  ```bash
  npm run test
  ```
