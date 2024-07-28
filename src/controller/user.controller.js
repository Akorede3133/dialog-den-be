import { Buffer } from 'buffer'
import { Op } from "sequelize";
import User from "../models/user.model.js"
import { handleError } from "../utils/error.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import categorizeUsers from "../utils/categorizeUsers.js";
import upload from "../utils/cloudinary.js";

export const register = async (req, res, next) => {
  try {
    const {email, username, password } = req.body;
    const user = await User.findOne({ where: { email }});
    if (user) {
      handleError('User already exists', 401);
    }
    const newUser = await User.create({ username, email, password: await bcrypt.hash(password, 12) })
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
      // expiresIn: '1d'
    });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000,
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });
    res.status(201).send(newUser);
  } catch (error) {
    next(error);
  }
}

export const login = async (req, res, next) => {
  try {
    const {username, password } = req.body;
    const user = await User.findOne({ where: { username }});
    if (!user) {
      handleError('Invalid credentials', 401);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      handleError('Invalid credentials', 401);
    }
     const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000,
      sameSite: process.env.NODE_ENV === 'production' && 'None',
    });
    res.status(200).send({ message: 'LoggedIn sucessfully!', user});
  } catch (error) {
    next(error);
  }
}

export const logout = async (req, res, next) => {
  try {
    console.log('======',req.userId,'======');
    res.clearCookie('auth_token');
    res.status(201).send({ message: 'LoggedOut sucessfully!'});
  } catch (error) {
    next(error)
  }
}


export const currentUser = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findByPk(userId);
    if (!user) {
      handleError('No user found', 404);
    }
    const { id, username, email, photo } = user;
    res.status(200).send({ id, username, email, photo});
  } catch (error) {
    next(error)
  }
}

export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { username, password, passwordConfirmation } = req.body;
    const { file } = req;
    const user = await User.findByPk(userId);
    if (!user) {
      handleError('No user Found', 404);
    }
    let photoURL = user.photo;

    if (file) {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      const cldRes = await upload(dataURI);
      photoURL = cldRes.secure_url;
    }

    await user.update({ photo: photoURL, username });

    res.status(201).send({ message: 'Profile updated successfully'});

  } catch (error) {
    next(error)
  }
}


export const getUsers = async (req, res, next) => {
  try {
    const { userId } = req;
    const users = await User.findAll({
      where: {
        id: {
          [Op.not]: userId
        }
      }
    });
    const categorizedUsers = categorizeUsers(users)
    res.status(200).send(categorizedUsers);
  } catch (error) {
    next(error)
  }
}
