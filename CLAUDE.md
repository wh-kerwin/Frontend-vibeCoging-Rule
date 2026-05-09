# Claude Project Instructions

**Primary contract: `AGENT.md`.** Read it first. This file only lists Claude-specific adaptations.

## Required Read Order

1. `AGENT.md` — engineering rules and collaboration protocol
2. `stacks/<stack>/ARCHITECTURE.md` — target stack conventions
3. `shared/` — cross-stack contracts (http, design-system, coding-style)
4. Existing files in the target area — inspect before editing

## Working Style (Claude-specific)

- **Minimal edits.** Touch only what the task requires. If the worktree is dirty, inspect before touching.
- **Templates are canonical.** When creating new files, copy the closest `templates/<stack>/` example and adapt it. Do not invent a new style.
- **No broad rewrites** unless the user explicitly asks for a migration.
- **Explicit assumptions.** State what you are assuming before acting, especially around auth, env vars, or DB shape.

## Output Format

**Implementation task** — finish with:
```
Files changed: <list>
Checks to run: pnpm typecheck && pnpm lint && pnpm test
Known gaps: <list or "none">
```

**Architecture task** — finish with recommended stack shape, directory tree, core conventions, and which template files to copy.

## Vibe Coding Guardrails

Fast is only acceptable when the result is still easy to inspect:

- Clear modules over magic configuration
- Typed boundaries over shape-explaining comments
- Small reusable primitives over large universal components
- Boring data flow over clever state synchronization
- All four async UI states (loading / empty / error / success) — never just the success path

