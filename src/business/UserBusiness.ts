import ConnectionHelper from "../helper/ConnectionHelper";
import bcrypt from "bcrypt";
import SecurityHelper from "../helper/SecurityHelper";
import BusinessError from "../errors/BusinessError";
import CardBusiness from "./CardBusiness";

export default class UserBusiness {
  static async login(username: string, password: string): Promise<string> {
    if (username.length === 0 || password.length === 0) {
      throw new BusinessError(401, "Veuillez remplir les champs.");
    }
    const sql: string = "SELECT * FROM users WHERE name = ?";
    const placeholders: string[] = [username];
    const result: any[] = await ConnectionHelper.performQuery(sql, placeholders);

    if (result.length === 0 || !(await bcrypt.compare(password, result[0].password))) {
      throw new BusinessError(401, "Nom d'utilisateur ou mot de passe incorrect.");
    }
    const token: string = SecurityHelper.generateToken(username, result[0].id);
    return token;
  }

  static async register(username: string, password: string): Promise<void> {
    if (username.length === 0 || password.length === 0) {
      throw new BusinessError(401, "Veuillez remplir les champs.");
    }
    // hash the input password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql: string = "INSERT INTO users(name, password) VALUES(?, ?)";
    const placeholders = [username, hashedPassword];
    await ConnectionHelper.performQuery(sql, placeholders);
  }

  static async updateUser(username: string, password: string, authUserId: number) {
    if (username.length === 0 || password.length === 0) {
      throw new BusinessError(401, "Veuillez remplir les champs.");
    }
    // hash the input password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql: string = "UPDATE users SET name = ?, password = ? WHERE id = ?";
    const placeholders: string[] = [username, hashedPassword, authUserId.toString()];
    await ConnectionHelper.performQuery(sql, placeholders);
  }

  static async removeUser(authUserId: number): Promise<void> {
    await CardBusiness.removeUserCards(authUserId);

    const sql: string = "DELETE FROM users WHERE id = ?";
    const placeholders: string[] = ["344"];
    const result: any = await ConnectionHelper.performQuery(sql, placeholders);

    if (result.affectedRows === 0) {
      throw new BusinessError(404, "Utilisateur non existant.");
    }
  }
}
