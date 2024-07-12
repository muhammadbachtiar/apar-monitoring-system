import type { Knex } from 'knex'

const TABLE_NAME = 'location_checker'

export async function up (knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.uuid('id').primary().unique()
    table.uuid('id_user').notNullable().references('id').inTable('users').onDelete('CASCADE')
    table.uuid('id_location').notNullable().references('id').inTable('locations').onDelete('CASCADE')
    table.string('checker_type', 255).notNullable()
  })
}

export async function down (knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE_NAME)
}
