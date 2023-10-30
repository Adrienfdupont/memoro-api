import { Request, Response } from 'express';
import CoreController from './CoreController';
import User from '../types/User';
import moment from 'moment';
import bcrypt from 'bcrypt';
import ConnectionHelper from '../helpers/ConnectionHelper';
import { SqlError } from 'mariadb';
import SecurityHelper from '../helpers/SecurityHelper';

export default class UserController extends CoreController {
  constructor() {
    super();
  }

  public async register(req: Request, res: Response): Promise<void> {
    if (req.body.name.length === 0 || req.body.password.length === 0) {
      this.httpCode = 400;
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const sql = 'INSERT INTO users(name, password, last_password_change) VALUES(?, ?, ?)';
    const now = moment.parseZone(new Date()).format('YYYY-MM-DD HH:mm:ss');
    const placeholders = [req.body.name, hashedPassword, now];
    let queryResult: any;

    try {
      queryResult = await ConnectionHelper.performQuery(sql, placeholders);
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        this.httpCode = 409;
      }
    }

    if (queryResult.affectedRows === 1) {
      this.httpCode = 204;
    }
    res.status(this.httpCode).end();
  }

  public async login(req: Request, res: Response): Promise<void> {
    if (req.body.name.length === 0 || req.body.password.length === 0) {
      this.httpCode = 400;
    }

    const sql = 'SELECT * FROM users WHERE name = ?';
    const placeholders = [req.body.name];
    const queryResult: any = await ConnectionHelper.performQuery(sql, placeholders);
    let token: string;

    if (
      queryResult.length === 1 && (await bcrypt.compare(req.body.password, queryResult[0].password))
    ) {
      this.httpCode = 200;
      token = await SecurityHelper.generateToken(req.body.name, queryResult[0].id)
      res.status(this.httpCode).json({token: token})
    } else {
      this.httpCode = 401;
    }
    res.status(this.httpCode).end();
  }

  public async getUser(req: Request, res: Response): Promise<void> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const placeholders = [req.params.id];
    const queryResult: any = await ConnectionHelper.performQuery(sql, placeholders);
    
    if (queryResult.length === 1) {
      const user: User = {
        id: queryResult[0].id,
        name: queryResult[0].name,
        password: undefined,
        lastPasswordChange: undefined,
      }
      res.status(this.httpCode).json(user);
    }
    res.status(this.httpCode).end();
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const placeholders = [req.body.id];
    const queryUsers: any = await ConnectionHelper.performQuery(sql, placeholders);
    
    if (queryUsers.length !== 1) {
      res.status(404).end();
      return;
    }

    const user = {
      id: queryUsers[0].id,
      name: req.body.name ?? queryUsers[0].name,
      password: queryUsers[0].password,
      lastPasswordChange: queryUsers[0].last_password_change,
    }

    if (req.body.password && !(await bcrypt.compare(req.body.password, user.password))) {
      res.status(401).end();
      return;
    }   

    if (req.body.newPassword && !(await bcrypt.compare(req.body.newPassword, user.password))) {
      user.password = await bcrypt.hash(req.body.newPassword, 10);
      user.lastPasswordChange = moment.parseZone(new Date()).format('YYYY-MM-DD HH:mm:ss');
    }

    const updateSql = 'UPDATE users SET name = ?, password = ?, last_password_change = ? WHERE id = ?';
    const updatePlaceholders = [user.name, user.password, user.lastPasswordChange, user.id];

    try {
      const queryResult: any = await ConnectionHelper.performQuery(updateSql, updatePlaceholders);
      if (queryResult.affectedRows === 1) {
        res.status(204).end();
      } else {
        res.status(500).end();
      }
    } catch (err) {
      if (err instanceof SqlError && err.errno === 1062) {
        res.status(409).end();
      } else {
        res.status(500).end();
      }
    }
  }


  public async removeUser(req: Request, res: Response): Promise<void> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const placeholders = [req.body.id];
    const queryUsers: any = await ConnectionHelper.performQuery(sql, placeholders);

    if (queryUsers.length === 1) {
      if (req.body.password && (await bcrypt.compare(req.body.password, queryUsers[0].password))) {
        const sql = 'DELETE FROM users WHERE id = ?';
        const placeholders = [req.body.id];
        let queryResult: any;

        queryResult = await ConnectionHelper.performQuery(sql, placeholders);
        if (queryResult.affectedRows === 1) {
          this.httpCode = 204;
        }
      } else {
        this.httpCode = 401;
      }
    }
    res.status(this.httpCode).end();
  }
}
