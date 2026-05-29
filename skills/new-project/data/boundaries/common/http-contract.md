# Shared HTTP Contract

## Request Flow

Feature UI → feature API module → shared HTTP client → server.

Feature components must not call `fetch`, `axios`, or SDK clients directly.

## Client Responsibilities

The shared `createHttpClient` factory handles:

- Base URL resolution
- Timeout (default 15 s) with `AbortController`
- `x-request-id` trace header injection (random ID, or forwarded from caller)
- `Authorization: Bearer <token>` injection via `getToken` option
- JSON body serialization and response parsing
- `AppError` normalization — all errors surface as `AppError`, never raw `Response` or `DOMException`

**Schema validation is NOT the client's job.** Each API module parses the response with its own Zod schema after receiving `unknown` from the client. This keeps the client generic and the schema close to the business type.

Two canonical implementations:

- `shared/snippets/http/client.web.ts` — uses `window.setTimeout` (Vue, React, Electron renderer).
- `shared/snippets/http/client.rn.ts` — uses global `setTimeout` (React Native — `window` is undefined there).

The error variants:

- `shared/snippets/http/errors.client.ts` — has a `NETWORK` code; status is optional (network failures have no HTTP status).
- `shared/snippets/http/errors.server.ts` — no `NETWORK` code; status defaults to 500; adds `serializeError` for response shaping.

## Abort / Signal Pattern

Pass a signal from the caller to cancel in-flight requests:

```ts
export async function getUser(id: string, init?: Pick<RequestOptions, 'signal'>): Promise<User> {
  const data = await http.get<unknown>(`/users/${id}`, init)
  return userSchema.parse(data)
}
```

In Vue composables, create an `AbortController` inside `watchEffect` and call `abort()` in `onCleanup`. In React, TanStack Query handles cancellation automatically.

## API Module Example

```ts
import { http } from '@/shared/http/client'
import { userSchema, type User } from './user.schema'

export async function getUser(id: string, init?: Pick<RequestOptions, 'signal'>): Promise<User> {
  const data = await http.get<unknown>(`/users/${id}`, init)
  return userSchema.parse(data)   // validation here, not inside the client
}
```

## Methods Provided

`http.get` · `http.post` · `http.patch` · `http.put` · `http.delete`

All accept an optional `RequestOptions` bag (`signal`, `timeoutMs`, extra headers).
