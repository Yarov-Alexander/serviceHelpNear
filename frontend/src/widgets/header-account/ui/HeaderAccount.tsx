import { useRef, useState } from "react";
import {
  accountNavItems,
  type AccountNavId,
  type AccountNavItem,
} from "../../../shared/config/accountNav";
import { cn } from "../../../shared/lib/cn";
import { openModal } from "../../../shared/lib/modalStore";
import { useDismiss } from "../../../shared/lib/useDismiss";
import { Avatar } from "../../../shared/ui/Avatar";
import { Logo } from "../../../shared/ui/Logo";
import { IconBell, IconChevronDown, IconClose, IconMenu } from "../../../shared/ui/Icons";
import { getShortName } from "../lib/getShortName";
import "./HeaderAccount.scss";

interface HeaderAccountProps {
  user: { name: string; avatarUrl?: string };
  /** Какой раздел подсвечен (страница «Заявки» по умолчанию) */
  activeId?: AccountNavId;
  unreadMessages?: number;
  notificationsCount?: number;
  homeHref?: string;
  historyHref?: string;
  onNotificationsClick?: () => void;
  onLogout: () => void;
}

const NAV_ID = "header-account-nav";
const MENU_ID = "header-account-user-menu";

export function HeaderAccount({
  user,
  activeId = "requests",
  unreadMessages = 0,
  notificationsCount = 0,
  homeHref = "/",
  historyHref = "#account-orders",
  onNotificationsClick,
  onLogout,
}: HeaderAccountProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useDismiss(headerRef, isNavOpen, () => setIsNavOpen(false));
  useDismiss(userRef, isMenuOpen, () => setIsMenuOpen(false));

  const toggleNav = () => {
    setIsMenuOpen(false);
    setIsNavOpen((prev) => !prev);
  };

  const toggleMenu = () => {
    setIsNavOpen(false);
    setIsMenuOpen((prev) => !prev);
  };

  const renderNavItem = (item: AccountNavItem) => {
    const badge =
      item.id === "messages" && unreadMessages > 0 ? (
        <span className="header-account__badge" aria-label={`непрочитанных: ${unreadMessages}`}>
          {unreadMessages}
        </span>
      ) : null;

    if (item.action.kind === "modal") {
      const { modal } = item.action;
      return (
        <button
          key={item.id}
          type="button"
          className="header-account__nav-item"
          aria-haspopup="dialog"
          onClick={() => {
            setIsNavOpen(false);
            openModal(modal);
          }}
        >
          {item.label}
          {badge}
        </button>
      );
    }

    const isActive = item.id === activeId;
    return (
      <a
        key={item.id}
        href={item.action.href}
        className={cn("header-account__nav-item", isActive && "is-active")}
        aria-current={isActive ? "page" : undefined}
        onClick={() => setIsNavOpen(false)}
      >
        {item.label}
      </a>
    );
  };

  return (
    <header className="header-account" ref={headerRef}>
      <div className="header-account__inner">
        <Logo href={homeHref} />

        <nav
          id={NAV_ID}
          className={cn("header-account__nav", isNavOpen && "is-open")}
          aria-label="Разделы личного кабинета"
        >
          {accountNavItems.map(renderNavItem)}
        </nav>

        <div className="header-account__actions">
          <button
            type="button"
            className="header-account__icon-btn"
            aria-label={
              notificationsCount > 0 ? `Уведомления: ${notificationsCount} новых` : "Уведомления"
            }
            onClick={onNotificationsClick}
          >
            <IconBell />
            {notificationsCount > 0 && <span className="header-account__dot" aria-hidden="true" />}
          </button>

          <div className="header-account__user" ref={userRef}>
            <button
              type="button"
              className="header-account__user-btn"
              aria-expanded={isMenuOpen}
              aria-controls={MENU_ID}
              onClick={toggleMenu}
            >
              <Avatar name={user.name} src={user.avatarUrl} size="sm" decorative />
              <span className="header-account__user-name">{getShortName(user.name)}</span>
              <IconChevronDown className="header-account__chevron" />
            </button>

            <div className="header-account__menu" id={MENU_ID} hidden={!isMenuOpen}>
              <button
                type="button"
                className="header-account__menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  openModal("profile", { tab: "info" });
                }}
              >
                Мой профиль
              </button>
              <button
                type="button"
                className="header-account__menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  openModal("profile", { tab: "security" });
                }}
              >
                Безопасность аккаунта
              </button>
              <a
                className="header-account__menu-item"
                href={historyHref}
                onClick={() => setIsMenuOpen(false)}
              >
                История заявок
              </a>
              <div className="header-account__menu-sep" role="separator" />
              <button
                type="button"
                className="header-account__menu-item header-account__menu-item--danger"
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
              >
                Выйти
              </button>
            </div>
          </div>

          <button
            type="button"
            className="header-account__burger"
            aria-expanded={isNavOpen}
            aria-controls={NAV_ID}
            aria-label={isNavOpen ? "Закрыть меню" : "Открыть меню"}
            onClick={toggleNav}
          >
            {isNavOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
    </header>
  );
}
