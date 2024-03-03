import type { Knex } from 'knex'
import databaseConfig from './src/config/databaseConfig'

// Update with your config settings.

const config: Record<string, Knex.Config> = {
  development: {
    client: 'postgresql',
    connection: {
      database: 'apar_management_system',
      user: 'muhammadbachtiar',
      password: '123456',
      port: 5000
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'pg',
    connection: databaseConfig,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

}

export default config
