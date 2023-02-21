import { describe, it, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Transactions routes', () => {
  // aguardando que a applicação esteja carregada completamente
  beforeAll(async () => {
    await app.ready()
  })

  // finalizando a applicação após a execução do test
  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  // deve ser possivel a criação de uma nova transação com reponse de status 201
  it('should be able create to new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 500,
        type: 'debit',
      })
      .expect(201)
  })

  // deve ser possível listar todas as transações passando o cookie
  it('should be able to list all transactions', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New Transaction',
      amount: 500,
      type: 'debit',
    })

    const cookies = response.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New Transaction',
        amount: -500,
      }),
    ])
  })

  // deve ser possível listar uma transação específica
  it('should be able to get a specifc transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New Transaction',
      amount: 500,
      type: 'credit',
    })

    const cookies = response.get('Set-Cookie')

    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    const id = listTransactionResponse.body.transactions[0].id

    const transaction = await request(app.server)
      .get(`/transactions/${id}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(transaction.body.transaction).toEqual(
      listTransactionResponse.body.transactions[0],
    )
  })

  // deve ser possível listar o summário das transações
  it('should be able to get the summary transactions', async () => {
    const debitTransaction = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New credit Transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = debitTransaction.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New debit Transaction',
        amount: 109,
        type: 'debit',
      })
      .set('Cookie', cookies)

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary.amount).toEqual(4891)
  })
})
