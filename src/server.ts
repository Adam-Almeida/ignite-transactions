import fastify from 'fastify'

const app = fastify()

app.get('/hello', async () => {
  return 'hello World'
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('http server is running on port 3333')
  })
