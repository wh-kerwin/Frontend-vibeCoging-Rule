import { AppError } from '../../shared/http/errors'
import { findUserById } from './user.repo'

export async function getUser(id: string) {
  const user = await findUserById(id)
  if (!user) throw new AppError('User not found', 'NOT_FOUND', 404)
  return user
}

