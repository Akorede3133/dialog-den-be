import express from 'express';
import { getMessages, sendMessage } from '../controller/message.controller.js';
import { isAuth } from '../middleware/isAuth.js';

const route = express.Router();

route.post('/send/:receiverId', isAuth, sendMessage);
route.get('/messages/:receiverId', isAuth, getMessages);

export default route;