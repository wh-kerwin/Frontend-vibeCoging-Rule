# React Project Matrix

Drives the generation step of `workflows/new-project.md` for the React stack. Same shape as `vue.matrix.md` — see that file for the format reference.

## Identifier

`react`

## Version baseline (as of 2026-05)

- React 19.2.x
- React DOM 19.2.x
- Vite 8.x (when build_tool: vite)
- Next.js 15.x (when build_tool: next)
- TypeScript 5.8.x
- Node 22 LTS
- Tailwind CSS 4.x
- UnoCSS 66.x

Use caret ranges in generated `package.json`.

## Defaults

| Dimension | Default |
|---|---|
| `build_tool` | `vite` |
| `ui_library` | `shadcn-ui` |
| `atomic_css` | `tailwind-v4+unocss` |
| `routing` | `react-router` |
| `state` | `zustand` |
| `data` | `tanstack-query` |
| `forms` | `react-hook-form+zod` |
| `tests` | `vitest` |
| `animation` | `motion` |
| `icons` | `lucide-react` |

## Choices

### Choices.build_tool

#### `vite` (default)
- `dev_deps`: `vite ^8.0`, `@vitejs/plugin-react ^4.5`
- `writes`: `vite.config.ts` (alias `@` + plugins), `index.html`, `src/main.tsx`

#### `next`
- `deps`: `next ^15.0`
- `writes`: Next.js App Router layout (`app/layout.tsx`, `app/page.tsx`), `next.config.ts`. No `index.html`, no `vite.config.ts`.
- When Next is selected, `routing: react-router` is replaced with App Router (file-based) and `state` defaults shift toward server components where appropriate.

### Choices.ui_library

#### `shadcn-ui` (default)
- `deps`: `@radix-ui/react-slot ^1.1`, `class-variance-authority ^0.7`, `clsx ^2.1`, `tailwind-merge ^3.3`, `tw-animate-css ^1.4`
- Radix UI primitives are added per-component as `shadcn-ui add` is run later. Do not predeclare them all.
- `dev_deps`: `shadcn ^2.4` (the React-flavored CLI)
- `cli`: none for init — workflow hand-writes `components.json` below; post-install runs `pnpm dlx shadcn@latest add button card input dialog label`
- `writes`: `components.json` (inline below)
- `snippets`: `lib/cn.ts`

```json
// components.json — write verbatim
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/shared/styles/tokens.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/shared/lib/cn",
    "ui": "@/components/ui",
    "lib": "@/shared/lib",
    "hooks": "@/shared/hooks"
  },
  "iconLibrary": "lucide"
}
```

When `build_tool: next` is selected, set `"rsc": true` and adjust aliases to the Next.js convention.

#### `mantine`
- `deps`: `@mantine/core ^7.13`, `@mantine/hooks ^7.13`
- `writes`: `MantineProvider` wrap in `src/main.tsx`; import `@mantine/core/styles.css`

#### `chakra`
- `deps`: `@chakra-ui/react ^3.0`, `@emotion/react ^11.13`
- `writes`: `ChakraProvider` wrap in `src/main.tsx`

#### `radix-only`
- `deps`: per-component Radix packages added via `shadcn add`. Same `cn.ts` snippet.

### Choices.atomic_css

#### `tailwind-v4+unocss` (default)
- `deps`: `tailwindcss ^4.3`
- `dev_deps`: `@tailwindcss/vite ^4.3` (Vite) or `@tailwindcss/postcss ^4.3` (Next), `unocss ^66.6`, `@iconify-json/lucide ^1.2`
- `writes`:
  - `src/shared/styles/tokens.css` — from `shared/snippets/styles/tokens.shadcn.css` (or `tokens.voltagent.css`)
  - `uno.config.ts` (inline — same shortcuts as Vue matrix)
- Imported once in `src/main.tsx` via `import '@/shared/styles/tokens.css'`

#### `tailwind-v4`
- Same minus UnoCSS. Use `lucide-react` components for icons.

#### `unocss`
- Atomic CSS via UnoCSS only.

#### `none`
- CSS Modules or vanilla CSS. `tokens.css` still written for design tokens.

### Choices.routing

#### `react-router` (default — when build_tool: vite)
- `deps`: `react-router ^7.15`
- `writes`: `src/app/routes/router.tsx` (route table), `BrowserRouter` wrap in `src/main.tsx`

#### `app-router` (forced when build_tool: next)
- File-based via `app/` directory at repo root. No router config file.

#### `none`
- No routing. Single-page state-driven app.

### Choices.state

#### `zustand` (default)
- `deps`: `zustand ^5.0`
- `writes`: `src/stores/` directory; one store file per cross-page concern (auth, theme).

#### `jotai`
- `deps`: `jotai ^2.10`

#### `redux-toolkit`
- `deps`: `@reduxjs/toolkit ^2.4`, `react-redux ^9.1`
- `writes`: `src/stores/store.ts` (`configureStore`), `Provider` wrap in `src/main.tsx`

#### `none`
- Local `useState`/`useReducer` + Context only.

### Choices.data

#### `tanstack-query` (default)
- `deps`: `@tanstack/react-query ^5.100`
- `writes`: `src/app/providers/QueryProvider.tsx` from `shared/snippets/query/QueryProvider.tsx`
- Wrap `<App />` with `<QueryProvider>` in `src/main.tsx`.

#### `swr`
- `deps`: `swr ^2.3`

#### `fetch-only`
- No additional deps.

### Choices.forms

#### `react-hook-form+zod` (default)
- `deps`: `react-hook-form ^7.54`, `@hookform/resolvers ^3.10`, `zod ^4.4`

#### `formik`
- `deps`: `formik ^2.4`, `zod ^4.4`

#### `none`
- Validate with Zod inline.

### Choices.tests

#### `vitest` (default)
- `dev_deps`: `vitest ^4.1`, `@testing-library/react ^16.1`, `@testing-library/user-event ^14.5`, `jsdom ^25.0`
- `writes`: `package.json` `"test": "vitest run"`. Use the `errors.test.ts` snippet as the canonical shape.

#### `playwright`
- For E2E only; pair with `vitest` for unit tests.

#### `none`
- Omit test scripts.

### Choices.animation

#### `motion` (default)
- `deps`: `motion ^11.15` (the package was renamed from `framer-motion`)

#### `none`
- Use `tw-animate-css` utility classes (already pulled in by shadcn-ui choice).

## Universal writes (every React project)

| Path | Source |
|---|---|
| `package.json` | Assembled |
| `vite.config.ts` (when build_tool: vite) | Inline (alias `@` → `./src` + plugins) |
| `next.config.ts` (when build_tool: next) | Inline minimal |
| `tsconfig.json` | `shared/snippets/config/tsconfig.strict.json` + add `"jsx": "react-jsx"` |
| `eslint.config.js` | `shared/snippets/config/eslint.flat.ts.js` + add `eslint-plugin-react-hooks` block |
| `.env.example` | `shared/snippets/config/env.example` with `%API_BASE_VAR%` → `VITE_API_BASE_URL` (vite) or `NEXT_PUBLIC_API_BASE_URL` (next) |
| `src/main.tsx` (vite) / `app/layout.tsx` (next) | Inline — provider stack assembled from selected choices |
| `src/App.tsx` (vite) / `app/page.tsx` (next) | Inline minimal placeholder |
| `src/shared/http/client.ts` | `shared/snippets/http/client.web.ts` with placeholder substituted |
| `src/shared/http/errors.ts` | `shared/snippets/http/errors.client.ts` |
| `src/shared/http/errors.test.ts` | `shared/snippets/http/errors.test.ts` (when tests selected) |
| `src/config/env.ts` | Inline — typed env wrapper |

## Post-init CLI

| Choice | Command | Mode |
|---|---|---|
| `tests: vitest` | `<pm> install` | auto |
| `ui_library: shadcn-ui` | `<pm> dlx shadcn@latest add button card input dialog label` | auto |

Do **not** run `shadcn init` — `components.json` is hand-written above.

## Feature exemplar (show inline; do not auto-write)

For each feature requested, generate (substituting `%FEATURE_NAME%` lowercase, `%FeatureName%` PascalCase):

- `src/features/%FEATURE_NAME%/schemas/%FEATURE_NAME%.schema.ts` — Zod schema + inferred type
- `src/features/%FEATURE_NAME%/api/%FEATURE_NAME%.api.ts` — `get%FeatureName%(id, init?)`
- `src/features/%FEATURE_NAME%/hooks/use%FeatureName%.ts` — `useQuery({ queryKey: [...], queryFn: ({ signal }) => get%FeatureName%(id, { signal }) })`
- `src/features/%FEATURE_NAME%/components/%FeatureName%Card.tsx` — presentational, typed props
- `src/features/%FEATURE_NAME%/views/%FeatureName%View.tsx` — handles the four async states from `boundaries/common/async-states.md`
