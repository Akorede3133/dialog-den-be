import express from 'express';
import { getMessages, sendImage, sendMessage } from '../controller/message.controller.js';
import { isAuth } from '../middleware/isAuth.js';
import upload from '../utils/upload.js';

const route = express.Router();

route.post('/send/:receiverId', isAuth, sendMessage);
route.post('/sendImage/:receiverId', isAuth, upload.single('image'), sendImage);
route.get('/messages/:receiverId', isAuth, getMessages);

export default route;