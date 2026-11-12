import { useEffect, useState, type ReactNode } from "react";
import { clearUser, getMe, setUser } from "@/entities/user";
import { ApiError, tokenStorage } from "@/shared/api";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const token = tokenStorage.get();

    if (!token) {
      clearUser();
      setError("");
      setStatus("ready");
      return () => {
        active = false;
      };
    }

    setStatus("loading");
    setError("");
    getMe()
      .then((user) => {
        if (!active) return;
        setUser(user);
        setStatus("ready");
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        if (requestError instanceof ApiError && requestError.status === 401) {
          tokenStorage.clear();
          clearUser();
          setStatus("ready");
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Не удалось восстановить сессию.",
        );
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [attempt]);

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
