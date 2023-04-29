export default interface LoginResponse {
  status: number;
  body: {
    token: string;
    message: string;
  };
}
