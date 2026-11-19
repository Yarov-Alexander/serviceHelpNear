import type { User } from '@/entities/user';
import type { LoginRequest } from './types';

export const DEMO_CREDENTIALS = {
  email: 'demo@servicehelp.local',
  password: 'demo1234',
} as const;

export const DEMO_USER: User = {
  id: 999,
  email: DEMO_CREDENTIALS.email,
  role: 'customer',
};

export function isDemoLogin(values: LoginRequest): boolean {
  return values.email.trim().toLowerCase() === DEMO_CREDENTIALS.email
    && values.password === DEMO_CREDENTIALS.password;
}
