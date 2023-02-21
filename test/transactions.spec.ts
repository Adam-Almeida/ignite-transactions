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
})
