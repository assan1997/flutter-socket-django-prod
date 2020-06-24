const User = require("../models/users");
module.exports = {
  async getAllUsers(req, res) {
    User.find().then((users) => {
      res.json(users);
    });
  },
  async create(req, res) {
    let data = req.body;
    const newUser = new User({
      login: data.login,
      email: data.email,
      password: data.password,
    });
    let user = await User.findOne({
      email: data.email,
    });
    if (user !== null) {
      res.json({ err: "err" });
    } else {
      newUser.save();
    }
  },
  async connect(req, res) {
    if (req.body && req.body !== null) {
      let data = req.body;
      let result = await User.findOne({
        email: data.email,
        password: data.password,
      });
      if (result !== null) {
        res.json(result);
      } else {
        res.json({ err: "connection failed" });
      }
    }
  },
  async updateProfil(req, res) {
    console.log(req.files);
  },
  async addNewContact(req, res) {
    let data = req.body;
    if (data.pseudo !== data.user_pseudo) {
      let contact = await User.findOne({ _id: data.pseudo });
      let user = await User.findOne({ _id: data.user_pseudo });
      if (contact !== null) {
        await User.updateOne(
          { _id: data.user_pseudo },
          { contacts: [...user.contacts, contact] }
        );
        let output = await User.findOne({ _id: data.user_pseudo }).populate(
          "contacts"
        );
        res.json(output);
      }
    }
  },
  async getAllContacts(req, res) {
    let output = await User.findOne({ _id: req.body.user }).populate({
      path: "contacts",
    });
    res.json(output);
  },
};
