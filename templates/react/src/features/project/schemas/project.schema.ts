import { z } from 'zod'

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string(),
})

export type Project = z.infer<typeof projectSchema>

