import type { Knex } from 'knex'

const TABLE_NAME = 'apars'

export async function up (knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.uuid('id').primary().unique()
    table.string('apar_number', 16).notNullable().unique()
    table.uuid('id_location').notNullable().references('id').inTable('locations')
    table.string('apar_type', 52).notNullable()
    table.boolean('condition').defaultTo(true).notNullable().notNullable()
    table.timestamp('last_6montly_check_time').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('last_1montly_check_time').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('last_filing_time').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('registered_time').defaultTo(knex.fn.now()).notNullable()
  })

  await knex.schema.raw(`
    ALTER TABLE ${TABLE_NAME}
    ADD CONSTRAINT apar_number_length CHECK (LENGTH(apar_number) >= 4),
    ADD CONSTRAINT apar_type_not_empty CHECK (apar_type <> '')
  `)
}

export async function down (knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE_NAME)
}
