export interface User {
  id: string;
  sub?: string;
  name: string;
  email: string;
  role: "admin" | "member";
  phone?: string;
  idToken?: string;
}
