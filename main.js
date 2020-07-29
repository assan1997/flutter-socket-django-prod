const express = require("express");
const http = require("http");
const fs = require("fs");
const cors = require("cors");
const apiRoute = require("./api/index");
const uniqid = require("uniqid");
const db = require("./config/db");
const websocket = require("ws");
const { globalQueries } = require("./queries/globalQueries");
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api", apiRoute);

const httpServer = http.createServer(app);

// connexion à la base de données
db();

// websocket

const wss = new websocket.Server({ server: httpServer });
wss.on("connection", (ws, request) => {
  console.log("user connected");
  ws.on("message", async (m) => {
    const message = JSON.parse(m);
    //console.log("message,", message);
    //console.log("ws_id", ws.id);
    switch (message.type) {
      case "new_connection":
        ws.id = message.uid;
        ws.send(
          JSON.stringify({ type: message.type, message: "connexion reussie" })
        );
        break;
      case "send_message":
        message.message.senderId = message.userId;
        if (message.gid !== undefined) {
          wss.clients.forEach((client) => {
            //console.log("id", client.id);
            if (client.id !== ws.id && message.groupUsers.includes(client.id)) {
              client.send(
                JSON.stringify({
                  type: message.type,
                  data: {
                    msg: message.message,
                    id: ws.id,
                    text: message.message.textContent,
                    isPinned: false,
                    userId: client.id,
                    gid: message.gid,
                  },
                })
              );
            }
          });
        } else {
          wss.clients.forEach((client) => {
            //console.log("id", client.id);
            if (
              client.id !== ws.id &&
              (client.id === message.userId || client.id === message.contactId)
            ) {
              client.send(
                JSON.stringify({
                  type: message.type,
                  data: {
                    msg: message.message,
                    id: ws.id,
                    text: message.message.textContent,
                    isPinned: false,
                    userId: client.id,
                  },
                })
              );
            }
          });
        }
        await globalQueries.sendMessage(message);
        break;
      case "send_isTyping":
        wss.clients.forEach((client) => {
          //console.log("id", client.id);
          if (client.id !== ws.id && message.users.includes(client.id)) {
            client.send(
              JSON.stringify({
                type: message.type,
                data: message.text,
              })
            );
          }
        });
        break;
      case "send_stopTyping":
        wss.clients.forEach((client) => {
          //console.log("id", client.id);
          if (client.id !== ws.id && message.users.includes(client.id)) {
            client.send(
              JSON.stringify({
                type: message.type,
              })
            );
          }
        });
        break;
      default:
        console.log("nothing");
        break;
    }
  });
});

httpServer.listen(process.env.PORT || 5000, () => {
  console.log("listenning on port 5000");
});
