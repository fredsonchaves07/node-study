import { beforeAll, afterAll, describe, it, beforeEach, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'
import { knex } from '../src/database'

describe('Meals routes test', () => {
  beforeAll(async () => {
    execSync('npm run knex migrate:rollback --all')
    await app.ready()
  })

  afterAll(async () => {
    execSync('npm run knex migrate:rollback --all')
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
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
        created_at: expect.any(String),
        updated_at: expect.any(String),
        user_id: expect.any(String),
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
    expect(mealResponse.body).toEqual({
      meal: expect.objectContaining({
        name: 'Refeição 1',
        description: 'Refeição detalhada 1',
        isDiet: 1,
        created_at: expect.any(String),
        updated_at: expect.any(String),
        user_id: expect.any(String),
      }),
    })
  })

  it('It must be possible to get a meals by user', async () => {
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
    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Refeição 2',
        description: 'Refeição detalhada 2',
        isDiet: false,
      })
      .expect(201)
    const mealResponse = await request(app.server)
      .get(`/meals`)
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)
    expect(mealResponse.body.meals[0]).toEqual(
      expect.objectContaining({
        name: 'Refeição 1',
        description: 'Refeição detalhada 1',
        isDiet: 1,
        created_at: expect.any(String),
        updated_at: expect.any(String),
        user_id: expect.any(String),
      }),
    )
    expect(mealResponse.body.meals[1]).toEqual(
      expect.objectContaining({
        name: 'Refeição 2',
        description: 'Refeição detalhada 2',
        isDiet: 0,
        created_at: expect.any(String),
        updated_at: expect.any(String),
        user_id: expect.any(String),
      }),
    )
  })
})
