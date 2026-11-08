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
      <div className="header__inner">
        <Logo />
        <nav className="header__desktop-nav" aria-label="Основная навигация">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header__actions">
          <Button variant="secondary" className="header__login">
            Войти
          </Button>
          <Button onClick={handleCreateOrder} className="header__cta">
            Создать заказ
          </Button>
          <button
            type="button"
            className={classNames("header__burger", isOpen && "header__burger--open")}
            aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={toggle}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={classNames("header__mobile-menu", isOpen && "header__mobile-menu--open")}
      >
        <nav aria-label="Мобильная навигация">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={close}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <Button onClick={handleCreateOrder}>Создать заказ</Button>
      </div>
    </header>
  );
}
