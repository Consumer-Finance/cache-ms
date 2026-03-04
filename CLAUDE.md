# CLAUDE.md — AI Assistant Guide for cache-ms

## Project Overview

A **NestJS microservice** providing distributed caching backed by **Redis**, communicating over **NATS** messaging. Part of a larger microservices architecture under the Consumer-Finance organization.

## Tech Stack

- **Runtime**: Node.js 22.16 (see `.nvmrc`)
- **Language**: TypeScript 5.7
- **Framework**: NestJS 11 (microservice mode, not HTTP)
- **Transport**: NATS messaging (no REST/HTTP endpoints)
- **Cache Backend**: Redis via `@nestjs/cache-manager` + `@keyv/redis`
- **Validation**: Joi (environment variable schemas)
- **Build**: NestJS CLI with SWC compiler
- **Testing**: Jest 29 + ts-jest
- **Linting**: ESLint 9 (flat config) + Prettier
- **Containers**: Docker with multi-stage builds, Docker Compose for E2E

## Project Structure

```
cache-ms/
├── src/
│   ├── main.ts                          # Bootstrap: creates NATS microservice
│   ├── app.module.ts                    # Root module (imports Redis, NATS, Cache)
│   ├── cache/
│   │   ├── cache.controller.ts          # NATS message pattern handlers
│   │   ├── cache.service.ts             # Cache operations (get/set/del/clear)
│   │   └── cache.module.ts              # Feature module
│   └── common/
│       ├── cache/
│       │   └── redis.module.ts          # Global Redis/Keyv configuration
│       ├── transports/
│       │   └── nast.module.ts           # NATS client registration
│       └── config/
│           ├── envs.ts                  # Joi-validated environment variables
│           ├── services.ts              # Service name constants (NAST_SERVICE)
│           └── index.ts                 # Barrel export
├── test/
│   └── cache.e2e-spec.ts               # E2E tests (requires NATS + Redis)
├── Dockerfile.prod                      # Production multi-stage build
├── Dockerfile.test                      # Test container
├── dockerfile                           # Dev/alternative production build
├── docker-compose.e2e.yml              # Local E2E with volume mounts
├── docker-compose.e2e.ci.yml           # CI E2E (no volumes)
└── .github/workflows/docker-image.yml  # CI/CD pipeline
```

Every `*.ts` source file has a co-located `*.spec.ts` unit test file.

## Commands

```bash
# Install dependencies
npm install

# Development
npm run start:dev          # Watch mode
npm run start:debug        # Debug + watch mode

# Build
npm run build              # Compile via nest build (SWC)
npm run start:prod         # Run compiled output (node dist/main)

# Testing
npm test                   # Unit tests (jest, rootDir: src/)
npm run test:watch         # Unit tests in watch mode
npm run test:cov           # Unit tests with coverage

# E2E tests (require running NATS + Redis)
npm run test:e2e           # Run E2E tests
npm run test:e2e:watch     # E2E in watch mode
npm run test:e2e:cov       # E2E with coverage

# E2E via Docker (spins up NATS + Redis automatically)
docker compose -f docker-compose.e2e.yml up --build --abort-on-container-exit

# Linting & formatting
npm run lint               # ESLint with --fix
npm run format             # Prettier write
```

## Architecture

### Microservice Pattern (No HTTP)

This service runs as a **NATS microservice** — there are no HTTP controllers or REST endpoints. All communication happens via NATS message patterns:

| Pattern          | Payload                                    | Description              |
|------------------|--------------------------------------------|--------------------------|
| `get_cache`      | `string` (key)                             | Retrieve cached value    |
| `set_cache`      | `{ key: string, value: any, ttl?: number }` | Store value (TTL in ms) |
| `delete_cache`   | `string` (key)                             | Delete specific key      |
| `clear_cache`    | `{}` (empty)                               | Clear entire cache       |

### Module Architecture

- **AppModule** — root; imports `RedisModule`, `NastModule`, `CacheModule`
- **RedisModule** — global; configures `@nestjs/cache-manager` with Keyv Redis adapter
- **NastModule** — registers NATS `ClientProxy` as `NAST_SERVICE`
- **CacheModule** — feature module with `CacheController` + `CacheService`

### Key Design Decisions

- Setting `null` or `undefined` values triggers a **delete** instead of storing (see `cache.service.ts:16`)
- `RedisModule` is registered as **global** (`isGlobal: true`) so `CACHE_MANAGER` is available everywhere
- Environment variables are validated at startup via Joi — the app throws on invalid config

## Environment Variables

Defined in `.env.template` and validated by `src/common/config/envs.ts`:

| Variable       | Type     | Description                          | Example                        |
|----------------|----------|--------------------------------------|--------------------------------|
| `NATS_SERVERS` | `string` | Comma-separated NATS server URLs     | `nats://localhost:4222`        |
| `REDIS_URL`    | `string` | Redis connection URL                 | `redis://localhost:6379`       |

`NATS_SERVERS` is split on commas into an array at runtime.

## Testing Conventions

### Unit Tests (`*.spec.ts`)

- Co-located with source files in `src/`
- Use `Test.createTestingModule` with mocked providers
- Mock pattern: `jest.Mocked<T>` with `useValue` provider overrides
- Run with: `npm test`

### E2E Tests (`test/*.e2e-spec.ts`)

- Located in `test/` directory
- Require live NATS and Redis instances
- Use `ClientProxyFactory` to create a NATS client, then `firstValueFrom(client.send(...))` to test message patterns
- 30-second timeout per test, `forceExit` and `detectOpenHandles` enabled
- Run via Docker Compose for easiest setup: `docker compose -f docker-compose.e2e.yml up --build`

### Test Structure Pattern

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let dependency: jest.Mocked<DependencyType>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServiceName,
        { provide: TOKEN, useValue: { method: jest.fn() } },
      ],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
    dependency = module.get(TOKEN) as jest.Mocked<DependencyType>;
  });

  it('should ...', async () => { ... });
});
```

## Code Style & Conventions

### Formatting (Prettier)

- Single quotes (`'singleQuote': true`)
- Trailing commas everywhere (`'trailingComma': 'all'`)

### ESLint

- Flat config format (`eslint.config.mjs`)
- TypeScript-ESLint with project-aware type checking
- `@typescript-eslint/no-explicit-any`: **off** (any is allowed)
- `@typescript-eslint/explicit-function-return-type`: **off**
- `@typescript-eslint/explicit-module-boundary-types`: **off**

### Naming Conventions

| Item                | Convention       | Example                      |
|---------------------|------------------|------------------------------|
| Files               | kebab-case       | `cache.service.ts`           |
| Classes             | PascalCase       | `CacheService`               |
| Methods/variables   | camelCase        | `cacheManager`, `get()`      |
| Constants/tokens    | UPPER_SNAKE_CASE | `CACHE_MANAGER`, `NAST_SERVICE` |
| Message patterns    | snake_case       | `get_cache`, `set_cache`     |
| Spec files          | `*.spec.ts`      | `cache.service.spec.ts`      |
| E2E test files      | `*.e2e-spec.ts`  | `cache.e2e-spec.ts`          |

### File Organization

- **Feature-based modules**: group controller, service, module, and spec files together
- **Common utilities**: `src/common/` with sub-directories by concern (`cache/`, `transports/`, `config/`)
- **Barrel exports**: `index.ts` files in config directories

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/docker-image.yml`) with sequential stages:

1. **lint** — ESLint (5 min timeout)
2. **build-verification** + **unit-tests** — run in parallel after lint (5/10 min)
3. **e2e-tests** — Docker Compose E2E after build + unit pass (15 min)
4. **build-and-push** — Build `Dockerfile.prod` and push to AWS ECR

Triggered on pushes to `main` and pull requests targeting `main`.

## Docker

Three Dockerfiles, all based on `node:22.16-alpine`:

| File               | Purpose                                           |
|--------------------|---------------------------------------------------|
| `Dockerfile.prod`  | 4-stage production build (deps → build+test → prod deps → runner) |
| `Dockerfile.test`  | Single-stage for running E2E tests                |
| `dockerfile`       | 3-stage alternative production build              |

Production images run as non-root `node` user with `NODE_ENV=production`.

## Common Pitfalls

- **No HTTP**: Don't add `@Get()`, `@Post()` etc. — this is a pure NATS microservice
- **E2E needs infrastructure**: Unit tests run standalone; E2E tests require NATS + Redis (use Docker Compose)
- **Env validation fails fast**: Missing `NATS_SERVERS` or `REDIS_URL` throws at import time, before the app boots
- **TTL is in milliseconds**: The `ttl` parameter in `set_cache` is passed directly to cache-manager (ms)
- **The NATS module is named "Nast"**: The codebase uses `NastModule` / `NAST_SERVICE` (not "Nats") — follow this convention
