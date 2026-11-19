import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "./client";
import { tokenStorage } from "./tokenStorage";

describe("api client", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    tokenStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the in-memory token and includes cookies", async () => {
    tokenStorage.set("saved-token");
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await api.get<{ id: number }>("/auth/me");

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8000/auth/me");
    const headers = new Headers(options?.headers);
    expect(headers.get("Authorization")).toBe("Bearer saved-token");
    expect(options?.credentials).toBe("include");
  });

  it("throws ApiError with the HTTP status and API detail", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: "Неверный email или пароль" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const request = api.post("/auth/login", {});
    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Неверный email или пароль",
    });
  });

  it("refreshes an expired access token once and retries the request", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ detail: "Недействительный токен" }), { status: 401 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "new-access-token" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1 }), { status: 200 }),
      );
    tokenStorage.set("expired-access-token");

    await expect(api.get<{ id: number }>("/auth/me")).resolves.toEqual({ id: 1 });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe("http://localhost:8000/auth/refresh");
    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8000/auth/me");
    expect(tokenStorage.get()).toBe("new-access-token");
    expect(new Headers(fetchMock.mock.calls[2][1]?.headers).get("Authorization")).toBe(
      "Bearer new-access-token",
    );
  });

  it("accepts successful no-content API responses", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(api.post("/auth/logout")).resolves.toBeUndefined();
  });
});
