---
name: new-project
description: Interactive workflow to scaffold a new frontend project. Asks for project type (Vue/React/React Native/Electron/Node full-stack), UI library, atomic CSS, and package manager, then generates a complete, runnable project assembled from canonical frontend-rules boundaries and snippets. Use when the user says "/new-project", "create a new project", "scaffold a project", "bootstrap a frontend app", or asks to start a new frontend project from scratch.
---

# /new-project — Frontend Project Scaffolding (Standalone)

Self-contained version. No pre-fetch of `workflows/new-project.md` required — all protocol stages are inline. Snippets and matrices are still fetched on-demand from the canonical repo, with fallback defaults when offline.

## Repo Source

```
GitHub:    wh-kerwin/Frontend-vibeCoging-Rule (branch: main)
RAW base:  https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/
API base:  https://api.github.com/repos/wh-kerwin/Frontend-vibeCoging-Rule/contents/
```

If `FRONTEND_RULES_ROOT` env var is set, read local files instead of fetching.

## Fetch Strategy

For `shared/snippets/<path>`, `workflows/matrices/<file>`, `boundaries/<path>`:

1. **Local first** — `FRONTEND_RULES_ROOT/<path>` if set
2. **RAW URL** — `GET <RAW_BASE>/<path>`
3. **API fallback** — `GET <API_BASE>/<path>`, base64-decode `content`

Cache fetched content in conversation memory. Never re-fetch the same path. If all sources fail, use inline defaults from this file.

---

## Stage 0 — Preflight

1. **Check cwd is empty.** Run `ls -A`. Abort if anything present other than `.git/`:
   > Working directory is not empty. Please `cd` into an empty directory and re-run.

2. **Load common rules.** Fetch `boundaries/common/` files (coding-style, design-system, http-contract, directory-rules, async-states, encapsulation). Cache them.

3. Announce: "Workspace is empty. Loaded common engineering boundaries. Starting interactive setup."

---

## Stage 1 — Mandatory Questions

### Question UX

- **Tools with native multi-select** (Claude Code): batch all 4 in one `AskUserQuestion`.
- **Text-only tools**: ask one at a time with numbered options. Wait for reply before next.

### Q1 — Project type (`stack`)

1. `vue` — Vue 3 web app. Vite + SFC + composables.
2. `react` — React web app. Vite or Next.js.
3. `react-native` — React Native (Expo). iOS/Android with Expo Router.
4. `electron` — Electron desktop. Hardened main + preload + framework renderer.
5. `node-fullstack` — Node full-stack monorepo. API + (optional) web app.

### Q2 — UI library (`ui_library`)

**If Q1 = vue:**
1. `shadcn-vue` (recommended) — Reka UI primitives, copy-paste components, Tailwind-driven.
2. `naive-ui` — Comprehensive component set, themable.
3. `element-plus` — Mature enterprise components.
4. `ant-design-vue` — Ant Design system for Vue.
5. `headless-only` — Reka UI primitives only.

**If Q1 = react:**
1. `shadcn-ui` (recommended) — Radix primitives, copy-paste components, Tailwind-driven.
2. `mantine` — Hooks + styled components, dark mode built in.
3. `chakra` — Style-prop driven component library.
4. `radix-only` — Radix primitives only.

**If Q1 = react-native:**
1. `native-primitives` (recommended) — View/Text/Pressable + own patterns.
2. `tamagui` — Cross-platform styled components.
3. `gluestack` — Themable component library.

**If Q1 = electron or node-fullstack:** skip Q2 (asked in nested matrix).

### Q3 — Atomic CSS (`atomic_css`)

**If Q1 = vue or react:**
1. `tailwind-v4+unocss` (recommended) — Tailwind colors/spacing + UnoCSS shortcuts + icons.
2. `tailwind-v4` — Tailwind v4 only, CSS-first config.
3. `unocss` — UnoCSS only.
4. `none` — CSS Modules or vanilla CSS.

**If Q1 = react-native:**
1. `nativewind` (recommended) — Tailwind syntax for RN.
2. `none` — StyleSheet.create only.

**If Q1 = electron or node-fullstack:** skip Q3.

### Q4 — Package manager (`package_manager`)

1. `pnpm` (recommended)
2. `npm`
3. `yarn`
4. `bun`

### Cross-stack follow-ups

**If Q1 = electron** — ask `renderer_framework`:
1. `vue` — renderer at `src/renderer/`
2. `react` — renderer at `src/renderer/`

**If Q1 = node-fullstack** — ask `web_framework`:
1. `vue` — `apps/web/` is Vue
2. `react` — `apps/web/` is React
3. `none` — API-only, no web app

---

## Stage 2 — Optional Deep-Dive

Ask: "Customize beyond defaults?"

1. `defaults` (recommended) — Apply the Defaults table. Fast path.
2. `customize` — Pick routing/state/data/forms/tests/animation individually.

### Defaults by Stack

| Dimension | Vue | React | React Native | Electron | Node Full-stack |
|---|---|---|---|---|---|
| routing | vue-router | react-router | expo-router | — | — |
| state | pinia | zustand | zustand | — | — |
| data | tanstack-query | tanstack-query | tanstack-query | — | — |
| forms | vee-validate+zod | react-hook-form+zod | react-hook-form+zod | — | — |
| tests | vitest | vitest | vitest+jest-expo | vitest | vitest |
| animation | motion-v | motion | reanimated | — | — |
| icons | lucide-vue-next | lucide-react | lucide-react-native | — | — |
| build_tool | vite (fixed) | vite (default) | — | electron-vite | — |
| api_framework | — | — | — | — | hono |
| orm | — | — | — | — | drizzle |
| database | — | — | — | — | sqlite |

### If customize: per-stack optional dimensions

**Vue:** routing, state, data, forms, tests, animation
**React:** build_tool, routing, state, data, forms, tests, animation
**React Native:** routing, state, data, forms, tests, animation, secure_storage
**Electron:** build_tool, storage, tests, updates
**Node full-stack:** api_framework, orm, database, tests, contracts_package

### Global customization (all stacks)

**Theme (`theme`):**
1. `light-dark-system` (recommended) — Light/Dark/System, auto detection + manual toggle + persistence.
2. `light-only` — Light tokens only.
3. `dark-only` — Dark tokens only.

**Theme preset (`theme_preset`):**
1. `shadcn-neutral` (recommended) — Standard neutral palette.
2. `voltagent` — Dark engineering command-center theme.

**I18n (`i18n`):**
1. `none` (recommended) — No i18n, hard-coded strings.
2. Stack-specific: vue → `vue-i18n`, react → `react-i18next`, react-native → `expo-localization+i18next`, electron/node-fullstack → inherits from renderer.

If i18n ≠ none:
- Default locale: free text, default `zh-CN`
- Supported locales: comma-separated, default `zh-CN, en-US`

---

## Stage 3 — Matrix Lookup

1. Fetch `workflows/matrices/<stack>.matrix.md` from the repo.
2. Start from the matrix's `Defaults` table. Override with user answers.
3. Output a resolved summary table:

```
Stack:           vue
UI library:      shadcn-vue
Atomic CSS:      tailwind-v4+unocss
Package manager: pnpm
Routing:         vue-router          (default)
State:           pinia               (default)
Data:            tanstack-query      (default)
Forms:           vee-validate+zod    (default)
Tests:           vitest              (default)
Animation:       motion-v            (default)
Theme:           light-dark-system   (default)
Theme preset:    shadcn-neutral      (default)
I18n:            none                (default)
```

4. Confirm: "Generate this project? Reply `yes` to generate or `change` to revise."

### Nested matrix delegation

- **electron + vue renderer**: apply vue matrix rooted at `src/renderer/`
- **electron + react renderer**: apply react matrix rooted at `src/renderer/`
- **node-fullstack + vue web**: apply vue matrix rooted at `apps/web/`
- **node-fullstack + react web**: apply react matrix rooted at `apps/web/`

---

## Stage 4 — Generation

### 4A — Skeleton

Build file list from matrix `Universal writes` + selected choice `writes`:

1. `package.json` — union of deps/dev_deps across chosen choices + scripts. Use caret ranges.
2. Config files: `tsconfig.json`, `vite.config.ts` (or `next.config.ts` / `electron.vite.config.ts` / `metro.config.js`), `eslint.config.js`, `.env.example`.
3. `components.json` (shadcn-vue/shadcn-ui) — write verbatim from matrix. **Do not run `shadcn init`.**
4. Create directories: `src/stores/`, `src/components/ui/`, `src/components/patterns/`, etc.

### 4B — Snippets

For each `snippets:` entry in the matrix, fetch from `shared/snippets/<path>`, substitute placeholders, write to project location.

**Placeholder table:**

| Placeholder | Replacement |
|---|---|
| `%API_BASE_VAR%` | Stack-specific: `VITE_API_BASE_URL` (Vite), `NEXT_PUBLIC_API_BASE_URL` (Next), `EXPO_PUBLIC_API_BASE_URL` (Expo) |
| `%PACKAGE_NAME%` | Project name from package.json |
| `%FEATURE_NAME%` | Feature name in lowercase |
| `%FeatureName%` | Feature name PascalCase |
| `%STACK%` | User's stack choice |
| `%UI_LIBRARY%` | UI library + description |
| `%ATOMIC_CSS%` | Atomic CSS choice |
| `%ROUTING%` | Routing choice |
| `%STATE_LIB%` | State library choice |
| `%DATA_LIB%` | Data fetching choice |
| `%FORMS_LIB%` | Forms choice |
| `%TESTS_LIB%` | Tests choice |
| `%ANIMATION_LIB%` | Animation choice |
| `%ICONS_LIB%` | Icons library |
| `%PACKAGE_MANAGER%` | pnpm / npm / yarn / bun |
| `%THEME_MODE%` | light-dark-system / light-only / dark-only |
| `%THEME_PRESET%` | shadcn-neutral / voltagent |
| `%I18N_LIBRARY%` | vue-i18n / react-i18next / none |
| `%DEFAULT_LOCALE%` | zh-CN / en-US / etc. |
| `%DATA_DIR%` | composables (vue) / hooks (react/RN) |
| `%DATA_HOOK_PATTERN%` | use<Name>.ts (composable) / use<Name>.ts (hook) |
| `%VIEWS_DIR%` | views (vue) / routes (react) / screens (RN) / pages (Next) |
| `%REPO_RAW_BASE%` | The RAW base URL above |
| `%UI_INSTALL_HINT%` | Fenced bash block from UI install mapping |
| `%UI_INSTALL_HINT_INLINE%` | Inline version from UI install mapping |

**UI install hint mapping:**

| UI Library | `%UI_INSTALL_HINT_INLINE%` |
|---|---|
| shadcn-vue | `<pm> dlx shadcn-vue@latest add <component>` |
| shadcn-ui | `<pm> dlx shadcn@latest add <component>` |
| naive-ui | `import { ... } from 'naive-ui'` (already installed) |
| element-plus | `import { ... } from 'element-plus'` (already installed) |
| ant-design-vue | `import { ... } from 'ant-design-vue'` (already installed) |
| headless-only | `import { ... } from 'reka-ui'` |
| mantine | `import { ... } from '@mantine/core'` (already installed) |
| chakra | `import { ... } from '@chakra-ui/react'` (already installed) |
| radix-only | `<pm> add @radix-ui/react-<primitive>` |
| native-primitives | compose with View/Text/Pressable from 'react-native' |
| tamagui | `import { ... } from 'tamagui'` (already installed) |
| gluestack | `import { ... } from '@gluestack-ui/themed'` (already installed) |

Pre-substitute `%PACKAGE_MANAGER%` inside `%UI_INSTALL_HINT%` before writing.

### 4C — Project-level AGENT.md and CLAUDE.md

Fetch from `shared/snippets/project-docs/`:
- `AGENT.md.tmpl` → write to `AGENT.md`
- `CLAUDE.md.tmpl` → write to `CLAUDE.md`

Substitute all `%PLACEHOLDER%` tokens from the resolved config. These files encode the per-project stack choices and the hard rule: **use the chosen UI library, never hand-roll components**.

### 4D — CLIs

Run `<pm> install`. Then auto-run non-interactive post-init CLIs (e.g., `shadcn-vue add button card input dialog label`). Announce interactive CLIs for manual execution.

**Never run `shadcn init` / `shadcn-vue init`** — `components.json` was hand-written in 4A.

---

## Stage 5 — Report

```
Files generated: <N>
  package.json
  tsconfig.json
  vite.config.ts
  components.json
  .env.example
  AGENT.md
  CLAUDE.md
  src/main.ts
  src/App.vue
  src/shared/http/client.ts         (snippet)
  src/shared/http/errors.ts         (snippet)
  src/shared/lib/cn.ts              (snippet)
  src/shared/styles/tokens.css      (snippet)
  src/config/env.ts
  ...

CLIs executed:
  <pm> install                                  ok
  <pm> dlx shadcn-vue@latest add button card...  ok

Next steps:
  1. Fill in .env.local from .env.example
  2. Run: <pm> dev
  3. Checks: <pm> typecheck && <pm> lint && <pm> test
  4. Read AGENT.md and CLAUDE.md for per-project rules
  5. For deeper boundaries, fetch from the canonical repo when needed

Open questions:
  - Auth strategy (none selected)
  - Backend origin
```

---

## Operating Principles

1. **Question UX is tool-dependent.** Native-multi-select tools (Claude Code) batch up to 4 per call. Text-only tools ask one at a time with numbered options as plain prose — never as YAML or `key: a|b|c` code blocks.
2. **No silent tech decisions.** Ambiguous → ask. Defaults are explicit and surfaced in Stage 3.
3. **Snippets are verbatim.** Fetch via strategy above, copy bytes, only substitute documented placeholders.
4. **`shadcn init` is never run.** `components.json` is hand-written.
5. **No backwards-compatibility scaffolding.** Pins current major versions per matrix `Version baseline`.
6. **Stop on error.** Any write fail / fetch 404 / CLI non-zero → stop and report partial state.
7. **Architecture docs win.** When generated file conflicts with `boundaries/<stack>/ARCHITECTURE.md`, the doc is right.

## Stack Quick Reference

| Stack | Matrix | Architecture |
|---|---|---|
| Vue | `workflows/matrices/vue.matrix.md` | `boundaries/vue/ARCHITECTURE.md` |
| React | `workflows/matrices/react.matrix.md` | `boundaries/react/ARCHITECTURE.md` |
| React Native | `workflows/matrices/react-native.matrix.md` | `boundaries/react-native/ARCHITECTURE.md` |
| Electron | `workflows/matrices/electron.matrix.md` | `boundaries/electron/ARCHITECTURE.md` |
| Node full-stack | `workflows/matrices/node-fullstack.matrix.md` | `boundaries/node-fullstack/ARCHITECTURE.md` |

## How to Install in Different Tools

### Claude Code
Install as a skill: `claude skills install wh-kerwin/Frontend-vibeCoging-Rule/skills/new-project`
Or use the thin [SKILL.md](SKILL.md) which fetches this workflow from GitHub.

### Codex
Copy this entire file into `~/.codex/AGENTS.md` (or append its content). Say `/new-project` in any empty directory.

### Cursor
Copy this entire file to `.cursor/rules/new-project.mdc` or append to `.cursorrules`. Say `/new-project`.

### Cline
Copy this entire file to `~/.cline/rules.md` (global) or project `.clinerules`. Say `/new-project`.

### Windsurf
Copy this entire file into `.windsurfrules`. Say `/new-project`.

### Any other AI tool
Copy this entire file into the tool's equivalent of "custom instructions" / "system prompt" / "rules" / "memory". The protocol is tool-agnostic — any AI that can read Markdown and fetch URLs can execute it.
