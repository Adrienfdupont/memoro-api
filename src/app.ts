import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql";
import bcrypt, { hash } from "bcrypt";

const app = express();

// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "easy-learn",
// });

app.use("/test_static", express.static("public"));
app.use(bodyParser.json());

// app.post("/api/user", (req, res) => {
//   const saltRounds = 10;
//   bcrypt.hash(req.body.password, saltRounds, (error, hash) => {
//     if (error) {
//       console.error("Error hashing password: ", error);
//       return;
//     }

//     connection.connect();

//     connection.query(
//       {
//         sql: "INSERT INTO users (username, password) VALUES (?,?)",
//         values: [req.body.username, hash],
//       },
//       (error, results) => {
//         console.error(error);
//         console.log(results);
//         connection.end();
//         res.send("utilisateur inséré");
//       }
//     );
//   });
// });

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "easy-learn",
});

app.post("/api/user", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query("SELECT * FROM users", (error, results, fields) => {
      connection.release(); // libérer la connexion

      if (error) throw error;

      // traiter les résultats de la requête
      console.log(results);
    });
  });
});

app.listen(3000, () => console.log("Serveur démarré"));
