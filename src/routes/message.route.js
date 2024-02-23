import express from 'express';
import { sendMessage } from '../controller/message.controller.js';
import { isAuth } from '../middleware/isAuth.js';

const route = express.Router();

route.post('/send/:receiverId', isAuth, sendMessage);

export default route;