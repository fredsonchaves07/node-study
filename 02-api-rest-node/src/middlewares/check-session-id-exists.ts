import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessiondId = request.cookies.sessionId
  if (!sessiondId) return reply.status(401).send({ error: 'Unauthorized' })
}
