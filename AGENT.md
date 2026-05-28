# Frontend Vibe Coding Agent Guide

This repository defines a standardized frontend development system for AI agents and human developers. Treat this file as the primary operating contract.

## Philosophy

Vibe coding here means fast product intuition with strict engineering rails:

- Build the smallest complete experience that can be used, reviewed, and extended.
- Prefer direct, readable code over clever abstractions.
- Keep UI work close to product intent: every component should explain what it does by its name, props, and state.
- Let conventions carry the team. If a rule exists here, follow it before inventing a new local style.
- Optimize for AI collaboration: explicit file names, stable boundaries, typed contracts, and examples beside rules.

## Default Engineering Rules

- Use TypeScript for application code.
- Use feature-first folders for product modules and shared folders only for genuinely reusable primitives.
- Keep business logic outside UI components when it crosses one component boundary.
- Avoid hidden global state. State must be local, URL-based, server-backed, or stored in a named module.
- Validate external input at the boundary with a schema library such as Zod, Valibot, or the framework-native equivalent.
- Centralize HTTP clients, error mapping, auth injection, and request cancellation.
- Components must expose clear props and events/callbacks. Do not read unrelated global state inside generic components.
- Styling must be token-based. Do not scatter one-off color values across features.
- Every feature should include loading, empty, error, and success states when it touches async data.

## AI Collaboration Protocol

When modifying a project:

1. Read the stack-specific architecture file under `boundaries/<stack>/`.
2. Inspect existing code patterns before editing.
3. Make the narrowest change that satisfies the request.
4. Add or update examples/snippets when a new convention is introduced.
5. Run the relevant checks listed in the stack file.
6. Report changed files and verification results.

When creating a new project:

- **Claude Code users**: install the `skills/new-project/` skill (`claude skills install ...`), then run `/new-project` in any empty directory. The skill fetches the canonical workflow from this repo at runtime.
- **Other AI tools**: read `workflows/new-project.md` directly (fetch from the canonical GitHub repo) and follow it stage by stage.
- The workflow asks for project type, UI library, atomic CSS, and package manager, then generates a complete project assembled from `boundaries/<stack>/ARCHITECTURE.md`, `workflows/matrices/<stack>.matrix.md`, and `shared/snippets/**`.
- Do not pre-write static templates. The workflow (via skill or direct fetch) is the single entry point.

## Naming

- Files: kebab-case, except framework-required files.
- Components: PascalCase.
- Hooks/composables: `useXxx`.
- Stores: `useXxxStore`.
- Services: `xxx.service.ts`.
- API clients: `xxx.api.ts`.
- Types: `xxx.types.ts`.
- Schemas: `xxx.schema.ts`.
- Tests: colocated as `*.test.ts` or `*.spec.ts`.

## Quality Bar

- Code must typecheck.
- New shared logic needs focused tests.
- UI changes need at least one realistic example or story when the project supports it.
- Avoid adding dependencies unless they replace meaningful custom code or are already standard for the stack.
- Public APIs must be documented by types and a short usage example.

## Stack Index

- Vue: `boundaries/vue/ARCHITECTURE.md` — matrix: `workflows/matrices/vue.matrix.md`
- React: `boundaries/react/ARCHITECTURE.md` — matrix: `workflows/matrices/react.matrix.md`
- Node full stack: `boundaries/node-fullstack/ARCHITECTURE.md` — matrix: `workflows/matrices/node-fullstack.matrix.md`
- Electron: `boundaries/electron/ARCHITECTURE.md` (+ `security-checklist.md`) — matrix: `workflows/matrices/electron.matrix.md`
- React Native: `boundaries/react-native/ARCHITECTURE.md` — matrix: `workflows/matrices/react-native.matrix.md`
- Cross-stack rules: `boundaries/common/` (coding-style, design-system, http-contract, directory-rules, async-states, encapsulation)
- Reusable code snippets: `shared/snippets/`

## Canonical source

This repo is published at:

```
GitHub:    https://github.com/wh-kerwin/Frontend-vibeCoging-Rule
Branch:    main
RAW base:  https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/
API base:  https://api.github.com/repos/wh-kerwin/Frontend-vibeCoging-Rule/contents/
```

The workflow fetches files from GitHub at runtime — the user does not need a local clone in the target project. See `README.md` for the per-AI-tool memory config that points to this repo.

