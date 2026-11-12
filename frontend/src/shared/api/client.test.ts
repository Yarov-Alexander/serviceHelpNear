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

  it("sends the stored token as a bearer authorization header", async () => {
    tokenStorage.set("saved-token");
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await api.get<{ id: number }>("/auth/me");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/auth/me",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer saved-token",
          "Content-Type": "application/json",
        }),
      }),
    );
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
});
