import { afterAll, beforeAll, it, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app.js'

describe('Transactions routes', () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })

    it('user can create a new transaction', async () => {
        await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit',
            })
            .expect(201)
    })

    it('should be able to list all transactions', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit',
            })

        const cookies = createTransactionResponse.get('Set-Cookie')

        if (!cookies) throw new Error('No set-cookie header returned.')

        const cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : cookies

        const listTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookieHeader)
            .expect(200)

        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New transaction',
                amount: 5000,
            })
        ])
    })

    it('should be able to get a specific transaction', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit',
            })

        const cookies = createTransactionResponse.get('Set-Cookie')

        if (!cookies) throw new Error('No set-cookie header returned.')

        const cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : cookies

        const listTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookieHeader)
            .expect(200)

        const transactionId = listTransactionsResponse.body.transactions[0].id

        const getTransactionResponse = await request(app.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookieHeader)
            .expect(200)

        expect(getTransactionResponse.body.transaction).toEqual(
            expect.objectContaining({
                title: 'New transaction',
                amount: 5000,
            })
        )
    })

    it('should be able to get the summary', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'Credit transaction',
                amount: 5000,
                type: 'credit',
            })

        const cookies = createTransactionResponse.get('Set-Cookie')

        if (!cookies) throw new Error('No set-cookie header returned.')

        const cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : cookies

        await request(app.server)
            .post('/transactions')
            .set('Cookie', cookieHeader)
            .send({
                title: 'Debit transaction',
                amount: 2000,
                type: 'debit',
            })

        const summaryResponse = await request(app.server)
            .get('/transactions/summary')
            .set('Cookie', cookieHeader)
            .expect(200)

        expect(summaryResponse.body.summary).toEqual({
            amount: 3000,
        })
    })

})
