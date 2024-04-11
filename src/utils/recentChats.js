import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const getRecentChats = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Message, 
        as: 'sentMessages',
        include: [
          {
            model: User,
            as: 'receiver'
          },
          {
            model: User,
            as: 'sender'
          }
        ],
        order: ['createdAt', 'DESC']
      },
      {
        model: Message, 
        as: 'receivedMessages',
        include: [
          {
            model: User,
            as: 'receiver'
          },
          {
            model: User,
            as: 'sender'
          }
        ],
        order: ['createdAt', 'DESC']
      }
    ],
  })

  const messages = [...user.sentMessages, ...user.receivedMessages]

  messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const chats = new Map();
  messages.map((message) => {
    const isSender = message.senderId === userId;

    const {
      id,
      content,
      type,
      createdAt,
      updatedAt,
      senderId,
      receiverId,
    } = message.dataValues
    const calcId = isSender ? receiverId : senderId;
    const {id: msgSenderId, username: senderUsername, email: senderEmail} = message.dataValues.sender.dataValues ;
    const sender = { msgSenderId, senderUsername, senderEmail };
    const {id: msgReceiverId, username: receiverUsername, email: receiverEmail} = message.dataValues.receiver.dataValues ;
    const receiver = { msgReceiverId, receiverUsername, receiverEmail }

    let chat = {
      messageId :id,
      content,
      type,
      createdAt,
      updatedAt,
      senderId,
      receiverId
    }


    if (isSender) {
      chat = {
        ...chat,
        ...receiver
      }
    } else {
      chat = {
        ...chat,
        ...sender
      }
    }
    if (!chats.get(calcId)) {
      chats.set(calcId, chat)
    }
  })
  console.log(chats);
  return Array.from(chats.values()) 
}

export default getRecentChats;