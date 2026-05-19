import type { Context, Next } from 'hono'

const REQUEST_ID_HEADER = 'x-request-id'

/**
 * Injects a trace ID on every request.
 * Forwards the client-supplied ID if present; otherwise generates one.
 * The ID is stored in `c.var.requestId` and echoed back in the response.
 */
export async function requestId(c: Context, next: Next) {
  const id = c.req.header(REQUEST_ID_HEADER) ?? crypto.randomUUID()
  c.set('requestId', id)
  await next()
  c.res.headers.set(REQUEST_ID_HEADER, id)
}

// Augment Hono's variable map so TypeScript knows about requestId.
declare module 'hono' {
  interface ContextVariableMap {
    requestId: string
  }
}
