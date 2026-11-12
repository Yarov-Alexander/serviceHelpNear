import { api } from "@/shared/api";
import type { User } from "@/entities/user";
import type { RegisterRequest } from "../model/types";

export function register(data: RegisterRequest) {
  return api.post<User>("/auth/register", data);
}