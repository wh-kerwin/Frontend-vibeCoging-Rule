# Claude Project Instructions

**Primary contract: `AGENT.md`.** Read it first. This file only lists Claude-specific adaptations.

## Required Read Order

1. `AGENT.md` — engineering rules and collaboration protocol
2. `boundaries/<stack>/ARCHITECTURE.md` — target stack conventions
3. `boundaries/common/` — cross-stack rules (coding-style, http-contract, design-system, directory-rules, async-states, encapsulation)
4. Existing files in the target area — inspect before editing

## Working Style (Claude-specific)

- **Minimal edits.** Touch only what the task requires. If the worktree is dirty, inspect before touching.
- **Snippets are canonical.** When generating shared infrastructure (HTTP client, AppError, cn util, tokens), copy verbatim from `shared/snippets/` and substitute placeholders. Do not re-author this code.
- **No broad rewrites** unless the user explicitly asks for a migration.
- **Explicit assumptions.** State what you are assuming before acting, especially around auth, env vars, or DB shape.

## Creating a New Project

Use the `/new-project` slash command. It executes `workflows/new-project.md`, which asks for stack / UI library / atomic CSS / package manager, looks up the matching `workflows/matrices/<stack>.matrix.md`, and assembles a complete project from `boundaries/` rules and `shared/snippets/` infrastructure.

Do not pre-write static templates outside of the workflow path.

## Output Format

**Implementation task** — finish with:
```
Files changed: <list>
Checks to run: pnpm typecheck && pnpm lint && pnpm test
Known gaps: <list or "none">
```

**Architecture task** — finish with recommended stack shape, directory tree, core conventions, and which snippets / matrix entries to use.

## Vibe Coding Guardrails

Fast is only acceptable when the result is still easy to inspect:

- Clear modules over magic configuration
- Typed boundaries over shape-explaining comments
- Small reusable primitives over large universal components
- Boring data flow over clever state synchronization
- All four async UI states (loading / empty / error / success) — never just the success path
