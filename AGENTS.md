# Agent Instructions

This is a NestJS backend project using TypeScript, Vitest for testing, Prisma for database, Redis, and JWT authentication.

## Build/Lint/Test Commands

```bash
# Build
npm run build              # Build the NestJS application

# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugger

# Linting and Formatting
npm run lint               # Run ESLint with auto-fix
npm run format             # Format with Prettier

# Testing - IMPORTANT: Use Vitest, not jest
npm run test               # Run all tests once
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:debug         # Debug tests with inspector
npm run test:e2e           # Run end-to-end tests

# Running a single test file
npx vitest run src/users/users.service.spec.ts
npx vitest run src/users/users.service.spec.ts --reporter=verbose

# Running a single test
npx vitest run -t "should be create a user"
```

## Code Style Guidelines

### Formatting (Prettier)

- Single quotes: `'string'`
- Trailing commas: `['a', 'b',]`
- No semicolons
- 2 space indentation

### Imports

```typescript
// 1. External libraries (alphabetical)
import { Injectable } from '@nestjs/common'
import { Test } from '@nestjs/testing'

// 2. Internal absolute imports using @/ alias
import { UsersService } from '@/users/users.service'
import { getFakeUser } from '@/test/utils'
```

### Naming Conventions

- **Classes**: PascalCase (e.g., `UsersService`, `AuthController`)
- **Interfaces/Types**: PascalCase (e.g., `CreateOptions`, `UserEntity`)
- **Variables/Functions**: camelCase (e.g., `findOne`, `isExist`)
- **Files**: kebab-case for modules, dot notation for related files:
  - `users.service.ts`, `users.controller.ts`, `users.module.ts`
  - `users.types.ts`, `users.dtos.ts`, `users.schema.ts`
  - `users.service.spec.ts` for tests

### TypeScript Patterns

- Use explicit return types on service methods
- Use type aliases from `*.types.ts` files
- Prefer `interface` over `type` for object shapes
- Use strict null checks enabled
- NestJS decorators for DI: `@Injectable()`, `@Controller()`

### Error Handling

- Use NestJS built-in exceptions: `BadRequestException`, `UnauthorizedException`
- Services return `null` for not-found scenarios
- Controllers handle HTTP-specific error mapping

### Testing Conventions

- Test files: `*.spec.ts` (unit), `*.e2e-spec.ts` (e2e)
- Use `describe` blocks for grouping by method
- Use `test` (not `it`) for individual cases
- Mock external dependencies with `vitest-mock-extended`
- Import test utilities from `@/test/utils`
- Follow pattern: `test('should be [action] [result]', ...)`

### Project Structure

```
src/
  [feature]/           # Domain-based modules
    [feature].service.ts
    [feature].controller.ts
    [feature].module.ts
    [feature].types.ts     # TypeScript types
    [feature].dtos.ts      # Data transfer objects
    [feature].schema.ts    # Validation schemas
    [feature].consts.ts    # Constants
    [feature].enums.ts     # Enums
    [feature].service.spec.ts
  shared/              # Shared utilities
    config/            # Configuration files
    guards/            # Auth guards
    strategies/        # Passport strategies
    types/             # Global types
  test/utils/          # Test utilities
prisma/                # Database schema
```

### Database (Prisma)

- Use `PrismaClient` type from `@/prisma/prisma.types`
- Inject repositories using `@InjectPrismaEntity('entityName')`
- Access via `prismaClient['entityName']` pattern

### Environment

- Uses `.env` file for configuration
- Required vars: DATABASE_URL, REDIS_URL, JWT secrets
- Validation in `src/shared/config/validate.ts`
