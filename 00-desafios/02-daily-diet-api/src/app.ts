import fastifyCookie from '@fastify/cookie'
import fastify from 'fastify'
import { usersRoute } from './routes/users'
import { mealsRoute } from './routes/meals'

export const app = fastify()

app.addHook('preHandler', async (request) => {
  console.log(`[${request.method}] - ${request.url}`)
})
app.register(fastifyCookie)
app.register(usersRoute, {
  prefix: 'users',
})
app.register(mealsRoute, {
  prefix: 'meals',
})
