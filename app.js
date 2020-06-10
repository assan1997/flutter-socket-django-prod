const express = require('express')
const axios = require('axios')
const webSocket = require('ws')
const http = require('http')
const path = require('path')
const db = require('./config/database');
const uniqid = require('uniqid');
const cors = require('cors');
const {
    globalQueries
} = require('./controllers/globalQueries');
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cors());



// la route for register user
app.get('/', (req, res) => {
    res.render('index')
})
app.post('/addUser', (req, res) => {
    const data = req.body;
    console.log('data', data);
    globalQueries.addUser(data).then((output) => {
        if (output.etat) {
            res.json(output);
        }
    })

});
//axios tester
//const result = axios.get('http://192.168.50.78:8000/create').then(r => r);



//connection to database
db();

// implement http_server for websocket
const httpServer = http.createServer(app);

//socket io implementation
const wss = new webSocket.Server({
    port: 8090
})

wss.on('connection', (ws, request) => {
    //console.log(request);
    ws.id = uniqid('ws_id-');
    console.log(ws.id);
    // const clientIp = request.connection.remoteAddress;
    //  console.log(`[WebSocket] Client with IP ${clientIp} has connected`);

    ws.on('message', async message => {
        const data = JSON.parse(message.toString());
        console.log('message', data);
        if (data.type === "connectUser") {
            const dt = await globalQueries.findUser(data.email);
            if (dt.etat && dt.data !== null) {
                console.log('data', dt);
                ws.send(JSON.stringify({ type: "connectionSuccess" }));
            } else {
                ws.send(JSON.stringify({ type: "connectionError" }));
            }
        }
        else if (data.type === "noConnection") {
            console.log('no connection')
        } else if (data.type === "newConnection") {
            console.log('user connected')
            const res = await globalQueries.newConnection(data);
            console.log('result ', res);
            if (res.status || !res.status) {
                ws.send(JSON.stringify(res));
            }
        } else if (data.type === "add") {
            data.ws_id = ws.id;
            const res = await globalQueries.setNewGroupOrUser(data);
            if (res) {
                console.log('etat', res);
                ws.send(JSON.stringify(res));
            }
        } else if (data.type === "getmessages") {
            const res = await globalQueries.getGroupeMessages(data, ws.id);
            console.log('resultmessge', res);
            if (res.status) {
                console.log('message send');
                ws.send(JSON.stringify(res));
            }
        } else if (data.type === "addmessage") {
            const res = await globalQueries.setNewMessage(data);
            console.log('result', res);
            const allUsers = await globalQueries.getGroupesUsers(data.id_article);
            allUsers.forEach(user => {
                console.log('user', user);
                wss.clients.forEach(client => {
                    console.log('client', client.id);
                    console.log('res', client.id === user.ws_id);
                    if (client.id === user.ws_id && client.readyState === client.OPEN) {
                        console.log('result', res);
                        client.send(JSON.stringify(res));
                    }
                })
            })
        }
    });
    ws.on('error', (error) => console.log(error.message));
});

// running server
httpServer.listen(process.env.PORT || 4000, () => {
    console.log('listenning on port 4000');
});