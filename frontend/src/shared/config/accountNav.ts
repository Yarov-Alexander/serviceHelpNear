import type { ModalName } from "../lib/modalStore";

export type AccountNavId = "requests" | "messages" | "schedule" | "profile";

export type AccountNavAction = { kind: "link"; href: string } | { kind: "modal"; modal: ModalName };

export interface AccountNavItem {
  id: AccountNavId;
  label: string;
  action: AccountNavAction;
}

/**
 * Единый список разделов для HeaderAccount и FooterAccount.
 * «Сообщения» и «Профиль» открываются модальными окнами,
 * «Заявки» и «Расписание» — обычные ссылки.
 * TODO: замените href на маршруты из shared/config/routes.ts.
 */
export const accountNavItems: readonly AccountNavItem[] = [
  { id: "requests", label: "Заявки", action: { kind: "link", href: "#account-orders" } },
  { id: "messages", label: "Сообщения", action: { kind: "modal", modal: "messages" } },
  { id: "schedule", label: "Расписание", action: { kind: "link", href: "#schedule" } },
  { id: "profile", label: "Профиль", action: { kind: "modal", modal: "profile" } },
];
