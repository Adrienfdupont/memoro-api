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

app.post('/api/user/register', (req, res) => userController.register(req, res));
app.post('/api/user/login', (req, res) => userController.login(req, res));

// routes that need authentication

app.use(SecurityHelper.middleware);

app.get('/api/user/:id', (req, res) => userController.getUser(req, res));
app.put('/api/user', (req, res) => userController.updateUser(req, res));
app.post('/api/user/delete', (req, res) => userController.removeUser(req, res));

app.post('/api/card', (req, res) => cardController.addCard(req, res));
app.get('/api/cards/collection/:id', (req, res) =>
  cardController.getCards(req, res)
);
app.get('/api/card/:id', (req, res) => cardController.getCard(req, res));
app.put('/api/card', (req, res) => cardController.updateCard(req, res));
app.delete('/api/card/:id', (req, res) => cardController.removeCard(req, res));

app.post('/api/collection', (req, res) =>
  collectionController.addCollection(req, res)
);
app.get('/api/collections/user/:id', (req, res) =>
  collectionController.getCollections(req, res)
);
app.get('/api/collection/:id', (req, res) =>
  collectionController.getCollection(req, res)
);
app.put('/api/collection', (req, res) =>
  collectionController.updateCollection(req, res)
);
app.delete('/api/collection/:id', (req, res) =>
  collectionController.removeCollection(req, res)
);

export default app;
