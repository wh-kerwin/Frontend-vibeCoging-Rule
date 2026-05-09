/**
 * packages/contracts/user.ts
 *
 * Shared request/response schemas for the User resource.
 * Imported by both `apps/api` (validation) and `apps/web` (type inference).
 * Do NOT import framework or DB code here – this package must be isomorphic.
 */
import { z } from 'zod'

// ── Response DTO ─────────────────────────────────────────────────────────────

export const userDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
})

export type UserDto = z.infer<typeof userDtoSchema>

// ── Create ───────────────────────────────────────────────────────────────────

export const createUserBodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
})

export type CreateUserBody = z.infer<typeof createUserBodySchema>

// ── Update ───────────────────────────────────────────────────────────────────

export const updateUserBodySchema = createUserBodySchema.partial()

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>

// ── Params ───────────────────────────────────────────────────────────────────

export const userIdParamsSchema = z.object({
  id: z.string().uuid(),
})
