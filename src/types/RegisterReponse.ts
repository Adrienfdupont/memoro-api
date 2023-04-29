export default interface RegisterResponse {
  status: number;
  body: {
    token: string;
    message: string;
  };
}
