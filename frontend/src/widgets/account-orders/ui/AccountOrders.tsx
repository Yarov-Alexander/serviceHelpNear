import { useState } from "react";
import type { UserRole } from "@/entities/user";
import type { Order } from "@/entities/order";
import { IconMessage, IconPlus } from "@/shared/ui/Icons";
import { AccountOrderCard } from "./AccountOrderCard";
import "./AccountOrders.scss";

interface AccountOrdersProps {
  role: UserRole;
  orders: Order[];
  availableOrders: Order[];
  loading: boolean;
  error: string;
  onAccept: (orderId: number) => Promise<void>;
  onCreateRequest: () => void;
  onOpenMessages: () => void;
}

type OrderFilter = "all" | Order["status"];

const ORDER_FILTERS: { id: OrderFilter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "assigned", label: "В работе" },
  { id: "open", label: "Ждут отклика" },
];

export function AccountOrders({
  role,
  orders,
  availableOrders,
  loading,
  error,
  onAccept,
  onCreateRequest,
  onOpenMessages,
}: AccountOrdersProps) {
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [acceptError, setAcceptError] = useState("");
  const [filter, setFilter] = useState<OrderFilter>("all");

  const accept = async (orderId: number) => {
    setAcceptingId(orderId);
    setAcceptError("");
    try {
      await onAccept(orderId);
    } catch (requestError) {
      setAcceptError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось принять заказ. Попробуйте ещё раз.",
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const visibleOrders =
    role === "customer" && filter !== "all"
      ? orders.filter((order) => order.status === filter)
      : orders;

  return (
    <section className="account-orders" id="account-orders" aria-labelledby="account-orders-title">
      <div className="account-orders__layout">
        <div className="account-orders__main">
          <header className="account-orders__head">
            <div>
              <h2 className="account-orders__title" id="account-orders-title">
                {role === "executor" ? "Заказы в работе" : "Мои заявки"}
              </h2>
              {role === "customer" && (
                <p className="account-orders__subtitle">
                  Следите за статусом заявок и находите помощь рядом
                </p>
              )}
            </div>
            {role === "customer" && (
              <button
                type="button"
                className="account-orders__create"
                aria-haspopup="dialog"
                onClick={onCreateRequest}
              >
                <IconPlus aria-hidden="true" />
                Создать заявку
              </button>
            )}
          </header>

          {role === "customer" && (
            <div
              className="account-orders__filters"
              role="group"
              aria-label="Фильтр заявок по статусу"
            >
              {ORDER_FILTERS.map(({ id, label }) => {
                const count =
                  id === "all"
                    ? orders.length
                    : orders.filter((order) => order.status === id).length;
                return (
                  <button
                    key={id}
                    type="button"
                    className="account-orders__filter"
                    aria-pressed={filter === id}
                    onClick={() => setFilter(id)}
                  >
                    {label}
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {loading && <p className="account-orders__note">Загружаем заявки…</p>}
          {error && (
            <p className="account-orders__error" role="alert">
              {error}
            </p>
          )}
          {acceptError && (
            <p className="account-orders__error" role="alert">
              {acceptError}
            </p>
          )}
          {!loading && !error && visibleOrders.length === 0 && (
            <p className="account-orders__empty">
              <strong>
                {role === "executor"
                  ? "Вы пока не взяли ни одного заказа"
                  : filter === "all"
                    ? "Пока нет созданных заявок"
                    : "Заявок с таким статусом пока нет"}
              </strong>
              {role === "customer" && (
                <span>Создайте заявку, и исполнители рядом смогут откликнуться.</span>
              )}
            </p>
          )}
          <div className="account-orders__list">
            {visibleOrders.map((order) => (
              <AccountOrderCard key={order.id} order={order} />
            ))}
          </div>

          {role === "executor" && (
            <section className="account-orders__available" aria-labelledby="available-orders-title">
              <h2 className="account-orders__title" id="available-orders-title">
                Открытые заказы
              </h2>
              {!loading && !error && availableOrders.length === 0 && (
                <p className="account-orders__note">Свободных заказов пока нет.</p>
              )}
              <div className="account-orders__list">
                {availableOrders.map((order) => (
                  <AccountOrderCard
                    key={order.id}
                    order={order}
                    accepting={acceptingId === order.id}
                    onAccept={accept}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {role === "customer" && (
          <aside className="account-orders__rail" aria-label="Быстрые действия">
            <div className="account-orders__quick">
              <h3>Быстрые действия</h3>
              <button type="button" onClick={onCreateRequest}>
                <IconPlus aria-hidden="true" />
                Создать заявку
              </button>
              <button type="button" onClick={onOpenMessages}>
                <IconMessage aria-hidden="true" />
                Открыть сообщения
              </button>
            </div>
            <p className="account-orders__tip">
              Подробно опишите задачу и укажите удобный город — так исполнителям будет проще
              откликнуться.
            </p>
          </aside>
        )}
      </div>
    </section>
  );
}
