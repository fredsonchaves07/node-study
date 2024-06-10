import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized.',
    })
  }

  const { id } = await knex('users')
    .select('id')
    .where('session_id', sessionId)
    .first()

  if (!id) {
    return reply.status(401).send({
      error: 'Unauthorized.',
    })
  }
  request.userId = id
}
