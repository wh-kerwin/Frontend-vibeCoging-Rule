import { Hono } from 'hono'
import { getUser } from './user.service'
import { userIdParamsSchema } from './user.schema'

export const userRoute = new Hono()

userRoute.get('/:id', async (c) => {
  const params = userIdParamsSchema.parse(c.req.param())
  const user = await getUser(params.id)
  return c.json(user)
})

