import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.boolean('isDiet').defaultTo(false)
    table.text('created_at').defaultTo(knex.fn.now()).notNullable()
    table.text('updated_at').defaultTo(knex.fn.now()).notNullable()
    table.text('user_id').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
