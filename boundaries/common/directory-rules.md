# Directory Rules

Cross-stack rules for how source code is laid out. Stack-specific elaboration lives in each `boundaries/<stack>/ARCHITECTURE.md`.

## Feature-First Organization

Product code is organized by feature, not by file type. A feature folder owns its UI, data, state, and types together:

```txt
src/features/<feature>/
  api/                 # HTTP client calls for this feature
  components/          # feature-specific UI (Vue: .vue; React/RN: .tsx)
  composables/ | hooks/   # state + side effects (Vue: composables; React/RN: hooks)
  schemas/             # Zod schemas for inputs and responses
  types/               # type aliases derived from schemas
  views/ | screens/    # top-level routed surfaces (Vue/React: views; RN: screens)
```

Names differ per stack (composables vs hooks, views vs screens), but the partitioning is the same. The matrix file for each stack documents the exact subfolders to create.

## Cross-Feature Boundary

**Features cannot import from other features.** If two features need the same logic, promote it to `shared/`.

- `features/billing/` may NOT import from `features/orders/`.
- Both may import from `shared/lib/format-money.ts`.

When you find yourself reaching across feature boundaries, that is the signal to extract a shared utility — but only after the same logic appears in two places. Do not pre-share.

## Shared Layer

`src/shared/` holds genuinely reusable primitives. Promote here only after the same code appears in two features.

```txt
src/shared/
  http/        # client.ts, errors.ts — see boundaries/common/http-contract.md
  lib/         # cn, format-date, format-money, result helpers
  styles/      # tokens.css (single source of truth for color/radius/space)
  storage/     # platform storage wrappers (RN: AsyncStorage; web: localStorage)
  native/      # RN-only: native module wrappers (feature code imports these, never the native module directly)
```

Anything stack-specific (Vue: `composables/`, React: `hooks/`) is allowed under `shared/` only when it is provably reusable. Otherwise it stays inside a feature folder.

## App Layer

`src/app/` holds bootstrap and global providers — anything that runs once at startup:

```txt
src/app/
  App.vue | App.tsx     # root component
  main.ts | main.tsx    # entry point
  router.ts             # route table
  providers/            # global Vue/React providers (QueryClient, theme, error boundary)
```

`src/app/` is the only place that knows about the framework's root mount. Features and shared code never import from `src/app/`.

## Generic UI Cannot Import Feature Code

Primitive components in `components/ui/` (shadcn primitives) and pattern components in `components/patterns/` (search bar, page header, entity card) must remain feature-agnostic. They take props and emit events; they do not import from `features/`.

This is what makes them reusable across the app and across future projects.

## Page Layer (Optional)

Some stacks (Vue with vue-router, React with react-router) put route components in `src/pages/`. When a page is non-trivial, move its logic into a feature's `views/` and keep the page file as a thin route adapter.
