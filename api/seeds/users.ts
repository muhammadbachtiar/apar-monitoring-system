import { type Knex } from 'knex'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

const TABLE_NAME = 'users'

export async function seed (knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex(TABLE_NAME).del()

  const hashedPassword = await bcrypt.hash('superadminsistemapar', 10)
  const uniqueId = uuidv4()

  // Inserts seed entries
  await knex(TABLE_NAME).insert([
    {
      id: uniqueId,
      username: 'superadmin',
      email: 'superadminmanajemenapar@gmail.com',
      password: hashedPassword,
      role: 'Admin',
      name: 'SUPER ADMINISTRATOR',
      registered_time: new Date()
    }
  ])
};
