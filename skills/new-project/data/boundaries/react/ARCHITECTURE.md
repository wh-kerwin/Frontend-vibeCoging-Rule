# React Project Architecture

Default stack and version pins live in `workflows/matrices/react.matrix.md`. This file defines the architectural rules that hold regardless of which UI library / state library / data layer the matrix selects.

## Positioning

Use React for component-heavy apps, complex interaction surfaces, ecosystem integration, and products that may need SSR or React Native code sharing.

## Directory Structure

```txt
src/
  app/
    providers/           # QueryProvider, ThemeProvider, ErrorBoundary
    routes/              # only if react-router; Next.js uses app/ at repo root
  components/
    ui/                  # shadcn/ui primitives (when shadcn selected)
    patterns/
  features/
    <feature>/
      api/<feature>.api.ts
      components/<Feature><Surface>.tsx
      hooks/use<Feature>.ts
      schemas/<feature>.schema.ts
      views/<Feature>View.tsx
  shared/
    http/                # from shared/snippets/http/client.web.ts + errors.client.ts
    lib/                 # cn.ts, format helpers
    styles/              # from shared/snippets/styles/tokens.<preset>.css
  stores/                # only when a global store (Zustand/Jotai) is selected
```

See `boundaries/common/directory-rules.md` for the cross-stack rules.

## Component Rules

- Components are functions with typed props.
- Effects are for synchronization, not derived state. Derive with `useMemo` / by computing during render.
- Put server data in TanStack Query, framework loaders, or server components depending on project type.
- Keep forms schema-driven with React Hook Form + Zod (or Valibot).
- Generic UI components do not import feature modules.
- See `boundaries/common/encapsulation.md` for the cross-stack component contract.

## State

| Where it belongs | Tool |
|---|---|
| Local UI state | `useState`, `useReducer` |
| Server state | TanStack Query (`useQuery`, `useMutation`) or framework data APIs |
| Cross-page app state | Zustand (or chosen alternative) — only when URL/server state cannot serve |
| URL state | search params via `useSearchParams` (filters, tabs, pagination, search) |

When Next.js is selected, prefer server components for data-bound trees and only escalate to client components at interactivity boundaries.

## HTTP

- All requests use the `http` singleton from `src/shared/http/client.ts` (same `createHttpClient` factory as the Vue stack — from `shared/snippets/http/client.web.ts`).
- Feature API functions return `Promise<DomainType>` and parse responses with Zod schemas at the boundary.
- TanStack Query handles cancellation automatically via its internal `AbortController`; forward the query's signal when needed: `({ signal }) => getProject(id, { signal })`.
- All errors surface as `AppError` — never branch on raw status codes in components.
- See `boundaries/common/http-contract.md`.

```tsx
// features/project/api/project.api.ts
export async function getProject(id: string, init?: Pick<RequestOptions, 'signal'>): Promise<Project> {
  const data = await http.get<unknown>(`/projects/${id}`, init)
  return projectSchema.parse(data)
}
```

## Data Provider Setup

When TanStack Query is selected, `QueryProvider` mounts at the app root. The snippet at `shared/snippets/query/QueryProvider.tsx` configures smart retry: 4xx errors are not retried, 5xx errors retry twice.

```tsx
// src/main.tsx
import { QueryProvider } from '@/app/providers/QueryProvider'

createRoot(document.getElementById('root')!).render(
  <QueryProvider>
    <App />
  </QueryProvider>,
)
```

## Styling

When the matrix selects shadcn/ui + Tailwind v4:

- **Tailwind v4** owns colors/spacing/responsive. CSS-first config via `@theme inline` inside `src/shared/styles/tokens.css`.
- **shadcn/ui** primitives in `src/components/ui/*`. Add via the pinned project command, for example `pnpm dlx shadcn@2.4 add <name>`.
- **UnoCSS** (optional hybrid) for shortcuts and icon utilities.

Two token presets in `shared/snippets/styles/` — `tokens.shadcn.css` (default) and `tokens.voltagent.css` (dev-tool palette).

## Recommended Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Generate a Project

Run `/new-project` (Claude Code) or follow `workflows/new-project.md`. Stack defaults in `workflows/matrices/react.matrix.md`.
