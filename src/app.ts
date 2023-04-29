import express from "express";
import bodyParser from "body-parser";
import ConnectionHelper from "./helper/ConnectionHelper";
import UserBusiness from "./business/UserBusiness";
import LoginResponse from "./types/LoginResponse";
import RegisterResponse from "./types/RegisterReponse";

const app = express();
app.use(bodyParser.json());
ConnectionHelper.createPool();

app.post("/api/user", async (req, res) => {
  const registerResponse: RegisterResponse = await UserBusiness.register(
    req.body.username,
    req.body.password
  );
  res.status(registerResponse.status).json(registerResponse.body);
});

app.post("/api/login", async (req, res) => {
  const loginResponse: LoginResponse = await UserBusiness.login(
    req.body.username,
    req.body.password
  );
  res.status(loginResponse.status).json(loginResponse.body);
});

app.listen(3000, () => console.log("Serveur démarré"));
