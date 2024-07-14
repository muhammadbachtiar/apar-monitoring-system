import type { Knex } from 'knex'

const TABLE_NAME = 'locations'

export async function up (knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.uuid('id').primary().unique()
    table.string('location_name', 160).notNullable().unique()
    table.timestamp('registered_time').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('update_time').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down (knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE_NAME)
}
