import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import ConnectionHelper from "./helper/ConnectionHelper";
import UserBusiness from "./business/UserBusiness";
import SecurityHelper from "./helper/SecurityHelper";
import CardBusiness from "./business/CardBusiness";
import Card from "./types/Card";
import { SqlError } from "mariadb";

const app = express();
app.use(bodyParser.json());
ConnectionHelper.createPool();

let authUserId: number;
let httpCode: number = 500;
let body: Object = { error: "Une erreur est survenue." };

// ---------------------------------- routes ----------------------------------

app.post("/login", async (req, res) => {
  try {
    const token: string | null = await UserBusiness.login(req.body.username, req.body.password);
    httpCode = 200;
    body = { token: token };
  } catch (err) {
    if (err instanceof Error) {
      httpCode = 403;
      body = { error: err.message };
    }
  }
  res.status(httpCode).json(body);
});

app.post("/user", async (req, res) => {
  try {
    await UserBusiness.register(req.body.username, req.body.password);
    httpCode = 200;
    body = { success: "Vous avez bien été inscrit(e)." };
  } catch (err) {
    if (err instanceof SqlError && err.errno === 1062) {
      httpCode = 409;
      body = { error: "Ce nom d'utilisateur est déjà utilisé." };
    }
  }
  res.status(httpCode).json(body);
});

// ---------- authentication necessary ------------

function middleware(req: Request, res: Response, next: NextFunction) {
  const token: string | undefined = req.get("Authorization");
  if (token !== undefined) {
    try {
      const userId: number | null = SecurityHelper.verifyToken(token);
      if (userId !== null) {
        authUserId = userId;
      }
      next();
    } catch (err) {
      res.status(401).json({ error: "Token invalide." });
    }
  } else {
    res.status(401).json({ error: "Token invalide." });
  }
}
app.use(middleware);

app.get("/cards", async (req, res) => {
  try {
    const cards: Card[] = await CardBusiness.getCards(authUserId);
    httpCode = 200;
    body = { cards: cards };
  } catch (err) {
    body = { error: "Une erreur est survenue" };
  }
  res.status(httpCode).json(body);
});

app.get("/card", async (req, res) => {
  const cardId: any = req.query.id;
  try {
    const card: Card = await CardBusiness.getCard(cardId);
    httpCode = 200;
    body = { card: card };
  } catch (err) {
    if (err instanceof Error) {
      body = { error: err.message };
    }
  }
  res.status(httpCode).json(body);
});

app.post("/card", async (req, res) => {
  try {
    await CardBusiness.addCard(req.body.label, req.body.value, authUserId);
    httpCode = 200;
    body = { success: "La carte a bien été ajoutée." };
  } catch (err) {
    if (err instanceof SqlError && err.errno === 1062) {
      httpCode = 409;
      body = { error: "Vous possédez déjà une carte avec ce label." };
    }
  }
  res.status(httpCode).json(body);
});

app.listen(3000, () => console.log("Serveur démarré"));
