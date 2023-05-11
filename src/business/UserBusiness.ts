import ConnectionHelper from "../helper/ConnectionHelper";
import bcrypt from "bcrypt";
import SecurityHelper from "../helper/SecurityHelper";
import BusinessError from "../errors/BusinessError";
import CardBusiness from "./CardBusiness";
import { SqlError } from "mariadb";

export default class UserBusiness {
  static async login(username: string, password: string): Promise<string> {
    if (username.length === 0 || password.length === 0) {
      throw new BusinessError(401, "Veuillez remplir les champs.");
    }

    const sql: string = "SELECT * FROM users WHERE name = ?";
    const placeholders: string[] = [username];
    let queryUsers: any[];

    try {
      queryUsers = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      throw new BusinessError(500, "Une erreur est survenue.");
    }

    if (queryUsers.length === 0 || !(await bcrypt.compare(password, queryUsers[0].password))) {
      throw new BusinessError(401, "Nom d'utilisateur ou mot de passe incorrect.");
    }

    const token: string = SecurityHelper.generateToken(username, queryUsers[0].id);
    return token;
  }

  static async register(username: string, password: string): Promise<void> {
    if (username.length === 0 || password.length === 0) {
      throw new BusinessError(401, "Veuillez remplir les champs.");
    }

    const saltRounds: number = 10;
    const hashedPassword: string = await bcrypt.hash(password, saltRounds);
    const sql: string = "INSERT INTO users(name, password) VALUES(?, ?)";
    const placeholders = [username, hashedPassword];

    try {
      await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new BusinessError(409, "Ce nom d'utilisateur est déjà utilisé.");
      } else {
        throw new BusinessError(500, "Une erreur est survenue.");
      }
    }
  }

  static async updateUser(username: string, password: string, authUserId: number) {
    if (username.length === 0 || password.length === 0) {
      throw new BusinessError(401, "Veuillez remplir les champs.");
    }

    const saltRounds: number = 10;
    const hashedPassword: string = await bcrypt.hash(password, saltRounds);
    const sql: string = "UPDATE users SET name = ?, password = ? WHERE id = ?";
    const placeholders: string[] = [username, hashedPassword, authUserId.toString()];
    let sqlResult: any;

    try {
      sqlResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new BusinessError(409, "Ce nom d'utilisateur est déjà utilisé.");
      } else {
        throw new BusinessError(500, "Une erreur est survenue.");
      }
    }

    if (sqlResult.affectedRows === 0) {
      throw new BusinessError(500, "Une erreur est survenue.");
    }
  }

  static async removeUser(authUserId: number): Promise<void> {
    const sql: string = "DELETE FROM users WHERE id = ?";
    const placeholders: string[] = [authUserId.toString()];
    let sqlResult: any;

    try {
      await CardBusiness.removeUserCards(authUserId);
      sqlResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      throw new BusinessError(500, "Une erreur est survenue.");
    }

    if (sqlResult.affectedRows === 0) {
      throw new BusinessError(404, "Utilisateur non existant.");
    }
  }
}
