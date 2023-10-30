export default interface User {
  id: number;
  name: string;
  password: string | undefined;
  lastPasswordChange: string | undefined;
}
