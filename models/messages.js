const Schema = mongoose.Schema;
const ChatSchama = new Schema({
  emitter: { type: Schema.Types.ObjectId, ref: "user" },
  receiver: { type: Schema.Types.ObjectId, ref: "user" },
  messageGroup: [{ type: Schema.Types.ObjectId, ref: "messageGroup" }],
});
const Chat = mongoose.model("chat", ChatSchama);
module.exports = Chat;
