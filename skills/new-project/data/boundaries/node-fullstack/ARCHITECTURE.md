# Node Full-Stack Architecture

Default stack and version pins live in `workflows/matrices/node-fullstack.matrix.md`. Defaults to a Hono API + shared contracts + a chosen web framework, in a pnpm workspace.

## Recommended Stack (Defaults — see matrix)

- Runtime: Node.js 22 LTS
- Package manager: pnpm
- API framework: Hono (Fastify and NestJS are matrix alternatives)
- Validation: Zod
- ORM/query: Drizzle (Prisma and Kysely are matrix alternatives)
- DB: PostgreSQL
- Testing: Vitest (unit) + Supertest or Playwright (integration)
- Observability: structured logs, `x-request-id` trace propagation, metrics hooks

## Monorepo Layout

```txt
apps/
  web/                  # delegates to vue/ or react/ matrix
  api/
packages/
  contracts/            # shared request/response schemas + DTO types
  db/                   # optional: shared DB client and migrations
  ui/                   # optional: shared component package (rare; usually duplicate inside each app)
  utils/                # cross-app pure utilities
  config/               # shared runtime config helpers
tooling/
  eslint/               # shared ESLint preset
  tsconfig/             # shared tsconfig bases
```

See `boundaries/common/directory-rules.md` for the cross-stack rules these subfolders follow.

## API Layers

```txt
apps/api/src/
  app.ts                # createApp() — middleware + routes + error handler
  server.ts             # from shared/snippets/node/server.skeleton.ts
  config/env.ts         # the ONE module that reads process.env
  modules/
    <feature>/
      <feature>.route.ts     # transport layer — request parsing, response shaping
      <feature>.service.ts   # business rules — no transport, no DB
      <feature>.repo.ts      # persistence boundary — the only place DB is touched
      <feature>.schema.ts    # API-internal schemas (params, headers, internal validation)
  shared/
    http/
      errors.ts          # from shared/snippets/http/errors.server.ts
    middleware/
      auth.ts
      request-id.ts      # from shared/snippets/node/request-id.middleware.ts
    logger.ts
```

**Layer rules:**

- Routes know about HTTP. Services know about business rules. Repos know about the DB. Never let knowledge leak across layers.
- Routes import services. Services import repos. Repos import the DB client. The chain is one-directional.
- Tests live colocated: `<feature>.service.test.ts` next to `<feature>.service.ts`.

## Contract Strategy

Put shared request/response schemas in `packages/contracts`. Both `apps/api` and `apps/web` import them. **Do not manually duplicate API types in the frontend.**

The canonical contract template is `shared/snippets/node/feature.contract.ts` — copy it and substitute `%FEATURE_NAME%`.

```ts
// packages/contracts/user.ts
export const userDtoSchema = z.object({ ... })
export type UserDto = z.infer<typeof userDtoSchema>

// apps/api uses it for validation
// apps/web uses it for type inference and form schemas
```

## Security Baseline

- Validate every body, query, param, header, and webhook payload at the route boundary.
- Use secure HTTP-only cookies for browser auth when possible. Bearer tokens for non-browser clients.
- Centralize CORS and rate-limiting middleware in `app.ts`; do not let routes override them.
- Never log secrets, full auth headers, or full request bodies. Log structured `{ requestId, route, status }` instead.
- Use least-privilege DB credentials per environment. Production credentials never appear in dev `.env.example`.
- All errors hit a single `app.onError` handler that uses `serializeError` from `shared/snippets/http/errors.server.ts` — clients receive a safe shape, logs capture the full error.

## Recommended Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm --filter api build
pnpm --filter web build
```

## Generate a Project

Run `/new-project` (Claude Code) or follow `workflows/new-project.md`. Defaults in `workflows/matrices/node-fullstack.matrix.md`. The workflow asks separately which framework the web app uses and pulls from `workflows/matrices/vue.matrix.md` or `react.matrix.md` accordingly.
