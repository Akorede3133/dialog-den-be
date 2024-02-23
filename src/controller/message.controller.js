import Message from "../models/message.model.js"

export const sendMessage = async (req, res, next) => {
  try {
    const { content, type } = req.body;
    const { receiverId } = req.params;
    const message = await Message.create({ content, type, senderId: req.userId, receiverId });
    res.status(201).send(message);
  } catch (error) {
    next(error)
  }
};