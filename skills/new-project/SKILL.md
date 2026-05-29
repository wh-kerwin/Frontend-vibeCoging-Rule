---
name: new-project
description: Interactive workflow to scaffold a new frontend project. Asks for project type (Vue/React/React Native/Electron/Node full-stack), UI library, atomic CSS, and package manager, then generates a complete, runnable project assembled from canonical frontend-rules boundaries and snippets. Use when the user says "/new-project", "create a new project", "scaffold a project", "bootstrap a frontend app", or asks to start a new frontend project from scratch.
---

# /new-project — Frontend Project Scaffolding

This skill generates a complete, runnable frontend project. Every stage is defined inline below — do NOT skip stages, reorder them, or invent your own questions. Execute from top to bottom.

## Repo Source

```
GitHub:    wh-kerwin/Frontend-vibeCoging-Rule (branch: main)
RAW base:  https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/
API base:  https://api.github.com/repos/wh-kerwin/Frontend-vibeCoging-Rule/contents/
```

If `FRONTEND_RULES_ROOT` env var is set, read from that local clone instead of the skill's `data/` directory (dev mode for editing rules).

## Fetch Strategy

This skill ships with all boundaries, matrices, and snippets inside `data/`. Read from there first — no network needed.

For every reference to `boundaries/<path>`, `workflows/matrices/<file>`, or `shared/snippets/<path>`:

1. **Skill local** — read `data/boundaries/<path>`, `data/matrices/<file>`, or `data/snippets/<path>` from this skill directory.
2. **FRONTEND_RULES_ROOT** — if env var is set, read `<FRONTEND_RULES_ROOT>/<path>` (dev mode).
3. **GitHub RAW** — `GET <RAW_BASE>/<path>` via WebFetch (fallback).
4. **GitHub API** — `GET <API_BASE>/<path>`, base64-decode `content` field (fallback when RAW blocked).

---

## Stage 0 — Preflight

1. **Check cwd is empty.** Run `ls -A`. Abort if anything present other than `.git/`:
   > Working directory is not empty. Please `cd` into an empty directory and re-run `/new-project`.

2. **Load common rules.** Read ALL six files from `data/boundaries/common/` in this skill directory: `coding-style.md`, `design-system.md`, `http-contract.md`, `directory-rules.md`, `async-states.md`, `encapsulation.md`. Cache in conversation memory.

3. Announce: "Workspace is empty. Loaded common engineering boundaries from `wh-kerwin/Frontend-vibeCoging-Rule@main`. Starting interactive setup."

---

## Stage 1 — Mandatory Questions

### Question UX rules

- **Tools with native multi-select UI** (Claude Code `AskUserQuestion`): batch all four into one call.
- **Text-only tools** (Codex CLI, Cursor terminal, Cline, etc.): ask **one question at a time** with numbered options as plain prose. Wait for reply before the next. Do NOT dump questions as YAML or `key: a|b|c` code blocks.

### Q1 — Project type (`stack`)

1. `vue` — Vue 3 web app. Vite + SFC + composables. Default for product/admin apps.
2. `react` — React web app. Vite or Next.js. Default for component-heavy apps.
3. `react-native` — React Native (Expo). iOS/Android cross-platform with Expo Router.
4. `electron` — Electron desktop. Hardened main + preload + framework renderer.
5. `node-fullstack` — Node full-stack monorepo. API + (optional) web app, shared TypeScript contracts.

Reply with a number (1-5) or the option name.

### Q2 — UI library (`ui_library`)

**If Q1 = vue:**
1. `shadcn-vue` (recommended) — Reka UI primitives, copy-paste components, Tailwind-driven.
2. `naive-ui` — Comprehensive component set, themable.
3. `element-plus` — Mature enterprise components.
4. `ant-design-vue` — Ant Design system for Vue.
5. `headless-only` — Reka UI primitives only, no pre-styled components.

**If Q1 = react:**
1. `shadcn-ui` (recommended) — Radix primitives, copy-paste components, Tailwind-driven.
2. `mantine` — Hooks + styled components, dark mode built in.
3. `chakra` — Style-prop driven component library.
4. `radix-only` — Radix primitives only.

**If Q1 = react-native:**
1. `native-primitives` (recommended) — `View`/`Text`/`Pressable` + your own patterns.
2. `tamagui` — Cross-platform styled components.
3. `gluestack` — Themable component library.

**If Q1 = electron or node-fullstack:** skip Q2 (asked in nested matrix below).

Reply with a number or the option name.

### Q3 — Atomic CSS (`atomic_css`)

**If Q1 = vue or react:**
1. `tailwind-v4+unocss` (recommended hybrid) — Tailwind owns colors/spacing/responsive; UnoCSS owns shortcuts + `i-lucide-*` icons.
2. `tailwind-v4` — Tailwind v4 only, CSS-first config. Use library icon components.
3. `unocss` — UnoCSS only, no Tailwind.
4. `none` — CSS Modules or vanilla CSS.

**If Q1 = react-native:**
1. `nativewind` (recommended) — Tailwind syntax for RN.
2. `none` — `StyleSheet.create` only.

**If Q1 = electron or node-fullstack:** skip Q3.

Reply with a number or the option name.

### Q4 — Package manager (`package_manager`)

1. `pnpm` (recommended)
2. `npm`
3. `yarn`
4. `bun`

Reply with a number or the option name.

### Cross-stack follow-ups

If Q1 = `electron`, ask `renderer_framework`:
1. `vue` — renderer is a Vue 3 app under `src/renderer/`.
2. `react` — renderer is a React app under `src/renderer/`.

If Q1 = `node-fullstack`, ask `web_framework`:
1. `vue` — `apps/web/` is a Vue 3 app.
2. `react` — `apps/web/` is a React app.
3. `none` — API-only monorepo, no web app.

---

## Stage 2 — Optional Deep-Dive

Ask: "Customize beyond defaults?"

1. `defaults` (recommended) — Apply the Defaults table from the chosen matrix. Fast path.
2. `customize` — Pick routing / state / data / forms / tests / animation individually.

### Defaults by Stack

| Dimension | Vue | React | React Native | Electron | Node Full-stack |
|---|---:|---:|---:|---:|---:|
| routing | vue-router | react-router | expo-router | — | — |
| state | pinia | zustand | zustand | — | — |
| data | tanstack-query | tanstack-query | tanstack-query | — | — |
| forms | vee-validate+zod | react-hook-form+zod | react-hook-form+zod | — | — |
| tests | vitest | vitest | vitest + jest-expo | vitest | vitest |
| animation | motion-v | motion | react-native-reanimated | — | — |
| icons | lucide-vue-next | lucide-react | lucide-react-native | — | — |
| build_tool | vite (fixed) | vite (default) | — | electron-vite | — |
| api_framework | — | — | — | — | hono |
| orm | — | — | — | — | drizzle |
| database | — | — | — | — | sqlite |

### If customize — per-stack optional dimensions

- **vue**: `routing`, `state`, `data`, `forms`, `tests`, `animation`
- **react**: `build_tool`, `routing`, `state`, `data`, `forms`, `tests`, `animation`
- **react-native**: `routing`, `state`, `data`, `forms`, `tests`, `animation`, `secure_storage`
- **electron**: `build_tool`, `storage`, `tests`, `updates`
- **node-fullstack**: `api_framework`, `orm`, `database`, `tests`, `contracts_package`

Ask one dimension at a time. Read actual option labels from `data/matrices/<stack>.matrix.md` in this skill directory. If the file is missing, ask as free text with the choice name as hint.

### Global customization (all stacks)

**Theme switching (`theme`):**
1. `light-dark-system` (recommended) — Light / Dark / System. Supports system preference detection, manual toggle, and persistence.
2. `light-only` — Only generates light tokens. No theme switcher.
3. `dark-only` — Only generates dark tokens. Suited for dashboards and dev tools.

**Theme preset (`theme_preset`):**
1. `shadcn-neutral` (recommended) — Standard neutral palette from shadcn/ui.
2. `voltagent` — Dark engineering command-center theme.

**I18n (`i18n`):**
1. `none` (recommended) — No i18n. Hard-coded strings only.
2. Stack-specific: vue → `vue-i18n`, react → `react-i18next`, react-native → `expo-localization+i18next`, electron/node-fullstack → inherits from renderer choice.

If i18n ≠ none, ask:
- **Default locale** (`default_locale`) — free text, default `zh-CN`
- **Supported locales** (`locales`) — comma-separated, default `zh-CN, en-US`

---

## Stage 3 — Matrix Lookup

1. **Read** `data/matrices/<stack>.matrix.md` from this skill directory.
2. Start from the matrix's `Defaults` table. Override with Stage 1 / Stage 2 user answers.
3. Output a resolved summary table BEFORE writing any files:

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

4. Confirm: "Generate this project with these choices? Reply `yes` to generate or `change` to revise an answer." For tools with native UI use a 2-option `AskUserQuestion`. Text-only tools just send the question line. If "change", re-enter Stage 2's customize branch.

### Nested matrix delegation

- **electron + vue renderer**: recursively apply the vue matrix rooted at `src/renderer/` (not `src/`).
- **electron + react renderer**: recursively apply the react matrix rooted at `src/renderer/`.
- **node-fullstack + vue web**: recursively apply the vue matrix rooted at `apps/web/`.
- **node-fullstack + react web**: recursively apply the react matrix rooted at `apps/web/`.
- Nested entry uses same Defaults / Stage 2 answers. Do NOT re-ask `package_manager`.

---

## Stage 4 — Generation

Four substages, in order. Announce each substage start.

### 4A — Skeleton (write assembled files)

Build the file list from the matrix's `Universal writes` table plus any `writes` entries triggered by chosen choices. Write:

1. **`package.json`** — assemble from union of `deps` and `dev_deps` across all chosen choices, plus matrix-required scripts. Use caret ranges from the matrix's `Version baseline`.

2. **Config files**: `tsconfig.json` (read `data/snippets/config/tsconfig.strict.json`, add framework-specific fields), `vite.config.ts` / `next.config.ts` / `electron.vite.config.ts` / `metro.config.js`, `eslint.config.js` (read `data/snippets/config/eslint.flat.ts.js`, add framework plugin), `.env.example` (read `data/snippets/config/env.example`, substitute `%API_BASE_VAR%`).

3. **`components.json`** (shadcn-vue / shadcn-ui) — write the verbatim JSON block from the matrix. **Do NOT run `shadcn init` / `shadcn-vue init`.**

4. **Directory skeletons** — `mkdir -p` for: `src/stores/`, `src/components/ui/`, `src/components/patterns/`, `src/shared/native/` (RN), and any other empty folders the stack structure expects.

### 4B — Snippets verbatim

For every `snippets:` entry in the matrix AND every snippet source in `Universal writes`:

1. **Read** from `data/snippets/<path>` in this skill directory
2. **Substitute placeholders** (see table below)
3. **Write** to project location

**Placeholder table:**

| Placeholder | Replacement |
|---|---|
| `%API_BASE_VAR%` | `VITE_API_BASE_URL` (Vite), `NEXT_PUBLIC_API_BASE_URL` (Next), `EXPO_PUBLIC_API_BASE_URL` (Expo), `PORT` (node API) |
| `%PACKAGE_NAME%` | Project name from `package.json` |
| `%STACK%` | Stage 1 stack answer |
| `%UI_LIBRARY%` | UI library + description (e.g. `shadcn-vue (Reka UI primitives)`) |
| `%ATOMIC_CSS%` | Atomic CSS choice |
| `%ROUTING%` | Resolved routing |
| `%STATE_LIB%` | Resolved state library |
| `%DATA_LIB%` | Resolved data fetching |
| `%FORMS_LIB%` | Resolved forms |
| `%TESTS_LIB%` | Resolved tests |
| `%ANIMATION_LIB%` | Resolved animation |
| `%ICONS_LIB%` | Resolved icons |
| `%PACKAGE_MANAGER%` | pnpm / npm / yarn / bun |
| `%THEME_MODE%` | light-dark-system / light-only / dark-only |
| `%THEME_PRESET%` | shadcn-neutral / voltagent |
| `%I18N_LIBRARY%` | vue-i18n / react-i18next / none |
| `%DEFAULT_LOCALE%` | Resolved default locale |
| `%DATA_DIR%` | `composables/` (vue) or `hooks/` (react / react-native) |
| `%DATA_HOOK_PATTERN%` | `use<Name>.ts (composable)` or `use<Name>.ts (hook)` |
| `%VIEWS_DIR%` | `views/` (vue) / `routes/` (react) / `screens/` (react-native) / `pages/` (next) |
| `%REPO_RAW_BASE%` | The RAW base URL from top of this file |
| `%UI_INSTALL_HINT%` | Fenced bash block from UI install mapping below |
| `%UI_INSTALL_HINT_INLINE%` | One-line version of the same hint |

**UI install hint mapping:**

| UI Library | `%UI_INSTALL_HINT_INLINE%` |
|---|---|
| shadcn-vue | `<pm> dlx shadcn-vue@latest add <component>` |
| shadcn-ui | `<pm> dlx shadcn@latest add <component>` |
| naive-ui | `import { NButton, NCard, ... } from 'naive-ui'` (already installed) |
| element-plus | `import { ElButton, ElCard, ... } from 'element-plus'` (already installed) |
| ant-design-vue | `import { Button, Card, ... } from 'ant-design-vue'` (already installed) |
| headless-only (vue) | `import { ... } from 'reka-ui'` (compose your own component) |
| mantine | `import { Button, Card, ... } from '@mantine/core'` (already installed) |
| chakra | `import { Button, Card, ... } from '@chakra-ui/react'` (already installed) |
| radix-only | `<pm> add @radix-ui/react-<primitive>` |
| native-primitives | `// no install — compose with View / Text / Pressable from 'react-native'` |
| tamagui | `import { Button, Card } from 'tamagui'` (already installed) |
| gluestack | `import { Button, Card } from '@gluestack-ui/themed'` (already installed) |

Pre-substitute `%PACKAGE_MANAGER%` inside `%UI_INSTALL_HINT%` before writing — project files must show literal `pnpm`/`npm`/`yarn`/`bun`, not the placeholder.

### Universal writes (every project)

The following files are written for EVERY project regardless of stack choices. Read snippets from `data/snippets/` per Fetch Strategy, substitute placeholders from the resolved config:

| Project path | Source snippet | Notes |
|---|---|---|
| `package.json` | Assembled from resolved deps/dev_deps/scripts | Not a snippet — built from matrix choices |
| `tsconfig.json` | `data/snippets/config/tsconfig.strict.json` | Add framework-specific fields (jsx, paths, etc.) |
| `eslint.config.js` | `data/snippets/config/eslint.flat.ts.js` | Add framework plugin block |
| `.env.example` | `data/snippets/config/env.example` | Substitute `%API_BASE_VAR%` |
| `src/shared/http/client.ts` | `data/snippets/http/client.web.ts` (or `client.rn.ts` for RN) | Substitute `%API_BASE_VAR%` |
| `src/shared/http/errors.ts` | `data/snippets/http/errors.client.ts` (or `errors.server.ts` for node) | |
| `src/shared/lib/cn.ts` | `data/snippets/lib/cn.ts` | Only when Tailwind selected |
| `src/shared/styles/tokens.css` | `data/snippets/styles/tokens.shadcn.css` (or `tokens.voltagent.css`) | Based on `theme_preset` |
| `src/config/env.ts` | Inline — typed wrapper around env vars | Write directly, not a snippet |
| `src/main.ts` (or `src/main.tsx`, `src/index.ts`) | Inline — bootstrap + plugins | Based on stack |
| `src/App.vue` (or `src/App.tsx`) | Inline — minimal shell | `<RouterView />` if router, else placeholder |

This is the **minimum** file set. The matrix's `Choices` blocks add more files (router config, query provider, theme provider, i18n, tests, etc.). Do NOT skip any `writes:` entry in the matrix.

### 4C — Project-level AGENT.md and CLAUDE.md

Read the templates from `data/snippets/project-docs/`:
- `AGENT.md.tmpl` → write to `AGENT.md`
- `CLAUDE.md.tmpl` → write to `CLAUDE.md`

Substitute ALL placeholders from the resolved config. These files encode the per-project stack choices and the hard rule: **use the chosen UI library, never hand-roll components**. Do NOT leave any `%TOKEN%` unreplaced.

### 4D — CLIs

1. Run `<package_manager> install`.
2. Run non-interactive post-init CLIs (e.g. `pnpm dlx shadcn-vue@latest add button card input dialog label`).
3. Announce interactive/destructive CLIs for the user to run manually.

**Never run `shadcn init` / `shadcn-vue init`** — `components.json` was hand-written in 4A.

---

## Stage 5 — Report

Print:

```
Files generated: <N>
  package.json
  tsconfig.json
  vite.config.ts                       (or next.config.ts / etc.)
  components.json                      (if shadcn)
  uno.config.ts                        (if UnoCSS)
  .env.example
  AGENT.md                             (snippet: project-docs/AGENT.md.tmpl)
  CLAUDE.md                            (snippet: project-docs/CLAUDE.md.tmpl)
  src/main.ts                          (or main.tsx / index.ts)
  src/App.vue                          (or App.tsx)
  src/app/router.ts                    (if routing selected)
  src/shared/http/client.ts            (snippet)
  src/shared/http/errors.ts            (snippet)
  src/shared/http/errors.test.ts       (snippet, if tests selected)
  src/shared/lib/cn.ts                 (snippet)
  src/shared/styles/tokens.css         (snippet)
  src/config/env.ts
  ...

CLIs executed:
  <pm> install                                                          ok
  <pm> dlx shadcn-vue@latest add button card input dialog label         ok

Next steps:
  1. Fill in .env.local from .env.example
  2. Run: <pm> dev
  3. Recommended checks before committing: <pm> typecheck && <pm> lint && <pm> test
  4. Read AGENT.md and CLAUDE.md in this project — they encode the per-project rules
     (including: use the chosen UI library, never hand-roll components).
  5. For deeper boundaries, read `data/boundaries/common/` and `data/boundaries/<stack>/`
     from this skill directory when needed.

Open questions for you:
  - Auth strategy (none selected)
  - Backend origin (API_BASE_URL is set to the default; change in .env.local)
```

---

## Operating Principles

1. **Question UX is tool-dependent.** Native-multi-select tools (Claude Code) batch up to 4 per `AskUserQuestion`. Text-only tools ask one at a time with numbered options as plain prose — never as YAML or `key: a|b|c` code blocks. Use exact option labels from Stage 1; do not invent or shorten.

2. **No silent decisions on tech selection.** If ambiguous, ask. Defaults are explicit and surfaced in Stage 3's summary.

3. **Snippets are verbatim.** Fetch via strategy above, copy bytes, only substitute documented placeholders. Do not re-author snippet content.

4. **`shadcn init` is never run.** `components.json` is hand-written.

5. **No backwards-compatibility scaffolding.** Pins current major versions per matrix `Version baseline`.

6. **Stop on error.** Any write fail / fetch 404 / CLI non-zero → stop and report partial state. Do not "fix forward."

7. **Architecture docs are the contract.** When a generated file conflicts with `boundaries/<stack>/ARCHITECTURE.md`, the doc is right and the matrix is wrong — fix the matrix and regenerate.

## Stack Reference

| Stack | Matrix | Architecture |
|---|---|---|
| Vue | `workflows/matrices/vue.matrix.md` | `boundaries/vue/ARCHITECTURE.md` |
| React | `workflows/matrices/react.matrix.md` | `boundaries/react/ARCHITECTURE.md` |
| React Native | `workflows/matrices/react-native.matrix.md` | `boundaries/react-native/ARCHITECTURE.md` |
| Electron | `workflows/matrices/electron.matrix.md` | `boundaries/electron/ARCHITECTURE.md` |
| Node full-stack | `workflows/matrices/node-fullstack.matrix.md` | `boundaries/node-fullstack/ARCHITECTURE.md` |

## For non-Claude-Code tools

This file is self-contained — copy it into any AI tool's config location:

- **Codex**: append to `~/.codex/AGENTS.md`
- **Cursor**: save as `.cursor/rules/new-project.mdc`
- **Cline**: append to `~/.cline/rules.md` or `.clinerules`
- **Windsurf**: save as `.windsurfrules`
- **Any other tool**: copy into "custom instructions" / "system prompt" / "rules" / "memory"

Then start a session in any empty directory and say `/new-project`.
