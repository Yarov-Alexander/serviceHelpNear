import { accountNavItems, type AccountNavItem } from "../../../shared/config/accountNav";
import { openModal } from "../../../shared/lib/modalStore";
import { BrandMark } from "../../../shared/ui/BrandMark";
import "./FooterAccount.scss";

interface FooterAccountProps {
  unreadMessages?: number;
  homeHref?: string;
  /** Если не передан, ссылка на поддержку не показывается */
  supportEmail?: string;
  onLogout: () => void;
}

export function FooterAccount({
  unreadMessages = 0,
  homeHref = "/",
  supportEmail,
  onLogout,
}: FooterAccountProps) {
  const renderItem = (item: AccountNavItem) => {
    const badge =
      item.id === "messages" && unreadMessages > 0 ? (
        <span className="footer-account__badge" aria-label={`непрочитанных: ${unreadMessages}`}>
          {unreadMessages}
        </span>
      ) : null;

    if (item.action.kind === "modal") {
      const { modal } = item.action;
      return (
        <li key={item.id}>
          <button
            type="button"
            className="footer-account__link"
            aria-haspopup="dialog"
            onClick={() => openModal(modal)}
          >
            {item.label}
            {badge}
          </button>
        </li>
      );
    }

    return (
      <li key={item.id}>
        <a className="footer-account__link" href={item.action.href}>
          {item.label}
        </a>
      </li>
    );
  };

  return (
    <footer className="footer-account">
      <div className="footer-account__container">
        <div className="footer-account__panel">
          <div className="footer-account__top">
            <div className="footer-account__about">
              <BrandMark href={homeHref} tone="light" />
              <p className="footer-account__text">
                Соседи помогают соседям: создавайте заявки и находите помощников рядом с домом.
              </p>
            </div>

            <nav className="footer-account__col" aria-label="Разделы кабинета">
              <h2 className="footer-account__title">Кабинет</h2>
              <ul className="footer-account__list">{accountNavItems.map(renderItem)}</ul>
            </nav>

            <div className="footer-account__col">
              <h2 className="footer-account__title">Аккаунт</h2>
              <ul className="footer-account__list">
                {supportEmail && (
                  <li>
                    <a className="footer-account__link" href={`mailto:${supportEmail}`}>
                      Написать в поддержку
                    </a>
                  </li>
                )}
                <li>
                  <button type="button" className="footer-account__link" onClick={onLogout}>
                    Выйти из аккаунта
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <p className="footer-account__copy">© {new Date().getFullYear()} Помощь рядом</p>
        </div>
      </div>
    </footer>
  );
}
