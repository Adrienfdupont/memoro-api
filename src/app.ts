import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import ConnectionHelper from './helpers/ConnectionHelper';
import SecurityHelper from './helpers/SecurityHelper';
import UserController from './controllers/UserController';
import CardController from './controllers/CardController';
import CollectionController from './controllers/CollectionController';

const app = express();
const port = process.env.PORT ?? 3000;
const cors = require('cors');

app.use(bodyParser.json());
app.use(
  cors({
    origin: 'http://localhost:4200',
  })
);
ConnectionHelper.createPool();

app.post('/user/register', async (req, res) => UserController.register(req, res));
app.post('/user/login', async (req, res) => UserController.login(req, res));

app.use(SecurityHelper.middleware);

app.put('/user/:id', async (req, res) => UserController.updateUser(req, res));
app.delete('/user/:id', async (req, res) => UserController.removeUser(req, res));

app.post('/card', async (req, res) => CardController.addCard(req, res));
app.get('/cards/collection/:id', async (req, res) => CardController.getCards(req, res));
app.get('/card/:id', async (req, res) => CardController.getCard(req, res));
app.put('/card/:id', async (req, res) => CardController.updateCard(req, res));
app.delete('/card/:id', async (req, res) => CardController.removeCard(req, res));

app.post('/collection', async (req, res) => CollectionController.addCollection(req, res));
app.get('/collections/user/:id', async (req, res) => CollectionController.getCollections(req, res));
app.get('/collection/:id', async (req, res) => CollectionController.getCollection(req, res));
app.put('/collection/:id', async (req, res) => CollectionController.updateCollection(req, res));
app.delete('/collection/:id', async (req, res) => CollectionController.removeCollection(req, res));

app.listen(port, () => console.log('Server started'));
