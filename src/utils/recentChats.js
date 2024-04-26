import { Op } from "sequelize";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const recentConversations = async (userId) => {
 const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'email', 'photo']
      },
      {
        model: User,
        as: 'receiver',
        attributes: ['id', 'username', 'email', 'photo']
      }
    ],
    order: [['createdAt', 'DESC']],
  });
  const conversations = messages.map((msg) => msg.dataValues);
  const chats = new Map();
  conversations.forEach((message) => {
    const isSender = message.senderId === userId;
    const otherUser = isSender ? message.receiverId : message.senderId;

    const { id, content, type, status, createdAt } = message;
    const { id: senderId, username: senderUsername, email: senderEmail, photo: senderPhoto  } = message.sender;
    const { id: receiverId, username: receiverUsername, email: receiverEmail,  photo: receiverPhoto  } = message.receiver;
    const receiver = { receiverId, receiverUsername, receiverEmail, receiverPhoto }
    const sender = { senderId, senderUsername, senderEmail, senderPhoto }

    const chat = {
      id,
      content,
      type,
      status,
      createdAt,
      user: isSender ? receiver : sender
    }

    if (!chats.get(otherUser)) {
      chats.set(otherUser, chat)
    }


  })
  return Array.from(chats.values());
}

export default recentConversations;
