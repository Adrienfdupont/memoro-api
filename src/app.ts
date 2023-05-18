import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import ConnectionHelper from "./helper/ConnectionHelper";
import UserBusiness from "./business/UserBusiness";
import SecurityHelper from "./helper/SecurityHelper";
import CardBusiness from "./business/CardBusiness";
import Card from "./types/Card";
import BusinessError from "./errors/BusinessError";

const app = express();
const port = process.env.PORT ?? 3000;
app.use(bodyParser.json());
ConnectionHelper.createPool();

let authUserId: number;
let httpCode: number = 500;
let body: Object = { error: "Une erreur est survenue." };

// ---------------------------------- routes ----------------------------------

app.get("/", (req, res) => {
  res.send("L'API fonctionne !");
});

app.post("/login", async (req, res) => {
  let token: string | null;

  try {
    token = await UserBusiness.login(req.body.username, req.body.password);
    body = { token: token };
  } catch (err) {
    if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
  }
  httpCode = 200;
  res.status(httpCode).json(body);
});

app.post("/user", async (req, res) => {
  try {
    await UserBusiness.register(req.body.username, req.body.password);
  } catch (err) {
    if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
  }
  httpCode = 200;
  body = { success: "Vous avez bien été inscrit(e)." };
  res.status(httpCode).json(body);
});

// ---------- authentication necessary ------------

async function middleware(req: Request, res: Response, next: NextFunction) {
  const token: string | undefined = req.get("Authorization");

  if (token !== undefined) {
    try {
      authUserId = await SecurityHelper.verifyToken(token);
      next();
    } catch (err) {
      httpCode = 401;
      if (err instanceof Error) {
        body = { error: err.message };
      }
      res.status(httpCode).json(body);
    }
  } else {
    httpCode = 401;
    body = { error: "Token invalide." };
    res.status(httpCode).json(body);
  }
}
app.use(middleware);

app.put("/user", async (req, res) => {
  try {
    await UserBusiness.updateUser(req.body.username, req.body.password, authUserId);
  } catch (err) {
    if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
  }
  httpCode = 200;
  body = { success: "Vos informations ont bien été modifiées." };
  res.status(httpCode).json(body);
});

app.delete("/user", async (req, res) => {
  try {
    await UserBusiness.removeUser(authUserId);
  } catch (err) {
    if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
  }
  httpCode = 200;
  body = { success: "Utilisateur supprimé." };
  res.status(httpCode).json(body);
});

app.get("/cards", async (req, res) => {
  let cards: Card[];

  try {
    cards = await CardBusiness.getCards(authUserId);
    body = cards;
  } catch (err) {
    if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
  }
  httpCode = 200;
  res.status(httpCode).json(body);
});

app.get("/card", async (req, res) => {
  const cardId: any = req.query.id;
  let card: Card;

  try {
    card = await CardBusiness.getCard(cardId);
    body = { card: card };
  } catch (err) {
    if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
  }
  httpCode = 200;
  res.status(httpCode).json(body);
});

app.post("/card", async (req, res) => {
  try {
    await CardBusiness.addCard(req.body.label, req.body.translation, authUserId);
  } catch (err) {
    if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
  }
  httpCode = 200;
  body = { success: "La carte a bien été ajoutée." };
  res.status(httpCode).json(body);
});

app.put("/card/:id", async (req, res) => {
  const cardId: string = req.params.id;

  try {
    await CardBusiness.updateCard(cardId, req.body.label, req.body.translation, authUserId);
  } catch (err) {
    if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
  }
  httpCode = 200;
  body = { success: "La carte a bien été modifiée" };
  res.status(httpCode).json(body);
});

app.delete("/card/:id", async (req, res) => {
  const cardId: string = req.params.id;

  try {
    await CardBusiness.removeCard(cardId, authUserId);
  } catch (err) {
    if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
  }
  httpCode = 200;
  body = { success: "La carte a bien été supprimée." };
  res.status(httpCode).json(body);
});

app.listen(port, () => console.log("Serveur démarré"));
