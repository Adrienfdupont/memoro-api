import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import ConnectionHelper from "./helper/ConnectionHelper";
import UserBusiness from "./business/UserBusiness";
import LoginResponse from "./types/LoginResponse";
import SecurityHelper from "./helper/SecurityHelper";
import CardAddResponse from "./types/CardAddResponse";
import CardBusiness from "./business/CardBusiness";
import RegisterResponse from "./types/RegisterReponse";

const app = express();
app.use(bodyParser.json());
ConnectionHelper.createPool();
let authUserId: number | null;


// ------------------------- routes --------------------------

app.post("/login", async (req, res) => {
  const loginResponse: LoginResponse = await UserBusiness.login(
    req.body.username,
    req.body.password
    );
  res.status(loginResponse.status).json(loginResponse.body);
});

app.post("/user", async (req, res) => {
  const registerResponse: RegisterResponse = await UserBusiness.register(
    req.body.username,
    req.body.password
    );
    res.status(registerResponse.status).json(registerResponse.body);
});
  
// ---------- authentication necessary ------------

function middleware(req: Request, res: Response, next: NextFunction) {
  const token: string | undefined = req.get("Authorization");
  if (token !== undefined) {
    try {
      const userId: number | null = SecurityHelper.verifyToken(token);
      authUserId = userId;
      console.log(authUserId);
      next();
    } catch (err) {
      res.status(401).json({error: "Token invalide"});
    }
  }
}

app.use(middleware);

app.get("/", (req, res) => {
  res.send("Cette route n'est pas censée s'afficher sans authentification");
});

app.post("/card", (req, res) => {
  const cardAddResponse: CardAddResponse = await CardBusiness.addCard(
    req.body.label, req.body.value, 
  )
})

app.listen(3000, () => console.log("Serveur démarré"));
