const http = require('http');
const socketio = require('socket.io');

const server = http.createServer((req, res) => {
    res.end('A message from server');
})

const io = socketio(server);

// Server listen
const port = 8000;
server.listen(port, () => {
    console.log('server is listening on port ', port);
})