import ConnectionHelper from '../helper/ConnectionHelper';
import bcrypt from 'bcrypt';
import SecurityHelper from '../helper/SecurityHelper';
import BusinessError from '../errors/BusinessError';
import { SqlError } from 'mariadb';
import moment from 'moment';

export default class UserBusiness {
  static async login(name: string, password: string): Promise<string> {
    if (name.length === 0 || password.length === 0) {
      throw new BusinessError(401, 'Please fill in the fields.');
    }

    const sql = 'SELECT * FROM users WHERE name = ?';
    const placeholders = [name];
    let queryUsers: any[];

    queryUsers = await ConnectionHelper.performQuery(sql, placeholders);

    if (queryUsers.length === 0 || !(await bcrypt.compare(password, queryUsers[0].password))) {
      throw new BusinessError(401, 'Username or password incorrect.');
    }

    return await SecurityHelper.generateToken(name, queryUsers[0].id);
  }

  static async register(name: string, password: string): Promise<void> {
    if (name.length === 0 || password.length === 0) {
      throw new BusinessError(401, 'Please fill in the fields.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users(name, password, last_password_change) VALUES(?, ?, ?)';
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

  static async updateUser(name: string, password: string, authUserId: number) {
    if (name.length === 0 || password.length === 0) {
      throw new BusinessError(401, 'Please fill in the fields.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'UPDATE users SET name = ?, password = ?, last_password_change = ? WHERE id = ?';
    const now = moment.parseZone(new Date()).format('YYYY-MM-DD HH:mm:ss');
    const placeholders = [name, hashedPassword, now, authUserId.toString()];
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

  static async removeUser(authUserId: number): Promise<void> {
    const sql = 'DELETE FROM users WHERE id = ?';
    const placeholders = [authUserId.toString()];
    let queryResult: any;

    queryResult = await ConnectionHelper.performQuery(sql, placeholders);

    if (queryResult.affectedRows === 0) {
      throw new BusinessError(500, 'The request could not be processed.');
    }
  }
}
