const Schema = mongoose.Schema;
const MessageGroupSchama = new Schema({
  chat_id: { type: Schema.Types.ObjectId, ref: "user" },
  date: { type: String },
  body: [
    {
      sendBy: { type: Schema.Types.ObjectId, ref: "user" },
      content: { type: String },
      time: { type: String },
    },
  ],
});
const MessageGroup = mongoose.model("messageGroup", MessageGroupSchama);
module.exports = MessageGroup;
