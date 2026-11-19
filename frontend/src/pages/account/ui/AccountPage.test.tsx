import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUserStore } from "@/entities/user";
import { tokenStorage } from "@/shared/api";
import { AccountPage } from "./AccountPage";

describe("AccountPage", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockImplementation((media: string) => ({
        matches: false,
        media,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (input, init) => {
      const path = new URL(String(input)).pathname;
      if (path === "/orders/mine" || path === "/chat/conversations") {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (path === "/orders" && init?.method === "POST") {
        return new Response(
          JSON.stringify({
            id: 8,
            customer_id: 1,
            executor_id: null,
            task: "Помочь с переездом",
            price: 1800,
            city: "Казань",
            status: "open",
            created_at: "2026-11-14T12:00:00Z",
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ detail: "Not found" }), { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);
    tokenStorage.clear();
    localStorage.clear();
    useUserStore.getState().clearUser();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the signed-in user in the welcome area and profile", async () => {
    const user = userEvent.setup();
    useUserStore.getState().setUser({
      id: 1,
      email: "customer@example.com",
      role: "customer",
    });

    render(
      <MemoryRouter>
        <AccountPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: "Рады видеть вас снова, Customer" }),
    ).toBeInTheDocument();

    const headerNav = screen.getByRole("navigation", { name: "Разделы личного кабинета" });
    await user.click(within(headerNav).getByRole("button", { name: "Профиль" }));

    expect(await screen.findByRole("dialog", { name: "Мой профиль" })).toBeInTheDocument();
    expect(screen.getByText("customer@example.com")).toBeInTheDocument();
  });

  it("does not report profile changes as saved when the API is unavailable", async () => {
    const user = userEvent.setup();
    useUserStore.getState().setUser({
      id: 1,
      email: "customer@example.com",
      role: "customer",
    });

    render(
      <MemoryRouter>
        <AccountPage />
      </MemoryRouter>,
    );

    const headerNav = screen.getByRole("navigation", { name: "Разделы личного кабинета" });
    await user.click(within(headerNav).getByRole("button", { name: "Профиль" }));
    await user.clear(await screen.findByLabelText("Имя и фамилия"));
    await user.type(screen.getByLabelText("Имя и фамилия"), "Новое имя");
    await user.click(screen.getByRole("button", { name: "Сохранить изменения" }));

    expect(
      await screen.findByText("Сохранение профиля и смена пароля пока не подключены к серверу."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Изменения сохранены")).not.toBeInTheDocument();
  });

  it("opens the order form in a modal and shows the created order below the welcome section", async () => {
    const user = userEvent.setup();
    useUserStore.getState().setUser({
      id: 1,
      email: "customer@example.com",
      role: "customer",
    });

    render(
      <MemoryRouter>
        <AccountPage />
      </MemoryRouter>,
    );

    await user.click(screen.getAllByRole("button", { name: "Создать заявку" })[0]);
    const dialog = await screen.findByRole("dialog", { name: "Создать заявку" });
    await user.type(within(dialog).getByLabelText("Что нужно сделать?"), "Помочь с переездом");
    await user.type(within(dialog).getByLabelText("Сколько готовы заплатить"), "1800");
    await user.type(within(dialog).getByLabelText("Город"), "Казань");
    await user.click(within(dialog).getByRole("button", { name: "Создать заявку" }));

    expect(await screen.findByRole("heading", { name: "Помочь с переездом" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Создать заявку" })).not.toBeInTheDocument();
    const createCall = fetchMock.mock.calls.find(
      ([input, init]) => new URL(String(input)).pathname === "/orders" && init?.method === "POST",
    );
    expect(createCall).toBeDefined();
    expect(JSON.parse(String(createCall?.[1]?.body))).toEqual({
      task: "Помочь с переездом",
      price: 1800,
      city: "Казань",
    });
  });
});
