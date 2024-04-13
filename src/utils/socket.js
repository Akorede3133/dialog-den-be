import express from 'express';
import { Server } from "socket.io";
import { createServer } from 'node:http';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';

export const app = express();
export const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});
export const onlineUsersMap = {};

export const getReceiverSocketId = (receiverId) => onlineUsersMap[receiverId]
const offers = [];

io.on('connection', (socket) => {
  socket.on('user', async (user) => {
    const userId = user.id
    onlineUsersMap[userId] = socket.id; 
    const onlineUsersId = Object.keys(onlineUsersMap).map((id) => +id);

    io.emit('getOnlineUsers', onlineUsersId)
    
    socket.on('getUserSocketId', ({ id }) => {
      socket.emit('getUserSocketId', getReceiverSocketId(id))
    })

    socket.on('sendOutgoingCall', async ({ callReceiverId, type}) => {
      const user = await User.findByPk(userId);
      const {id, username, email } = user.dataValues;
      const caller = { id, username, email, type }
      socket.to(getReceiverSocketId(callReceiverId)).emit('sendOutgoingCallToReceiver', caller );
    });

    socket.on('cancelOutgoingVoiceCall', ({ callReceiverId}) => {
      socket.to(getReceiverSocketId(callReceiverId)).emit('cancelOutgoingVoiceCallForReceiver');
    })

    socket.on('cancelOutgoingVideoCall', ({ callReceiverId}) => {
      socket.to(getReceiverSocketId(callReceiverId)).emit('cancelOutgoingVideoCallForReceiver');
    })

    socket.on('sendOnGoingCall', ({ callerId }) => {
      socket.to(getReceiverSocketId(callerId)).emit('sendOnGoingCall')
    })

    socket.on('sendOffer', ({ offer,receiverId }) => {
      if (offer) {
        const offerObj = {
          offererId: +userId,
          offer,
          offererIceCandiates: [],
          answererId: receiverId,
          answer: null,
          answererIceCandiates: [],
        }
        offers.push(offerObj);
        socket.to(getReceiverSocketId(receiverId)).emit('sendOffer', offerObj);
      }
    })

    socket.on('sendAnswer',  ({answer, offererId} ) => {
      const offerToUpdate = offers.find((offer) => offer.offererId == offererId)
      if (offerToUpdate) {
      offerToUpdate.answer = answer;
        socket.to(getReceiverSocketId(offererId)).emit('sendAnswer', answer)
      }
    })
  
    socket.on('sendIceCandidate',({ candidate, iceCandidateOffererId }) => {
      const offerToUpdate = offers.find((offer) => offer.offererId == iceCandidateOffererId || offer.answererId == iceCandidateOffererId);
      if (offerToUpdate) {
        if (iceCandidateOffererId == offerToUpdate.offererId) {
          offerToUpdate.offererIceCandiates.push(candidate);
          socket.to(getReceiverSocketId(offerToUpdate.answererId)).emit('updatedOfferWithIceCandiadates', {candidate});
        } else {
          offerToUpdate.answererIceCandiates.push(candidate);
          socket.to(getReceiverSocketId(offerToUpdate.offererId)).emit('updatedOfferWithIceCandiadates', {candidate});
        }
      }
    })
    socket.on('disconnect', () => {
      delete onlineUsersMap[userId];
      const onlineUsersId = Object.keys(onlineUsersMap).map((id) => +id);
      io.emit('getOnlineUsers', onlineUsersId)
    })

    const messages = await Message.findAll({
      where: {
        receiverId: userId | null,
        status: 'sent'
      },
    });
    const messageIds = messages.map((message) => message.id);
    if (messageIds.length > 0) {
      await Message.update({status: 'delivered'}, { where: { id: messageIds } })
    } 
  })
})

