import type { Knex } from 'knex'

const TABLE_NAME = 'notifications'

export async function up (knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.uuid('id').primary().unique()
    table.uuid('id_user').notNullable().references('id').inTable('users').onDelete('CASCADE')
    table.string('title', 255).notNullable()
    table.text('message').notNullable()
    table.boolean('status_read').defaultTo(false)
    table.string('notification_type', 255).notNullable()
    table.timestamp('timestamp').defaultTo(knex.fn.now())
  })
}

export async function down (knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE_NAME)
}
