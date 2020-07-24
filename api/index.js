const express = require("express");
const { globalQueries } = require("../queries/globalQueries");
const router = new express.Router();
const jwt = require("jsonwebtoken");
const jwtConfig = {
  secret: "dd5f3089-40c3-403d-af14-d0c228b05cb4",
  expireTime: 8000,
};
router.route("/").get((req, res) => {
  res.send("api ok ");
});
router.route("/addUser").post((req, res) => {
  console.log('body',req.body);
  req.body.uid = parseInt(req.body.uid);
  req.body.id_ent = parseINt(req.body.id_ent);
  const s = await globalQueries.addUser(req.body);
  console.log('s',s);
  if(s.status){
    res.json(s.data);
  }
});
router.route("/chats/:id").get(async (req, res) => {
  console.log("oui je reçois laroute", req.params.id);
  let chats = await globalQueries.getAll({ user_id: parseInt(req.params.id) });
  console.log("getAlls", chats);
  if (chats.status) {
    res.json(chats.data);
  }
});
router.route("/chatContacts/:id").get(async (req, res) => {
  console.log("oui je rentre ici");
  let all = await globalQueries.getChatContacts({
    user_id: parseInt(req.params.id),
  });
  if (all.status) {
    res.json(all.data);
  }
});
router.route("/setFavorite/:id").post(async (req, res) => {
  console.log("body", req.body);
  let all = await globalQueries.toggleFavorite({
    user_id: parseInt(req.params.id),
    favorite_id: parseInt(req.body.contactId),
  });
  console.log(all);
  if (all.status) {
    res.json(all.data);
  }
});
router.route("/signIn").post(async (req, res) => {
  console.log("body", req.body);
  let all = await globalQueries.signIn({
    email: req.body.email,
    password: req.body.password,
  });
  if (all.status) {
    const accessToken = jwt.sign({ id: all.data.uid }, jwtConfig.secret, {
      expiresIn: jwtConfig.expireTime,
    });
    const userData = Object.assign({}, all.data, { loggedInWith: "jwt" });
    delete userData.password;
    const response = {
      user: userData,
      accessToken: accessToken,
    };
    res.json(response);
  } else {
    res.json(all.data);
  }
});
module.exports = router;
