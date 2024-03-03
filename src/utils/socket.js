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

export const getReceiverSocketId = (receiverId) => onlineUsersMap[receiverId]

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    onlineUsersMap[userId] = socket.id;
  }
  const onlineUsersId = Object.keys(onlineUsersMap).map((id) => +id)
  io.emit('getOnlineUsers', onlineUsersId)
  socket.on('disconnect', () => {
    delete onlineUsersMap[userId];
    io.emit('getOnlineUsers', Object.keys(onlineUsersMap))
  })
})

