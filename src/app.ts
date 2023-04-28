import express from "express";
import bodyParser from "body-parser";
import login from "./login";
import register from "./register";
import ConnectionHelper from "./helper/ConnectionHelper";

const app = express();
app.use(bodyParser.json());
ConnectionHelper.createPool();

// app.post("/api/user", (req, res) => {
//   register(pool, req, res);
// });

app.post("/api/login", (req, res) => {
  login(req, res);
});

app.listen(3000, () => console.log("Serveur démarré"));
