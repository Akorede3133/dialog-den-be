import jwt from 'jsonwebtoken';
import { handleError } from '../utils/error.js';

export const isAuth = (req, res, next) => {
  try {
    const { auth_token } = req.cookies;
    if (!auth_token) {
      handleError('No token found', 401);
    }
    const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
    if (!decoded) {
      handleError('Expired token', 401);
    }
    const { userId } = decoded;
    req.userId = userId;
    next()
  } catch (error) {
    next(error);
  }
}