import type { Knex } from 'knex'

const TABLE_NAME = 'users'

export async function up (knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.uuid('id').primary().unique()
    table.string('username', 32).notNullable().unique()
    table.string('email', 48).notNullable().unique()
    table.string('password', 100).notNullable()
    table.enum('role', ['Admin', 'Viewer', 'Checker']).notNullable().defaultTo('Viewer')
    table.string('name', 52).notNullable()
    table.timestamp('registered_time').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down (knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE_NAME)
}
