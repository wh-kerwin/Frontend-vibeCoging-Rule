import { z } from 'zod'

export const userIdParamsSchema = z.object({
  id: z.string().uuid(),
})

export const userDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
})

export type UserDto = z.infer<typeof userDtoSchema>

