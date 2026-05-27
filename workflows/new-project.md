# /new-project — Interactive Project Scaffolding Workflow

This is the master protocol for creating a new project under the `frontend-rules` system. Any AI agent (Claude Code, Cursor, Cline, Codex, etc.) reads this file and executes it from top to bottom.

The Claude Code slash command at `.claude/commands/new-project.md` is a thin entry that points here.

## Repo source (read this BEFORE Stage 0)

This workflow does **not** assume the frontend-rules repo is present in the user's working directory. The user runs `/new-project` from an empty target project directory (e.g. `e:/projects/my-app`). The AI fetches `boundaries/`, `workflows/matrices/`, and `shared/snippets/` from the canonical GitHub repo at runtime.

**Canonical source:**

```
GitHub repo:    wh-kerwin/Frontend-vibeCoging-Rule
Branch:         main
RAW base URL:   https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/
API base URL:   https://api.github.com/repos/wh-kerwin/Frontend-vibeCoging-Rule/contents/
```

The user can override these via their AI tool's user memory (e.g. `~/.claude/CLAUDE.md` or `~/.codex/AGENTS.md` may declare a fork or a different branch — see the repo README for the exact one-liner). If memory provides a different repo URL, use it instead.

### Fetch strategy

For every `shared/snippets/<path>`, `workflows/matrices/<file>`, or `boundaries/<path>` reference in this workflow, fetch the file at runtime in this order:

1. **Local first** — if `<FRONTEND_RULES_ROOT>/<path>` exists locally (set via env var or memory), read that. This is the dev mode when the user is editing the rules themselves.
2. **RAW URL** — `GET <RAW_BASE>/<path>` via WebFetch. Direct, fastest.
3. **GitHub API fallback** — if RAW returns DNS failure or 404 (e.g. raw.githubusercontent.com is blocked on some networks), fall back to `GET <API_BASE>/<path>` and base64-decode the `content` field. This works wherever `api.github.com` resolves.

Cache fetched content in conversation memory for the rest of the run — never re-fetch the same path.

If both RAW and API fail (offline, blocked, repo moved), abort Stage 4 cleanly with:
> Could not fetch <path> from <repo>. Check your network or set FRONTEND_RULES_ROOT to a local clone.

## Overview

A run produces **a complete, runnable project tailored to the user's tech choices**, assembled from:

- `boundaries/<stack>/ARCHITECTURE.md` — architectural rules (always applied)
- `workflows/matrices/<stack>.matrix.md` — choice catalog + default tech selections
- `shared/snippets/**` — verbatim source files for cross-stack infrastructure (HTTP client, AppError, cn util, tokens, etc.)

The workflow asks 4 mandatory questions in Stage 1, an optional deep-dive in Stage 2, then writes files in Stage 4 and reports in Stage 5.

## Stage 0 — Preflight

1. **Check cwd is empty.** Run `ls -A` (or equivalent). If anything is present that is not `.git/`, abort with:
   > Working directory is not empty. Please `cd` into an empty directory (or one that only contains `.git/`) and re-run `/new-project`.
   Do **not** offer to merge into the existing project — this workflow is for greenfield only.
2. **Load common rules into context.** Fetch every file in `boundaries/common/` per the **Fetch strategy** above (`coding-style.md`, `design-system.md`, `http-contract.md`, `directory-rules.md`, `async-states.md`, `encapsulation.md`). These rules apply to every generated project; subsequent stages reference them. Cache them in conversation memory.
3. Announce: "Workspace is empty. Loaded common engineering boundaries from `<repo>@<branch>`. Starting interactive setup."

## Stage 1 — Mandatory questions

There are four mandatory questions. **How you ask them depends on your tool**:

- **Tools with native interactive multi-select** (Claude Code's `AskUserQuestion`): batch all four into one call so the user answers them together.
- **Text-only tools** (Codex CLI, Cursor terminal chat, Cline, generic IDE chat panels): ask **one question at a time** in plain prose with numbered options. Wait for the user's reply, parse it (a number or the option name), then move to the next question. Do **not** dump the question list as a code block or `key: a|b|c` table — the user wants to pick, not to fill in.

Template for the text-only path (use this exact shape for each question):

```
What kind of project are you creating?

 1. Vue 3 web app — Vite + SFC + composables. Default for product/admin apps.
 2. React web app — Vite or Next.js. Default for component-heavy apps.
 3. React Native (Expo) — iOS/Android cross-platform with Expo Router.
 4. Electron desktop — Hardened main + preload + framework renderer.
 5. Node full-stack monorepo — API + (optional) web app, shared TypeScript contracts.

Reply with a number (1-5) or the option name.
```

### The four questions (use these exact options — do not paraphrase or shorten)

**Q1 — Project type (`stack`)**

1. `vue` — Vue 3 web app. Vite + SFC + composables. Default for product/admin apps.
2. `react` — React web app. Vite or Next.js. Default for component-heavy apps.
3. `react-native` — React Native (Expo). iOS/Android cross-platform with Expo Router.
4. `electron` — Electron desktop. Hardened main + preload + framework renderer.
5. `node-fullstack` — Node full-stack monorepo. API + (optional) web app, shared TypeScript contracts.

**Q2 — Primary UI library (`ui_library`)** — options depend on Q1's answer:

- If Q1 = `vue`:
  1. `shadcn-vue` (recommended) — Reka UI primitives, copy-paste components, Tailwind-driven.
  2. `naive-ui` — Comprehensive component set, themable.
  3. `element-plus` — Mature enterprise components.
  4. `ant-design-vue` — Ant Design system for Vue.
  5. `headless-only` — Reka UI primitives only, no pre-styled components.
- If Q1 = `react`:
  1. `shadcn-ui` (recommended) — Radix primitives, copy-paste components, Tailwind-driven.
  2. `mantine` — Hooks + styled components, dark mode built in.
  3. `chakra` — Style-prop driven component library.
  4. `radix-only` — Radix primitives only.
- If Q1 = `react-native`:
  1. `native-primitives` (recommended) — `View`/`Text`/`Pressable` + your own patterns.
  2. `tamagui` — Cross-platform styled components.
  3. `gluestack` — Themable component library.
- If Q1 = `electron` or `node-fullstack`: **skip Q2**. It will be asked again when the nested renderer / web matrix is entered (see "Cross-stack follow-ups" below).

**Q3 — Atomic CSS solution (`atomic_css`)** — options depend on Q1:

- If Q1 = `vue` or `react`:
  1. `tailwind-v4+unocss` (recommended hybrid) — Tailwind owns colors/spacing/responsive; UnoCSS owns shortcuts + `i-lucide-*` icons.
  2. `tailwind-v4` — Tailwind v4 only, CSS-first config. Use library icon components (no `i-lucide-*` utility).
  3. `unocss` — UnoCSS only, no Tailwind.
  4. `none` — CSS Modules or vanilla CSS.
- If Q1 = `react-native`:
  1. `nativewind` (recommended) — Tailwind syntax for RN.
  2. `none` — `StyleSheet.create` only.
- If Q1 = `electron` or `node-fullstack`: **skip Q3**. It will be asked when the nested matrix is entered.

**Q4 — Package manager (`package_manager`)** — always asked:

1. `pnpm` (recommended)
2. `npm`
3. `yarn`
4. `bun`

### Cross-stack follow-ups

After the four mandatory questions, if Q1's answer requires a nested framework choice, ask **one** follow-up (same one-at-a-time rule for text tools):

- If Q1 = `electron`, ask `renderer_framework`:
  1. `vue` — renderer is a Vue 3 app under `src/renderer/`.
  2. `react` — renderer is a React app under `src/renderer/`.
- If Q1 = `node-fullstack`, ask `web_framework`:
  1. `vue` — `apps/web/` is a Vue 3 app.
  2. `react` — `apps/web/` is a React app.
  3. `none` — API-only monorepo, no web app.

These follow-ups trigger nested matrix entry in Stage 3.

## Stage 2 — Optional deep-dive

Ask one question — **one-at-a-time text prompt for text-only tools, single `AskUserQuestion` for tools with native UI**:

**Question — Customize beyond defaults? (`customize`)**

1. `defaults` (recommended) — Apply the Defaults table from the chosen matrix. Fast path.
2. `customize` — Pick routing / state / data / forms / tests / animation individually.

If the user picks `customize`, ask the per-stack optional dimensions listed below. **Same rule applies**: native-UI tools batch up to 4 per call; text-only tools ask one at a time with numbered options. Read the actual option labels from the chosen matrix's `Choices.<dimension>` block, but render them as numbered options (not as YAML).

Optional dimensions per stack:

- **vue**: `routing`, `state`, `data`, `forms`, `tests`, `animation`
- **react**: `build_tool`, `routing`, `state`, `data`, `forms`, `tests`, `animation`
- **react-native**: `routing`, `state`, `data`, `forms`, `tests`, `animation`, `secure_storage`
- **electron**: `build_tool`, `storage`, `tests`, `updates`
- **node-fullstack**: `api_framework`, `orm`, `database`, `tests`, `contracts_package`

For Claude Code: cap each `AskUserQuestion` call at 4 questions; split into two calls if a stack has more than 4 optional dimensions.

### Stage 2b — Global customization (theme / i18n)

After the stack-specific deep-dive, ask the following global configuration questions. These apply to all stacks and are defined in `workflows/options/global.options.json`.

**Q — Theme switching strategy (`theme`)**

1. `light-dark-system` (recommended) — Light / Dark / System. Supports system preference detection, manual toggle, and persistence.
2. `light-only` — Only generates light tokens. No theme switcher.
3. `dark-only` — Only generates dark tokens. Suited for dashboards and dev tools.

**Q — Theme preset (`theme_preset`)** — only when theme ≠ custom-token-preset:

1. `shadcn-neutral` (recommended) — Standard neutral palette from shadcn/ui.
2. `voltagent` — Dark engineering command-center theme.

**Q — Internationalization (`i18n`)** — choices depend on stack:

1. `none` (recommended) — No i18n. Hard-coded strings only.
2. Stack-specific library:
   - Vue → `vue-i18n`
   - React → `react-i18next`
   - React Native → `expo-localization+i18next`
   - Electron / node-fullstack → inherits from renderer/web framework choice

If i18n ≠ none, ask two follow-ups:
- **Default locale** (`default_locale`) — free text, default `zh-CN`
- **Supported locales** (`locales`) — comma-separated, default `zh-CN, en-US`

## Stage 3 — Matrix lookup

1. **Fetch** `workflows/matrices/<stack>.matrix.md` per the **Fetch strategy** above.
2. Start with the matrix's `Defaults` table.
3. Override defaults with any Stage 1 / Stage 2 user answers.
4. Resolve to a concrete decision per dimension. Output a summary table to the chat **before** writing any files:

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

5. Confirm with the user:
   > Generate this project with these choices? Reply `yes` to generate or `change` to revise an answer.
   Tools with native UI use a 2-option `AskUserQuestion`. Text-only tools just send the line above. If "change", re-enter Stage 2's customize branch.

### Renderer / web sub-app delegation

- For `stack: electron` with `renderer_framework: vue`, recursively apply the vue matrix rooted at `src/renderer/` (not `src/`). Skip the renderer matrix's `src/shared/http/client.ts` write unless the user opts in for renderer-side HTTP.
- For `stack: node-fullstack` with `web_framework: react`, recursively apply the react matrix rooted at `apps/web/`.
- The nested entry uses the same Defaults / Stage 2 answers as the parent run for its own dimensions (do **not** re-ask `package_manager`).

## Stage 4 — Generation

Four substages, in order. Announce each substage start.

### 4A — Skeleton (write assembled files)

Build the file list from the matrix's `Universal writes` table plus any `writes` entries triggered by the chosen `Choices`. Then write:

1. `package.json` — assemble from union of `deps` and `dev_deps` across all chosen choices, plus matrix-required scripts. Use caret ranges from the matrix's `Version baseline`.
2. Top-level config files: `tsconfig.json`, `vite.config.ts` / `next.config.ts` / `electron.vite.config.ts` / `metro.config.js`, `eslint.config.js`, `.env.example`.
3. `components.json` (when shadcn-vue / shadcn-ui selected) — write the verbatim block from the matrix. **Do not run `shadcn init`.**
4. Directory skeletons: `mkdir`-equivalent for empty folders the structure expects (e.g. `src/stores/`, `src/components/ui/`, `src/components/patterns/`, `src/shared/native/` for RN).

### 4B — Snippets verbatim

For each `snippets:` entry in the matrix (and the `Universal writes` table's snippet sources), **fetch** the file from `shared/snippets/<path>` per the **Fetch strategy** at the top of this workflow, then write the content to its project location. Substitute placeholders:

| Placeholder | Replace with |
|---|---|
| `%API_BASE_VAR%` | Stack-specific env var name: `VITE_API_BASE_URL` (Vue / React with Vite), `NEXT_PUBLIC_API_BASE_URL` (React with Next), `EXPO_PUBLIC_API_BASE_URL` (React Native), `PORT` (node-fullstack API), etc. |
| `%FEATURE_NAME%` | Only used when generating a feature exemplar — substitute the feature name in lowercase. |
| `%FeatureName%` | Same, PascalCase. |
| `%PACKAGE_NAME%` | The project name from `package.json`. |

If `boundaries/common/design-system.md` shows the user picked a non-default token preset (e.g. VoltAgent for dev tools), write `tokens.voltagent.css` instead of `tokens.shadcn.css`. Default is `tokens.shadcn.css`.

### 4C — Project-level AGENT.md and CLAUDE.md

These two files are written into the root of the generated project so that future AI sessions (Claude Code, Codex, Cursor, Cline) and human contributors share the same contract for **this specific project's** stack choices. They also encode the hard rule that future page generation / image-to-code work must use the chosen UI library instead of hand-rolling components.

Fetch the templates per the **Fetch strategy** at the top of this workflow:

- `shared/snippets/project-docs/AGENT.md.tmpl` → write to `AGENT.md` in the project root.
- `shared/snippets/project-docs/CLAUDE.md.tmpl` → write to `CLAUDE.md` in the project root.

Substitute the following placeholders from the user's Stage 1–3 answers. **All values come from the resolved choices summarized in Stage 3** — do not leave any token unreplaced.

| Placeholder | Replace with | Example |
|---|---|---|
| `%PACKAGE_NAME%` | Project name (folder name or user-provided `name`) | `my-app` |
| `%STACK%` | Stage 1 `stack` answer | `vue`, `react`, `react-native`, `electron`, `node-fullstack` |
| `%UI_LIBRARY%` | Stage 1 `ui_library` (or renderer-delegated value for electron/node-fullstack) | `shadcn-vue (Reka UI primitives)`, `shadcn-ui (Radix primitives)`, `native-primitives`, etc. |
| `%ATOMIC_CSS%` | Stage 1 `atomic_css` | `tailwind-v4+unocss`, `nativewind`, `none` |
| `%ROUTING%` | Resolved `routing` | `vue-router`, `react-router`, `expo-router`, `app-router (next)`, `none` |
| `%STATE_LIB%` | Resolved `state` | `pinia`, `zustand`, `jotai`, `redux-toolkit`, `none` |
| `%DATA_LIB%` | Resolved `data` | `@tanstack/vue-query`, `@tanstack/react-query`, `swr`, `fetch-only` |
| `%FORMS_LIB%` | Resolved `forms` | `vee-validate + zod`, `react-hook-form + zod`, `none` |
| `%TESTS_LIB%` | Resolved `tests` | `vitest`, `vitest + jest-expo`, `none` |
| `%ANIMATION_LIB%` | Resolved `animation` | `motion-v`, `motion`, `react-native-reanimated`, `none` |
| `%ICONS_LIB%` | Matrix's `icons` default (or user override) | `@lucide/vue`, `lucide-react`, `lucide-react-native` |
| `%PACKAGE_MANAGER%` | Stage 1 `package_manager` | `pnpm`, `npm`, `yarn`, `bun` |
| `%DATA_DIR%` | `composables/` (vue) or `hooks/` (react / react-native) | `composables` / `hooks` |
| `%DATA_HOOK_PATTERN%` | `use<Name>.ts (composable)` / `use<Name>.ts (hook)` | per stack |
| `%VIEWS_DIR%` | `views/` (vue) / `routes/` (react) / `screens/` (react-native) / `pages/` (next) | per stack |
| `%REPO_RAW_BASE%` | Same RAW base URL used to fetch this workflow | `https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/` |
| `%UI_INSTALL_HINT%` | Multi-line install hint formatted as a fenced bash block; mapping table below | see table |
| `%UI_INSTALL_HINT_INLINE%` | One-line version of the same hint (no fence) for inline reference | see table |
| `%THEME_MODE%` | Resolved `theme` | `light-dark-system`, `light-only`, `dark-only` |
| `%THEME_PRESET%` | Resolved `theme_preset` | `shadcn-neutral`, `voltagent` |
| `%I18N_LIBRARY%` | Resolved `i18n` | `vue-i18n`, `react-i18next`, `none` |
| `%DEFAULT_LOCALE%` | Resolved `default_locale` | `zh-CN`, `en-US` |

**UI install hint mapping** (substitute as a single fenced ` ```bash ` block for `%UI_INSTALL_HINT%`, and as plain inline text for `%UI_INSTALL_HINT_INLINE%`):

| `ui_library` | `%UI_INSTALL_HINT_INLINE%` |
|---|---|
| `shadcn-vue` | `%PACKAGE_MANAGER% dlx shadcn-vue@latest add <component>` |
| `shadcn-ui` | `%PACKAGE_MANAGER% dlx shadcn@latest add <component>` |
| `naive-ui` | `import { NButton, NCard, ... } from 'naive-ui'` (already installed) |
| `element-plus` | `import { ElButton, ElCard, ... } from 'element-plus'` (already installed) |
| `ant-design-vue` | `import { Button, Card, ... } from 'ant-design-vue'` (already installed) |
| `headless-only` (vue) | `import { ... } from 'reka-ui'` (compose your own component) |
| `mantine` | `import { Button, Card, ... } from '@mantine/core'` (already installed) |
| `chakra` | `import { Button, Card, ... } from '@chakra-ui/react'` (already installed) |
| `radix-only` | `%PACKAGE_MANAGER% add @radix-ui/react-<primitive>` |
| `native-primitives` | `// no install — compose with View / Text / Pressable from 'react-native'` |
| `tamagui` | `import { Button, Card } from 'tamagui'` (already installed) |
| `gluestack` | `import { Button, Card } from '@gluestack-ui/themed'` (already installed) |

When `%UI_INSTALL_HINT%` is the fenced form, ALWAYS pre-substitute `%PACKAGE_MANAGER%` inside the hint before writing — the project files should show literal `pnpm`/`npm`/`yarn`/`bun`, not the placeholder.

### 4D — CLIs

Run `<package_manager> install`. Then announce any framework CLIs from the matrix's `Post-init CLI` table:

- Auto-run when marked `auto` and the command is non-interactive (e.g. `pnpm dlx shadcn-vue@latest add button card input dialog label` accepts the component list as args, so it is non-interactive).
- For commands marked `announce` (interactive or destructive), surface the exact command to the user and instruct them to run it themselves.

Never run `shadcn init` / `shadcn-vue init` — `components.json` was written in 4A.

## Stage 5 — Report

Print a structured summary:

```
Files generated: <N>
  package.json
  tsconfig.json
  vite.config.ts
  components.json
  uno.config.ts
  .env.example
  AGENT.md                                 (snippet: project-docs/AGENT.md.tmpl)
  CLAUDE.md                                (snippet: project-docs/CLAUDE.md.tmpl)
  src/main.ts
  src/App.vue
  src/shared/http/client.ts                (snippet: http/client.web.ts)
  src/shared/http/errors.ts                (snippet: http/errors.client.ts)
  src/shared/http/errors.test.ts           (snippet: http/errors.test.ts)
  src/shared/lib/cn.ts                     (snippet: lib/cn.ts)
  src/shared/styles/tokens.css             (snippet: styles/tokens.shadcn.css)
  src/config/env.ts
  ...

CLIs executed:
  pnpm install                                                          ok
  pnpm dlx shadcn-vue@latest add button card input dialog label         ok

Next steps:
  1. Fill in .env.local from .env.example (VITE_API_BASE_URL)
  2. Run: pnpm dev
  3. Recommended checks before committing: pnpm typecheck && pnpm lint && pnpm test
  4. Read AGENT.md and CLAUDE.md in this project — they encode the per-project rules
     (including: use the chosen UI library, never hand-roll components).
  5. For deeper boundaries, fetch boundaries/common/ and boundaries/<stack>/ from the
     canonical repo when needed.

Open questions for you:
  - Auth strategy (none selected)
  - Backend origin (VITE_API_BASE_URL is set to the default; change in .env.local)
```

## Operating principles

These apply throughout every stage:

1. **Question UX is tool-dependent, not optional.** Native-multi-select tools (Claude Code) MUST batch independent questions into `AskUserQuestion` (max 4 per call). Text-only tools (Codex, Cursor terminal, Cline) MUST ask one question at a time with numbered options as plain prose — never as `key: a|b|c` code blocks or YAML. Both paths use the exact option labels defined in Stage 1; do not invent or shorten them.
2. **No silent decisions on tech selection.** If a user choice is ambiguous, ask. Defaults are explicit and surfaced in Stage 3's summary table.
3. **Snippets are fetched verbatim.** Do not re-author content that lives in `shared/snippets/` — fetch via the strategy above, copy the bytes, only substitute the documented placeholders. This is what keeps stacks consistent across runs.
4. **`shadcn init` is never run.** `components.json` is hand-written. This avoids interactive CLI prompts the workflow cannot answer cleanly.
5. **No backwards-compatibility scaffolding.** The generated project pins current major versions per the matrix's `Version baseline`. If a project needs an older major, that is a manual edit post-generation — not a matrix option.
6. **Stop on error.** If any file write fails, any fetch returns 404 with no fallback path, or any auto-run CLI exits non-zero, stop and report the partial state. Do not try to "fix forward."
7. **The architecture docs are the contract.** When a generated file conflicts with `boundaries/<stack>/ARCHITECTURE.md`, the doc is right and the matrix is wrong — fix the matrix and regenerate.

## When matrix versions drift

The `Version baseline` in each matrix is dated. When >6 months stale, the workflow should announce this at the start of Stage 4 and link the user to the matrix file for a manual bump check before installing.

Quarterly maintenance: update each matrix's `Version baseline` block, re-test by running `/new-project` for each stack into a scratch directory and running `pnpm typecheck && pnpm build`.

## Generator CLI mode (alternative to AI workflow)

The same configuration schema that powers this AI workflow is also available as a local CLI generator at `generator/`. Both modes produce equivalent output.

### CLI usage

```bash
# Interactive mode (same questions as this workflow)
pnpm --dir generator dev --target ../my-app

# Config-file mode (skip interactive prompts)
pnpm --dir generator scaffold --config scaffold.config.json --target ../my-app

# Dry-run (print file plan without writing)
pnpm --dir generator scaffold --stack react --target ../my-app --dry-run
```

### Equivalence

- The AI workflow reads `workflows/matrices/*.matrix.md` and `shared/snippets/`.
- The generator CLI reads `workflows/options/*.options.json` and `shared/snippets/`.
- Both share `schemas/scaffold-config.schema.json` for input validation and `schemas/resolved-config.schema.json` for the resolved config shape.
- Options JSON files are the machine-readable source; Markdown matrices remain the human-readable reference.

When the local generator is available, the AI should prefer it for file generation (calling `scaffold --config --dry-run` to preview, then `scaffold --config --target`) and only fall back to the manual Stage 4 approach when the generator is not installed.
