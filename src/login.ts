import { Request, response } from "express";
import { Response } from "express-serve-static-core";
import bcrypt from "bcrypt";
import ConnectionHelper from "./helper/ConnectionHelper";

export default async function login(
  req: Request,
  res: Response
): Promise<void> {
  let msgContent: string = "";

  try {
    const sql = "SELECT * FROM users WHERE name = ?";
    const placeholder = [req.body.username];

    const result: any[] = await ConnectionHelper.performQuery(sql, placeholder);

    if (
      result.length > 0 &&
      (await bcrypt.compare(req.body.password, result[0].password))
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
}
