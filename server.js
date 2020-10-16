const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const Pusher = require('pusher')
const Conversation = require('./mongoData')
// YgGrl2ciQK10XjAO
const app = express()
const PORT = 9000 || process.env.PORT

const pusher = new Pusher({
    appId: '1091506',
    key: '00a4c2b87e2035ac61c3',
    secret: '028b1315c01dd0ffe7a9',
    cluster: 'ap2',
    encrypted: true
});

const mongooseURI = 'mongodb+srv://admin:YgGrl2ciQK10XjAO@cluster0.7pxt3.mongodb.net/imessage?retryWrites=true&w=majority'


app.use(express.json())
app.use(cors())

mongoose.connect(mongooseURI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.once('open', () => {
    const changeStream = Conversation.watch()
    console.log(changeStream)
    changeStream.on('change', (change) => {
        console.log("changed")
        if (change.operationType === 'insert') {
            pusher.trigger('chats', 'newChat', {
                "change": change
            })
        } else if (change.operationType === 'update') {
            console.log("triggering")
            pusher.trigger('messages', 'newMessage', {
                'change': change
            })
        } else {
            console.log("Error triggering pusher")
        }
    })

})

app.get('/', (req, res) => {
    res.send("Hello World!")
})

app.post('/new/conversation', (req, res) => {
    console.log("new conversation is triggering")
    const dbData = req.body

    Conversation.create(dbData, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

app.post('/new/message', (req, res) => {
    Conversation.updateOne(
        { _id: req.query.id },
        { $push: { conversation: req.body } },
        (err, data) => {
            if (err) {
                console.log("error occured")
                res.status(500).send(err)
            } else {
                res.status(201).send(data)
            }
        }
    )
})

app.get('/get/conversations', (req, res) => {
    Conversation.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            data.sort((b, a) => {
                return a.timestamp - b.timestamp
            })
            let conversations = []

            data.map((conv) => {
                const cv = {
                    id: conv.id,
                    name: conv.chatName,
                    timestamp: conv.conversation[0].timestamp
                }
                conversations.push(cv)
            })
            res.status(200).send(conversations)
        }
    })
})

app.get('/get/conversation', (req, res) => {
    const id = req.query.id

    Conversation.find({ _id: id }, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

app.get('/get/lastMessage', (req, res) => {
    const id = req.query.id

    Conversation.find({ _id: id }, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            console.log(typeof data)
            let convData = data[0].conversation

            convData.sort((b, a) => {
                return a.timestamp - b.timestamp
            });

            res.status(200).send(convData[0]);
        }
    })

})

app.listen(PORT, () => {
    console.log(`Server is listning on ${PORT}`)
})