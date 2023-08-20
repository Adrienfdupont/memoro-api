import { Request, Response } from 'express';
import UserBusiness from '../business/UserBusiness';
import BusinessError from '../errors/BusinessError';

export default class UserController {
  static async register(req: Request, res: Response): Promise<void> {
    let httpCode = 500;
    let body: Object = { error: 'Internal server error.' };
    try {
      await UserBusiness.register(req.body.name, req.body.password);
      httpCode = 200;
      body = { success: 'You were successfully registered.' };
    } catch (err) {
      if (err instanceof BusinessError) {
        httpCode = err.status;
        body = { error: err.message };
      }
    }
    res.status(httpCode).json(body);
  }

  static async login(req: Request, res: Response): Promise<void> {
    let httpCode = 500;
    let body: Object = { error: 'Internal server error.' };
    let token: string | null;

    try {
      token = await UserBusiness.login(req.body.name, req.body.password);
      httpCode = 200;
      body = { token: token };
    } catch (err) {
      if (err instanceof BusinessError) {
        httpCode = err.status;
        body = { error: err.message };
      }
    }
    res.status(httpCode).json(body);
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    let httpCode = 500;
    let body: Object = { error: 'Internal server error.' };
    try {
      await UserBusiness.updateUser(req.body.name, req.body.password, req.params.id);
      httpCode = 200;
      body = { success: 'Your information was successfully updated.' };
    } catch (err) {
      if (err instanceof BusinessError) {
        httpCode = err.status;
        body = { error: err.message };
      }
    }
    res.status(httpCode).json(body);
  }

  static async removeUser(req: Request, res: Response): Promise<void> {
    let httpCode = 500;
    let body: Object = { error: 'Internal server error.' };
    try {
      await UserBusiness.removeUser(req.params.id);
      httpCode = 200;
      body = { success: 'Your account was successfully deleted.' };
    } catch (err) {
      if (err instanceof BusinessError) {
        httpCode = err.status;
        body = { error: err.message };
      }
    }
    res.status(httpCode).json(body);
  }
}
