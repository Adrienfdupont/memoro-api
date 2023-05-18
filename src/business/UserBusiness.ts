import ConnectionHelper from "../helper/ConnectionHelper";
import bcrypt from "bcrypt";
import SecurityHelper from "../helper/SecurityHelper";
import BusinessError from "../errors/BusinessError";
import { SqlError } from "mariadb";
import moment from "moment";

export default class UserBusiness {
  static async login(username: string, password: string): Promise<string> {
    if (username.length === 0 || password.length === 0) {
      throw new BusinessError(401, "Please fill in the fields.");
    }

    const sql: string = "SELECT * FROM users WHERE name = ?";
    const placeholders: string[] = [username];
    let queryUsers: any[];

    try {
      queryUsers = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      throw new BusinessError(500, "Internal server error.");
    }

    if (queryUsers.length === 0 || !(await bcrypt.compare(password, queryUsers[0].password))) {
      throw new BusinessError(401, "Username or password incorrect.");
    }

    const token: string = await SecurityHelper.generateToken(username, queryUsers[0].id);
    return token;
  }

  static async register(username: string, password: string): Promise<void> {
    if (username.length === 0 || password.length === 0) {
      throw new BusinessError(401, "Please fill in the fields.");
    }

    const saltRounds: number = 10;
    const hashedPassword: string = await bcrypt.hash(password, saltRounds);
    const sql: string = "INSERT INTO users(name, password, last_password_change) VALUES(?, ?, ?)";
    const now = moment.parseZone(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const placeholders = [username, hashedPassword, now];
    let sqlResult: any;

    try {
      sqlResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new BusinessError(409, "This username is already used.");
      } else {
        throw new BusinessError(500, "Internal server error.");
      }
    }

    if (sqlResult.affectedRows === 0) {
      throw new BusinessError(500, "Internal server error.");
    }
  }

  static async updateUser(username: string, password: string, authUserId: number) {
    if (username.length === 0 || password.length === 0) {
      throw new BusinessError(401, "Please fill in the fields.");
    }

    const saltRounds: number = 10;
    const hashedPassword: string = await bcrypt.hash(password, saltRounds);
    const sql: string = "UPDATE users SET name = ?, password = ?, last_password_change = ? WHERE id = ?";
    const now = moment.parseZone(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const placeholders: string[] = [username, hashedPassword, now, authUserId.toString()];
    let sqlResult: any;

    try {
      sqlResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new BusinessError(409, "This username is already used.");
      } else {
        throw new BusinessError(500, "Internal server error.");
      }
    }

    if (sqlResult.affectedRows === 0) {
      throw new BusinessError(500, "Internal server error.");
    }
  }

  static async removeUser(authUserId: number): Promise<void> {
    const sql: string = "DELETE FROM users WHERE id = ?";
    const placeholders: string[] = [authUserId.toString()];
    let sqlResult: any;

    try {
      // await CardBusiness.removeUserCards(authUserId);
      sqlResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      throw new BusinessError(500, "Internal server error.");
    }

    if (sqlResult.affectedRows === 0) {
      throw new BusinessError(404, "Unknown user.");
    }
  }

  static async removeTokens(userId: number): Promise<void> {
    const sql: string = "DELETE FROM tokens WHERE user_id = ?";
    const placeholders: string[] = [userId.toString()];
    let sqlResult: any;

    try {
      sqlResult = ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      throw new BusinessError(500, "Internal server error.");
    }

    if (sqlResult.affectedRows === 0) {
      throw new BusinessError(404, "Aucun token pour cet utilisateur.");
    }
  }
}
