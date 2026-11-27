import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUserStore } from "@/entities/user";
import { api, ApiError, tokenStorage } from "@/shared/api";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    localStorage.clear();
    useUserStore.getState().clearUser();
  });

  it("blocks a password shorter than eight characters", async () => {
    const user = userEvent.setup();
    const post = vi.spyOn(api, "post");

    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/account" element={<p>Аккаунт открыт</p>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Введите email"), "person@example.com");
    await user.type(screen.getByLabelText("Введите пароль"), "short");

    fireEvent.submit(screen.getByRole("button", { name: "Войти" }).closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Пароль должен содержать не менее 8 символов",
    );
    expect(post).not.toHaveBeenCalled();
  });

  it("sends login credentials and shows a 401 error from the API", async () => {
    const user = userEvent.setup();
    const post = vi
      .spyOn(api, "post")
      .mockRejectedValueOnce(new ApiError(401, "Неверный email или пароль"));

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Введите email"), "person@example.com");
    await user.type(screen.getByLabelText("Введите пароль"), "valid-pass-123");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Неверный email или пароль");
    expect(post).toHaveBeenCalledWith("/auth/login", {
      email: "person@example.com",
      password: "valid-pass-123",
    });
    await waitFor(() => expect(screen.getByRole("button", { name: "Войти" })).toBeEnabled());
  });

  it("stores the returned access token in memory and opens the account", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "post").mockResolvedValueOnce({ access_token: "login-access-token" });
    vi.spyOn(api, "get").mockResolvedValueOnce({
      id: 3,
      email: "person@example.com",
      role: "customer",
    });

    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/account" element={<p>Аккаунт открыт</p>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Введите email"), "person@example.com");
    await user.type(screen.getByLabelText("Введите пароль"), "valid-pass-123");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(await screen.findByText("Аккаунт открыт")).toBeInTheDocument();
    expect(tokenStorage.get()).toBe("login-access-token");
    expect(useUserStore.getState().currentUser).toEqual({
      id: 3,
      email: "person@example.com",
      role: "customer",
    });
  });

  it("returns to the pathname stored in location state after login", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "post").mockResolvedValueOnce({ access_token: "login-access-token" });
    vi.spyOn(api, "get").mockResolvedValueOnce({
      id: 3,
      email: "person@example.com",
      role: "customer",
    });

    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/", state: { from: { pathname: "/requested" } } }]}
      >
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/requested" element={<p>Запрошенная страница</p>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Введите email"), "person@example.com");
    await user.type(screen.getByLabelText("Введите пароль"), "valid-pass-123");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(await screen.findByText("Запрошенная страница")).toBeInTheDocument();
  });
});
