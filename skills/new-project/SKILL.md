---
name: new-project
description: Interactive workflow to scaffold a new frontend project. Asks for project type (Vue/React/React Native/Electron/Node full-stack), UI library, atomic CSS, and package manager, then generates a complete, runnable project assembled from canonical frontend-rules boundaries and snippets. Use when the user says "/new-project", "create a new project", "scaffold a project", "bootstrap a frontend app", or asks to start a new frontend project from scratch.
---

# /new-project — Frontend Project Scaffolding

This skill generates a complete, runnable frontend project. Every stage is defined inline below — do NOT skip stages, reorder them, or invent your own questions. Execute from top to bottom.

## Repo Source (reference only — not used for fetching)

```
GitHub:    wh-kerwin/Frontend-vibeCoging-Rule (branch: main)
RAW base:  https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/
```

These URLs are used ONLY as values for the `%REPO_RAW_BASE%` placeholder in generated project files. This skill does NOT fetch anything from the network — all data is bundled locally in `data/`.

## Data Directory & Fetch Strategy

This skill ships with ALL boundaries, matrices, and snippets inside a `data/` directory. **No network access is needed or allowed.** Every file reference in this skill resolves to a local path under `data/`.

### Locating the data directory

The AI must resolve the `data/` directory ONCE at the start of Stage 0, BEFORE reading any files. Use the first path that exists:

1. **`SKILL_DATA_DIR` env var** — if set, use it directly. Example: `SKILL_DATA_DIR=/home/user/.codex/skills/new-project/data`
2. **`FRONTEND_RULES_ROOT` env var** — if set, use `<FRONTEND_RULES_ROOT>/skills/new-project/data/`
3. **Relative to this instruction file** — if you know the filesystem path of this SKILL.md file, use `<that directory>/data/`
4. **Known tool-specific install locations** — try each in order, stop at the first that exists:
   - `~/.claude/skills/new-project/data/`
   - `~/.codex/skills/new-project/data/`
   - `.cursor/rules/new-project/data/`
   - `./skills/new-project/data/`

Assign the resolved path to a variable called `DATA_DIR` in your working memory. All subsequent file reads use `<DATA_DIR>/` as the root.

### Verification

After resolving `DATA_DIR`, immediately read `<DATA_DIR>/boundaries/common/coding-style.md`. If this file does not exist or is empty, STOP and report:

> **Cannot locate skill data directory.** Set the `SKILL_DATA_DIR` environment variable to the absolute path of the `data/` directory that ships with this skill, then re-run `/new-project`.
> Example: `export SKILL_DATA_DIR=/path/to/skills/new-project/data`

Do NOT fall back to GitHub, do NOT make up file contents, do NOT skip files. Every file referenced in this skill MUST be read from `DATA_DIR`.

### Path mapping

For every reference in this skill:
- `data/boundaries/<path>` → read `<DATA_DIR>/boundaries/<path>`
- `data/matrices/<file>` → read `<DATA_DIR>/matrices/<file>`
- `data/snippets/<path>` → read `<DATA_DIR>/snippets/<path>`

---

## Stage 0 — Preflight

1. **Resolve DATA_DIR.** Follow the "Locating the data directory" algorithm above. Run the verification check (read `<DATA_DIR>/boundaries/common/coding-style.md`). If it fails, STOP immediately — do not proceed.

2. **Check cwd is empty.** Run `ls -A`. Abort if anything present other than `.git/`:
   > Working directory is not empty. Please `cd` into an empty directory and re-run `/new-project`.

3. **Load common rules.** Read ALL six files from `<DATA_DIR>/boundaries/common/`: `coding-style.md`, `design-system.md`, `http-contract.md`, `directory-rules.md`, `async-states.md`, `encapsulation.md`. Cache in conversation memory. If any file is missing, STOP and report which file could not be read.

4. Announce: "Workspace is empty. Data directory resolved to `<DATA_DIR>`. Loaded 6 common engineering boundaries. Starting interactive setup."

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

Ask one dimension at a time. Read actual option labels from `<DATA_DIR>/matrices/<stack>.matrix.md`. If the file is missing, STOP and report the error — do not fall back to free text.

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

1. **Read** `<DATA_DIR>/matrices/<stack>.matrix.md`.
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

2. **Config files**: `tsconfig.json` (read `<DATA_DIR>/snippets/config/tsconfig.strict.json`, add framework-specific fields), `vite.config.ts` / `next.config.ts` / `electron.vite.config.ts` / `metro.config.js`, `eslint.config.js` (read `<DATA_DIR>/snippets/config/eslint.flat.ts.js`, add framework plugin), `.env.example` (read `<DATA_DIR>/snippets/config/env.example`, substitute `%API_BASE_VAR%`).

3. **`components.json`** (shadcn-vue / shadcn-ui) — write the verbatim JSON block from the matrix. **Do NOT run `shadcn init` / `shadcn-vue init`.**

4. **Directory skeletons** — `mkdir -p` for: `src/stores/`, `src/components/ui/`, `src/components/patterns/`, `src/shared/native/` (RN), and any other empty folders the stack structure expects.

### 4B — Snippets verbatim

For every `snippets:` entry in the matrix AND every snippet source in `Universal writes`:

1. **Read** from `<DATA_DIR>/snippets/<path>`
2. **Substitute placeholders** (see table below — ONLY these placeholders appear in snippet files)
3. **Write** to project location

**Snippet placeholder table (4B only):**

| Placeholder | Replacement |
|---|---|
| `%API_BASE_VAR%` | `VITE_API_BASE_URL` (Vite), `NEXT_PUBLIC_API_BASE_URL` (Next), `EXPO_PUBLIC_API_BASE_URL` (Expo), `PORT` (node API) |
| `%PACKAGE_NAME%` | Project name from `package.json` |
| `%FEATURE_NAME%` | Feature name in lowercase (node-fullstack contracts only) |
| `%FeatureName%` | Feature name in PascalCase (node-fullstack contracts only) |
| `%DEFAULT_LOCALE%` | Resolved default locale (i18n snippet files only) |

These are the ONLY placeholders that appear in snippet source files. Do NOT substitute `%STACK%`, `%UI_LIBRARY%`, or other template-level placeholders during this stage — they do not appear in snippet files and substituting them here is a no-op that risks corrupting file content.

### Universal writes (every project)

The following files are written for EVERY project regardless of stack choices. Read snippets from `<DATA_DIR>/snippets/`, substitute placeholders from the 4B table above:

| Project path | Source snippet | Notes |
|---|---|---|
| `package.json` | Assembled from resolved deps/dev_deps/scripts | Not a snippet — built from matrix choices |
| `tsconfig.json` | `<DATA_DIR>/snippets/config/tsconfig.strict.json` | Add framework-specific fields (jsx, paths, etc.) |
| `eslint.config.js` | `<DATA_DIR>/snippets/config/eslint.flat.ts.js` | Add framework plugin block |
| `.env.example` | `<DATA_DIR>/snippets/config/env.example` | Substitute `%API_BASE_VAR%` |
| `src/shared/http/client.ts` | `<DATA_DIR>/snippets/http/client.web.ts` (or `client.rn.ts` for RN) | Substitute `%API_BASE_VAR%` |
| `src/shared/http/errors.ts` | `<DATA_DIR>/snippets/http/errors.client.ts` (or `errors.server.ts` for node) | |
| `src/shared/lib/cn.ts` | `<DATA_DIR>/snippets/lib/cn.ts` | Only when Tailwind selected |
| `src/shared/styles/tokens.css` | `<DATA_DIR>/snippets/styles/tokens.shadcn.css` (or `tokens.voltagent.css`) | Based on `theme_preset` |
| `src/config/env.ts` | Inline — typed wrapper around env vars | Write directly, not a snippet |
| `src/main.ts` (or `src/main.tsx`, `src/index.ts`) | Inline — bootstrap + plugins | Based on stack |
| `src/App.vue` (or `src/App.tsx`) | Inline — minimal shell | `<RouterView />` if router, else placeholder |

This is the **minimum** file set. The matrix's `Choices` blocks add more files (router config, query provider, theme provider, i18n, tests, etc.). Do NOT skip any `writes:` entry in the matrix.

### 4C — Project-level AGENT.md and CLAUDE.md

Read the templates from `<DATA_DIR>/snippets/project-docs/`:
- `AGENT.md.tmpl` → write to `AGENT.md` in the project root
- `CLAUDE.md.tmpl` → write to `CLAUDE.md` in the project root

These files encode the per-project stack choices so that future AI sessions and human contributors share the same contract. They also encode the hard rule: **use the chosen UI library, never hand-roll components**.

Substitute ALL of the following placeholders from the resolved Stage 1-3 config. **Do NOT leave any `%TOKEN%` unreplaced.**

**Template placeholder table (4C):**

| Placeholder | Replacement | Example |
|---|---|---|
| `%PACKAGE_NAME%` | Project name (folder name or user-provided) | `my-app` |
| `%STACK%` | Stage 1 stack answer | `vue`, `react`, `react-native`, `electron`, `node-fullstack` |
| `%UI_LIBRARY%` | UI library + description | `shadcn-vue (Reka UI primitives)` |
| `%ATOMIC_CSS%` | Atomic CSS choice | `tailwind-v4+unocss`, `nativewind`, `none` |
| `%ROUTING%` | Resolved routing | `vue-router`, `react-router`, `expo-router` |
| `%STATE_LIB%` | Resolved state library | `pinia`, `zustand` |
| `%DATA_LIB%` | Resolved data fetching | `@tanstack/vue-query`, `@tanstack/react-query` |
| `%FORMS_LIB%` | Resolved forms | `vee-validate + zod`, `react-hook-form + zod` |
| `%TESTS_LIB%` | Resolved tests | `vitest`, `vitest + jest-expo` |
| `%ANIMATION_LIB%` | Resolved animation | `motion-v`, `motion` |
| `%ICONS_LIB%` | Resolved icons | `lucide-vue-next`, `lucide-react` |
| `%PACKAGE_MANAGER%` | Package manager | `pnpm`, `npm`, `yarn`, `bun` |
| `%THEME_MODE%` | Theme switching strategy | `light-dark-system`, `light-only`, `dark-only` |
| `%THEME_PRESET%` | Theme preset | `shadcn-neutral`, `voltagent` |
| `%I18N_LIBRARY%` | I18n library | `vue-i18n`, `react-i18next`, `none` |
| `%DEFAULT_LOCALE%` | Default locale | `zh-CN`, `en-US` |
| `%DATA_DIR%` | Data hooks directory | `composables` (vue) or `hooks` (react/RN) |
| `%DATA_HOOK_PATTERN%` | Hook naming pattern | `use<Name>.ts (composable)` or `use<Name>.ts (hook)` |
| `%VIEWS_DIR%` | Views directory | `views` (vue), `routes` (react), `screens` (RN), `pages` (next) |
| `%REPO_RAW_BASE%` | The RAW base URL from "Repo Source" section | `https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/` |
| `%UI_INSTALL_HINT%` | Fenced bash block from UI install mapping below | see mapping table |
| `%UI_INSTALL_HINT_INLINE%` | One-line version of the same hint | see mapping table |

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
  5. For deeper boundaries, fetch from the canonical repo:
     `https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/boundaries/`
     Or read locally from `<DATA_DIR>/boundaries/` if the skill data directory is available.

Open questions for you:
  - Auth strategy (none selected)
  - Backend origin (API_BASE_URL is set to the default; change in .env.local)
```

---

## Operating Principles

1. **Question UX is tool-dependent.** Native-multi-select tools (Claude Code) batch up to 4 per `AskUserQuestion`. Text-only tools ask one at a time with numbered options as plain prose — never as YAML or `key: a|b|c` code blocks. Use exact option labels from Stage 1; do not invent or shorten.

2. **No silent decisions on tech selection.** If ambiguous, ask. Defaults are explicit and surfaced in Stage 3's summary.

3. **Snippets are verbatim.** Read from `<DATA_DIR>/snippets/`, copy bytes, only substitute the documented placeholders from the applicable stage (4B for snippets, 4C for templates). Do not re-author snippet content. Do not fabricate content if a file cannot be read — STOP and report the error.

4. **`shadcn init` is never run.** `components.json` is hand-written.

5. **No backwards-compatibility scaffolding.** Pins current major versions per matrix `Version baseline`.

6. **Stop on error.** Any write fail / fetch 404 / CLI non-zero → stop and report partial state. Do not "fix forward."

7. **Architecture docs are the contract.** When a generated file conflicts with `boundaries/<stack>/ARCHITECTURE.md`, the doc is right and the matrix is wrong — fix the matrix and regenerate.

## Stack Reference

| Stack | Matrix | Architecture |
|---|---|---|
| Vue | `<DATA_DIR>/matrices/vue.matrix.md` | `<DATA_DIR>/boundaries/vue/ARCHITECTURE.md` |
| React | `<DATA_DIR>/matrices/react.matrix.md` | `<DATA_DIR>/boundaries/react/ARCHITECTURE.md` |
| React Native | `<DATA_DIR>/matrices/react-native.matrix.md` | `<DATA_DIR>/boundaries/react-native/ARCHITECTURE.md` |
| Electron | `<DATA_DIR>/matrices/electron.matrix.md` | `<DATA_DIR>/boundaries/electron/ARCHITECTURE.md` |
| Node full-stack | `<DATA_DIR>/matrices/node-fullstack.matrix.md` | `<DATA_DIR>/boundaries/node-fullstack/ARCHITECTURE.md` |

## For non-Claude-Code tools

This file plus its `data/` directory must be installed together. Copy both to your tool's config location:

### Installation

- **Codex CLI**:
  1. Copy `skills/new-project/` (this file + `data/`) to `~/.codex/skills/new-project/`
  2. Add to `~/.codex/AGENTS.md`: `Read and follow the instructions in ~/.codex/skills/new-project/SKILL.md when the user says /new-project`
  3. Alternatively, set `SKILL_DATA_DIR`: `export SKILL_DATA_DIR=~/.codex/skills/new-project/data`

- **Cursor**:
  1. Copy `skills/new-project/` to `.cursor/rules/new-project/`
  2. Rename `SKILL.md` to `new-project.mdc` or reference it from `.cursor/rules/`
  3. Set env var: `SKILL_DATA_DIR=.cursor/rules/new-project/data`

- **Cline**:
  1. Copy `skills/new-project/` to the project or user config location
  2. Set `SKILL_DATA_DIR` to the absolute path of the `data/` directory

- **Any other tool**:
  1. Copy `skills/new-project/` to a stable location
  2. Set `SKILL_DATA_DIR` to the absolute path of the `data/` directory
  3. Copy the content of this file into "custom instructions" / "system prompt" / "rules" / "memory"

### Verification

After installation, start a session in any empty directory and say `/new-project`. Stage 0 will verify the data directory is accessible. If it reports "Cannot locate skill data directory", set the `SKILL_DATA_DIR` env var as described above.
