/**
 * packages/contracts/%FEATURE_NAME%.ts
 *
 * Shared request/response schemas for the %FEATURE_NAME% resource.
 * Imported by both `apps/api` (validation) and `apps/web` (type inference).
 * Do NOT import framework or DB code here — this package must be isomorphic.
 */
import { z } from 'zod'

// ── Response DTO ─────────────────────────────────────────────────────────────

export const %FEATURE_NAME%DtoSchema = z.object({
  id: z.uuid(),
  // TODO: add fields the client needs to render
  createdAt: z.iso.datetime(),
})

export type %FEATURE_NAME%Dto = z.infer<typeof %FEATURE_NAME%DtoSchema>

// ── Create ───────────────────────────────────────────────────────────────────

export const create%FEATURE_NAME%BodySchema = z.object({
  // TODO: add createable fields
})

export type Create%FEATURE_NAME%Body = z.infer<typeof create%FEATURE_NAME%BodySchema>

// ── Update ───────────────────────────────────────────────────────────────────

export const update%FEATURE_NAME%BodySchema = create%FEATURE_NAME%BodySchema.partial()

export type Update%FEATURE_NAME%Body = z.infer<typeof update%FEATURE_NAME%BodySchema>

// ── Params ───────────────────────────────────────────────────────────────────

export const %FEATURE_NAME%IdParamsSchema = z.object({
  id: z.uuid(),
})
