import { Request } from "express";
import { Response } from "express-serve-static-core";
import { Connection, Pool } from "mariadb";
import bcrypt from "bcrypt";

export default async function login(
  pool: Pool,
  req: Request,
  res: Response
): Promise<void> {
  let connection: Connection | undefined = undefined;
  let msgContent: string = "";

  try {
    connection = await pool.getConnection();
    const response = await connection.query(
      "SELECT * FROM users WHERE name = ?",
      [req.body.username]
    );

    if (
      response.length > 0 &&
      (await bcrypt.compare(req.body.password, response[0].password))
    ) {
      msgContent = "Connecté";
    } else {
      msgContent = "Nom d'utilisateur ou mot de passe incorrect.";
    }
  } catch (err) {
    res.status(500);
  }
  res.send({
    message: msgContent,
  });
  connection?.end();
}
