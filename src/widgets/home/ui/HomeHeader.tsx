import classNames from "classnames";
import { useMobileMenu } from "../../../shared/lib";
import { Button } from "../../../shared/ui/Button";
import { Logo } from "../../../shared/ui/Logo";
import { navItems } from "../model/content.mock";
import "./HomeHeader.scss";

type HomeHeaderProps = {
  onCreateOrder: () => void;
};

export function HomeHeader({ onCreateOrder }: HomeHeaderProps) {
  const { isOpen, toggle, close } = useMobileMenu();

  const handleCreateOrder = () => {
    close();
    onCreateOrder();
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
          <Button variant="secondary" className="header__login">
            Войти
          </Button>
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