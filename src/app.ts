import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import ConnectionHelper from "./helper/ConnectionHelper";
import UserBusiness from "./business/UserBusiness";
import LoginResponse from "./types/LoginResponse";
import SecurityHelper from "./helper/SecurityHelper";
import CardAddResponse from "./types/CardAddResponse";
import CardBusiness from "./business/CardBusiness";

const app = express();
app.use(bodyParser.json());
ConnectionHelper.createPool();

app.post("/login", async (req, res) => {
  const loginResponse: LoginResponse = await UserBusiness.login(
    req.body.username,
    req.body.password
  );
  res.status(loginResponse.status).json(loginResponse.body);
});

app.post("/user", async (req, res) => {
  const loginResponse: LoginResponse = await UserBusiness.register(
    req.body.username,
    req.body.password
  );
  res.status(loginResponse.status).json(loginResponse.body);
});

function middlewareFunction(req: Request, res: Response, next: NextFunction) {
  const token = req.get("Authorization");
  if (token) {
    if (SecurityHelper.verifyToken(token)) {
      next();
    } else {
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
}
app.use(middlewareFunction);

app.get("/", (req, res) => {
  res.send("Cette route n'est pas censée s'afficher sans authentification");
});

app.post("/card", (req, res) => {
  const cardAddResponse: CardAddResponse = await CardBusiness.addCard(
    req.body.label, req.body.value, 
  )
})

app.listen(3000, () => console.log("Serveur démarré"));
