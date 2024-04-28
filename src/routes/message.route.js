import express from 'express';
import { getMessages, getRecentChats, sendImage, sendMessage, sendVoiceMessage } from '../controller/message.controller.js';
import { isAuth } from '../middleware/isAuth.js';
import upload from '../utils/upload.js';

const route = express.Router();

route.post('/send/:receiverId', isAuth, sendMessage);
route.post('/sendImage/:receiverId', isAuth, upload.single('image'), sendImage);
route.post('/sendFile/:receiverId', isAuth, upload.single('image'), sendImage);
route.get('/messages/:receiverId', isAuth, getMessages);
route.post('/sendVoice/:receiverId', isAuth, upload.single('voice'), sendVoiceMessage);
route.get('/recentChats', isAuth, getRecentChats);

export default route;