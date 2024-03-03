import type { Knex } from 'knex'

const TABLE_NAME = 'inspection'

export async function up (knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.string('id', 255).primary().unique()
    table.json('documents')
    table.json('result_check')
    table.string('id_apar', 255).notNullable().references('id').inTable('apars')
    table.string('checker_account_id', 255).notNullable().references('id').inTable('users')
    table.string('checker_name', 255).notNullable()
    table.boolean('status_check').defaultTo(true).notNullable().notNullable()
    table.timestamp('check_time').defaultTo(knex.fn.now()).notNullable()
    table.string('inspection_type', 255).notNullable()
  })
}

export async function down (knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE_NAME)
}
