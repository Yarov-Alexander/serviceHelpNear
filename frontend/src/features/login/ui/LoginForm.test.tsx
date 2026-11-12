import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "@/shared/api";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("blocks a password shorter than eight characters", async () => {
    const user = userEvent.setup();
    const post = vi.spyOn(api, "post");

    render(
      <MemoryRouter>
        <LoginForm />
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
});
