const mongoose = require('mongoose');
const {
    Schema
} = require('mongoose');

const groupeSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String
    },
    users: [{
        type: Schema.Types.ObjectId,
        ref: "usermongo"
    }],
    messages: [{
        message: {
            type: String,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "usermongo"
        }
    }]
});

module.exports = mongoose.model('groupe', groupeSchema);