# React Project Architecture

Target stack: React + TypeScript with Vite or Next.js.

## Positioning

Use React for component-heavy apps, complex interaction surfaces, ecosystem integration, and products that may need SSR or React Native code sharing.

## Directory Structure

```txt
src/
  app/
    providers/
    routes/
  components/
    ui/
    patterns/
  features/
    project/
      api/project.api.ts
      components/ProjectCard.tsx
      hooks/useProject.ts
      schemas/project.schema.ts
      views/ProjectView.tsx
  shared/
    http/
    lib/
    styles/
  stores/
```

## Component Rules

- Components are functions with typed props.
- Effects are for synchronization, not derived state.
- Put server data in TanStack Query, framework loaders, or server components depending on project type.
- Keep forms schema-driven with React Hook Form plus Zod or Valibot.
- Generic UI components do not import feature modules.

## State

- Local UI state: `useState`, `useReducer`.
- Server state: TanStack Query or framework data APIs.
- Cross-page app state: Zustand only when URL/server state is not appropriate.
- URL state: filters, tabs, pagination, search.

## HTTP

- All requests use the `http` singleton from `src/shared/http/client.ts` (same `createHttpClient` factory as the Vue stack).
- Feature API functions return `Promise<DomainType>` and parse responses with Zod schemas.
- TanStack Query handles cancellation automatically via its internal `AbortController`; pass the query's signal through when needed.
- All errors surface as `AppError` — never branch on raw status codes in components.

```ts
// features/project/api/project.api.ts
export async function getProject(id: string): Promise<Project> {
  const data = await http.get<unknown>(`/projects/${id}`)
  return projectSchema.parse(data)
}
```

## Data / State

- **Server state**: TanStack Query (`useQuery`, `useMutation`). Mount `QueryProvider` at the app root.
- **Local UI state**: `useState`, `useReducer`.
- **Cross-page app state**: Zustand — only when URL or server state is not appropriate.
- **URL state**: filters, tabs, pagination, search.

### QueryProvider setup

```tsx
// src/app/providers/QueryProvider.tsx — see template
// Wrap <App /> with <QueryProvider> in main.tsx
```

The template `QueryProvider` configures smart retry logic: 4xx errors are not retried, 5xx errors retry twice.

## Styling

Use Tailwind plus a tokenized component system. shadcn/ui is the default primitive source for Vite/Next apps unless the product has an existing design system.

Token CSS variables live in `src/shared/styles/tokens.css` (same structure as Vue stack). Import this file in `main.tsx` or the root CSS entry.

## Recommended Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Template Index

| File | Purpose |
|------|---------|
| `templates/react/package.json` | Pinned dependencies + scripts |
| `templates/react/tsconfig.json` | Strict TS config with `@` alias |
| `templates/react/tailwind.config.ts` | Tailwind token colors |
| `templates/react/.env.example` | Required env variables |
| `templates/react/src/shared/styles/tokens.css` | CSS custom properties + Tailwind directives |
| `templates/react/src/shared/http/client.ts` | `createHttpClient` factory |
| `templates/react/src/shared/http/errors.ts` | `AppError` class + `toAppError` |
| `templates/react/src/app/providers/QueryProvider.tsx` | TanStack Query root provider |
| `templates/react/src/features/project/api/project.api.ts` | API module example |
| `templates/react/src/features/project/hooks/useProject.ts` | `useQuery` hook example |
| `templates/react/src/features/project/components/ProjectCard.tsx` | Presentational component example |

