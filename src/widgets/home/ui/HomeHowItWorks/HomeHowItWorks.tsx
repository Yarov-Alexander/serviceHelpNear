import { steps } from "../../model/content.mock";
import "./HomeHowItWorks.scss";

export function HomeHowItWorks() {
  return (
    <section id="how" className="explain">
      <div className="explain__inner container">
        <div className="explain__heading">
          <span className="explain__kicker">Три шага. Ни одного созвона с диспетчером</span>
          <h2 className="explain__title">Как это работает</h2>
        </div>
        <div className="explain__steps">
          {steps.map((step) => (
            <article className="explain__step" key={step.number}>
              <span className="explain__step-number">{step.number}</span>
              <h3 className="explain__step-title">{step.title}</h3>
              <p className="explain__step-description">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}