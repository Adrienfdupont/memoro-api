import express from 'express';
import bodyParser from 'body-parser';
import ConnectionHelper from './helpers/ConnectionHelper';
import SecurityHelper from './helpers/SecurityHelper';
import UserController from './controllers/UserController';
import CardController from './controllers/CardController';
import CollectionController from './controllers/CollectionController';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();

dotenv.config();
app.use(bodyParser.json());
app.use(
  cors({
    origin: process.env.ALLOW_ORIGIN,
  })
);
ConnectionHelper.createPool();

const userController = new UserController();
const collectionController = new CollectionController();
const cardController = new CardController();

app.get('/api/', (req, res) => res.send('Momoro APi is workling.'));

export default app;
