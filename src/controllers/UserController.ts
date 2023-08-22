import { Request, Response } from 'express';
import UserBusiness from '../business/UserBusiness';
import CoreController from './CoreController';

export default class UserController extends CoreController {
  private userBusiness: UserBusiness;

  constructor() {
    super();
    this.userBusiness = new UserBusiness();
  }

  public async register(req: Request, res: Response): Promise<void> {
    try {
      await this.userBusiness.register(req.body.name, req.body.password);
      const responseBody = { success: 'You were successfully registered.' };
      res.status(200).json(responseBody);
    } catch (err) {
      this.sendErrorResponse(err, res);
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    let token: string | null;
    let responseBody: any;
    try {
      token = await this.userBusiness.login(req.body.name, req.body.password);
      responseBody = { token: token };
    } catch (err) {
      this.sendErrorResponse(err, res);
    }
    res.status(200).json(responseBody);
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      await this.userBusiness.updateUser(req.body.name, req.body.password, req.params.id);
      const responseBody = { success: 'Your information was successfully updated.' };
      res.status(200).json(responseBody);
    } catch (err) {
      this.sendErrorResponse(err, res);
    }
  }

  public async removeUser(req: Request, res: Response): Promise<void> {
    try {
      await this.userBusiness.removeUser(req.params.id);
      const responseBody = { success: 'Your account was successfully deleted.' };
      res.status(200).json(responseBody);
    } catch (err) {
      this.sendErrorResponse(err, res);
    }
  }
}
