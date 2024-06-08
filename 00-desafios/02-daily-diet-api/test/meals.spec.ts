import { beforeAll, afterAll, describe, it, beforeEach, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'
import { afterEach } from 'node:test'
import { knex } from '../src/database'
import { number } from 'zod'

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

  it('It must be possible to edit a meals', async () => {
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
    const { id } = await knex('meals').select('id').first()
    await request(app.server)
      .put(`/meals/${id}`)
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Refeição 1 Editada',
        description: 'Refeição detalhada 1 Editada',
        isDiet: false,
      })
      .expect(204)
  })

  it('It must be possible to delete a meals', async () => {
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
    const { id } = await knex('meals').select('id').first()
    await request(app.server)
      .delete(`/meals/${id}`)
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({})
      .expect(204)
  })

  it('It must be possible to get a meals by id', async () => {
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
    const { id } = await knex('meals').select('id').first()
    const mealResponse = await request(app.server)
      .get(`/meals/${id}`)
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)
    console.log(mealResponse.body)
    expect(mealResponse.body).toEqual({
      meal: expect.objectContaining({
        name: 'Refeição 1',
        description: 'Refeição detalhada 1',
        isDiet: 1,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      }),
    })
  })
})
