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
      })
      return reply.status(201).send()
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealSchema = z.object({
        id: z.string().uuid(),
      })
      const updateMealsSchema = z.object({
        name: z.string(),
        description: z.string(),
        isDiet: z.boolean(),
      })
      const { name, description, isDiet } = updateMealsSchema.parse(
        request.body,
      )
      const { id } = getMealSchema.parse(request.params)
      const { userId } = request
      await knex('meals')
        .update({
          name,
          description,
          isDiet,
          updated_at: new Date().toISOString(),
        })
        .where({
          id,
          user_id: userId,
        })
      return reply.status(204).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getMealSchema.parse(request.params)
      const { userId } = request
      await knex('meals').delete().where({
        id,
        user_id: userId,
      })
      return reply.status(204).send()
    },
  )

  app.get('/:id', async (request, reply) => {
    const getMeaIdSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getMeaIdSchema.parse(request.params)
    const meal = await knex('meals')
      .where({
        id,
      })
      .first()
    return reply.send({ meal })
  })

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { userId } = request
      const meals = await knex('meals').select().where({ user_id: userId })
      return reply.send({ meals })
    },
  )

  app.get(
    '/metrics',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { userId } = request
      const totalMealsOnDiet = await knex('meals')
        .where({ user_id: userId, isDiet: true })
        .count('id', { as: 'total' })
        .first()
      const totalMealsOffDiet = await knex('meals')
        .where({ user_id: userId, isDiet: false })
        .count('id', { as: 'total' })
        .first()
      const totalMeals = await knex('meals')
        .where({ user_id: userId })
        .orderBy('created_at', 'desc')
      const { bestOnDietSequence } = totalMeals.reduce(
        (acc, meal) => {
          if (meal.is_on_diet) {
            acc.currentSequence += 1
          } else {
            acc.currentSequence = 0
          }

          if (acc.currentSequence > acc.bestOnDietSequence) {
            acc.bestOnDietSequence = acc.currentSequence
          }

          return acc
        },
        { bestOnDietSequence: 0, currentSequence: 0 },
      )

      return reply.send({
        totalMeals: totalMeals.length,
        totalMealsOnDiet: totalMealsOnDiet?.total,
        totalMealsOffDiet: totalMealsOffDiet?.total,
        bestOnDietSequence,
      })
    },
  )
}
