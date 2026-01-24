# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS TypeScript backend for authentication with email OTP verification. Uses PostgreSQL (Prisma) for persistent data and Redis (redis-om) for ephemeral data.

## Common Commands

```bash
# Build
yarn run build

# Run
yarn run start          # standard mode
yarn run start:dev      # watch mode (development)
yarn run start:prod     # production mode

# Linting/Formatting
yarn run format         # Prettier
yarn run lint           # ESLint with --fix

# Testing
yarn run test           # Vitest unit tests
yarn run test:watch     # watch mode
yarn run test:cov       # coverage
yarn run test:e2e       # e2e tests
```

## Architecture

### Data Layer Split

- **PostgreSQL via Prisma**: Persistent data (users, etc.)
  - Generated client output: `generated/prisma` (not `node_modules/.prisma`)
  - Prisma module uses `forFeature(entity)` pattern to inject model entities

- **Redis via redis-om**: Ephemeral data (OTPs, signed/revoked JWTs)
  - Redis module uses `forFeature(schemas)` pattern to inject repositories

### Module Patterns

**PrismaModule** (`src/prisma/`):
- `PrismaModule.forRootAsync()` - initializes core connection
- `PrismaModule.forFeature(entity)` - injects specific Prisma model entity
- Use `getPrismaEntityToken(entity)` to get injection token

**RedisModule** (`src/redis/`):
- `RedisModule.forRootAsync()` - initializes core connection
- `RedisModule.forFeature(schemas)` - injects redis-om repositories
- Use `getRepositoryToken(schema)` to get injection token

### JWT Architecture

JWT handling is split across multiple modules:

- `AccessJwtModule` / `RefreshJwtModule` - token generation and validation options
- `SignedJwtsModule` - tracks signed JWTs in Redis (for token management)
- `RevokedJwtsModule` - tracks revoked JWTs in Redis (for logout/blacklist)
- `JwtsModule` - orchestrates the above, provides `JwtsService`
- `AuthModule` - uses JWT strategies for authentication flow

### Auth Flow

1. User registers email → OTP sent via MailModule
2. User verifies OTP → account activated
3. Login → access + refresh tokens issued
4. Protected routes use `AccessJwtGuard` or `RefreshJwtGuard`

### Path Aliases

`@/*` resolves to `src/*` (configured in tsconfig.json and vitest.config.ts)

### Configuration

Environment variables are loaded via `ConfigModule` with factory functions in `src/shared/config/`:
- `database.ts` - DATABASE_URL
- `jwt-sign-options.ts` - JWT signing options
- `mailer.ts` - SMTP config
- `otp.ts` - OTP alphabet, size, bcrypt rounds
- `redis.ts` - Redis URL

### Testing Utilities

`src/test/utils/` provides helpers for creating fake entities:
- `createFakeUser()` - generates test user data
- `createFakeJwt()` - generates test JWTs
- `createFakeOtp()` - generates test OTPs