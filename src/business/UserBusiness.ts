import ConnectionHelper from "../helper/ConnectionHelper";
import bcrypt from "bcrypt";
import SecurityHelper from "../helper/SecurityHelper";

export default class UserBusiness {
  static async login(inputUsername: string, inputPassword: string): Promise<string> {
    if (inputUsername.length === 0 || inputPassword.length === 0) {
      throw new Error("Veuillez renseigner vos identifiants.");
    }

    // perfom the query
    const sql = "SELECT * FROM users WHERE name = ?";
    const placeholders: string[] = [inputUsername];
    const result: any[] = await ConnectionHelper.performQuery(sql, placeholders);

    if (result.length === 0 || !(await bcrypt.compare(inputPassword, result[0].password))) {
      throw new Error("Nom d'utilisateur ou mot de passe incorrect.");
    }

    const token: string = SecurityHelper.generateToken(inputUsername, result[0].id);
    return token;
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
