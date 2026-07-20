---
name: new-project
description: Scaffold a greenfield Vue, React, React Native, Electron, or Node full-stack project with the Frontend Rules generator. Use for explicit requests such as "/new-project", "创建新项目", "scaffold a frontend project", or starting one of the supported project types in an empty directory. Do not use for adding features to an existing project or for unrelated backend-only stacks.
---

# New Project

Create projects through the deterministic generator. Use the bundled `data/` directory only for offline engineering boundaries and snippet inspection; do not assemble project files manually from Markdown when the generator is available.

## Locate The Rules Repository

Resolve `RULES_ROOT` once, in this order:

1. Use `FRONTEND_RULES_ROOT` when it contains `generator/package.json`.
2. Walk upward from this `SKILL.md` and use the first directory containing both `generator/package.json` and `workflows/options/`.
3. Reuse a cached clone at `~/.cache/frontend-rules` when it is a valid checkout.
4. With network access, clone `https://github.com/wh-kerwin/Frontend-vibeCoging-Rule.git` at branch `main` into that cache.

Stop with a concrete error when no generator can be located. Do not silently switch to model-authored scaffolding.

## Preflight

1. Require the target directory to be empty except for `.git/`.
2. Derive a package name from the target folder and ask for confirmation or a replacement. Require the name to match `^[a-z0-9@][a-z0-9._@/-]*$`.
3. Read `workflows/options/global.options.json` and only the selected stack's options file. Read a nested Vue/React options file only after the user selects that renderer or web framework.

## Ask Questions

For text chat, ask exactly one question at a time with numbered options and wait for the answer. For a native structured-question tool, group independent single-choice questions, but preserve dependencies between answers.

Ask in this order:

1. Project stack: Vue, React, React Native, Electron, or Node full-stack.
2. For Electron, renderer framework: Vue or React. For Node full-stack, web framework: Vue, React, or none.
3. Package manager: pnpm, npm, yarn, or bun.
4. Setup depth:
   1. Recommended defaults: accept all matrix and global defaults.
   2. Customize: ask applicable dimensions from the selected options JSON.

In customize mode:

- Ask parent-stack dimensions first.
- When a renderer/web framework exists, also ask its `uiLibrary`, `atomicCss`, `routing`, `state`, `data`, `forms`, `tests`, and `animation` dimensions when present.
- Ask global `theme`, then `themePreset` when applicable, then `i18n`.
- When i18n is enabled, ask `defaultLocale` and `locales`.

Use exact choice values from JSON. Never accept a choice belonging to another stack.

## Generate

1. Build a `scaffold.config.json` object in memory using camelCase keys from the schema.
2. Write it to an OS temporary file outside the empty target directory.
3. Run from `RULES_ROOT/generator`:

```bash
npm ci
npx tsx src/cli.ts scaffold --config <temp-config> --target <target> --dry-run
```

4. Present the resolved choices and planned files. Ask whether to generate or change a specific answer.
5. For `change`, update only the named answer, revalidate, and repeat dry-run.
6. For `generate`, rerun without `--dry-run`.
7. Delete the temporary config.

Do not run `shadcn init`. When the plan announces a pinned, non-interactive component seeding command, run it only after dependency installation. Never substitute an `@latest` command for a pinned command.

## Verify

Run the generated project's package-manager equivalents of:

```bash
<pm> install
<pm> typecheck
<pm> build
<pm> test
```

Skip only scripts that are absent from `package.json`, and report each skip. On failure, preserve the generated files, identify the failing command, and fix deterministic generator/template defects in the rules repository before regenerating. Retry transient network failures; do not conceal partial state.

Report the target path, resolved choices, generated file count, executed commands, verification results, and any manually announced commands.

## Maintain The Bundle

When editing this skill inside the rules repository, run:

```bash
node skills/new-project/scripts/sync-bundle.mjs
node skills/new-project/scripts/validate-bundle.mjs
```

The scripts keep bundled boundaries, matrices, and snippets synchronized with canonical repository files.
