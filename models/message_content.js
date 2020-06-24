const Schema = mongoose.Schema;
const MessageBodySchama = new Schema({
  content: { type: String },
  created_at: { type: String },
});
const messageBody = mongoose.model('messagebody', MessageBodySchama);
module.exports = messageBody;
