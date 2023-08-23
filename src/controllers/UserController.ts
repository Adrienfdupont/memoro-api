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
      this.httpCode = 200;
      this.responseBody = { success: 'You were successfully registered.' };
    } catch (err) {
      this.setErrorReponse(err);
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async login(req: Request, res: Response): Promise<void> {
    let token: string | null;
    try {
      token = await this.userBusiness.login(req.body.name, req.body.password);
      this.httpCode = 200;
      this.responseBody = { token: token };
    } catch (err) {
      this.setErrorReponse(err);
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      await this.userBusiness.updateUser(req.body.name, req.body.password, req.params.id);
      this.httpCode = 200;
      this.responseBody = { success: 'Your information was successfully updated.' };
    } catch (err) {
      this.setErrorReponse(err);
    }
    res.status(this.httpCode).json(this.responseBody);
  }

  public async removeUser(req: Request, res: Response): Promise<void> {
    try {
      await this.userBusiness.removeUser(req.params.id);
      this.httpCode = 200;
      this.responseBody = { success: 'Your account was successfully deleted.' };
    } catch (err) {
      this.setErrorReponse(err);
    }
    res.status(this.httpCode).json(this.responseBody);
  }
}
