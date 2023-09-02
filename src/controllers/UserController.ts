import { Request, Response } from 'express';
import UserBusiness from '../business/UserBusiness';
import CoreController from './CoreController';
import User from '../types/User';
import BusinessError from '../errors/BusinessError';

export default class UserController extends CoreController {
  private userBusiness: UserBusiness;

  constructor() {
    super();
    this.userBusiness = new UserBusiness();
  }

  public async register(req: Request, res: Response): Promise<void> {
    try {
      await this.userBusiness.register(req.body.name, req.body.password);
      this.httpCode = 204;
      res.status(this.httpCode).end();
    } catch (err) {
      if (err instanceof BusinessError) {
        this.httpCode = err.status;
        this.responseBody = { message: err.message };
      }
      res.status(this.httpCode).json(this.responseBody);
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    let token: string | null;
    try {
      token = await this.userBusiness.login(req.body.name, req.body.password);
      this.httpCode = 200;
      this.responseBody = { token: token };
    } catch (err) {
      if (err instanceof BusinessError) {
        this.httpCode = err.status;
        this.responseBody = { message: err.message };
      }
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async getUser(req: Request, res: Response): Promise<void> {
    let user: User;
    try {
      user = await this.userBusiness.getUser(req.params.id, false);
      this.httpCode = 200;
      this.responseBody = user;
    } catch (err) {
      if (err instanceof BusinessError) {
        this.httpCode = err.status;
        this.responseBody = { message: err.message };
      }
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    let token: string | null;
    try {
      token = await this.userBusiness.updateUser(
        req.body.name,
        req.body.newPassword,
        req.body.password,
        req.body.id
      );
      this.httpCode = 200;
      this.responseBody = { token: token };
    } catch (err) {
      if (err instanceof BusinessError) {
        this.httpCode = err.status;
        this.responseBody = { message: err.message };
      }
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async removeUser(req: Request, res: Response): Promise<void> {
    try {
      await this.userBusiness.removeUser(req.body.password, req.params.id);
      this.httpCode = 204;
      res.status(this.httpCode).end();
    } catch (err) {
      if (err instanceof BusinessError) {
        this.httpCode = err.status;
        this.responseBody = { message: err.message };
      }
      res.status(this.httpCode).json(this.responseBody);
    }
  }
}
