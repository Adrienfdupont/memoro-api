export default class SecurityError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'SecurityError';
    this.status = status;
  }
}
