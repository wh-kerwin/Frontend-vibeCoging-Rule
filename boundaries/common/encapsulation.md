# Component & Method Encapsulation

Cross-stack rules for how to package logic. Applies to Vue components, React components, RN screens, and pure modules.

## Component Encapsulation

### One Component, One Job

If a component answers more than one question, split it. A reusable Button does not know about authentication. A UserProfileCard does not know how to fetch a user.

### Typed Boundaries

- **Props are typed.** No `any`. No untyped slots/children that pass through arbitrary data.
- **Emits/callbacks are typed.** Vue: `defineEmits<...>()`. React/RN: typed callback props (`onChange: (value: string) => void`).
- **No prop drilling beyond two levels.** If the same prop passes through three components untouched, restructure (composition, context/provide, or feature container).

### Generic UI Stays Generic

Components in `components/ui/` (shadcn primitives) and `components/patterns/` must:

- Take their data through props.
- Emit events / call callbacks. Never read from a feature store directly.
- Never import from `src/features/`.

This is the line that makes them reusable across the app and across future projects.

### Business Logic Lives Outside the Generic UI

When logic crosses one component boundary, extract it:

- Vue → composable in `features/<x>/composables/use<X>.ts`.
- React/RN → hook in `features/<x>/hooks/use<X>.ts`.
- Pure transformations → `shared/lib/` (after the second usage).

### Slots / Children for Composition

Prefer composition over configuration props when a primitive has many visual variants:

- Vue: named slots.
- React: `children` and render-prop callbacks.

A Card with `<CardHeader>`, `<CardContent>`, `<CardFooter>` slots beats a Card with 14 boolean props.

### State Lives at the Right Level

- **Local** for "only this component cares" (`ref`, `useState`).
- **Feature** for "the feature cares" (composable / hook with module-private state, or feature store).
- **URL** for "the deep-link should reproduce this" (search params).
- **Server** for "this is the canonical source" (TanStack Query cache).
- **Global** only for cross-feature user/auth/theme — and only when you have proven it cannot live in a feature container.

## Method Encapsulation

### Pure First

Functions in `shared/lib/` and `features/*/lib/` should be pure where possible: same input → same output, no side effects, no module-level mutable state.

### One Reason to Exist

A method that does two unrelated things gets split. `parseAndSaveUser` becomes `parseUser` + `saveUser`. Each is testable and reusable.

### Validate at the Boundary

External input — HTTP responses, URL params, form payloads, IPC payloads, env vars — is validated with Zod (or equivalent) at the boundary module. Once inside, types are trusted.

```ts
// API module — boundary
export async function getUser(id: string): Promise<User> {
  const data = await http.get<unknown>(`/users/${id}`)
  return userSchema.parse(data)   // validated here
}

// Feature code — trusts the type
function greetUser(user: User) {
  return `Hello, ${user.name}`     // no defensive checks needed
}
```

### Errors as Values, Where It Helps

For operations with predictable failure modes (parsing user input, async business operations), prefer a `Result<T, E>` shape over throwing — when the caller is expected to branch on the failure mode. Use exceptions for genuinely unexpected conditions.

When throwing, throw `AppError` with a meaningful `code`. See `boundaries/common/coding-style.md`.

### Cancellation Is the Caller's Choice

Async functions that hit network or long-running work accept an optional `signal: AbortSignal`. They do not create signals internally — that decision belongs to the caller.

```ts
export async function searchProducts(
  query: string,
  init?: Pick<RequestOptions, 'signal'>,
): Promise<Product[]> { ... }
```

### Stable Module Boundaries

A module's public surface is what other modules import. Mark non-exported helpers with a leading underscore or keep them inside the file. Do not export internal helpers "just in case".
