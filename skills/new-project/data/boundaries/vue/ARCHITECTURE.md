# Vue Project Architecture

Default stack and version pins live in `workflows/matrices/vue.matrix.md`. This file defines the architectural rules that hold regardless of which UI library / state library / animation library the matrix selects.

## Positioning

Use Vue for fast product iteration, design-system-friendly UI, dashboards, admin tools, and content-heavy web apps. The architecture is feature-first with shared primitives.

## Directory Structure

```txt
src/
  app/
    App.vue
    main.ts
    router.ts            # only if a router is selected
    providers/           # global providers (QueryClient, theme, etc.)
  assets/
  components/
    ui/                  # shadcn/vue generated primitives (when shadcn-vue selected)
    patterns/            # reusable app-level UI patterns
  config/
    env.ts               # the ONE module that reads import.meta.env
  features/
    <feature>/
      api/<feature>.api.ts
      components/<Feature><Surface>.vue
      composables/use<Feature>.ts
      schemas/<feature>.schema.ts
      types/<feature>.types.ts
      views/<Feature>View.vue
  shared/
    http/
      client.ts          # from shared/snippets/http/client.web.ts
      errors.ts          # from shared/snippets/http/errors.client.ts
    lib/
      cn.ts              # from shared/snippets/lib/cn.ts (when Tailwind selected)
      format.ts
      result.ts
    styles/
      tokens.css         # from shared/snippets/styles/tokens.<preset>.css
  stores/                # only if a global store library is selected
  pages/                 # only if vue-router is selected
```

See `boundaries/common/directory-rules.md` for the cross-stack rules these subfolders follow.

## Component Rules

- Use `<script setup lang="ts">`.
- Props and emits must be typed.
- Prefer computed state over watchers.
- Watchers need a concrete reason: persistence, subscriptions, or imperative integrations.
- Generic UI stays in `components/ui` or `components/patterns`.
- Feature components stay inside their feature folder.
- Components that fetch data should usually be feature views or feature containers.
- See `boundaries/common/encapsulation.md` for the cross-stack component contract.

## Styling

When the matrix selects shadcn/vue + Tailwind, use the three-tool model with clear ownership:

- **Tailwind v4**: utility classes, responsive layout, token-based color/spacing utilities. Config is CSS-first via `@theme inline` inside `src/shared/styles/tokens.css` — there is no `tailwind.config.ts`.
- **shadcn/vue (Reka UI)**: accessible primitives in `src/components/ui/*`. Add new components via `pnpm dlx shadcn-vue@latest add <name>`.
- **UnoCSS** (optional hybrid): shortcuts (`surface-card`, `h-stack`, `focus-ring`) and icon utilities (`i-lucide-*` via `@iconify-json/lucide`). Color tokens are **not** mirrored here — Tailwind owns them.

Token values live in `src/shared/styles/tokens.css` as CSS custom properties. The `@theme inline` block re-exports them as Tailwind theme variables. Two presets are available in `shared/snippets/styles/`:

- `tokens.shadcn.css` — shadcn `new-york` OKLCH (default for product apps).
- `tokens.voltagent.css` — dark engineering palette (default for dev tools and dashboards).

When a different UI library is selected (Naive UI, Element Plus, Ant Design Vue), the matrix replaces this section with that library's theming approach.

## Icons

- Inside `.vue` component code: import named components from the chosen icon library. With the default matrix this is `lucide-vue-next` (`import { ArrowRight } from 'lucide-vue-next'`).
- Inside template-only class usage with UnoCSS: use `i-lucide-arrow-right`.

## Animation

- Use `motion-v` (the Vue port of Motion) for component-level animation when the matrix selects it: `import { motion } from 'motion-v'`.
- Use Reka UI's `data-[state=...]` attributes + utility classes for primitive animations (already wired into shadcn/vue components).

## HTTP

- All requests use the `http` singleton from `src/shared/http/client.ts` (the `createHttpClient` factory from `shared/snippets/http/client.web.ts`).
- Feature API functions accept an optional `init` bag (`Pick<RequestOptions, 'signal'>`) and forward it to the client, enabling caller-controlled cancellation.
- Response schemas are parsed in the API module (`zod.parse`), not inside the client.
- UI receives `AppError` instances only — never raw `Response`, `DOMException`, or axios errors.
- See `boundaries/common/http-contract.md` for the cross-stack rules.

### Request Cancellation in Composables

Use `AbortController` inside `watchEffect` to cancel stale requests when reactive deps change:

```ts
watchEffect(async (onCleanup) => {
  const ac = new AbortController()
  onCleanup(() => ac.abort())
  const data = await getUser(userId.value, { signal: ac.signal })
  // ...
})
```

Ignore `AbortError` — it is not a real error from the user's perspective. When `@tanstack/vue-query` is selected, cancellation is handled by the query client automatically.

## Public Functions

Place public utility functions in `src/shared/lib`. A utility must be pure, typed, and tested when it handles dates, money, permissions, or state transitions.

## Recommended Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Generate a Project

Run `/new-project` (Claude Code) or follow `workflows/new-project.md` (any AI). Stack-specific defaults and choices are documented in `workflows/matrices/vue.matrix.md`.
