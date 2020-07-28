const Chat = require("../models/chats.model");
const Ent = require("../models/entreprise.model");
const Messages = require("../models/messages.model");
const User = require("../models/users.model");
const Groups = require("../models/groups.model");
const { find } = require("../models/chats.model");
exports.globalQueries = class {
  static addUser(data) {
    return new Promise(async (next) => {
      const user = await new User({
        ...data,
      });
      user
        .save()
        .then((r) => {
          next({ status: true, data: r });
        })
        .catch((err) => {
          next({ status: false, err: err });
        });
    });
  }

  static addGroup(data) {
    return new Promise(async (next) => {
      const group = await new Groups({
        gid: data.gid,
        id_ent: data.id_ent,
        name: data.name,
        avatar: data.avatar,
        users: data.users,
        msg: [],
      });
      group
        .save()
        .then((r) => {
          next({ status: true, data: r });
        })
        .catch((err) => {
          next({ status: false, err: err });
        });
    });
  }

  static getAllData(id) {
    return new Promise(async (next) => {
      const user = await User.findOne({ uid: id }).then((r) => r._id);
      console.log(user);
      const contacts = await User.find().populate("favorites");
      const groups = await Groups.find().populate("msg").populate("users");
      console.log("groups", groups);
      await Chat.find({ $or: [{ initiator: user }, { peer: user }] })
        .populate("peer")
        .populate("initiator")
        .populate("msg")
        .then((r) => {
          console.log(r);
          if (r !== null && r.length > 0) {
            const output = [];
            r.forEach((el, index) => {
              output.push({
                initiator: el.initiator.uid,
                peer: el.peer.uid,
                isPinned: el.isPinned,
                msg: el.msg,
              });
              if (index === r.length - 1) {
                console.log("output", output);
                next({
                  status: true,
                  data: {
                    chats: output,
                    contacts: contacts,
                    groups: groups,
                  },
                });
              }
            });
          } else {
            next({
              status: true,
              data: {
                chats: [],
                contacts: contacts,
                groups: groups,
              },
            });
          }
        })
        .catch((err) => {
          next({ status: false, messager: err });
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

  static sendMessage(data) {
    return new Promise(async (next) => {
      if (data.gid !== undefined) {
        let group = await Groups.findOne({ gid: data.gid });
        if (group !== null) {
          const newMessage = await new Messages({
            textContent: data.message.textContent,
            isSent: data.message.isSent,
            isPinned: data.message.isPinned,
            senderId: data.userId,
            time: data.message.time,
          });
          newMessage.save().then((message) => {
            group.msg.push(message._id);
            group.save().then((r) => {
              next({ status: true });
            });
          });
        }
      } else {
        const initiator = await User.findOne({ uid: data.userId }).then(
          (r) => r
        );
        const peer = await User.findOne({ uid: data.contactId }).then((r) => r);
        const newMessage = await new Messages({
          textContent: data.message.textContent,
          isSent: data.message.isSent,
          isPinned: data.message.isPinned,
          senderId: data.userId,
          time: data.message.time,
        });
        newMessage.save().then(async (mes) => {
          const chat = await Chat.findOne({
            $or: [
              { initiator: initiator._id, peer: peer._id },
              { initiator: peer._id, peer: initiator._id },
            ],
          }).then((s) => s);
          if (chat !== null) {
            chat.msg.push(mes._id);
            chat.save().then((s) =>
              next({
                status: true,
                data: { initiator: initiator.uid, peer: peer.uid },
              })
            );
          } else {
            const chat = await new Chat({
              initiator: initiator._id,
              peer: peer._id,
              isPinned: false,
              msg: [mes._id],
            });
            chat.save().then((s) =>
              next({
                status: true,
                data: { initiator: initiator.uid, peer: peer.uid },
              })
            );
          }
        });
      }
    });
  }
};
