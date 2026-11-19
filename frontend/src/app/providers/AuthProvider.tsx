import { useEffect, useState, type ReactNode } from "react";
import { getMe, useUserStore } from "@/entities/user";
import { ApiError, api, tokenStorage } from "@/shared/api";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const clearUser = useUserStore((state) => state.clearUser);
  const setUser = useUserStore((state) => state.setUser);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setError("");

    const restoreSession = async () => {
      try {
        await api.refreshSession();
        if (!active) return;
        const user = await getMe();
        if (!active) return;
        setUser(user);
        setStatus("ready");
      } catch (requestError: unknown) {
        if (!active) return;
        tokenStorage.clear();
        clearUser();
        if (requestError instanceof ApiError && requestError.status === 401) {
          setError("");
          setStatus("ready");
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Не удалось восстановить сессию.",
        );
        setStatus("error");
      }
    };

    void restoreSession();
    return () => {
      active = false;
    };
  }, [attempt, clearUser, setUser]);

  if (status === "loading") {
    return <p role="status">Восстанавливаем сессию...</p>;
  }

  if (status === "error") {
    return (
      <div role="alert">
        <p>Не удалось восстановить сессию: {error}</p>
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          Повторить
        </button>
      </div>
    );
  }

  return children;
}
