import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "@/shared/api";
import { RegisterForm } from "./RegisterForm";

describe("RegisterForm", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("blocks a password shorter than eight characters", async () => {
    const user = userEvent.setup();
    const post = vi.spyOn(api, "post");

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Введите email"), "person@example.com");
    await user.type(screen.getByLabelText("Введите пароль"), "short");
    await user.type(screen.getByLabelText("Повторите пароль"), "short");

    fireEvent.submit(
      screen.getByRole("button", { name: "Зарегистрироваться" }).closest("form")!,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Пароль должен содержать от 8 до 128 символов",
    );
    expect(post).not.toHaveBeenCalled();
  });

  it("sends registration data and shows a 409 duplicate-email error", async () => {
    const user = userEvent.setup();
    const post = vi
      .spyOn(api, "post")
      .mockRejectedValueOnce(new ApiError(409, "Email уже зарегистрирован"));

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Введите email"), "person@example.com");
    await user.type(screen.getByLabelText("Введите пароль"), "valid-pass-123");
    await user.type(screen.getByLabelText("Повторите пароль"), "valid-pass-123");
    await user.click(screen.getByRole("button", { name: "Зарегистрироваться" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Email уже зарегистрирован");
    expect(post).toHaveBeenCalledWith("/auth/register", {
      email: "person@example.com",
      password: "valid-pass-123",
      role: "customer",
    });
  });

  it("rejects mismatching password confirmation without calling the API", async () => {
    const user = userEvent.setup();
    const post = vi.spyOn(api, "post");

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Введите email"), "person@example.com");
    await user.type(screen.getByLabelText("Введите пароль"), "valid-pass-123");
    await user.type(screen.getByLabelText("Повторите пароль"), "different-pass");
    await user.click(screen.getByRole("button", { name: "Зарегистрироваться" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Пароли не совпадают");
    expect(post).not.toHaveBeenCalled();
  });
});
