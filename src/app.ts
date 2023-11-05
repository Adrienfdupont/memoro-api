import express from 'express';
import bodyParser from 'body-parser';
import ConnectionHelper from './helpers/ConnectionHelper';
import SecurityHelper from './helpers/SecurityHelper';
import UserController from './controllers/UserController';
import CardController from './controllers/CardController';
import CollectionController from './controllers/CollectionController';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
ConnectionHelper.createPool();

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOW_ORIGIN,
  }),
);

let userController: UserController;
let collectionController: CollectionController;
let cardController: CardController;

app.use((req, res, next) => {
  const entity = req.originalUrl.split('/')[1];

  switch (entity) {
    case 'user':
      userController = new UserController();
    case 'collection':
      collectionController = new CollectionController();
    case 'card':
      cardController = new CardController();
  }

  next();
});

app.get('/', async (req, res) => res.send('Momoro APi is workling.'));

app.post('/user/register', async (req, res) => userController.register(req, res));
app.post('/user/login', async (req, res) => userController.login(req, res));

// routes that need authentication

app.use(SecurityHelper.middleware);

app.get('/user/:id', async (req, res) => userController.getUser(req, res));
app.put('/user', async (req, res) => userController.updateUser(req, res));
app.post('/user/delete', async (req, res) => userController.removeUser(req, res));

app.post('/card', async (req, res) => cardController.addCard(req, res));
app.get('/card/collection/:id', async (req, res) => cardController.getCards(req, res));
app.get('/card/:id', async (req, res) => cardController.getCard(req, res));
app.put('/card', async (req, res) => cardController.updateCard(req, res));
app.delete('/card/:id', async (req, res) => cardController.removeCard(req, res));

app.post('/collection', async (req, res) => collectionController.addCollection(req, res));
app.get('/collection/user/:id', async (req, res) => collectionController.getCollections(req, res));
app.get('/collection/:id', async (req, res) => collectionController.getCollection(req, res));
app.put('/collection', async (req, res) => collectionController.updateCollection(req, res));
app.delete('/collection/:id', async (req, res) => collectionController.removeCollection(req, res));

app.listen(port, () => console.log(`Server started on port ${port}`));
