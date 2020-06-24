userController = require('../controller/user_controller');

const { profil } = require('../controller/upload');

userMediaControler = require('../controller/user_media_controller');
userMessages = require('../controller/user_message');
module.exports = (app) => {
  app.post('/user/create/', userController.create);
  app.post('/user/connect/', userController.connect);
  app.get('/user/all/', userController.getAllUsers);
  app.post('/user/addNew/', userController.addNewContact);
  app.post('/user/updateProfil', profil, async (req, res) => {
    let data = { ...req.body, file: req.file.filename };
    let output = await userMediaControler.updateUserProfil(data);
    res.json(output);
  });
  app.post('/contact/all/', userController.getAllContacts);
  app.post('/messages/all/', async (req, res) => {
    let data = req.body.user;
    let output = await userMessages.getAllMessages(data);
    res.json(output);
  });
  app.post('/messages/add', async (req, res) => {
    let data = req.body;
    let output = await userMessages.addMessage(data);
    res.json(output);
  });

  app.post('/messages/delete/', async (req, res) => {
    let output = await userMessages.deleteMessage(req.body);

    res.json(output);
  });
};
