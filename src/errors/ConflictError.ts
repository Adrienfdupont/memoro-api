export default class ConflictError extends Error {
    status: number;
  
    constructor() {
      super('Conflict');
      this.status = 409;
    }
  }
  