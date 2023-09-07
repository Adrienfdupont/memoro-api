import ConnectionHelper from '../helpers/ConnectionHelper';
import bcrypt from 'bcrypt';
import SecurityHelper from '../helpers/SecurityHelper';
import BusinessError from '../errors/BusinessError';
import { SqlError } from 'mariadb';
import moment from 'moment';
import User from '../types/User';

export default class UserBusiness {
  public async login(name: string, password: string): Promise<string> {
    if (name.length === 0 || password.length === 0) {
      throw new BusinessError(401, 'Please fill in the fields.');
    }

    const sql = 'SELECT * FROM users WHERE name = ?';
    const placeholders = [name];
    let queryUsers: any[];

    queryUsers = await ConnectionHelper.performQuery(sql, placeholders);

    if (
      queryUsers.length === 0 ||
      !(await bcrypt.compare(password, queryUsers[0].password))
    ) {
      throw new BusinessError(401, 'Username or password incorrect.');
    }

    return await SecurityHelper.generateToken(name, queryUsers[0].id);
  }

  public async register(name: string, password: string): Promise<void> {
    if (name.length === 0 || password.length === 0) {
      throw new BusinessError(401, 'Please fill in the fields.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql =
      'INSERT INTO users(name, password, last_password_change) VALUES(?, ?, ?)';
    const now = moment.parseZone(new Date()).format('YYYY-MM-DD HH:mm:ss');
    const placeholders = [name, hashedPassword, now];
    let queryResult: any;

    try {
      queryResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new BusinessError(409, 'This username is already used.');
      }
    }

    if (queryResult.affectedRows === 0) {
      throw new BusinessError(500, 'The request could not be processed.');
    }
  }

  public async getUser(userId: string, allFields: boolean): Promise<User> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const placeholders = [userId];
    let queryResult: any;

    queryResult = await ConnectionHelper.performQuery(sql, placeholders);

    const user = {
      id: queryResult[0].id,
      name: queryResult[0].name,
      password: allFields ? queryResult[0].password : null,
      lastPasswordChange: allFields
        ? queryResult[0].last_password_change
        : null,
    };

    return user;
  }

  public async updateUser(
    name: string,
    newPassword: string,
    password: string,
    userId: string
  ): Promise<string | null> {
    const user = await this.getUser(userId, true);
    const newName = name ? name : user.name;
    let newHashedPassword = user.password;
    let newLastPasswordChange = user.lastPasswordChange;

    if (newPassword) {
      if (!password || !(await bcrypt.compare(password, user.password))) {
        throw new BusinessError(401, 'Password incorrect.');
      }
      if (newPassword !== user.password) {
        newLastPasswordChange = moment
          .parseZone(new Date())
          .format('YYYY-MM-DD HH:mm:ss');
      }
      newHashedPassword = await bcrypt.hash(newPassword, 10);
    }

    const sql =
      'UPDATE users SET name = ?, password = ?, last_password_change = ? WHERE id = ?';
    const placeholders = [
      newName,
      newHashedPassword,
      newLastPasswordChange,
      userId,
    ];
    let queryResult: any;

    try {
      queryResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        throw new BusinessError(409, 'This username is already used.');
      }
    }

    if (queryResult.affectedRows === 0) {
      throw new BusinessError(500, 'The request could not be processed.');
    }

    let token: string | null;
    if (newLastPasswordChange !== user.lastPasswordChange) {
      token = await SecurityHelper.generateToken(newName, parseInt(userId));
    } else {
      token = null;
    }

    return token;
  }

  public async removeUser(password: string, userId: string): Promise<void> {
    const user = await this.getUser(userId, true);
    if (!password || !(await bcrypt.compare(password, user.password))) {
      throw new BusinessError(401, 'Password incorrect.');
    }

    const sql = 'DELETE FROM users WHERE id = ?';
    const placeholders = [userId];
    let queryResult: any;

    queryResult = await ConnectionHelper.performQuery(sql, placeholders);

    if (queryResult.affectedRows === 0) {
      throw new BusinessError(500, 'The request could not be processed.');
    }
  }
}
