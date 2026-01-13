import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { randomUUID } from "node:crypto"
import { knexInstance } from "../database.js"

export async function transactionRoutes(app: FastifyInstance) {
    app.get('/', async () => {
        const transactions = await knexInstance('transactions').select()
        return { transactions }
    })

    app.get('/:id', async (request) => {
        const getTransactionParamsSchema = z.object({
            id: z.string().uuid(),

        })
        const { id } = getTransactionParamsSchema.parse(request.params)

        const transaction = await knexInstance('transactions').where('id', id).first()

        return { transaction }
    })

    app.get('/summary', async () => {
        const summary = await knexInstance('transactions').sum('amount', { as: 'amount' }).first()

        return { summary }
    })

    app.post('/', async (request, reply) => {

        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        })

        const { title, amount, type } = createTransactionBodySchema.parse(
            request.body,
        )

        await knexInstance('transactions').insert({
            id: randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
        })

        return reply.status(201).send()
    })
}