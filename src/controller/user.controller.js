import User from "../models/user.model.js"
import { handleError } from "../utils/error.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res, next) => {
  try {
    const {email, username, password } = req.body;
    const user = await User.findOne({ where: { email }});
    if (user) {
      handleError('User already exists', 401);
    }
    const newUser = await User.create({ username, email, password: await bcrypt.hash(password, 12) })
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000
    });
    res.status(201).send(newUser);
  } catch (error) {
    next(error);
  }
}