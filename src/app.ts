import express from "express";
import mariadb, { Connection, SqlError } from "mariadb";
import bodyParser from "body-parser";
import bcrypt, { hash } from "bcrypt";

const app = express();

const pool = mariadb.createPool({
  host: process.env.DB_HOST ?? "localhost",
  user: "root",
  password: "root",
  database: "easy-learn",
  connectionLimit: 5,
});

let connection: Connection | undefined = undefined;

app.use(bodyParser.json());


app.post("/api/user", async (req, res) => {
  try {
    connection = await pool.getConnection();
    const saltRounds = 10;
    const hash = await bcrypt.hash(req.body.password, saltRounds);
    const response = await connection.query(
      "INSERT INTO users(name, password) VALUES(?, ?)",
      [req.body.username, hash]
    );
    res.send({
      message: "Vous avez bien été inscrit."
    });
  } catch (err) {
    res.status(500);
    if (err instanceof SqlError){
      if (err.errno === 1062){
        res.send({
          "message": "Ce nom est déjà utilisé."
        })
      }
    }
  }
  res.send();
  connection?.end();
});


app.post("/api/login", async (req, res) => {
  try {
    connection = await pool.getConnection();
    const response = await connection.query(
      "SELECT * FROM users WHERE name = ?",
      [req.body.username]
    );
    res.send(response);
  } catch (err) {
    res.status(500);
    console.log(err);
    res.send({
      message: "erreur"
    });
  }
  res.send();
  connection?.end();
});

app.listen(3000, () => console.log("Serveur démarré"));
