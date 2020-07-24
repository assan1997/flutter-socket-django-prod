const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
   peer:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
   initiator:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
   isPinned:{type:Boolean},
   msg:[{type:mongoose.Schema.Types.ObjectId,ref:"messages"}]
})

module.exports = mongoose.model('chat',ChatSchema);