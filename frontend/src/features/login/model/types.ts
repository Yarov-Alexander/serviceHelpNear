export type LoginRequest = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: "bearer";
};

export const LOGIN_VALIDATION = {
  email: { required: true },
  password: { required: true, minLength: 8 },
} as const;
