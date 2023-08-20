import { Request, Response } from 'express';
import UserBusiness from '../business/UserBusiness';
import CoreController from './CoreController';

export default class UserController extends CoreController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      await UserBusiness.register(req.body.name, req.body.password);
      const responseBody = { success: 'You were successfully registered.' };
      res.status(200).json(responseBody);
    } catch (err) {
      CoreController.sendErrorResponse(err, res);
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    let token: string | null;
    try {
      token = await UserBusiness.login(req.body.name, req.body.password);
      const responseBody = { token: token };
      res.status(200).json(responseBody);
    } catch (err) {
      CoreController.sendErrorResponse(err, res);
    }
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      await UserBusiness.updateUser(req.body.name, req.body.password, req.params.id);
      const responseBody = { success: 'Your information was successfully updated.' };
      res.status(200).json(responseBody);
    } catch (err) {
      CoreController.sendErrorResponse(err, res);
    }
  }

  static async removeUser(req: Request, res: Response): Promise<void> {
    try {
      await UserBusiness.removeUser(req.params.id);
      const responseBody = { success: 'Your account was successfully deleted.' };
      res.status(200).json(responseBody);
    } catch (err) {
      CoreController.sendErrorResponse(err, res);
    }
  }
}
