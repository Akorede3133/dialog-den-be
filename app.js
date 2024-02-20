import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config()

const app = express();

app.use(cors())
app.use(express.json())

app.listen(process.env.PORT, () => {
  console.log(`Server connected on port ${process.env.PORT}`);
})