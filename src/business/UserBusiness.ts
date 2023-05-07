import ConnectionHelper from "../helper/ConnectionHelper";
import bcrypt from "bcrypt";
import SecurityHelper from "../helper/SecurityHelper";

export default class UserBusiness {
  static async login(inputUsername: string, inputPassword: string): Promise<string | null> {
    // perfom the query
    const sql = "SELECT * FROM users WHERE name = ?";
    const placeholder = [inputUsername];
    const result: any[] = await ConnectionHelper.performQuery(sql, placeholder);

    if (result.length > 0 && (await bcrypt.compare(inputPassword, result[0].password))) {
      // password matches username
      const token: string = SecurityHelper.generateToken(inputUsername, result[0].id);
      return token;
    } else {
      // authentication failed
      return null;
    }
  }

  static async register(inputUsername: string, inputPassword: string): Promise<void> {
    // hash the input password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(inputPassword, saltRounds);

    // perform the query
    const sql = "INSERT INTO users(name, password) VALUES(?, ?)";
    const placeholders = [inputUsername, hashedPassword];
    await ConnectionHelper.performQuery(sql, placeholders);
  }
}
