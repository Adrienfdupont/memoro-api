import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import ConnectionHelper from "./helper/ConnectionHelper";
import UserBusiness from "./business/UserBusiness";
import SecurityHelper from "./helper/SecurityHelper";
import CardBusiness from "./business/CardBusiness";
import Card from "./types/Card";
import { SqlError } from "mariadb";
import BusinessError from "./errors/BusinessError";

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
    if (err instanceof BusinessError) {
      httpCode = err.status;
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
    } else if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
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

app.put("/user", async (req, res) => {
  try {
    await UserBusiness.updateUser(req.body.username, req.body.password, authUserId);
    httpCode = 200;
    body = { success: "Vos information ont bien été modifiées." };
  } catch (err) {
    if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
  }
  res.status(httpCode).json(body);
});

app.delete("/user", async (req, res) => {
  try {
    await UserBusiness.removeUser(authUserId);
    httpCode = 200;
    body = { success: "Utilisateur supprimé." };
  } catch (err) {
    if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
  }
  res.status(httpCode).json(body);
});

app.get("/cards", async (req, res) => {
  try {
    const cards: Card[] = await CardBusiness.getCards(authUserId);
    httpCode = 200;
    body = { cards: cards };
  } catch (err) {
    if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
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
    if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
  }
  res.status(httpCode).json(body);
});

app.post("/card", async (req, res) => {
  try {
    await CardBusiness.addCard(req.body.label, req.body.translation, authUserId);
    httpCode = 200;
    body = { success: "La carte a bien été ajoutée." };
  } catch (err) {
    if (err instanceof SqlError && err.errno === 1062) {
      httpCode = 409;
      body = { error: "Vous possédez déjà une carte avec ce label." };
    } else if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
  }
  res.status(httpCode).json(body);
});

app.put("/card/:id", async (req, res) => {
  const cardId: string = req.params.id;
  try {
    await CardBusiness.updateCard(cardId, req.body.label, req.body.translation, authUserId);
    httpCode = 200;
    body = { success: "La carte a bien été modifiée" };
  } catch (err) {
    if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
  }
  res.status(httpCode).json(body);
});

app.delete("/card/:id", async (req, res) => {
  const cardId: string = req.params.id;
  try {
    await CardBusiness.removeCard(cardId, authUserId);
    httpCode = 200;
    body = { success: "La carte a bien été supprimée." };
  } catch (err) {
    if (err instanceof BusinessError) {
      httpCode = err.status;
      body = { error: err.message };
    }
  }
  res.status(httpCode).json(body);
});

app.listen(3000, () => console.log("Serveur démarré"));
