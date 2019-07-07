import * as express from 'express';
import * as socketio from 'socket.io';
import { channels, namespaces } from './db';

const app = express();
const port = 8000;

const expressServer = app.listen(port, () => {
  console.log(`Server is listen on port ${port}`);
});

const socketioServer = socketio.listen(expressServer);

// global namespace
socketioServer.of('/').on('connect', socket => {
  // a new connection to global namespace /, populate workspaces
  socket.emit('namespaces', namespaces);
});

// level2 namespaces
namespaces.forEach(ns => {
  socketioServer.of(ns.name).on('connect', nsSocket => {
    console.log(`${nsSocket.id} connect to ${ns.name} namespace`);

    // send back all channels of namespace to the client has requested
    nsSocket.emit(ns.name, channels.filter(c => c.namespaceId === ns.id));

    nsSocket.on(
      'joinChannel',
      (channelName: string): void => {
        console.log(`${nsSocket.id} wants to join ${channelName}`);
        nsSocket.join(channelName, err => {
          if (err) throw err;
          socketioServer
            .of(ns.name)
            .in(channelName)
            .clients((err, clients) => {
              if (err) throw err;
              // initial data for the newcomer
              nsSocket.emit('channelUpdate', {
                numOfMembers: clients.length,
                msgList: channels.find(c => c.name === channelName).msgList,
                channelName
              });
              // notify others with the newcomer
              nsSocket.to(channelName).emit('updateMembers', clients.length);
            });
        });
      }
    );

    nsSocket.on('msgToChannel', msg => {
      // add server timestamp for msg
      const msgWithTime = { ...msg, createdAt: Date.now() };
      // check current channel of user
      const currentRoom = Object.keys(nsSocket.rooms)[1];
      // populate new msg for all connected user except the one who sent it
      nsSocket.to(currentRoom).emit('newMsgFromChannel', msgWithTime);
    });
  });
});
