# /new-project — Interactive Project Scaffolding Workflow

This is the master protocol for creating a new project under the `frontend-rules` system. Any AI agent (Claude Code, Cursor, Cline, Codex, etc.) reads this file and executes it from top to bottom.

The Claude Code slash command at `.claude/commands/new-project.md` is a thin entry that points here.

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
2. **Load common rules into context.** Read every file in `boundaries/common/` (`coding-style.md`, `design-system.md`, `http-contract.md`, `directory-rules.md`, `async-states.md`, `encapsulation.md`). These rules apply to every generated project; subsequent stages reference them.
3. Announce: "Workspace is empty. Loaded common engineering boundaries. Starting interactive setup."

## Stage 1 — Mandatory questions

Ask all four questions in a **single `AskUserQuestion` batch** so the user answers them together. Tools that do not support batched interactive questions can fall back to numbered text prompts.

```yaml
questions:
  - id: stack
    question: "What kind of project are you creating?"
    options:
      - label: "Vue 3 web app"
        description: "Vite + SFC + composables. Default for product/admin apps."
      - label: "React web app"
        description: "Vite or Next.js. Default for component-heavy apps."
      - label: "React Native (Expo)"
        description: "iOS/Android cross-platform with Expo Router."
      - label: "Electron desktop"
        description: "Hardened main + preload + framework renderer."
      - label: "Node full-stack monorepo"
        description: "API + (optional) web app, shared TypeScript contracts."

  - id: ui_library
    question: "Primary UI library?"
    # Options filtered by stack — read from the chosen matrix's Choices.ui_library section
    # Vue:    shadcn-vue (recommended) | naive-ui | element-plus | ant-design-vue | headless-only
    # React:  shadcn-ui (recommended)  | mantine  | chakra       | radix-only
    # RN:     native-primitives        | tamagui  | gluestack
    # Electron: deferred — the renderer's framework matrix asks this
    # node-fullstack: deferred to the web sub-app's framework matrix

  - id: atomic_css
    question: "Atomic CSS solution?"
    # Options filtered by stack:
    # Web stacks: tailwind-v4+unocss (recommended) | tailwind-v4 | unocss | none
    # RN:        nativewind (recommended)         | none
    # Electron: deferred to renderer matrix
    # node-fullstack: deferred to web matrix

  - id: package_manager
    question: "Package manager?"
    options:
      - label: "pnpm (recommended)"
      - label: "npm"
      - label: "yarn"
      - label: "bun"
```

### Cross-stack follow-ups

After the batch, if the chosen `stack` requires a nested framework choice, ask **one** follow-up:

- `stack: electron` → `renderer_framework: vue | react`
- `stack: node-fullstack` → `web_framework: vue | react | none`

These trigger nested matrix entry in Stage 3 (see "Renderer / web sub-app delegation" below).

## Stage 2 — Optional deep-dive

Ask one question:

```yaml
- id: customize
  question: "Use stack defaults, or customize routing / state / data / forms / tests / animation?"
  options:
    - label: "Use stack defaults (recommended)"
      description: "Apply the Defaults table from the chosen matrix. Fast path."
    - label: "Customize"
      description: "Pick each dimension individually."
```

If `customize`, immediately ask a **single batched `AskUserQuestion`** with the per-stack optional dimensions (read from the matrix's `Choices.<dimension>` blocks beyond `ui_library` and `atomic_css`):

- **vue**: routing, state, data, forms, tests, animation
- **react**: build_tool, routing, state, data, forms, tests, animation
- **react-native**: routing, state, data, forms, tests, animation, secure_storage
- **electron**: build_tool, storage, tests, updates
- **node-fullstack**: api_framework, orm, database, tests, contracts_package

Cap each multi-option block at 4 questions per `AskUserQuestion` call — split into two calls if needed (the tool only allows 4 per batch).

## Stage 3 — Matrix lookup

1. Read `workflows/matrices/<stack>.matrix.md` for the chosen stack.
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
   ```

5. Confirm with the user via a single `AskUserQuestion`:
   > Generate this project? (`Yes, generate` / `Change a choice`)
   If "Change a choice", re-enter Stage 2's customize branch.

### Renderer / web sub-app delegation

- For `stack: electron` with `renderer_framework: vue`, recursively apply the vue matrix rooted at `src/renderer/` (not `src/`). Skip the renderer matrix's `src/shared/http/client.ts` write unless the user opts in for renderer-side HTTP.
- For `stack: node-fullstack` with `web_framework: react`, recursively apply the react matrix rooted at `apps/web/`.
- The nested entry uses the same Defaults / Stage 2 answers as the parent run for its own dimensions (do **not** re-ask `package_manager`).

## Stage 4 — Generation

Three substages, in order. Announce each substage start.

### 4A — Skeleton (write assembled files)

Build the file list from the matrix's `Universal writes` table plus any `writes` entries triggered by the chosen `Choices`. Then write:

1. `package.json` — assemble from union of `deps` and `dev_deps` across all chosen choices, plus matrix-required scripts. Use caret ranges from the matrix's `Version baseline`.
2. Top-level config files: `tsconfig.json`, `vite.config.ts` / `next.config.ts` / `electron.vite.config.ts` / `metro.config.js`, `eslint.config.js`, `.env.example`.
3. `components.json` (when shadcn-vue / shadcn-ui selected) — write the verbatim block from the matrix. **Do not run `shadcn init`.**
4. Directory skeletons: `mkdir`-equivalent for empty folders the structure expects (e.g. `src/stores/`, `src/components/ui/`, `src/components/patterns/`, `src/shared/native/` for RN).

### 4B — Snippets verbatim

For each `snippets:` entry in the matrix (and the `Universal writes` table's snippet sources), read the file from `shared/snippets/<path>` and write it to its project location. Substitute placeholders:

| Placeholder | Replace with |
|---|---|
| `%API_BASE_VAR%` | Stack-specific env var name: `VITE_API_BASE_URL` (Vue / React with Vite), `NEXT_PUBLIC_API_BASE_URL` (React with Next), `EXPO_PUBLIC_API_BASE_URL` (React Native), `PORT` (node-fullstack API), etc. |
| `%FEATURE_NAME%` | Only used when generating a feature exemplar — substitute the feature name in lowercase. |
| `%FeatureName%` | Same, PascalCase. |
| `%PACKAGE_NAME%` | The project name from `package.json`. |

If `boundaries/common/design-system.md` shows the user picked a non-default token preset (e.g. VoltAgent for dev tools), write `tokens.voltagent.css` instead of `tokens.shadcn.css`. Default is `tokens.shadcn.css`.

### 4C — CLIs

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
  4. Read boundaries/common/ for cross-stack rules
  5. Read boundaries/vue/ARCHITECTURE.md for Vue-specific rules

Open questions for you:
  - Auth strategy (none selected)
  - Backend origin (VITE_API_BASE_URL is set to the default; change in .env.local)
```

## Operating principles

These apply throughout every stage:

1. **Question batching.** Never ask one question at a time when several are independent. Use `AskUserQuestion` (4 per batch) and split if needed.
2. **No silent decisions on tech selection.** If a user choice is ambiguous, ask. Defaults are explicit and surfaced in Stage 3's summary table.
3. **Snippets are read verbatim.** Do not re-author content that lives in `shared/snippets/` — just copy and substitute placeholders. This is what keeps stacks consistent.
4. **`shadcn init` is never run.** `components.json` is hand-written. This avoids interactive CLI prompts the workflow cannot answer cleanly.
5. **No backwards-compatibility scaffolding.** The generated project pins current major versions per the matrix's `Version baseline`. If a project needs an older major, that is a manual edit post-generation — not a matrix option.
6. **Stop on error.** If any file write fails or any auto-run CLI exits non-zero, stop and report the partial state. Do not try to "fix forward."
7. **The architecture docs are the contract.** When a generated file conflicts with `boundaries/<stack>/ARCHITECTURE.md`, the doc is right and the matrix is wrong — fix the matrix and regenerate.

## When matrix versions drift

The `Version baseline` in each matrix is dated. When >6 months stale, the workflow should announce this at the start of Stage 4 and link the user to the matrix file for a manual bump check before installing.

Quarterly maintenance: update each matrix's `Version baseline` block, re-test by running `/new-project` for each stack into a scratch directory and running `pnpm typecheck && pnpm build`.
