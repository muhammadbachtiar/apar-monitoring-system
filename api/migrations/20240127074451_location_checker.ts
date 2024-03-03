import type { Knex } from 'knex'

const TABLE_NAME = 'location_checker'

export async function up (knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.string('id', 255).primary().unique()
    table.string('id_user', 255).notNullable().references('id').inTable('users').onDelete('CASCADE')
    table.string('id_location', 255).notNullable().references('id').inTable('locations').onDelete('CASCADE')
    table.string('checker_type', 255).notNullable()
  })
}

export async function down (knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE_NAME)
}
