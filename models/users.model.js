const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  uid: { type: Number },
  id_ent: { type: Number },
  displayName: {
    type: String,
  },
  photoURL: {
    type: String,
  },
  about: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  status: {
    type: String,
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
});

module.exports = mongoose.model("user", UserSchema);
