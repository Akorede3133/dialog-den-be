import User from "../models/user.model.js"
import { handleError } from "../utils/error.js";
import bcrypt from 'bcryptjs';
export const register = async (req, res, next) => {
  try {
    const {email, username, password } = req.body;
    const user = await User.findOne({ where: { email }});
    if (user) {
      handleError('User already exists', 401);
    }
    const newUser = await User.create({ username, email, password: await bcrypt.hash(password, 12) })
    res.status(201).send(newUser);
  } catch (error) {
    next(error);
  }
}