import { z } from 'zod'
import { http } from '@/shared/http/client'

const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type Account = z.infer<typeof accountSchema>

export async function getAccount(): Promise<Account> {
  const data = await http.get<unknown>('/account')
  return accountSchema.parse(data)
}

