const express = require('express')
const amqp = require('amqplib')
const app = express()
const port = 3000;
var channel, connection;

app.use(express.json())

connect() 
async function connect() {
    try{
    const amqpServer = 'amqp://localhost:5672';
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel()
    await channel.assertQueue("rabbit") // this will create a queue named rabbit, if there is no queue
    } catch (err) {
        console.error(err);
    }
}

app.get('/send', async (req,res) => {
    const fakeData = { message: "Hello World!" }
    await connect()
    await channel.sendToQueue("rabbit", Buffer.from(JSON.stringify(fakeData)))
    // await channel.close() // Here the channel and the connection is closing after sending to queue
    // await connection.close() // so you will get error when you make request after the channel close.
    return res.send("done")
})

// consuming the data from Service A
connectConsumer()
async function connectConsumer() {
    try{
    const amqpServer = 'amqp://localhost:5672';
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel()
    await channel.assertQueue("rabbit1") // this will create a queue named rabbit, if there is no queue

    // Set up a consumer to receive messages from the queue
    channel.consume("rabbit1", async(msg) => {
        if (msg !== null) {
            const message = JSON.parse(msg.content.toString())
            console.log(`Received message in Service-A: `, message)

            // Acknowledge the message to remove it from the queue
            // channel.ack(msg)

        }
    })

    } catch (err) {
        console.error(err);
    }
}

app.listen(port, () => {
    console.log(`Service-A listening in ${port}`)
})
