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
  conversations.forEach(async (message) => {
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
      // const unreadMessages = await Message.findAndCountAll({ where: {status: { [Op.not]: 'read'}, senderId: userId, receiverId: otherUser}
      // })
      // console.log(unreadMessages);
      // console.log(chat);
      // chat.count = unreadMessages.count
      chats.set(otherUser, chat)
    }
  })
  const convos = await Promise.all(Array.from(chats.values()).map(async (item) => {
    const unreadMessages = await Message.findAndCountAll({ 
        where: { 
            status: { [Op.not]: 'read' },
            senderId: item.user.receiverId || item.user.senderId,
            receiverId: userId
        }
    });
    item.count = unreadMessages.count;
    return item;
}));
  return convos;
}

export default recentConversations;
