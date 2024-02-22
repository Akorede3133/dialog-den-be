import express from 'express';
import { currentUser, getUsers, login, register } from '../controller/user.controller.js';
import { isAuth } from '../middleware/isAuth.js';

const route = express.Router();

route.post('/register', register)
route.post('/login', login)
route.get('/currentUser', isAuth, currentUser)
route.get('/users', isAuth, getUsers)



export default route;