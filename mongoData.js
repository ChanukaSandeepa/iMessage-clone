const mongoose = require('mongoose')

const messageSchema = mongoose.Schema({
    chatName: String,
    conversation: [
        {
            message: String,
            timestamp: String,
            user: {
                displayName: String,
                email: String,
                photo: String,
                uid: String
            }
        }
    ]
})

const Conversation = mongoose.model('Conversation', messageSchema)

module.exports = Conversation