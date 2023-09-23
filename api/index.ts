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

app.post('/api/user/register', (req, res) => res.send('register'));
app.post('/api/user/login', (req, res) => res.send('login'));

// routes that need authentication

app.use(SecurityHelper.middleware);

app.get('/api/user/:id', (req, res) => res.send('get user'));
app.put('/api/user', (req, res) => res.send('put user'));
app.post('/api/user/delete', (req, res) => res.send('delete user'));

app.post('/api/card', (req, res) => res.send('post card'));
app.get('/api/cards/collection/:id', (req, res) => res.send('get cards'));
app.get('/api/card/:id', (req, res) => res.send('get card'));
app.put('/api/card', (req, res) => res.send('put card'));
app.delete('/api/card/:id', (req, res) => res.send('delete card'));

app.post('/api/collection', (req, res) => res.send('post collection'));
app.get('/api/collections/user/:id', (req, res) => res.send('get collections'));
app.get('/api/collection/:id', (req, res) => res.send('get collection'));
app.put('/api/collection', (req, res) => res.send('put collection'));
app.delete('/api/collection/:id', (req, res) => res.send('delete collection'));

export default app;
