import express from "express";
import mariadb, { Connection, SqlError, version } from "mariadb";
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

app.use(bodyParser.json());


app.post("/api/user", async (req, res) => {
  let connection: Connection | undefined = undefined;
  let msgContent: String = "";
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
  let connection: Connection | undefined = undefined;
  let msgContent: String = "";
  try {
    connection = await pool.getConnection();
    const response = await connection.query(
      "SELECT * FROM users WHERE name = ?",
      [req.body.username]
    );
    
    if (response.length > 0){
      const verify = await bcrypt.compare(req.body.password, response[0].password);
      if (verify){
        msgContent = "Connecté";
      } else {
        msgContent = "Nom d'utilisateur ou mot de passe incorrect.";
      }
    } else {
      msgContent = "Nom d'utilisateur ou mot de passe incorrect.";
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

function generateToken(name: String){
  
}
