import { Op } from "sequelize";
import Message from "../models/message.model.js"
import uploadImage from "../utils/cloudinary.js";
import { getReceiverSocketId, io } from "../utils/socket.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { content, type } = req.body;
    const { receiverId } = req.params;
    const message = await Message.create({ content, type, senderId: req.userId, receiverId });

    const receiverSocketId = getReceiverSocketId(receiverId);
   
    res.status(201).send(message);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getMessage', message);
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
      } 
    })
    res.status(200).send(messages);
  } catch (error) {
    next(error)
  }
};

export const sendImage = async (req, res, next) => {
  try {
    const { receiverId } = req.params;
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const cldRes = await uploadImage(dataURI);
    console.log(cldRes);
    const { secure_url } = cldRes;
    const message = await Message.create({ content: secure_url, type: 'image', senderId: req.userId, receiverId })
    res.status(201).send(message);
    
    const receiverSocketId = getReceiverSocketId(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getMessage', message);
    }

  } catch (error) {
    next(error)
  }
}