import { faqItems } from "../../model/content.mock";
import "./HomeFAQ.scss";
import { useId } from "react";

export function HomeFAQ() {
  const titleId = useId();
  return (
    <section id="faq" className="faq">
      <div className="faq__inner container">
        <div className="faq__heading">
          <span className="faq__kicker">Без мелкого шрифта</span>
          <h2 className="faq__title" id={titleId}>
            Вопросы,
            <br />
            которые могли остаться
          </h2>
        </div>
        <div className="faq__list">
          {faqItems.map((item) => (
            <details className="faq__item" key={item.question}>
              <summary className="faq__question">
                {item.question}
                <span className="faq__toggle" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="faq__answer">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}