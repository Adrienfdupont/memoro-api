import { Response } from 'express';
import BusinessError from '../errors/BusinessError';

export default class CoreController {
  protected static httpCode = 500;
  protected static responseBody: Object = { error: 'Internal server error.' };

  static async sendErrorResponse(err: any, res: Response): Promise<void> {
    if (err instanceof BusinessError) {
      CoreController.httpCode = err.status;
      CoreController.responseBody = { error: err.message };
    }
    res.status(CoreController.httpCode).json(CoreController.responseBody);
  }
}
