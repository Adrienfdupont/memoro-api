import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();

dotenv.config();
app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOW_ORIGIN,
  })
);

app.get('/api/', (req, res) => res.send('Momoro APi is workling.'));

export default app;
