//const https = require('https');
const http = require("http");
mongoose = require("mongoose");
const message = require("./controller/user_message");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");
/* 
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  ca: fs.readFileSync('certificate.crt'),
}; */
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
const server = http.createServer(/* options, */ app);
const io = require("socket.io")(server, {
  transports: ["websocket", "polling"],
});
const port = process.env.PORT || 4001;
const route = require("./routes/index");
app.use(cors(corsOptions));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use("/ressources", express.static(__dirname + "/ImageProfil"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
route(app);
// SOCKET CALL EVENTS
let clients = [];
io.on("connection", function (socket) {
  let t = [];
  // SALLE D'APPEL
  socket.on("session", function (data) {
    let client = {
      ...data.client,
      oncall: false,
    };
    roomCleaner(client.room);
    socket.join(client.room);
    clients.forEach((c) => io.to(c.room).emit("clientsOnline", clients));
    if (clients.length !== 0) {
      clients.forEach((item, index, array) => {
        if (item.userId === client.userId) {
          clients.splice(clients.indexOf(index), client);
        } else {
          t.push("different");
        }
      });
    } else {
      clients.push(client);
    }
    if (t.length === clients.length) {
      clients.push(client);
    }
  });
  // ON SUPPRIME LA SALLE D'APPEL DE L'UTILISATEUR QUAND IL SE DECONNECTE
  socket.on("session-out", function (data) {
    let c = clients.findIndex((c) => c.username === data.user);
    clients.splice(c, 1);
    roomCleaner(data.room);
  });
  // APPEL //

  // * audio video *//
  socket.on("call", function (data) {
    manageCall(data, io, socket);
  });
  //* audio video */

  //** partage d'ecran */

  socket.on("sharing-screen", function (data) {
    manageCall(data, io, socket);
  });
  //** partage d'ecran */
  // TRANSMISSION REUSSIE
  socket.on("ok", function (data) {
    let init = clients.find((c) => c.userId === data.init);
    let peer = clients.find((c) => c.userId === data.peer);
    //OnCallStatus(true, init, peer);
    io.to(init.room).emit("AcceptCall", data.signal);
  });
  // TERMINER UN APPEL
  socket.on("end", function (data) {
    let init = clients.find((c) => c.userId === data.init);
    let peer = clients.find((c) => c.userId === data.peer);
    //OnCallStatus(false, init, peer);
    io.to(init.room).emit("initEnd", feedBack("failed", "Appel terminé"));
    if (peer !== undefined)
      io.to(peer.room).emit("peerEnd", feedBack("failed", "Appel terminé"));
  });
  // REFUSER UN APPEL
  socket.on("denied", function (data) {
    let init = clients.find((c) => c.userId === data.init);
    let peer = clients.find((c) => c.userId === data.peer);
    io.to(init.room).emit("initEnd", feedBack("failed", "Appel terminé"));
    io.to(peer.room).emit("peerEnd", feedBack("failed", "Appel terminé"));
  });

  socket.on("reload", function (data) {
    let init = clients.find((c) => c.username === data.user);
    if (init !== undefined) {
    }
    //OnCallStatus(false, init, null);
  });
  // TEXT MESSAGE EVENTS
  // **ENVOI DE MESSAGE TEXTE ** //

  socket.on("sendMessage", function (data) {
    let init = clients.find((c) => c.userId === data.header.emitter);
    let peer = clients.find(
      (c) => c.userId === data.header.receiver || data.header.receiver._id
    );
    console.log(data.header.receiver);
    let output = {
      header: { ...data.header },
      body: {
        sendBy: data.header.emitter,
        content: data.content,
        time: data.time,
        _id: uniqid(10),
      },
    };
    io.to(init.room).emit("updateMessages", output);
    if (peer !== undefined) io.to(peer.room).emit("updateMessages", output);
    message.addMessage(data).then();
  });
  // ACTION SUR LES FLUX MEDIA

  // couper sa video

  socket.on("removeVideo", function (data) {
    let peer = clients.find((c) => c.userId === data.peer);
    if (peer !== undefined) io.to(peer.room).emit("removeVideo");
  });
  socket.on("addVideo", function (data) {
    let peer = clients.find((c) => c.userId === data.peer);
    if (peer !== undefined) io.to(peer.room).emit("addVideo");
  });
});

// FONCTIONS
/**
 * CETTE FONCTION GERE LES MESSAGES LIES AU EVEMENTS D'APPEL
 * @param {} status le statut du message
 * @param {} msg le message
 */
function feedBack(status, msg) {
  let feedBack = {};
  feedBack.status = status;
  feedBack.msg = msg;
  return feedBack;
}
/**
 * CETTE FONCTION PREND TROIS PARAMETTRE ET GERE LA METHODE ONCALL D'UN UTILISATEUR
 * LA METHODE ON PERMET DE SAVOIR SI UN UTILISATEUR A UN APPEL EN COUR
 * @param {} status Le Statut true OU false
 * @param {} init Un Utilisateur
 * @param {} peer Un Utilisateur
 */
function manageCall(data, io, socket) {
  let callData = data;
  let peer = clients.find((c) => c.userId === data.peer);
  let init = clients.find((c) => c.userId === data.init);
  //console.log(clients);
  //console.log(data.peer);
  if (peer === undefined) {
    feedBack();
    socket.emit(
      "call-event",
      feedBack("failed", `Echec de la connexion : utilisateur hors ligne`)
    );
  } else {
    if (peer.oncall) {
      socket.emit(
        "call-event",
        feedBack("failed", `${peer.user}à un autre autre appel`)
      );
    } else {
      socket.emit("call-event", feedBack("success", "Appel en cours"));
      callData.user = init.username;
      io.to(peer.room).emit("call-signal", callData);
    }
  }
}
function OnCallStatus(status, init, peer) {
  if (init !== null || init !== undefined) {
    let iniIndex = clients.findIndex((i) => i.userId === init.userId);
    init.oncall = status;
    clients.splice(clients.indexOf(iniIndex), init);
  }
  if (peer !== null && peer !== undefined) {
    let peerIndex = clients.find((c) => c.userId === peer.userId);
    peer.oncall = status;
    clients.splice(clients.indexOf(peerIndex), peer);
  }
}
function roomCleaner(room) {
  io.of("/")
    .in(room)
    .clients((error, socketIds) => {
      if (error) throw error;
      socketIds.forEach((socketId) => io.sockets.sockets[socketId].leave(room));
    });
}
server.listen(port, (err) => {
  console.log("started");
  var uri = process.env.MONGODB_URI;
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.connection
    .once("open", () => console.log("connexion à la base de donnée établie"))
    .on("error", (error) => {
      console.warn("Warning", error);
    });
  if (err) {
    console.log(err);
  }
});
