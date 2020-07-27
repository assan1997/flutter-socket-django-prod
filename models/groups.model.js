const mongoose = require("mongoose");
const GroupsSchema = new mongoose.Schema({
  gid: {type: Number},
  id_ent: { type: Number },
  name: { type: String },
  avatar: { type: String },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  msg: [{ type: mongoose.Schema.Types.ObjectId, ref: "messages" }],
});
module.exports = mongoose.model("groupChat", GroupsSchema);
