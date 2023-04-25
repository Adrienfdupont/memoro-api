import express from "express";
import mariadb from "mariadb";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import login from "./login";
import register from "./register";

const app = express();
app.use(bodyParser.json());
dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.post("/api/user", (req, res) => {
  register(pool, req, res);
});

app.post("/api/login", (req, res) => {
  login(pool, req, res);
});

app.listen(3000, () => console.log("Serveur démarré"));
