import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Order } from "@/entities/order";
import { AccountOrders } from "./AccountOrders";

const orders: Order[] = [
  {
    id: 12,
    customer_id: 1,
    executor_id: null,
    task: "Помочь с переездом",
    price: 1800,
    city: "Казань",
    status: "open",
    created_at: "2026-11-14T12:00:00Z",
  },
  {
    id: 13,
    customer_id: 1,
    executor_id: 2,
    task: "Собрать шкаф",
    price: 2500,
    city: "Казань",
    status: "assigned",
    created_at: "2026-11-14T13:00:00Z",
  },
];

describe("AccountOrders", () => {
  it("filters customer requests by their real order status", async () => {
    const user = userEvent.setup();
    render(
      <AccountOrders
        role="customer"
        orders={orders}
        availableOrders={[]}
        loading={false}
        error=""
        onAccept={vi.fn()}
        onCreateRequest={vi.fn()}
        onOpenMessages={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Ждут отклика/ }));

    expect(screen.getByRole("heading", { name: "Помочь с переездом" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Собрать шкаф" })).not.toBeInTheDocument();
    expect(screen.getByText("Заявка №12")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Этап 1 из 2: заявка опубликована" }),
    ).toBeInTheDocument();
  });
});
