import { useState } from "react";
import { CreateOrderForm, OrderSubmittedToast } from "@/features/create-order-form";
import heroUrl from "./hero.webp";
import "./HomeHero.scss";

export function HomeHero() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <section className="hero">
        <div className="hero__inner container">
          <div className="hero__body">
            <div className="hero__eyebrow">
              <span className="hero__eyebrow-dot" aria-hidden="true" />
              Бытовая помощь рядом
            </div>
            <h1 className="hero__title">
              Заплати за{" "}
              <span className="hero__title-accent">
                дело
                <svg
                  className="hero__title-underline"
                  viewBox="0 0 240 18"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M3 10C52 1 148 18 237 6" />
                </svg>
              </span>{" "}
              — гуляй смело
            </h1>
            <p className="hero__description">
              Опишите, что нужно сделать: донести пакеты, повесить полку, разобрать бардак.
              Назначьте цену, и рядом найдётся тот, кто возьмётся.
            </p>
            <div className="hero__form" id="order-form">
              <CreateOrderForm onSubmit={() => setSubmitted(true)} />
            </div>
            <ul className="hero__trust-notes">
              <li className="hero__trust-note">
                <span aria-hidden="true">✓</span> Цену называете вы
              </li>
              <li className="hero__trust-note">
                <span aria-hidden="true">⌂</span> Точный адрес видит только тот, кто взялся
              </li>
            </ul>
          </div>
          <div className="hero__visual">
            <img
              className="hero__image"
              src={heroUrl}
              alt="Соседи помогают с бытовыми делами"
              width={1400}
              height={903}
              fetchPriority="high"
            />
            <div className="hero__sticker hero__sticker--one" aria-hidden="true">
              <span className="hero__sticker-label">сегодня</span>
              <strong className="hero__sticker-title">Донести 3 пакета</strong>
              <small className="hero__sticker-meta">900 ₽ · рядом</small>
            </div>
            <div className="hero__sticker hero__sticker--two" aria-hidden="true">
              <span className="hero__sticker-label">можно вечером</span>
              <strong className="hero__sticker-title">Повесить полку</strong>
              <small className="hero__sticker-meta">1 500 ₽ · 1,2 км</small>
            </div>
          </div>
        </div>
      </section>
      <OrderSubmittedToast isOpen={submitted} onClose={() => setSubmitted(false)} />
    </>
  );
}
