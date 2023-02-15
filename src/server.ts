import fastify from "fastify";

const app = fastify()

app.get('/hello', async (req, rep)=>{
    return 'hello World'
})

app.listen({
    port: 3333
}).then(()=>{
    console.log("http server is running on port 33333")
})