import { beforeAll, afterAll, describe, it, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'
import { afterEach } from 'node:test'

describe('Meals routes test', () => {
  beforeEach(async () => {
    execSync('npm run knex migrate:latest')
  })

  afterEach(async () => {
    execSync('npm run knex migrate:rollback --all')
  })

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('It must be possible to create a meals', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoed@email.com',
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Refeição 1',
        description: 'Refeição detalhada 1',
        isDiet: true,
      })
      .expect(201)
  })
})
