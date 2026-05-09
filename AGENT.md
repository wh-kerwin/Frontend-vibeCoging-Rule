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

1. Read the stack-specific architecture file under `stacks/`.
2. Inspect existing code patterns before editing.
3. Make the narrowest change that satisfies the request.
4. Add or update examples/templates when a new convention is introduced.
5. Run the relevant checks listed in the stack file.
6. Report changed files and verification results.

When creating a new project:

1. Choose the closest stack from `stacks/`.
2. Copy relevant files from `templates/`.
3. Keep the generated structure minimal until the product needs more.
4. Document deviations in the project README.

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

- Vue: `stacks/vue/ARCHITECTURE.md`
- React: `stacks/react/ARCHITECTURE.md`
- Node full stack: `stacks/node-fullstack/ARCHITECTURE.md`
- Electron: `stacks/electron/ARCHITECTURE.md`
- React Native: `stacks/react-native/ARCHITECTURE.md`
- Shared conventions: `shared/`

