import { Button } from "../../../../shared/ui/Button";
import { performerBenefits } from "../../model/content.mock";
import "./HomePerformers.scss";

export function HomePerformers() {
  return (
    <section id="performers" className="performers">
      <div className="performers__inner container">
        <div className="performers__intro">
          <span className="performers__label">Для тех, кто умеет и готов</span>
          <h2 className="performers__title">
            Дела рядом.
            <br />
            Цена известна.
            <br />
            Выбор за вами.
          </h2>
        </div>
        <div className="performers__benefits">
          {performerBenefits.map((benefit, index) => (
            <div className="performers__benefit" key={benefit}>
              <span className="performers__benefit-number">{index + 1}</span>
              <p className="performers__benefit-text">{benefit}</p>
            </div>
          ))}
          <Button className="performers__cta" variant="dark">
            Стать исполнителем
          </Button>
        </div>
      </div>
    </section>
  );
}