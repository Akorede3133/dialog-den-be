import express from 'express';
import { currentUser, getUsers, login, recentChats, register } from '../controller/user.controller.js';
import { isAuth } from '../middleware/isAuth.js';

const route = express.Router();

route.post('/register', register)
route.post('/login', login)
route.get('/currentUser', isAuth, currentUser)
route.get('/users', isAuth, getUsers)
route.get('/recentChats', isAuth, recentChats)




export default route;