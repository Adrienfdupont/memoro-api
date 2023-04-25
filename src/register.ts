import { Request, Response } from "express";
import { Connection, Pool, SqlError } from "mariadb";
import bcrypt from "bcrypt";

export default async function register(
  pool: Pool,
  req: Request,
  res: Response
): Promise<void> {
  let connection: Connection | undefined = undefined;
  let msgContent: string = "";

  try {
    connection = await pool.getConnection();
    const saltRounds = 10;
    const hash = await bcrypt.hash(req.body.password, saltRounds);
    await connection.query("INSERT INTO users(name, password) VALUES(?, ?)", [
      req.body.username,
      hash,
    ]);
    msgContent = "Vous avez bien été inscrit.";
  } catch (err) {
    res.status(500);
    if (err instanceof SqlError) {
      if (err.errno === 1062) {
        msgContent = "Ce nom est déjà utilisé.";
      }
    }
  }
  res.send({
    message: msgContent,
  });
  connection?.end();
}
