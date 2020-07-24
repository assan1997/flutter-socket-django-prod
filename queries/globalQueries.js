const Chat = require("../models/chats.model");
const Ent = require("../models/entreprise.model");
const Messages = require("../models/messages.model");
const User = require("../models/users.model");

exports.globalQueries = class {
  static getAll(data) {
    return new Promise(async (next) => {
      const contacts = await User.find();
      console.log(contacts);
      const user = await User.findOne({ uid: data.user_id })
        .populate("chatContacts")
        .populate("favorites")
        .then((r) => r);
      await Chat.find({ $or: [{ peer: user._id }, { initiator: user._id }] })
        .populate("peer")
        .populate("initiator")
        .populate("msg")
        .then((r) => {
          if (r !== null && r.length > 0) {
            const output = {};
            r.forEach((el, index) => {
              const id =
                el.initiator.uid === data.user_id
                  ? el.peer.uid
                  : el.initiator.uid;
              output[id] = {};
              output[id].isPinned = el.isPinned;
              output[id].msg =[];
              el.msg.forEach((ms,index) => {
                if(ms.senderId === data.user_id){
                    ms.isSent=true;
                }
                output[id].msg.push(ms);
              });
              if (index === r.length - 1) {
                next({
                  status: true,
                  data: {
                    chats: output,
                    favorites: user.favorites,
                    contacts: contacts.filter((el) => el.uid !== user.uid),
                  },
                });
              }
            });
          } else {
            next({
              status: true,
              data:{
                  chats:[],
                  favorites:user.favorites,
                  contacts: contacts.filter((el) => el.uid !== user.uid)
              }
            
            });
          }
        }).catch(err => {
            next({status:false,messager:err});
        });
    });
  }
  static signIn(data) {
    return new Promise(async (next) => {
      let user = await User.findOne({
        email: data.email,
        password: data.password,
      });
      if (user !== null) {
        next({
          status: true,
          data: {
            uid: user.uid,
            name: user.displayName,
            status: user.status,
            photoUrl: user.photoURL,
            about: user.about,
          },
        });
      } else {
        next({ status: false, data: "login failled" });
      }
    });
  }
  static toggleFavorite(data) {
    return new Promise(async (next) => {
      let favorite = await User.findOne({ uid: data.favorite_id }).then(
        (r) => r._id
      );
      const user = await User.findOne({ uid: data.user_id }).then((r) => r);
      if (user.favorites.includes(favorite)) {
        await User.updateOne(
          { uid: data.user_id },
          { $pull: { favorites: favorite } }
        );
        user.save().then((r) => next({ status: true, data: "success" }));
      } else {
        console.log("oui je rentre ici");
        console.log(user.favorites);
        user.favorites.push(favorite);
        user.save().then((r) => {
          console.log("r", r);
          next({ status: true, data: "success" });
        });
      }
    });
  }
  static getChatContacts(data) {
    return new Promise(async (next) => {
      const user = await User.findOne({ uid: data.user_id }).then((r) => r);
      await Chat.find({ $or: [{ peer: user._id }, { initiator: user._id }] })
        .populate("peer")
        .populate("initiator")
        .then((r) => {
          if (r !== null) {
            const output = [];
            r.forEach((el, index) => {
              const id =
                el.initiator.uid === data.user_id ? el.peer : el.initiator;
              output.push(id);
              if (index === r.length - 1) {
                next({
                  status: true,
                  data: output,
                });
              }
            });
          } else {
            next({
              status: false,
              message:
                "nous n'avez aucune conversation avec un membre de l'entreprise",
            });
          }
        });
    });
  }
  // messages
  static sendMessage(data) {
    console.log('sendMessage',data);
    return new Promise(async (next) => {
      const initiator = await User.findOne({ uid: data.userId }).then((r) => r);
      const peer = await User.findOne({ uid: data.contactId }).then((r) => r);
      const newMesg = await new Messages({
        textContent: data.message.textContent,
        isSent: data.message.isSent,
        isSeen: data.message.isSeen,
        senderId:data.userId,
        time: data.message.time,
      });
      newMesg.save().then(async (mess) => {
        const chat = await Chat.findOne({
          $or: [
            { peer: peer._id, initiator: initiator._id },
            { peer: initiator._id, initiator: peer._id },
          ],
        });
        if (chat !== null) {
          chat.msg.push(mess._id);
          chat.save().then((r) => {
            next({
              status: true,
              data: { peer: peer.uid, initiator: initiator.uid },
            });
          });
        } else {
          const chat = new Chat({
            peer: peer._id,
            initiator: initiator._id,
            msg: [mess._id],
          });
          chat.save().then((r) => {
            next({
              status: true,
              data: { peer: peer.uid, initiator: initiator.uid },
            });
          });
        }
      });
    });
  }
};
