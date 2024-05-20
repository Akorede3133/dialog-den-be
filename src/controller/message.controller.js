import { Buffer } from 'node:buffer'
import { Op } from "sequelize";
import Message from "../models/message.model.js"
import upload from "../utils/cloudinary.js";
import { getReceiverSocketId, io, onlineUsersMap } from "../utils/socket.js";
import recentConversations from '../utils/recentChats.js'
import { handleError } from '../utils/error.js';
export const sendMessage = async (req, res, next) => {
  try {
    const { content, type } = req.body;
    const { receiverId } = req.params;
    const isUserOnline = Boolean(onlineUsersMap[receiverId.toString()])
    const status = isUserOnline ? 'delivered' : 'sent';
    const message = await Message.create({ content, type, senderId: req.userId, receiverId, status});
    const receiverSocketId = getReceiverSocketId(receiverId);
   
    res.status(201).send(message);
  
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getMessage', message);
      const chats = await recentConversations(+receiverId);
      io.to(receiverSocketId).emit('recentChat', chats)

    }
  } catch (error) {
    next(error)
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { receiverId } = req.params;
    const messages = await Message.findAll({ 
      where: {
        [Op.or]: [
          { receiverId, senderId: req.userId },
          { senderId: receiverId, receiverId: req.userId }
        ]
      },
      order: [
        ['id', 'asc']
      ]
    })
    const messageIds = messages.filter((message) => message.status !== 'read' && message.senderId == receiverId).map((msg) => msg.id)
    if (messageIds.length > 0) {
      await Message.update({ status: 'read' }, {
        where: {
          id: messageIds
        }
      })
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(getReceiverSocketId(receiverId)).emit('readMessage', messageIds);
        const chats = await recentConversations(+receiverId);
        io.to(receiverSocketId).emit('recentChat', chats)
      }
     
    }
    
    res.status(200).send(messages);
  } catch (error) {
    next(error)
  }
};

export const getRecentChats = async (req, res, next) => {
  try {
    const chats = await recentConversations(req.userId);
    res.status(200).send(chats);
  } catch (error) {
    next(error)
  }
}

export const sendImage = async (req, res, next) => {
  try {
    const { receiverId } = req.params;
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const cldRes = await upload(dataURI);
    const { secure_url } = cldRes;
    const message = await Message.create({ content: secure_url, type: 'image', senderId: req.userId, receiverId })
    res.status(201).send(message);
    
    const receiverSocketId = getReceiverSocketId(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getMessage', message);
      const chats = await recentConversations(+receiverId);
      io.to(receiverSocketId).emit('recentChat', chats)
    }

  } catch (error) {
    next(error)
  }
}

export const sendVoiceMessage = async (req, res, next) => {
  try {
    const { receiverId } = req.params;
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const cldRes = await upload(dataURI);
    const { secure_url } = cldRes;
    const message = await Message.create({ content: secure_url, type: 'voice', senderId: req.userId, receiverId })
    res.status(201).send(message);
    
    const receiverSocketId = getReceiverSocketId(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getMessage', message);
      const chats = await recentConversations(+receiverId);
      io.to(receiverSocketId).emit('recentChat', chats)
    }

  } catch (error) {
    next(error)
  }
}

export const deleteConversation = async (req, res, next) => {
  try {
    const {receiverId } = req.params;
    const { userId } = req;

    await Message.destroy({ where: {
      [Op.or]: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId }
      ]
    }});
    res.status(200).send({message: 'Coversation deleted sucessfully'});
  } catch (error) {
    next(error)
  }
}

export const deleteMessage = async(req, res, next) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findByPk(messageId);
    if (!message) {
      handleError('Message not found', 404);
    }
    await message.destroy();
    res.status(201).send({ message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
}