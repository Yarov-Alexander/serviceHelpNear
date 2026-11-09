import { Logo } from "../../../../shared/ui/Logo";
import "./HomeFooter.scss";

export function HomeFooter() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__brand">
          <Logo variant="inverted" />
          <p className="footer__tagline">
            Помогаем найти человека для бытовых задач рядом с вами.
          </p>
        </div>
        <div className="footer__links">
          <p className="footer__label">Связаться</p>
          <a className="footer__link" href="mailto:hello@pomosh-ryadom.ru">
            hello@pomosh-ryadom.ru
          </a>
          <a className="footer__link" href="https://t.me/pomosh_ryadom">
            @pomosh_ryadom
          </a>
        </div>
        <div className="footer__links">
          <p className="footer__label">Разделы сайта</p>
          <a className="footer__link" href="#how">
            Как это работает
          </a>
          <a className="footer__link" href="#performers">
            Исполнителям
          </a>
          <a className="footer__link" href="#faq">
            Частые вопросы
          </a>
        </div>
        <p className="footer__copyright">
          © {new Date().getFullYear()} «Помощь рядом»
        </p>
      </div>
    </footer>
  );
}