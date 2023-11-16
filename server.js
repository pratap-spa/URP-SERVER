const express = require('express');
const cors = require('cors')
const http = require('http');
const { ExpressPeerServer } = require('peer');
const socketIO = require('socket.io');

const app = express();
app.use(cors())

const server = http.createServer(app);
//const io = socketIO(server);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const peerServer = ExpressPeerServer(server, {
  path: '/peerjs',
});

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  res.send('Server is running');
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    console.log(`user Joined - RoomID: ${roomId} and UserID: ${userId}`)
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId);
      console.log("user disconnected", userId)
    });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

 