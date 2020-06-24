const Schema = mongoose.Schema;
const UserSchema = new Schema({
  email: { type: String },
  login: { type: String },
  password: { type: String },
  profil: { type: String },
  isOnline: { type: Boolean, default: false },
  contacts: [{ type: Schema.Types.ObjectId, ref: "user" }],
});
const User = mongoose.model("user", UserSchema);
module.exports = User;
