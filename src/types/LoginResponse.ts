export default interface LoginResponse {
  status: number;
  body: {
    token: string;
    success: string;
    error: string;
  };
}
