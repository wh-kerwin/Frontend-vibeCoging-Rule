# /new-project Workflow

Use this protocol to create a greenfield Vue, React, React Native, Electron, or Node full-stack project. The TypeScript generator is the only component allowed to write project files. AI tools collect choices, produce validated configuration, preview the plan, and invoke the generator.

## Canonical Source

```text
Repository: wh-kerwin/Frontend-vibeCoging-Rule
Branch: main
RAW base: https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/
API base: https://api.github.com/repos/wh-kerwin/Frontend-vibeCoging-Rule/contents/
```

Resolve `RULES_ROOT` in this order:

1. `FRONTEND_RULES_ROOT`, when it contains `generator/package.json`.
2. A local ancestor containing `generator/package.json` and `workflows/options/`.
3. A valid cached checkout at `~/.cache/frontend-rules`.
4. Clone the canonical repository at `main` into that cache.

When only document fetching is available, fetch RAW first and use the GitHub contents API with base64 decoding as fallback. Cache each fetched path for the run. Generation still requires a local checkout containing `generator/`; stop rather than inventing project files when it cannot be obtained.

## Source Of Truth

- `boundaries/**`: normative engineering constraints.
- `schemas/*.json`: input and resolved configuration contracts.
- `workflows/options/*.options.json`: operational choices, defaults, dependencies, writes, and commands.
- `shared/snippets/**`: canonical reusable source.
- `generator/**`: the only project writer.
- `workflows/matrices/*.matrix.md`: human-readable reference; JSON options win when values drift.

## Interaction Rules

For text-only chat, ask one question at a time with numbered options and wait for a number or option name. Do not emit YAML, compact `key: a|b|c` forms, or all questions at once.

For native structured-question tools, group independent single-choice questions but keep dependent questions sequential. “Multi-select” must not be used for dimensions that accept one value.

Use exact values and labels from the relevant options JSON. Do not accept a choice belonging to another stack.

## Stage 0: Preflight

1. Require the target directory to be empty except for `.git/`.
2. Resolve `RULES_ROOT`.
3. Read `schemas/scaffold-config.schema.json` and `workflows/options/global.options.json`.
4. Derive the project name from the target folder and ask the user to confirm or replace it. Require `^[a-z0-9@][a-z0-9._@/-]*$`.
5. Announce the resolved rules source and target directory.

## Stage 1: Project Shape

Ask the stack:

1. `vue`
2. `react`
3. `react-native`
4. `electron`
5. `node-fullstack`

Then read only `workflows/options/<stack>.options.json`.

For `electron`, ask `rendererFramework`: `vue` or `react`. For `node-fullstack`, ask `webFramework`: `vue`, `react`, or `none`. Read a Vue/React options file only after that answer.

Ask `packageManager`: `pnpm`, `npm`, `yarn`, or `bun`.

## Stage 2: Setup Depth

Ask:

1. `defaults` (recommended): use stack, nested-stack, and global defaults without more technology questions.
2. `customize`: ask applicable dimensions from the loaded options JSON.

In customize mode:

1. Ask the parent stack's dimensions in their JSON order.
2. For Electron/Node with a UI sub-app, ask its `uiLibrary`, `atomicCss`, `routing`, `state`, `data`, `forms`, `tests`, and `animation` dimensions when present. UI and CSS are not silently defaulted.
3. Ask global `theme` and `themePreset`.
4. Ask stack-appropriate `i18n`. When enabled, ask `defaultLocale` and comma-separated `locales`.

Do not expose placeholder features. Authentication and arbitrary token-file presets are out of scope until the schema and generator implement them.

## Stage 3: Resolve And Preview

Build an in-memory config using schema casing:

```json
{
  "name": "my-app",
  "stack": "react",
  "packageManager": "pnpm",
  "choices": {
    "uiLibrary": "shadcn-ui",
    "atomicCss": "tailwind-v4+unocss",
    "theme": "light-dark-system",
    "themePreset": "shadcn-neutral",
    "i18n": "none"
  }
}
```

Omit answers that use defaults. Write the config to an OS temporary file outside the empty target directory.

From `RULES_ROOT/generator`, run:

```bash
npm ci
npx tsx src/cli.ts scaffold --config <temp-config> --target <target> --dry-run
```

If validation fails, return to the specific invalid answer. Do not continue with partial configuration.

Show resolved choices and the dry-run file list, then ask:

1. `generate`
2. `change`

For `change`, ask which field to revise, update only that field, and repeat validation plus dry-run. Stack changes invalidate incompatible nested and stack-specific answers.

## Stage 4: Generate

After confirmation, rerun without `--dry-run`:

```bash
npx tsx src/cli.ts scaffold --config <temp-config> --target <target>
```

Delete the temporary config after generation.

Run the selected package manager's install command. Run only pinned, non-interactive commands marked `auto` in the resolved plan. Announce commands marked `announce` without executing them. Never run `shadcn init`, and never replace a pinned CLI version with `@latest`.

On a transient download failure, retry once. On validation, write, or build failure, preserve partial state and report the exact command and path. Fix deterministic generator/template defects at their source and regenerate; do not hand-edit a one-off output while leaving the generator broken.

## Stage 5: Verify And Report

Run available scripts in this order:

```bash
<pm> typecheck
<pm> build
<pm> test
```

Report absent scripts as skipped. A successful run reports:

- target path and project name;
- resolved stack and choices;
- generated file count;
- install and post-init commands executed;
- typecheck, build, and test results;
- manual commands still required.

Generated projects contain root `AGENTS.md` and `CLAUDE.md`. Composite projects contain one root set; nested renderer/web projects do not receive duplicate agent instruction files.

## Repository Maintenance

Every change to defaults, matrices, snippets, or generator behavior must pass:

```bash
npm --prefix generator test
npm --prefix generator run typecheck
npm --prefix generator run build
node skills/new-project/scripts/sync-bundle.mjs
node skills/new-project/scripts/validate-bundle.mjs
```

Maintain generation contract tests for all five default stacks plus Electron Vue/React and Node API-only/Vue/React variants. Test required entry files, path prefixes, package metadata, unresolved placeholders, and duplicate paths.
