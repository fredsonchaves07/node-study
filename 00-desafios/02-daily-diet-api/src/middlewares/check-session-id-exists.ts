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

  const userId = await knex('users').where('session_id', sessionId).first()

  if (!userId) {
    return reply.status(401).send({
      error: 'Unauthorized.',
    })
  }

  request.userId = userId
}
