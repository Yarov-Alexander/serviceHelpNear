import { useNavigate } from "react-router";
import { clearUser, useUser } from "@/entities/user";
import { tokenStorage } from "@/shared/api";
import { ROUTES } from "@/shared/config";

export function AccountPage() {
  const user = useUser();
  const navigate = useNavigate();

  if (!user) return null;

  const logout = () => {
    tokenStorage.clear();
    clearUser();
    navigate(ROUTES.home, { replace: true });
  };

  return (
    <main>
      <h1>Личный кабинет</h1>
      <p>{user.email}</p>
      <p>Роль: {user.role}</p>
      <button type="button" onClick={logout}>
        Выйти
      </button>
    </main>
  );
}
