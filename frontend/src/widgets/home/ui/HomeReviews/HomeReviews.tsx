import { ReviewSlider } from "../../../../features/review-slider";
import { Section } from "../../../../shared/ui/Section";
import "./HomeReviews.scss";

export function HomeReviews() {
  return (
    <Section id="reviews" className="home__section">
      <div className="home__section-heading">
        <span className="home__kicker">Уже стало полегче</span>
        <h2>Истории с хорошим концом</h2>
      </div>
      <ReviewSlider />
    </Section>
  );
}