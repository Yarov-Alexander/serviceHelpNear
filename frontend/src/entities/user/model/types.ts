export type UserRole = "customer" | "executor" | "admin";

export interface User {
  id: number;
  email: string;
  role: UserRole;
}
