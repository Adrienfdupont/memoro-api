import { Request, Response } from 'express';
import CoreController from './CoreController';
import User from '../types/User';
import moment from 'moment';
import bcrypt from 'bcrypt';
import ConnectionHelper from '../helpers/ConnectionHelper';
import { SqlError } from 'mariadb';
import SecurityHelper from '../helpers/SecurityHelper';
import BadRequestError from '../errors/BadRequestError';
import ConflictError from '../errors/ConflictError';
import UnauthorizedError from '../errors/UnauthorizedError';
import NotFoundError from '../errors/NotFoundError';
export default class UserController extends CoreController {
  constructor() {
    super();
  }

  public async register(req: Request, res: Response): Promise<void> {
    try {
      if (req.body.name?.length === 0 || req.body.password?.length === 0) {
        throw new BadRequestError();
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const sql = 'INSERT INTO users(name, password, last_password_change) VALUES(?, ?, ?)';
      const now = moment.parseZone(new Date()).format('YYYY-MM-DD HH:mm:ss');
      const placeholders = [req.body.name, hashedPassword, now];

      try {
        await ConnectionHelper.performQuery(sql, placeholders);
      } catch (err) {
        if (err instanceof SqlError && err.errno === 1062) {
          throw new ConflictError();
        }
      }

      this.httpCode = 204;
    } catch (err: any) {
      this.httpCode = err.status ?? 500;
    }
    res.status(this.httpCode).end();
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      if (req.body.name?.length === 0 || req.body.password?.length === 0) {
        throw new BadRequestError();
      }

      const sql = 'SELECT * FROM users WHERE name = ?';
      const placeholders = [req.body.name];
      const queryResult: any = await ConnectionHelper.performQuery(sql, placeholders);

      if (
        queryResult?.length === 0 ||
        !(await bcrypt.compare(req.body.password, queryResult[0].password))
      ) {
        throw new UnauthorizedError();
      }

      const token = await SecurityHelper.generateToken(req.body.name, queryResult[0].id);
      this.httpCode = 200;
      res.status(this.httpCode).json({ token: token });
    } catch (err: any) {
      this.httpCode = err.status ?? 500;
      res.status(this.httpCode).end();
    }
  }

  public async getUser(req: Request, res: Response): Promise<void> {
    try {
      const sql = 'SELECT * FROM users WHERE id = ?';
      const placeholders = [req.params.id];
      const queryResult: any = await ConnectionHelper.performQuery(sql, placeholders);

      if (queryResult?.length === 0) {
        throw new NotFoundError();
      }

      const user: User = {
        id: queryResult[0].id,
        name: queryResult[0].name,
        password: undefined,
        lastPasswordChange: undefined,
      };

      this.httpCode = 200;
      res.status(this.httpCode).json(user);
    } catch (err: any) {
      this.httpCode = err.status ?? 500;
      res.status(this.httpCode).end();
    }
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const sql = 'SELECT * FROM users WHERE id = ?';
      const placeholders = [req.body.id];
      const queryUsers: any = await ConnectionHelper.performQuery(sql, placeholders);
      let token: string | undefined;

      const user = {
        id: queryUsers[0].id,
        name: req.body.newName ?? queryUsers[0].name,
        password: queryUsers[0].password,
        lastPasswordChange: queryUsers[0].last_password_change,
      };

      if (
        (req.body.newPassword && !req.body.password) ||
        (req.body.password && !(await bcrypt.compare(req.body.password, user.password)))
      ) {
        throw new UnauthorizedError();
      }

      if (req.body.newPassword && !(await bcrypt.compare(req.body.newPassword, user.password))) {
        user.password = await bcrypt.hash(req.body.newPassword, 10);
        user.lastPasswordChange = moment.parseZone(new Date()).format('YYYY-MM-DD HH:mm:ss');
        token = await SecurityHelper.generateToken(user.name, user.id);
      }

      const updateSql =
        'UPDATE users SET name = ?, password = ?, last_password_change = ? WHERE id = ?';
      const updatePlaceholders = [user.name, user.password, user.lastPasswordChange, user.id];

      try {
        await ConnectionHelper.performQuery(updateSql, updatePlaceholders);
      } catch (err) {
        if (err instanceof SqlError && err.errno === 1062) {
          throw new ConflictError();
        }
      }

      if (token) {
        this.httpCode = 200;
        res.status(this.httpCode).json({ token: token });
      } else {
        this.httpCode = 204;
        res.status(this.httpCode).end();
      }
    } catch (err: any) {
      this.httpCode = err.status ?? 500;
      res.status(this.httpCode).end();
    }
  }

  public async removeUser(req: Request, res: Response): Promise<void> {
    try {
      const sql = 'SELECT * FROM users WHERE id = ?';
      const placeholders = [req.body.id];
      const queryUsers: any = await ConnectionHelper.performQuery(sql, placeholders);

      if (
        !req.body.password ||
        !(await bcrypt.compare(req.body.password, queryUsers[0].password))
      ) {
        throw new UnauthorizedError();
      }

      const updateSql = 'DELETE FROM users WHERE id = ?';
      const updatePlaceholders = [req.body.id];
      await ConnectionHelper.performQuery(updateSql, updatePlaceholders);

      this.httpCode = 204;
    } catch (err: any) {
      this.httpCode = err.status ?? 500;
    }
    res.status(this.httpCode).end();
  }
}
