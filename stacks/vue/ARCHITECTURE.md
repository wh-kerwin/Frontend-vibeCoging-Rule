# Vue Project Architecture

Target stack: Vue 3 + Vite + TypeScript + Tailwind CSS + shadcn/vue + UnoCSS.

## Positioning

Use Vue for fast product iteration, design-system-friendly UI, dashboards, admin tools, and content-heavy web apps. The architecture is feature-first with shared primitives.

## Directory Structure

```txt
src/
  app/
    App.vue
    main.ts
    router.ts
    providers/
  assets/
  components/
    ui/                 # shadcn/vue generated primitives
    patterns/           # reusable app-level UI patterns
  config/
    env.ts
  features/
    user/
      api/user.api.ts
      components/UserProfileCard.vue
      composables/useUserProfile.ts
      schemas/user.schema.ts
      types/user.types.ts
      views/UserProfileView.vue
  shared/
    http/
      client.ts
      errors.ts
    lib/
      cn.ts
      format.ts
      result.ts
    styles/
      tokens.css
  stores/
  pages/
  tests/
```

## Component Rules

- Use `<script setup lang="ts">`.
- Props and emits must be typed.
- Prefer computed state over watchers.
- Watchers need a concrete reason: persistence, subscriptions, or imperative integrations.
- Generic UI stays in `components/ui` or `components/patterns`.
- Feature components stay inside their feature folder.
- Components that fetch data should usually be feature views or feature containers.

## Styling

Use all three styling tools with clear ownership:

- **Tailwind**: utility classes, responsive layout, and token-based color utilities (`bg-primary`, `text-muted-foreground`, etc.).
- **shadcn/vue**: accessible primitives and base visual language.
- **UnoCSS**: shortcuts (`surface-card`, `h-stack`, `focus-ring`), icon utilities (`i-lucide-*`), and dynamic atomic utilities not covered by Tailwind.

Token values live in `src/shared/styles/tokens.css` as CSS custom properties.
Both Tailwind and UnoCSS `theme.colors` **mirror** those variables — this intentional duplication is necessary because each tool generates CSS independently for its own utility classes. Keep the two `theme.colors` maps in sync; the CSS file is the single source of truth for the actual values.

## HTTP

- All requests use the `http` singleton from `src/shared/http/client.ts` (`createHttpClient` factory).
- Feature API functions accept an optional `init` bag (`Pick<RequestOptions, 'signal'>`) and forward it to the client, enabling caller-controlled cancellation.
- Response schemas are parsed in the API module (`zod.parse`), not inside the client.
- UI receives `AppError` instances only — never raw `Response`, `DOMException`, or axios errors.

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

Ignore `AbortError` — it is not a real error from the user's perspective.

## Public Functions

Place public utility functions in `src/shared/lib`. A utility must be pure, typed, and tested when it handles dates, money, permissions, or state transitions.

## Recommended Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Template Index

| File | Purpose |
|------|---------|
| `templates/vue/package.json` | Pinned dependencies + scripts |
| `templates/vue/tsconfig.json` | Strict TS config with `@` alias |
| `templates/vue/vite.config.ts` | Vite + UnoCSS plugin + `@` alias |
| `templates/vue/uno.config.ts` | UnoCSS shortcuts, icons, mirrored token colors |
| `templates/vue/tailwind.config.ts` | Tailwind token colors + border-radius |
| `templates/vue/eslint.config.js` | ESLint flat config for TS + Vue |
| `templates/vue/.env.example` | Required env variables |
| `templates/vue/src/shared/styles/tokens.css` | CSS custom properties (source of truth for token values) |
| `templates/vue/src/shared/http/client.ts` | `createHttpClient` factory |
| `templates/vue/src/shared/http/errors.ts` | `AppError` class + `toAppError` |
| `templates/vue/src/shared/http/errors.test.ts` | Canonical unit test example |
| `templates/vue/src/shared/lib/cn.ts` | `clsx` + `tailwind-merge` helper |
| `templates/vue/src/features/user/*` | Full feature slice (api / composable / component / view / schema) |

