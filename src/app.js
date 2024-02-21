import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import sequelize from './configs/database.js';
import authRoute from './routes/user.route.js';
import cookieParser from 'cookie-parser';
config()

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser());

app.use('/api/v1', authRoute);

app.use((error, req, res, next) => {
  const { message, statusCode} = error;
  res.status(statusCode || 500).send({ message })
})

sequelize.sync({ alter: true })
  .then(() => {
    console.log('database connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server connected on port ${process.env.PORT}`);
    })
  })
