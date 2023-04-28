import ConnectionHelper from "../helper/ConnectionHelper";
import { SqlError } from "mariadb";
import bcrypt from "bcrypt";

export default class UserBusiness {
  static async login(
    inputUsername: string,
    inputPassword: string
  ): Promise<number> {
    let status: number;

    try {
      const sql = "SELECT * FROM users WHERE name = ?";
      const placeholder = [inputUsername];
      const result: any[] = await ConnectionHelper.performQuery(
        sql,
        placeholder
      );

      if (
        result.length > 0 &&
        (await bcrypt.compare(inputPassword, result[0].password))
      ) {
        status = 200;
      } else {
        status = 403;
      }
    } catch (err) {
      status = 500;
    }
    return status;
  }

  static async register(
    inputUsername: string,
    inputPassword: string
  ): Promise<number> {
    let status: number;
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(inputPassword, saltRounds);

      const sql = "INSERT INTO users(name, password) VALUES(?, ?)";
      const placeholders = [inputUsername, hashedPassword];
      await ConnectionHelper.performQuery(sql, placeholders);
      status = 200;
    } catch (err) {
      status = 500;
      if (err instanceof SqlError) {
        if (err.errno === 1062) {
          status = 409;
        }
      }
    }
    return status;
  }
}
