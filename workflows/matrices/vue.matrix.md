# Vue Project Matrix

Drives the generation step of `workflows/new-project.md` for the Vue stack. The workflow reads `Defaults` first, then overrides with the user's Stage 1 / Stage 2 answers, then walks `Universal writes` and the selected `Choices.<dimension>` blocks to assemble files.

## Identifier

`vue`

## Version baseline (as of 2026-05)

- Vue 3.5.x
- Vite 8.x
- TypeScript 5.8.x
- Node 22 LTS
- Tailwind CSS 4.x
- UnoCSS 66.x

Use caret ranges in generated `package.json` unless a known major regression demands a pin.

## Defaults

| Dimension | Default |
|---|---|
| `ui_library` | `shadcn-vue` |
| `atomic_css` | `tailwind-v4+unocss` |
| `routing` | `vue-router` |
| `state` | `pinia` |
| `data` | `tanstack-query` |
| `forms` | `vee-validate+zod` |
| `tests` | `vitest` |
| `animation` | `motion-v` |
| `icons` | `@lucide/vue` |

## Choices

### Choices.ui_library

#### `shadcn-vue` (default)
- `deps`: `reka-ui ^2.8`, `class-variance-authority ^0.7`, `clsx ^2.1`, `tailwind-merge ^3.3`, `tw-animate-css ^1.4`
- `dev_deps`: `shadcn-vue ^2.7`, `@iconify-json/lucide ^1.2` (only when UnoCSS selected)
- `cli`: none — workflow hand-writes `components.json` (see Universal writes); post-install runs `pnpm dlx shadcn-vue@latest add button card input dialog label` to seed primitives
- `writes`: `components.json` (inline below)
- `snippets`: `lib/cn.ts`

```json
// components.json — write verbatim
{
  "$schema": "https://shadcn-vue.com/schema.json",
  "style": "new-york",
  "typescript": true,
  "tailwind": {
    "config": "",
    "css": "src/shared/styles/tokens.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "composables": "@/shared/composables",
    "lib": "@/shared/lib",
    "utils": "@/shared/lib/cn"
  },
  "iconLibrary": "lucide"
}
```

#### `naive-ui`
- `deps`: `naive-ui ^2.39`
- `writes`: import the global styles in `src/main.ts` (Naive uses CSS-in-JS, no `components.json`)
- `snippets`: none — Naive is consumed as-is from the package

#### `element-plus`
- `deps`: `element-plus ^2.8`
- `writes`: import `element-plus/dist/index.css` in `src/main.ts`
- `snippets`: none

#### `ant-design-vue`
- `deps`: `ant-design-vue ^4.2`
- `writes`: import `ant-design-vue/dist/reset.css` in `src/main.ts`
- `snippets`: none

#### `headless-only`
- `deps`: `reka-ui ^2.8` (primitives only)
- `snippets`: `lib/cn.ts` (still useful with Tailwind)

### Choices.atomic_css

#### `tailwind-v4+unocss` (default)
- `deps`: `tailwindcss ^4.3`
- `dev_deps`: `@tailwindcss/vite ^4.3`, `unocss ^66.6`, `@unocss/reset ^66.6`, `@iconify-json/lucide ^1.2`
- `writes`:
  - `src/shared/styles/tokens.css` — from `shared/snippets/styles/tokens.shadcn.css` (or `tokens.voltagent.css` if VoltAgent design preset chosen)
  - `uno.config.ts` (inline below)
- `vite_plugins`: `tailwindcss()`, `UnoCSS()`

```ts
// uno.config.ts — write verbatim
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind3({ preflight: false }),
    presetAttributify(),
    presetIcons({
      scale: 1.1,
      warn: true,
      collections: {
        lucide: () => import('@iconify-json/lucide/icons.json').then((m) => m.default),
      },
    }),
  ],
  shortcuts: {
    'v-stack': 'flex flex-col',
    'h-stack': 'flex items-center',
    'surface-card': 'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
    'focus-ring':
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  },
  transformers: [transformerDirectives(), transformerVariantGroup()],
})
```

#### `tailwind-v4`
- Same as above minus UnoCSS pieces. No `uno.config.ts`. Use `@lucide/vue` for all icons.

#### `unocss`
- `dev_deps`: `unocss ^66.6`, `@unocss/reset ^66.6`, `@iconify-json/lucide ^1.2`
- No Tailwind. `src/shared/styles/tokens.css` defines CSS variables only; UnoCSS theme mirrors them.

#### `none`
- No atomic CSS. CSS Modules or vanilla CSS. `src/shared/styles/tokens.css` is still written for the design tokens.

### Choices.routing

#### `vue-router` (default)
- `deps`: `vue-router ^5.0`
- `writes`: `src/app/router.ts` (route table), wire `app.use(router)` in `src/main.ts`

#### `none`
- No router. `src/pages/` is not created.

### Choices.state

#### `pinia` (default)
- `deps`: `pinia ^2.2`
- `writes`: wire `app.use(createPinia())` in `src/main.ts`. Create `src/stores/` directory.

#### `none`
- Use `ref`/`reactive` + `provide`/`inject` inside feature folders.

### Choices.data

#### `tanstack-query` (default)
- `deps`: `@tanstack/vue-query ^5.100`
- `writes`: `src/app/providers/QueryProvider.vue` (small wrapper around `VueQueryPlugin`), mount in `src/main.ts`

#### `fetch-only`
- No additional deps. Composables build on top of `http` directly with `ref` + `watchEffect`.

### Choices.forms

#### `vee-validate+zod` (default)
- `deps`: `vee-validate ^4.13`, `@vee-validate/zod ^4.13`, `zod ^4.4`

#### `none`
- No additional deps. Validate with Zod inline; no field-level integration.

### Choices.tests

#### `vitest` (default)
- `dev_deps`: `vitest ^4.1`, `@vue/test-utils ^2.4`, `jsdom ^25.0`
- `writes`: ensure `package.json` has `"test": "vitest run"`. The `errors.test.ts` snippet is the canonical shape.

#### `none`
- Omit test scripts and dev_deps.

### Choices.animation

#### `motion-v` (default)
- `deps`: `motion-v ^1.7`

#### `none`
- No animation library; rely on Reka UI's `data-[state=...]` attributes + CSS transitions.

## Universal writes (every Vue project)

| Path | Source |
|---|---|
| `package.json` | Assembled from `Defaults`/user choices + matrix `deps`/`dev_deps` lists |
| `vite.config.ts` | Inline (alias `@` → `./src`, + plugins from selected choices) |
| `tsconfig.json` | `shared/snippets/config/tsconfig.strict.json` + add `"jsx": "preserve"` |
| `eslint.config.js` | `shared/snippets/config/eslint.flat.ts.js` + add `eslint-plugin-vue` block |
| `.env.example` | `shared/snippets/config/env.example` with `%API_BASE_VAR%` → `VITE_API_BASE_URL` |
| `src/main.ts` | Inline — `createApp(App)` + selected plugins (router/pinia/Query) + mount |
| `src/App.vue` | Inline minimal shell — `<RouterView />` if router, else `<HelloWorld />` placeholder |
| `src/shared/http/client.ts` | `shared/snippets/http/client.web.ts` with `%API_BASE_VAR%` → `VITE_API_BASE_URL` |
| `src/shared/http/errors.ts` | `shared/snippets/http/errors.client.ts` |
| `src/shared/http/errors.test.ts` | `shared/snippets/http/errors.test.ts` (only when tests selected) |
| `src/config/env.ts` | Inline — typed wrapper around `import.meta.env`, exports `env.apiBaseUrl` |

## vite.config.ts assembly template

```ts
import vue from '@vitejs/plugin-vue'
%TAILWIND_IMPORT%
%UNOCSS_IMPORT%
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()%TAILWIND_PLUGIN%%UNOCSS_PLUGIN%],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173, strictPort: false },
})
```

`%TAILWIND_IMPORT%` = `import tailwindcss from '@tailwindcss/vite'` (only when Tailwind selected), `%TAILWIND_PLUGIN%` = `, tailwindcss()`. Same shape for UnoCSS.

## Post-init CLI (announce, do not auto-run when interactive)

| Choice | Command | Mode |
|---|---|---|
| `tests: vitest` | `<pm> install` | auto |
| `ui_library: shadcn-vue` | `<pm> dlx shadcn-vue@latest add button card input dialog label` | auto (non-interactive — shadcn-vue add accepts component list as args) |

Do **not** run `shadcn-vue init` — `components.json` is hand-written above.

## Feature exemplar (show inline; do not auto-write)

When the user asks for a feature scaffold, generate this slice (substituting `%FEATURE_NAME%` for the feature name in lowercase, `%FeatureName%` for PascalCase):

- `src/features/%FEATURE_NAME%/schemas/%FEATURE_NAME%.schema.ts` — Zod schema + inferred type
- `src/features/%FEATURE_NAME%/api/%FEATURE_NAME%.api.ts` — `get%FeatureName%(id, init?)` returning parsed type
- `src/features/%FEATURE_NAME%/composables/use%FeatureName%.ts` — `watchEffect` + `AbortController` (or `useQuery` when tanstack-query selected)
- `src/features/%FEATURE_NAME%/components/%FeatureName%Card.vue` — presentational, props-typed
- `src/features/%FEATURE_NAME%/views/%FeatureName%View.vue` — orchestrates the four async states from `boundaries/common/async-states.md`
