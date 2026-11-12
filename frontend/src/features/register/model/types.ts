import type { UserRole } from "@/entities/user";

export type RegisterRequest = {
  email: string;
  password: string;
  role: Exclude<UserRole, "admin">;
};

export const REGISTER_VALIDATION = {
  email: { required: true },
  password: { required: true, minLength: 8, maxLength: 128 },
  confirmPassword: { required: true },
} as const;
