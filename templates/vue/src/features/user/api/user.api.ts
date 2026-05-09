import { http, type RequestOptions } from '@/shared/http/client'
import { userSchema, type User } from '../schemas/user.schema'

export async function getUserProfile(id: string, init?: Pick<RequestOptions, 'signal'>): Promise<User> {
  const data = await http.get<unknown>(`/users/${id}`, init)
  return userSchema.parse(data)
}

