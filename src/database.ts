import knex from 'knex'
import type { Knex } from 'knex'

export const config: Knex.Config = {
    client: 'sqlite3',
    connection: {
        filename: './db/app.db',
    },
    useNullAsDefault: true,
    migrations: {
        extension: 'ts',
        directory: './db/migrations',
    },
}

export const knexInstance = knex(config)
