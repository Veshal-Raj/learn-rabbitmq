const express = require('express')
const amqp = require('amqplib')
const app = express()
const port = 3001;
var channel, connection;


connect() 
async function connect() {
    try{
    const amqpServer = 'amqp://localhost:5672';
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel()
    await channel.assertQueue("rabbit") // this will create a queue named rabbit, if there is no queue

    // Set up a consumer to receive messages from the queue
    channel.consume("rabbit", async(msg) => {
        if (msg !== null) {
            const message = JSON.parse(msg.content.toString())
            console.log(`Received message in Service-B: `, message)
            
            // Perform operations on the received data
            const result = performOperations(message);

            // Acknowledge the message to remove it from the queue
            channel.ack(msg)

            // Send the modified data back to Service-A
            await channel.sendToQueue("rabbit1", Buffer.from(JSON.stringify(result)))
            // channel.ack(msg)

        }
    })

    } catch (err) {
        console.error(err);
    }
}

app.use(express.json())


function performOperations(a) {
    b = a.message + ' from Service B'
    // console.log(b)
    return { message: b}
}


app.listen(port, () => {
    console.log(`Service-A listening in ${port}`)
})
