import { describe, it, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

// aguardando que a applicação esteja carregada completamente
beforeAll(async () => {
  await app.ready()
})

// finalizando a applicação após a execução do test
afterAll(async () => {
  await app.close()
})

describe('Transactions', () => {
  // deve ser possivel a criação de uma nova transação com reponse de status 201
  it('slould be able create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 500,
        type: 'debit',
      })
      .expect(201)
  })
})
