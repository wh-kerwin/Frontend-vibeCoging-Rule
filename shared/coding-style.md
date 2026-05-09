# Shared Coding Style

## Module Shape

Use this order inside files:

1. Imports
2. Constants
3. Types and schemas
4. Public functions/components
5. Private helpers

Keep files focused. A file should usually answer one question: render this component, call this endpoint, transform this data, or own this store.

## Error Handling

Use a normalized `AppError` class that extends `Error`. All HTTP clients produce it; all UI branches on it.

```ts
export type AppErrorCode = 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION' | 'NETWORK' | 'UNKNOWN'

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: AppErrorCode,
    public readonly status?: number,  // HTTP status, omit for network/unknown
    public readonly cause?: unknown,  // original error for logging
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Server-side variant: `status` defaults to 500 and there is no NETWORK code.
// See templates/node-fullstack/apps/api/src/shared/http/errors.ts.
```

UI renders `error.message` (user-safe). Logs capture `error.cause` (technical detail).

> **Note for AI agents:** Do not create a plain `interface AppError`. Always use the class form so `instanceof` checks work across all async boundaries.

## Environment

- Read environment variables from one typed module.
- Never access `process.env` or `import.meta.env` throughout feature code.
- Document required variables in `.env.example`.

## Testing

- Unit test pure logic, adapters, and stores.
- Component test reusable UI and complex feature states.
- E2E test core product journeys.
- Prefer realistic fixtures over excessive mocks.
- **Colocate tests** next to the file they cover (`errors.ts` → `errors.test.ts`). Do not create a top-level `__tests__` folder for unit tests.
- See `templates/vue/src/shared/http/errors.test.ts` for the canonical test file shape.

