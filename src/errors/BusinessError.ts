export default class StatusMsgError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'StatusMsgError';
    this.status = status;
  }
}
