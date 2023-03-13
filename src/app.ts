import express from "express";

const app = express();

app.get("/api", (req, res) => res.send("Hello"));

app.listen(3000, () => console.log("Serveur démarré"));
