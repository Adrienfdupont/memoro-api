export default class SecurityError extends Error {
  status: number;

  constructor() {
    super('Security error');
    this.status = 401;
  }
}
