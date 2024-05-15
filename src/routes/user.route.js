import express from 'express';
import { currentUser, getUsers, login, logout, register, updateUser } from '../controller/user.controller.js';
import { isAuth } from '../middleware/isAuth.js';
import upload from '../utils/upload.js';

const route = express.Router();

route.post('/register', register)
route.post('/login', login)
route.delete('/logout', isAuth,  logout)
route.get('/currentUser', isAuth, currentUser)
route.get('/users', isAuth, getUsers)
route.put('/updateUser/:userId', isAuth, upload.single('photo'), updateUser);




export default route;