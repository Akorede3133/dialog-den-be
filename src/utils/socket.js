import express from 'express';
import { Server } from "socket.io";
import { createServer } from 'node:http';

export const app = express();
export const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

const onlineUsersMap = {};

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) {
    onlineUsersMap[userId] = socket.id;
  }
  console.log(onlineUsersMap);
  io.emit('getOnlineUsers', Object.keys(onlineUsersMap))
  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
    delete onlineUsersMap[userId];
    io.emit('getOnlineUsers', Object.keys(onlineUsersMap))
  })
})

