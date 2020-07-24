const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  textContent: String,
  isSeen: Boolean,
  isSent: Boolean,
  senderId: Number,
  time: String,
});

module.exports = mongoose.model("messages", ChatSchema);
