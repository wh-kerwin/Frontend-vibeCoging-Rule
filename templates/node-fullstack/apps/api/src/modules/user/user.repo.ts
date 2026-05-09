import type { UserDto } from './user.schema'

const users = new Map<string, UserDto>()

export async function findUserById(id: string): Promise<UserDto | null> {
  return users.get(id) ?? null
}

