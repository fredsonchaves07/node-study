import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { knex } from '../database'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()

      return { transactions }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getTransactionParamsSchema.parse(request)
      const { sessionId } = request.cookies
      const transation = await knex('transactions')
        .where({
          id,
          session_id: sessionId,
        })
        .first()
      return { transation }
    },
  )

  app.post('/', async (request, reply) => {
    const createTransactionsBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })
    const { title, amount, type } = createTransactionsBodySchema.parse(
      request.body,
    )
    let sessionId = request.cookies.sessionId
    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    }
    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount,
      session_id: sessionId,
    })
    return reply.status(201).send()
  })

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessiondId } = request.cookies
      const summary = await knex('transactions')
        .where('sessiondId', sessiondId)
        .sum('amount', { as: 'amount' })
        .first()
      return { summary }
    },
  )
}
