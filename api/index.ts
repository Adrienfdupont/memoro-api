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

app.get('/', async (req, res) => res.send('Momoro APi is workling.'));

app.post('/user/register', async (req, res) =>
  userController.register(req, res)
);
app.post('/user/login', async (req, res) => userController.login(req, res));

// routes that need authentication

app.use(SecurityHelper.middleware);

app.get('/user/:id', async (req, res) => userController.getUser(req, res));
app.put('/user', async (req, res) => userController.updateUser(req, res));
app.post('/user/delete', async (req, res) =>
  userController.removeUser(req, res)
);

app.post('/card', async (req, res) => cardController.addCard(req, res));
app.get('/cards/collection/:id', async (req, res) =>
  cardController.getCards(req, res)
);
app.get('/card/:id', async (req, res) => cardController.getCard(req, res));
app.put('/card', async (req, res) => cardController.updateCard(req, res));
app.delete('/card/:id', async (req, res) =>
  cardController.removeCard(req, res)
);

app.post('/collection', async (req, res) =>
  collectionController.addCollection(req, res)
);
app.get('/collections/user/:id', async (req, res) =>
  collectionController.getCollections(req, res)
);
app.get('/collection/:id', async (req, res) =>
  collectionController.getCollection(req, res)
);
app.put('/collection', async (req, res) =>
  collectionController.updateCollection(req, res)
);
app.delete('/collection/:id', async (req, res) =>
  collectionController.removeCollection(req, res)
);

export default app;