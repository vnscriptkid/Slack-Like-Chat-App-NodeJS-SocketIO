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
  console.log(socket.handshake.query.username, 'join global namespace');
  socket.emit('namespaces', namespaces);
});

// level2 namespaces
namespaces.forEach(ns => {
  socketioServer.of(ns.name).on('connect', nsSocket => {
    console.log(
      `${nsSocket.handshake.query.username} connect to ${ns.name} namespace`
    );

    // send back all channels of namespace to the client has requested
    nsSocket.emit(ns.name, channels.filter(c => c.namespaceId === ns.id));

    nsSocket.on(
      'joinChannel',
      (channelName: string): void => {
        const joinedChannel = Object.keys(nsSocket.rooms)[1];
        if (joinedChannel) {
          nsSocket.leave(joinedChannel);
          updateMembers(ns.name, joinedChannel);
        }

        nsSocket.join(channelName, err => {
          if (err) throw err;
          // initial data for the newcomer
          nsSocket.emit('channelUpdate', {
            msgList: channels.find(c => c.name === channelName).msgList,
            channelName
          });
          // update the number of members for all in room (including the new one)
          updateMembers(ns.name, channelName);
        });
      }
    );

    nsSocket.on('msgToChannel', msg => {
      // add server timestamp for msg
      const msgWithTime = {
        ...msg,
        createdAt: Date.now(),
        author: nsSocket.handshake.query.username
      };
      // check current channel of user
      const currentRoom = Object.keys(nsSocket.rooms)[1];
      // persist msg on server
      channels
        .find(channel => channel.name === currentRoom)
        .msgList.push(msgWithTime);
      // populate new msg for all connected user except the one who sent it
      nsSocket.to(currentRoom).emit('newMsgFromChannel', msgWithTime);
    });
  });
});

function updateMembers(ns: string, channel: string) {
  socketioServer
    .of(ns)
    .in(channel)
    .clients((err, clients: []) => {
      if (err) throw err;
      socketioServer
        .of(ns)
        .in(channel)
        .emit('updateMembers', clients.length);
    });
}
