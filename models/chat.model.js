const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const ChatSchema = new Schema({
    initiator: {
        type: Schema.Types.ObjectId,
        ref: 'userMongo'
    },
    peer: {
        type: Schema.Types.ObjectId,
        ref: 'userMongo'
    },
    messages: [
        {
            user_id: { type: Schema.Types.ObjectId, ref: 'user' },
            msg_id: String,
            content: Text,
            createdAt: {
                type: Date,
                default: new Date()
            }
        }
    ]
}); 

export default mongoose.model('chat', ChatSchema);
