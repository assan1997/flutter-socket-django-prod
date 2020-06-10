const mongoose = require('mongoose');
const {
    Schema
} = require('mongoose');

const userSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    nom: {
        type: String,
        required: true,
    },
    prenoms: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    pays: {
        type:String,
        required: true
    },
    ws_id: String
});

module.exports = mongoose.model('usermongo', userSchema);
