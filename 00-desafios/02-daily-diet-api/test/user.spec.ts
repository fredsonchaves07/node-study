import {
  beforeAll,
  afterAll,
  describe,
  it,
  beforeEach,
  expect,
  afterEach,
} from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('User routes test', () => {
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

  it('It must be possible to create a user', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoed@email.com',
      })
      .expect(201)
    const cookies = response.get('Set-Cookie')
    expect(cookies).toEqual(
      expect.arrayContaining([expect.stringContaining('sessionId')]),
    )
  })
})
