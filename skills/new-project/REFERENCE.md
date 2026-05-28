# /new-project Workflow Reference

Condensed reference for offline use and contributor onboarding. The canonical source is `workflows/new-project.md` in the frontend-rules repo.

## Repo Source

```
GitHub:    wh-kerwin/Frontend-vibeCoging-Rule (branch: main)
RAW base:  https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/
API base:  https://api.github.com/repos/wh-kerwin/Frontend-vibeCoging-Rule/contents/
```

Local override: set `FRONTEND_RULES_ROOT` env var to a local clone path.

## Fetch Strategy

For every file reference (`shared/snippets/<path>`, `workflows/matrices/<file>`, `boundaries/<path>`):

1. **Local first** — if `FRONTEND_RULES_ROOT/<path>` exists, read it
2. **RAW URL** — `GET <RAW_BASE>/<path>`
3. **API fallback** — `GET <API_BASE>/<path>`, base64-decode `content` field

Cache fetched content in conversation memory. Never re-fetch the same path.

## Stage 0 — Preflight

1. Check cwd is empty (`ls -A`). Abort if not.
2. Fetch all `boundaries/common/` files (coding-style, design-system, http-contract, directory-rules, async-states, encapsulation).
3. Announce readiness.

## Stage 1 — Mandatory Questions

Ask all four together (native UI) or one-at-a-time (text-only tools).

### Q1 — Project type (stack)

1. `vue` — Vue 3 web app
2. `react` — React web app
3. `react-native` — React Native (Expo)
4. `electron` — Electron desktop
5. `node-fullstack` — Node full-stack monorepo

### Q2 — UI library (depends on Q1)

**Vue**: shadcn-vue (rec), naive-ui, element-plus, ant-design-vue, headless-only
**React**: shadcn-ui (rec), mantine, chakra, radix-only
**React Native**: native-primitives (rec), tamagui, gluestack
**Electron / node-fullstack**: skip (asked in nested matrix)

### Q3 — Atomic CSS (depends on Q1)

**Vue/React**: tailwind-v4+unocss (rec), tailwind-v4, unocss, none
**React Native**: nativewind (rec), none
**Electron / node-fullstack**: skip

### Q4 — Package manager

1. `pnpm` (rec)
2. `npm`
3. `yarn`
4. `bun`

### Cross-stack follow-ups

- **Electron**: ask `renderer_framework` — vue or react
- **Node full-stack**: ask `web_framework` — vue, react, or none (API-only)

## Stage 2 — Optional Deep-Dive

Ask: "Customize beyond defaults?" → `defaults` or `customize`.

If customize, ask per-stack optional dimensions (from matrix):

- **vue**: routing, state, data, forms, tests, animation
- **react**: build_tool, routing, state, data, forms, tests, animation
- **react-native**: routing, state, data, forms, tests, animation, secure_storage
- **electron**: build_tool, storage, tests, updates
- **node-fullstack**: api_framework, orm, database, tests, contracts_package

### Global customization (all stacks)

- **Theme**: light-dark-system (rec), light-only, dark-only
- **Theme preset**: shadcn-neutral (rec), voltagent
- **I18n**: none (rec), or stack-specific library (vue-i18n / react-i18next / expo-localization+i18next)
  - If i18n enabled: ask default locale (default: zh-CN), supported locales (default: zh-CN, en-US)

## Stage 3 — Matrix Lookup

1. Fetch `workflows/matrices/<stack>.matrix.md`
2. Start from `Defaults` table, override with user answers
3. Output resolved summary table
4. Confirm: "Generate this project? yes / change"

### Nested matrix delegation

- **electron + vue renderer**: apply vue matrix rooted at `src/renderer/`
- **electron + react renderer**: apply react matrix rooted at `src/renderer/`
- **node-fullstack + vue web**: apply vue matrix rooted at `apps/web/`
- **node-fullstack + react web**: apply react matrix rooted at `apps/web/`

## Stage 4 — Generation

### 4A — Skeleton

Write `package.json`, config files (`tsconfig.json`, `vite.config.ts`, etc.), `components.json` (for shadcn), directory structure.

### 4B — Snippets

Fetch snippets from `shared/snippets/` and substitute placeholders:

| Placeholder | Replacement |
|---|---|
| `%API_BASE_VAR%` | Stack-specific env var (VITE_API_BASE_URL, NEXT_PUBLIC_API_BASE_URL, etc.) |
| `%FEATURE_NAME%` | Feature name in lowercase |
| `%FeatureName%` | Feature name in PascalCase |
| `%PACKAGE_NAME%` | Project name from package.json |

### 4C — AGENT.md and CLAUDE.md

Fetch `shared/snippets/project-docs/AGENT.md.tmpl` and `CLAUDE.md.tmpl`, substitute all `%PLACEHOLDER%` tokens from the resolved config, write to project root.

Key placeholders: `%STACK%`, `%UI_LIBRARY%`, `%ATOMIC_CSS%`, `%ROUTING%`, `%STATE_LIB%`, `%DATA_LIB%`, `%FORMS_LIB%`, `%TESTS_LIB%`, `%ANIMATION_LIB%`, `%ICONS_LIB%`, `%PACKAGE_MANAGER%`, `%THEME_MODE%`, `%THEME_PRESET%`, `%I18N_LIBRARY%`, `%DEFAULT_LOCALE%`, `%DATA_DIR%`, `%VIEWS_DIR%`, `%UI_INSTALL_HINT%`, `%UI_INSTALL_HINT_INLINE%`, `%REPO_RAW_BASE%`.

### 4D — CLIs

Run `<pm> install`. Auto-run non-interactive post-init CLIs (e.g., `shadcn-vue add button card input dialog label`). Announce interactive ones for the user to run.

**Never run `shadcn init` / `shadcn-vue init`** — `components.json` is hand-written.

## Stage 5 — Report

Print file list, CLI results, next steps (fill .env.local, run dev, typecheck/lint/test).

## Operating Principles

1. **Question UX is tool-dependent**: native-UI tools batch up to 4 `AskUserQuestion` calls; text-only tools ask one at a time with numbered options.
2. **No silent tech decisions**: ambiguous choices → ask. Defaults are explicit.
3. **Snippets are verbatim**: fetch and copy; only substitute documented placeholders.
4. **`shadcn init` never run**: `components.json` is hand-written.
5. **Stop on error**: any write/fetch/CLI failure → stop and report partial state.
6. **Architecture docs win**: when a generated file conflicts with `boundaries/<stack>/ARCHITECTURE.md`, the doc is right.

## UI Install Hint Mapping

| UI Library | Install hint |
|---|---|
| shadcn-vue | `<pm> dlx shadcn-vue@latest add <component>` |
| shadcn-ui | `<pm> dlx shadcn@latest add <component>` |
| naive-ui | `import { ... } from 'naive-ui'` (pre-installed) |
| element-plus | `import { ... } from 'element-plus'` (pre-installed) |
| ant-design-vue | `import { ... } from 'ant-design-vue'` (pre-installed) |
| headless-only (vue) | `import { ... } from 'reka-ui'` |
| mantine | `import { ... } from '@mantine/core'` (pre-installed) |
| chakra | `import { ... } from '@chakra-ui/react'` (pre-installed) |
| radix-only | `<pm> add @radix-ui/react-<primitive>` |
| native-primitives | compose with View/Text/Pressable |
| tamagui | `import { ... } from 'tamagui'` (pre-installed) |
| gluestack | `import { ... } from '@gluestack-ui/themed'` (pre-installed) |

## Supported Stacks Quick Reference

| Stack | Arch doc | Matrix |
|---|---|---|
| Vue | `boundaries/vue/ARCHITECTURE.md` | `workflows/matrices/vue.matrix.md` |
| React | `boundaries/react/ARCHITECTURE.md` | `workflows/matrices/react.matrix.md` |
| React Native | `boundaries/react-native/ARCHITECTURE.md` | `workflows/matrices/react-native.matrix.md` |
| Electron | `boundaries/electron/ARCHITECTURE.md` | `workflows/matrices/electron.matrix.md` |
| Node full-stack | `boundaries/node-fullstack/ARCHITECTURE.md` | `workflows/matrices/node-fullstack.matrix.md` |
