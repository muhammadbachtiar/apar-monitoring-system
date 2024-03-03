import type { Knex } from 'knex'

const TABLE_NAME = 'apars'

export async function up (knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.string('id', 255).primary().unique()
    table.string('apar_number', 255).notNullable().unique()
    table.string('id_location', 255).notNullable().references('id').inTable('locations')
    table.string('apar_type', 255).notNullable()
    table.boolean('condition').defaultTo(true).notNullable().notNullable()
    table.timestamp('last_6montly_check_time').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('last_1montly_check_time').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('last_filing_time').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('registered_time').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down (knex: Knex): Promise<void> {
  await knex.schema.alterTable('inspection', (table) => {
    table.dropForeign(['id_apar'])
  })

  await knex.schema.dropTableIfExists(TABLE_NAME)
}
