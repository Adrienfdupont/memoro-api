import BusinessError from '../errors/BusinessError';

export default class CoreController {
  protected httpCode = 500;
  protected responseBody: Object = { error: 'Internal server error.' };

  protected async setErrorReponse(err: any): Promise<void> {
    if (err instanceof BusinessError) {
      this.httpCode = err.status;
      this.responseBody = { error: err.message };
    }
  }
}
