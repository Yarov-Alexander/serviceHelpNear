import type { Order } from "@/entities/order";
import { IconCalendar } from "@/shared/ui/Icons";
import "./AccountOrderCard.scss";

const ORDER_STATUS: Record<Order["status"], string> = {
  open: "Ждёт отклика",
  assigned: "В работе",
};

interface AccountOrderCardProps {
  order: Order;
  onAccept?: (orderId: number) => void;
  accepting?: boolean;
}

export function AccountOrderCard({ order, onAccept, accepting = false }: AccountOrderCardProps) {
  const isAssigned = order.status === "assigned";
  const stage = isAssigned ? 2 : 1;
  const progressLabel = isAssigned ? "исполнитель назначен" : "заявка опубликована";

  return (
    <article className="account-order">
      <div className="account-order__top">
        <span className={`account-order__chip account-order__chip--${order.status}`}>
          {onAccept && order.status === "open" ? "Открытый заказ" : ORDER_STATUS[order.status]}
        </span>
        <span className="account-order__id">Заявка №{order.id}</span>
      </div>
      <h3 className="account-order__title">{order.task}</h3>
      <ul className="account-order__meta">
        <li>
          <span className="account-order__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          {order.city}
        </li>
        <li>
          <span className="account-order__icon" aria-hidden="true">
            ₽
          </span>
          {order.price.toLocaleString("ru-RU")} ₽
        </li>
        <li>
          <span className="account-order__icon" aria-hidden="true">
            <IconCalendar />
          </span>
          <time dateTime={order.created_at}>
            Создана {new Date(order.created_at).toLocaleDateString("ru-RU")}
          </time>
        </li>
      </ul>

      <div
        className="account-order__progress"
        role="img"
        aria-label={`Этап ${stage} из 2: ${progressLabel}`}
      >
        <i className={isAssigned ? "is-done" : "is-active"} />
        <i className={isAssigned ? "is-active" : undefined} />
      </div>
      <p className="account-order__progress-text">
        Этап {stage} из 2 ·{" "}
        {isAssigned ? "исполнитель назначен" : "заявка опубликована, ждём отклики"}
      </p>

      <div className="account-order__foot">
        <span className="account-order__person">
          <span className="account-order__person-mark" aria-hidden="true">
            {isAssigned ? "✓" : "…"}
          </span>
          {isAssigned ? "Исполнитель назначен" : "Ожидаем отклик исполнителя"}
        </span>
        {onAccept && order.status === "open" && (
          <button
            type="button"
            className="account-order__accept"
            onClick={() => onAccept(order.id)}
            disabled={accepting}
          >
            {accepting ? "Принимаем…" : "Взять заказ"}
          </button>
        )}
      </div>
    </article>
  );
}
