import express from "express";
import bodyParser from "body-parser";
import ConnectionHelper from "./helper/ConnectionHelper";
import UserBusiness from "./business/UserBusiness";

const app = express();
app.use(bodyParser.json());
ConnectionHelper.createPool();

app.post("/api/user", async (req, res) => {
  const status = await UserBusiness.register(
    req.body.username,
    req.body.password
  );
  res.sendStatus(status);
});

app.post("/api/login", async (req, res) => {
  const status = await UserBusiness.login(req.body.username, req.body.password);
  res.sendStatus(status);
});

app.listen(3000, () => console.log("Serveur démarré"));
