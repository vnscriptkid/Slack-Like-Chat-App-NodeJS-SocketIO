# Key takeaways:

## 1. Namespaces

#### What is namespace:

* A way to separate connections that belong to a group

#### Type of namespaces:

* global level (default): globalNs = io('http://example.com/')
* level 2:

> teacherNs = io('http://example.com/teachers')

> studentNs = io(http://example.com/students)

#### Why namespaces?

- Divide users into groups in which they have access to information that they need
- Imagine everything is pushed into global, everyone knows everything including what they don't need to know

#### Operations with namespaces:

###### Client side:

* Initiate connection to a namespace
  > const teacherNs = io(`http://example.com/teachers`);

###### Server side:

* Initiate socketioServer first
  > socketioServer = socketio.listen()
* Listen for connection to one namespace:
  > socketioServer.of(`teachers`).on('connect', (teacherNs) => { ... })

###### Same in both client and server:

* Talk over a namespace
  > teacherNs.emit(`eventName`, data)
* Listen for message over a namespace
  > teacherNs.on(`eventName`, function(data) { ... })

## 2. Rooms

#### What is room:
* Group clients in one specific namespace
* A server concept, client knows nothing about room

#### Operations with room (server side only):

###### Join a client to a room
> teacherSocket.join(`channelName`, function(err) { ... })

###### Leave a client out of a room
> teacherSocket.leave(`channelName`)

###### Send a message to all clients except for the one who initiates it:
> teacherSocket.to(`room`).emit(`eventName`, data)

###### See all the clients inside a room (possibly count the number of clients):
> socketioServer.of(`namespace`).in(`room`).clients(function(err, clients) { ... })

###### Send a message to all clients inside a room
> socketioServer.of(`namespace`).in(`room`).emit(`eventName`, data)
