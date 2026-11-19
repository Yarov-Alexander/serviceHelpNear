import { tokenStorage } from "./tokenStorage";

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
let refreshPromise: Promise<string> | null = null;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function getUrl(path: string): string {
  return `${BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(getUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        tokenStorage.clear();
        const body = await response.json().catch(() => null);
        const message =
          typeof body?.detail === "string" ? body.detail : "Не удалось обновить сессию";
        throw new ApiError(response.status, message);
      }

      const body = (await response.json()) as { access_token: string };
      if (typeof body.access_token !== "string" || body.access_token.length === 0) {
        throw new Error("Сервер вернул некорректный access token.");
      }
      tokenStorage.set(body.access_token);
      return body.access_token;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  hasRetried = false,
): Promise<T> {
  const token = tokenStorage.get();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(getUrl(path), {
    ...options,
    credentials: "include",
    headers,
  });

  const isSessionEndpoint = [
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/logout",
  ].includes(path);
  if (res.status === 401 && !hasRetried && !isSessionEndpoint) {
    await refreshAccessToken();
    return request<T>(path, options, true);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = typeof body?.detail === 'string' ? body.detail : 'Ошибка запроса';
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function refreshSession(): Promise<string> {
  return refreshAccessToken();
}

export function getWebSocketUrl(path: string): string {
  const url = new URL(getUrl(path));
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  refreshSession,
};