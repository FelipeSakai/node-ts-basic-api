import fastify from 'fastify'
import { knexInstance } from './database.js'

const app = fastify()

app.get('/hello', async () => {
    const tables = await knexInstance('transactions')
        .insert({
            id: crypto.randomUUID(),
            title: 'Teste',
            amount: 1000,
        }).returning('*')
    return tables
})

app
    .listen({
        port: 3333,
    })
    .then(() => {
        console.log('Server is running on http://localhost:3333')
    })
