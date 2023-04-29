import ConnectionHelper from "../helper/ConnectionHelper";
import { SqlError } from "mariadb";
import bcrypt from "bcrypt";
import SecurityHelper from "../helper/SecurityHelper";
import LoginResponse from "../types/LoginResponse";
import RegisterResponse from "../types/RegisterReponse";

export default class UserBusiness
{
  static async login(inputUsername: string, inputPassword: string): Promise<LoginResponse>
  {
    const loginResponse: LoginResponse = {
      status: 500,
      body: {
        token: "",
        message: "Une erreur est survenue",
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
        loginResponse.body.message = "Authentification réussie.";
      } else {
        // authentication failed
        loginResponse.status = 403;
        loginResponse.body.message = "Nom d'utilisateur ou mot de passe incorrect.";
      }
    } catch (err) {
      // query failed
      loginResponse.status = 500;
    }
    return loginResponse;
  }

  static async register(inputUsername: string, inputPassword: string): Promise<RegisterResponse>
  {
    const registerResponse: RegisterResponse = {
      status: 500,
      body: {
        message: "Une erreur est survenue",
        token: "",
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
      registerResponse.status = 200;
      registerResponse.body.token = SecurityHelper.generateToken(inputUsername);
      registerResponse.body.message = "Vous avez bien été inscrit(e).";
    } catch (err) {
      // query failed
      if (err instanceof SqlError) {
        if (err.errno === 1062) {
          registerResponse.status = 409;
          registerResponse.body.message = "Ce nom d'utilisateur est déjà utilisé.";
        }
      }
    }
    return registerResponse;
  }
}
