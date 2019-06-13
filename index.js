const express = require('express');
const app = express();
const Server = require('socket.io');

app.use(express.static(__dirname + '/public'));

const port = 8000;
const expressServer = app.listen(port, () => {
    console.log(`Server is listen on port ${port}`);
})

const socketioServer = new Server(expressServer);

socketioServer.on('connect', (socket) => {
    console.log('found connection: ', socket.id);

    socket.emit('welcomeMsg', { msg: `Welcome ${socket.id}! Let\'s chat now ...`, userId: socket.id });

    socket.on('msgFromClient', ({ msg }) => {
        socketioServer.emit('msgToClients', { msg, userId: socket.id })
    })
})

socketioServer.of('/company1').on('connect', (socket) => {
    console.log('someone connect to company 1');
})