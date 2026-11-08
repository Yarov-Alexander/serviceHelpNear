import { useEffect, useState } from "react";
import { reviews } from "../model/reviews.mock";
import { useReducedMotion } from "../../../shared/lib";
import "./ReviewSlider.scss";

export function ReviewSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  const goTo = (index: number) => setActive((index + reviews.length) % reviews.length);

  useEffect(() => {
    if (reducedMotion || paused) return;
    const timer = window.setInterval(() => goTo(active + 1), 6000);
    return () => window.clearInterval(timer);
  }, [active, paused, reducedMotion]);

  const review = reviews[active];

  return (
    <div
      className="review-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <article className="review-slider__card" aria-live="polite">
        <span className="review-slider__quote-mark" aria-hidden="true">
          “
        </span>
        <blockquote>{review.quote}</blockquote>
        <footer>
          <strong>{review.author}</strong>
          <span>{review.task}</span>
        </footer>
      </article>

      <div className="review-slider__controls">
        <button type="button" onClick={() => goTo(active - 1)} aria-label="Предыдущий отзыв">
          ←
        </button>
        <div className="review-slider__dots" aria-label="Выбор отзыва">
          {reviews.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={index === active ? "review-slider__dot--active" : undefined}
              onClick={() => goTo(index)}
              aria-label={`Показать отзыв ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
            />
          ))}
        </div>
        <button type="button" onClick={() => goTo(active + 1)} aria-label="Следующий отзыв">
          →
        </button>
      </div>
    </div>
  );
}
