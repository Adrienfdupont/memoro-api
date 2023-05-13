export default class BusinessError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "BusinessError";
    this.status = status;
  }
}
