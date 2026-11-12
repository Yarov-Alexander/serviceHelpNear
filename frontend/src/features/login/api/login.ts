

import { api } from '@/shared/api';
import type { LoginRequest, TokenResponse } from "../model/types";

export function login(data: LoginRequest) {
  return api.post<TokenResponse>("/auth/login", data);
}