import { useNavigate } from 'react-router';
import { useUserStore, type User } from '@/entities/user';
import { api, tokenStorage } from '@/shared/api';
import { ROUTES } from '@/shared/config';

export type AccountUser = Omit<User, 'id'> & { id: string };

export function useAccountUser(): {
  user: AccountUser | null;
  loading: boolean;
  logout: () => Promise<void>;
} {
  const currentUser = useUserStore((state) => state.currentUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const navigate = useNavigate();

  const logout = async () => {
    await api.post<void>("/auth/logout");
    tokenStorage.clear();
    clearUser();
    navigate(ROUTES.home, { replace: true });
  };

  return {
    user: currentUser ? { ...currentUser, id: String(currentUser.id) } : null,
    loading: false,
    logout,
  };
}
