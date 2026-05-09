# Node Full-Stack Architecture

Target stack: TypeScript monorepo with Node API, web app, shared packages, and typed contracts.

## Recommended Stack

- Runtime: Node.js LTS
- Package manager: pnpm
- API framework: Hono, Fastify, or NestJS depending on complexity
- Validation: Zod or Valibot
- ORM/query: Prisma, Drizzle, or Kysely
- Testing: Vitest for unit, Playwright for web journeys
- Observability: structured logs, request IDs, metrics hooks

## Monorepo Layout

```txt
apps/
  web/
  api/
packages/
  config/
  db/
  contracts/
  ui/
  utils/
tooling/
  eslint/
  tsconfig/
```

## API Layers

```txt
apps/api/src/
  app.ts
  server.ts
  config/env.ts
  modules/
    user/
      user.route.ts
      user.service.ts
      user.repo.ts
      user.schema.ts
      user.types.ts
  shared/
    http/errors.ts
    middleware/auth.ts
    middleware/request-id.ts
    logger.ts
```

Routes handle transport. Services handle business rules. Repositories handle persistence. Schemas define boundary contracts.

## Contract Strategy

Put shared request/response schemas in `packages/contracts`. Import schemas from both API and clients. Do not manually duplicate API types in the frontend.

## Security Baseline

- Validate every body, query, param, and external webhook.
- Use secure cookies for browser auth when possible.
- Centralize CORS and rate limits.
- Never log secrets or full auth headers.
- Use least-privilege DB credentials per environment.

## Recommended Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm --filter api build
pnpm --filter web build
```

## Template Index

| File | Purpose |
|------|---------|
| `templates/node-fullstack/package.json` | Monorepo root — pinned devDeps + workspace scripts |
| `templates/node-fullstack/pnpm-workspace.yaml` | Workspace package globs |
| `templates/node-fullstack/apps/api/src/server.ts` | `createApp()` — Hono setup, CORS, request-id, global error handler, 404 catch-all |
| `templates/node-fullstack/apps/api/src/shared/middleware/request-id.ts` | `x-request-id` trace middleware; augments `ContextVariableMap` |
| `templates/node-fullstack/apps/api/src/shared/http/errors.ts` | Server-side `AppError` + `serializeError` (safe JSON shape for clients) |
| `templates/node-fullstack/apps/api/src/modules/user/user.route.ts` | Route layer example — transport only, delegates to service |
| `templates/node-fullstack/apps/api/src/modules/user/user.service.ts` | Service layer example — business rules |
| `templates/node-fullstack/apps/api/src/modules/user/user.repo.ts` | Repository layer example — persistence boundary |
| `templates/node-fullstack/apps/api/src/modules/user/user.schema.ts` | API-internal schemas (params, body) |
| `templates/node-fullstack/packages/contracts/user.ts` | **Shared contract** — DTO + create/update body schemas imported by both API and web |

