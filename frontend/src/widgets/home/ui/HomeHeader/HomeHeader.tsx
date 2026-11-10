import classNames from "classnames";
import { useMobileMenu } from "@/shared/lib";
import { Button } from "@/shared/ui/Button";
import { Logo } from "@/shared/ui/Logo";
import { navItems } from "../../model/content.mock";
import { useOrderFormNavigation } from "@/shared/lib/useOrderFormNavigation";
import "./HomeHeader.scss";
import { Link } from 'react-router';
import { ROUTES } from "@/shared/config/routes";


export function HomeHeader() {
  const { isOpen, toggle, close } = useMobileMenu();
  const scrollToOrder = useOrderFormNavigation();

  const handleCreateOrder = () => {
    close();
    scrollToOrder();
  };

  return (
    <header className="header">
      <div className="header__inner container">
        <Logo />

        <div id="header-panel" className={classNames("header__panel", isOpen && "is-active")}>
          <nav aria-label="Основная навигация">
            <ul className="header__menu-list">
              {navItems.map(({ href, label }) => (
                <li key={href}>
                  <a className="header__menu-link" href={href} onClick={close}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Button className="header__panel-cta" onClick={handleCreateOrder}>
            Создать заказ
          </Button>
        </div>

        <div className="header__actions">
          <Link 
            to={ROUTES.login}
            className={classNames("button", `button--secondary`, "header__login")}
          >
            Войти
          </Link>
          <Button className="header__cta" onClick={handleCreateOrder}>
            Создать заказ
          </Button>
          <button
            type="button"
            className={classNames("header__burger", isOpen && "is-active")}
            aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isOpen}
            aria-controls="header-panel"
            onClick={toggle}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}