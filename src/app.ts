import express from "express";
import mariadb, { Connection, SqlError, version } from "mariadb";
import bodyParser from "body-parser";
import bcrypt, { hash } from "bcrypt";
import dotenv from 'dotenv';
import generateToken from './utils';

const app = express();
app.use(bodyParser.json());
dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

let connection: Connection | undefined = undefined;
let msgContent: String = "";


app.post("/api/user", async (req, res) => {
  try {
    connection = await pool.getConnection();
    const saltRounds = 10;
    const hash = await bcrypt.hash(req.body.password, saltRounds);
    const response = await connection.query(
      "INSERT INTO users(name, password) VALUES(?, ?)",
      [req.body.username, hash]
    );
    msgContent = "Vous avez bien été inscrit.";

  } catch (err) {
    res.status(500);
    if (err instanceof SqlError){
      if (err.errno === 1062){
        msgContent = "Ce nom est déjà utilisé.";
      }
    }
  }
  res.send({
    message: msgContent
  });
  connection?.end();
});


app.post("/api/login", async (req, res) => {
  try {
    connection = await pool.getConnection();
    const response = await connection.query(
      "SELECT * FROM users WHERE name = ?",
      [req.body.username]
    );

    if (response.length > 0 && await bcrypt.compare(req.body.password, response[0].password)){
      msgContent = "Connecté";
      generateToken(response[0].name);
    } else {
      msgContent = "Nom d'utilisateur ou mot de passe incorrect."
    }

  } catch (err) {
    res.status(500);
  }
  res.send({
    message: msgContent
  });
  connection?.end();
});

app.listen(3000, () => console.log("Serveur démarré"));