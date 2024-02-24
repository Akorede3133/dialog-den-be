import { Op } from "sequelize";
import User from "../models/user.model.js"
import { handleError } from "../utils/error.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import categorizeUsers from "../utils/categorizeUsers.js";
import Message from "../models/message.model.js";

export const register = async (req, res, next) => {
  try {
    const {email, username, password } = req.body;
    const user = await User.findOne({ where: { email }});
    if (user) {
      handleError('User already exists', 401);
    }
    const newUser = await User.create({ username, email, password: await bcrypt.hash(password, 12) })
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000
    });
    res.status(201).send(newUser);
  } catch (error) {
    next(error);
  }
}

export const login = async (req, res, next) => {
  try {
    const {username, password } = req.body;
    const user = await User.findOne({ where: { username }});
    if (!user) {
      handleError('Invalid credentials', 401);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      handleError('Invalid credentials', 401);
    }
     const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000
    });
    res.status(200).send({ message: 'LoggedIn sucessfully!', user});
  } catch (error) {
    next(error);
  }
}

export const currentUser = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findByPk(userId);
    if (!user) {
      handleError('No user found', 404);
    }
    const { id, username, email } = user;
    res.status(200).send({ id, username, email});
  } catch (error) {
    next(error)
  }
}

export const getUsers = async (req, res, next) => {
  try {
    const { userId } = req;
    const users = await User.findAll({
      where: {
        id: {
          [Op.not]: userId
        }
      }
    });
    const categorizedUsers = categorizeUsers(users)
    res.status(200).send(categorizedUsers);
  } catch (error) {
    next(error)
  }
}

export const recentChats = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
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
      const isSender = message.senderId === req.userId;

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
      const sender = message.dataValues.sender.dataValues;
      const receiver = message.dataValues.receiver.dataValues;

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
    res.status(200).send(Array.from(chats.values()));
  } catch (error) {
    next(error)
  }
}