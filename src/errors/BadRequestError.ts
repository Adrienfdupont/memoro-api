export default class BadRequestError extends Error {
  status: number;

  constructor() {
    super('Bad request');
    this.status = 400;
  }
}
