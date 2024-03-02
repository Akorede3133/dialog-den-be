import express from 'express';
import cors from 'cors';
import { server, app, io } from './utils/socket.js';
import { config } from 'dotenv';
import sequelize from './configs/database.js';
import cookieParser from 'cookie-parser';
import User from './models/user.model.js';
import Message from './models/message.model.js';
import authRoutes from './routes/user.route.js';
import messageRoutes from './routes/message.route.js';

config()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser());

app.use('/api/v1', authRoutes);
app.use('/api/v1', messageRoutes);


app.use((error, req, res, next) => {
  const { message, statusCode} = error;
  res.status(statusCode || 500).send({ message })
})


User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });


sequelize.sync({ alter: true })
  .then(() => {
    console.log('database connected');
    server.listen(process.env.PORT, () => {
      console.log(`Server connected on port ${process.env.PORT}`);
    })
  })
