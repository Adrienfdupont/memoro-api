import express from 'express';
import bodyParser from 'body-parser';
import ConnectionHelper from './helpers/ConnectionHelper';
import SecurityHelper from './helpers/SecurityHelper';
import UserController from './controllers/UserController';
import CardController from './controllers/CardController';
import CollectionController from './controllers/CollectionController';
import dotenv from 'dotenv';

const app = express();
const port = process.env.PORT ?? 3000;
const cors = require('cors');

dotenv.config();
app.use(bodyParser.json());
app.use(
  cors({
    origin: 'http://localhost:4200',
  })
);
ConnectionHelper.createPool();

const userController = new UserController();
const collectionController = new CollectionController();
const cardController = new CardController();

app.post('/user/register', async (req, res) => userController.register(req, res));
app.post('/user/login', async (req, res) => userController.login(req, res));

// routes that need authentication

app.use(SecurityHelper.middleware);

app.put('/user/:id', async (req, res) => userController.updateUser(req, res));
app.delete('/user/:id', async (req, res) => userController.removeUser(req, res));

app.post('/card', async (req, res) => cardController.addCard(req, res));
app.get('/cards/collection/:id', async (req, res) => cardController.getCards(req, res));
app.get('/card/:id', async (req, res) => cardController.getCard(req, res));
app.put('/card/:id', async (req, res) => cardController.updateCard(req, res));
app.delete('/card/:id', async (req, res) => cardController.removeCard(req, res));

app.post('/collection', async (req, res) => collectionController.addCollection(req, res));
app.get('/collections/user/:id', async (req, res) => collectionController.getCollections(req, res));
app.get('/collection/:id', async (req, res) => collectionController.getCollection(req, res));
app.put('/collection/:id', async (req, res) => collectionController.updateCollection(req, res));
app.delete('/collection/:id', async (req, res) => collectionController.removeCollection(req, res));

app.listen(port, () => console.log('Server started'));
