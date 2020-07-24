const express = require("express");
const https = require("https");
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

const httpServer = https.createServer(
  {
    key: fs.readFileSync("./key.pem"),
    cert: fs.readFileSync("./cert.pem"),
    passphrase: "nanjs",
  },
  app
);

// connexion à la base de données
db();

// websocket

const wss = new websocket.Server({ server: httpServer });
wss.on("connection", (ws, request) => {
  console.log("user connected");
  ws.on("message", async (m) => {
    const message = JSON.parse(m);
    console.log("message,", message);
    console.log("ws_id", ws.id);
    switch (message.type) {
      case "new_connection":
        ws.id = message.uid;
        ws.send(
          JSON.stringify({ type: message.type, message: "connexion reussie" })
        );
        break;
      case "send_message":
        let manageMsg = await globalQueries.sendMessage(message);
        if (manageMsg.status) {
          wss.clients.forEach((client) => {
            console.log("id", client.id);
            if (
              client.id !== ws.id &&
              (client.id === manageMsg.data.peer ||
                client.id === manageMsg.data.initiator)
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
        break;
      default:
        console.log("nothing");
        break;
    }
  });
});

httpServer.listen(5000, () => {
  console.log("listenning on port 5000");
});
