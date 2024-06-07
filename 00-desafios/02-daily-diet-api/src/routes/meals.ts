import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoute(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealsSchema = z.object({
        name: z.string(),
        description: z.string(),
        isDiet: z.boolean(),
      })
      const { name, description, isDiet } = createMealsSchema.parse(
        request.body,
      )
      const { userId } = request
      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        isDiet,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
      })
      return reply.status(201).send()
    },
  )
}
