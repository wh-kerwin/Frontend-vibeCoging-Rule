import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { userRoute } from './modules/user/user.route'
import { requestId } from './shared/middleware/request-id'
import { serializeError } from './shared/http/errors'

export function createApp() {
  const app = new Hono()

  // ── Global middleware ────────────────────────────────────────────────────────
  app.use('*', requestId)
  app.use('*', logger())
  app.use(
    '/api/*',
    cors({
      origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
      allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['content-type', 'authorization', 'x-request-id'],
    }),
  )

  // ── Routes ───────────────────────────────────────────────────────────────────
  app.route('/api/users', userRoute)

  // ── Global error handler ─────────────────────────────────────────────────────
  app.onError((err, c) => {
    const { status, body } = serializeError(err)
    const requestId = c.var.requestId

    // Log full error internally; send only safe shape to client.
    console.error({ requestId, status, err })

    return c.json({ requestId, ...body }, status as Parameters<typeof c.json>[1])
  })

  // ── 404 catch-all ────────────────────────────────────────────────────────────
  app.notFound((c) => c.json({ code: 'NOT_FOUND', message: 'Route not found' }, 404))

  return app
}
