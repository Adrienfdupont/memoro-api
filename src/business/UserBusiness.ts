import ConnectionHelper from "../helper/ConnectionHelper";
import { SqlError } from "mariadb";
import bcrypt from "bcrypt";
import SecurityHelper from "../helper/SecurityHelper";
import LoginResponse from "../types/LoginResponse";

export default class UserBusiness
{
  static async login(inputUsername: string, inputPassword: string): Promise<LoginResponse>
  {
    const loginResponse: LoginResponse = {
      status: 500,
      body: {
        token: "",
        success: "",
        error: "",
      },
    };
    
    try {
      // perfom the query
      const sql = "SELECT * FROM users WHERE name = ?";
      const placeholder = [inputUsername];
      const result: any[] = await ConnectionHelper.performQuery(sql, placeholder);

      if (result.length > 0 && await bcrypt.compare(inputPassword, result[0].password)
      ) {
        // password matches username
        loginResponse.status = 200;
        loginResponse.body.token = SecurityHelper.generateToken(inputUsername);
        loginResponse.body.success = "Authentification réussie.";
      } else {
        // authentication failed
        loginResponse.status = 403;
        loginResponse.body.success = "Nom d'utilisateur ou mot de passe incorrect.";
      }
    } catch (err) {
      loginResponse.body.error = "Une erreur est survenue";
    }
    return loginResponse;
  }

  static async register(inputUsername: string, inputPassword: string): Promise<LoginResponse>
  {
    const loginResponse: LoginResponse = {
      status: 500,
      body: {
        token: "",
        success: "",
        error: "",
      },
    };
    // hash the input password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(inputPassword, saltRounds);

    try {
      // perform the query
      const sql = "INSERT INTO users(name, password) VALUES(?, ?)";
      const placeholders = [inputUsername, hashedPassword];
      await ConnectionHelper.performQuery(sql, placeholders);

      // query successful
      loginResponse.status = 200;
      loginResponse.body.token = SecurityHelper.generateToken(inputUsername);
      loginResponse.body.success = "Vous avez bien été inscrit(e).";
    } catch (err) {
      if (err instanceof SqlError) {
        if (err.errno === 1062) {
          loginResponse.status = 409;
          loginResponse.body.error = "Ce nom d'utilisateur est déjà utilisé.";
        } else {
          loginResponse.body.error = "Nom d'utilisateur ou mot de passe incorrect.";
        }
      }
    }
    return loginResponse;
  }
}
