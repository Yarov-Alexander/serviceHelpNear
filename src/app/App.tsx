import { useState } from "react";
import classNames from "classnames";
import { CreateOrderForm } from "../features/create-order-form";
import { ReviewSlider } from "../features/review-slider";
import { Button } from "../shared/ui/Button";
import { Logo } from "../shared/ui/Logo";
import { Section } from "../shared/ui/Section";
import { useOrderFormNavigation } from "../shared/lib";
import { faqItems, HomeHeader, performerBenefits, steps } from "../widgets/home";
import "../App.scss";

function App() {
  const [submitted, setSubmitted] = useState(false);
  const scrollToOrder = useOrderFormNavigation();

  return (
    <div id="top">
      <HomeHeader onCreateOrder={scrollToOrder} />

      <main>
        <Section className="home__hero" containerClassName="home__hero-grid">
          <div>
            <div className="home__eyebrow">
              <span /> Бытовая помощь рядом
            </div>
            <h1>
              Заплати за{" "}
              <span className="home__underlined">
                дело
                <svg viewBox="0 0 240 18" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 10C52 1 148 18 237 6" />
                </svg>
              </span>{" "}
              — гуляй смело
            </h1>
            <p className="home__lead">
              Опишите, что нужно сделать: донести пакеты, повесить полку, разобрать бардак.
              Назначьте цену, и рядом найдётся тот, кто возьмётся.
            </p>

            <div id="order-form">
              <CreateOrderForm onSubmit={() => setSubmitted(true)} />
            </div>
            <div className="home__trust-notes">
              <span>✓ Цену называете вы</span>
              <span>⌂ Точный адрес видит только тот, кто взялся</span>
            </div>
          </div>

          <div className="home__hero-visual">
            <picture>
              <source srcSet="/images/hero.webp" type="image/webp" />
              <img
                src="/images/hero.webp"
                alt="Соседи помогают с бытовыми делами"
                fetchPriority="high"
              />
            </picture>
            <div
              className={classNames("home__order-sticker", "home__order-sticker--one")}
              aria-hidden="true"
            >
              <span>сегодня</span>
              <strong>Донести 3 пакета</strong>
              <small>900 ₽ · рядом</small>
            </div>
            <div
              className={classNames("home__order-sticker", "home__order-sticker--two")}
              aria-hidden="true"
            >
              <span>можно вечером</span>
              <strong>Повесить полку</strong>
              <small>1 500 ₽ · 1,2 км</small>
            </div>
          </div>
        </Section>

        <Section id="how" className="home__section">
          <div className="home__section-heading">
            <span className="home__kicker">Три шага. Ни одного созвона с диспетчером</span>
            <h2>Как это работает</h2>
          </div>
          <div className="home__steps">
            {steps.map((step) => (
              <article className="home__step-card" key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section
          id="performers"
          className="home__performers"
          containerClassName="home__performer-grid"
        >
          <div className="home__performer-intro">
            <span className="home__sticker-label">Для тех, кто умеет и готов</span>
            <h2>
              Дела рядом.
              <br />
              Цена известна.
              <br />
              Выбор за вами.
            </h2>
          </div>
          <div className="home__benefits">
            {performerBenefits.map((benefit, index) => (
              <div className="home__benefit" key={benefit}>
                <span>{index + 1}</span>
                <p>{benefit}</p>
              </div>
            ))}
            <Button variant="dark">Стать исполнителем</Button>
          </div>
        </Section>

        <Section id="reviews" className="home__section">
          <div className="home__section-heading">
            <span className="home__kicker">Уже стало полегче</span>
            <h2>Истории с хорошим концом</h2>
          </div>
          <ReviewSlider />
        </Section>

        <Section id="faq" className="home__faq-section" containerClassName="home__faq-grid">
          <div className="home__faq-title">
            <span className="home__kicker">Без мелкого шрифта</span>
            <h2>
              Вопросы,
              <br />
              которые могли остаться
            </h2>
          </div>
          <div className="home__faq-list">
            {faqItems.map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </Section>

        <Section className="home__final-cta" containerClassName="home__final-cta-inner">
          <h2>Пусть дело сделает тот, кто рядом.</h2>
          <Button onClick={scrollToOrder}>Создать заказ</Button>
        </Section>
      </main>

      <Section as="footer" className="home__footer" containerClassName="home__footer-inner">
        <div>
          <Logo variant="inverted" />
          <p>Заплати за дело — гуляй смело.</p>
        </div>
        <div className="home__footer-links">
          <a href="mailto:hello@pomosh-ryadom.ru">hello@pomosh-ryadom.ru</a>
          <a href="https://t.me/pomosh_ryadom">@pomosh_ryadom</a>
        </div>
        <div className="home__footer-links">
          <a href="#privacy">Политика конфиденциальности</a>
          <a href="#rules">Правила</a>
        </div>
        <p className="home__copyright">© 2025 «Помощь рядом»</p>
      </Section>

      {submitted && (
        <div className="home__toast" role="status">
          <strong>Задача готова к публикации</strong>
          <span>Бэкенд подключим позже, а форма уже не пропускает ерунду.</span>
          <button
            type="button"
            aria-label="Закрыть уведомление"
            onClick={() => setSubmitted(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
