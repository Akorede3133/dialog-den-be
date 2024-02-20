import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import sequelize from './configs/database.js';

config()

const app = express();

app.use(cors())
app.use(express.json())

sequelize.sync({ alter: true })
  .then(() => {
    console.log('database connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server connected on port ${process.env.PORT}`);
    })
  })
