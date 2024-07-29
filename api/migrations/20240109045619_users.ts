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

  await knex.schema.raw(`
    ALTER TABLE ${TABLE_NAME}
    ADD CONSTRAINT username_length CHECK (LENGTH(username) >= 8),
    ADD CONSTRAINT name_length CHECK (LENGTH(name) >= 3),
    ADD CONSTRAINT name_valid CHECK (name ~ '^[a-zA-Z\\s]+$'),
    ADD CONSTRAINT password_length CHECK (LENGTH(password) >= 8),
    ADD CONSTRAINT email_format CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
  `)
}

export async function down (knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE_NAME)
}
