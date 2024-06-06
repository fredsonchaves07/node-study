import { beforeAll, afterAll, describe, it, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('User routes', () => {
  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })
})

it('It must be possible to create a user', async () => {
  await request(app.server)
    .post('/users')
    .send({
      name: 'John Doe',
      email: 'johndoed@email.com',
    })
    .expect(201)
})
