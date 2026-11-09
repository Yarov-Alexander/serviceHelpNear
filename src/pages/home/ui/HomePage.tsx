import {
  HomeFAQ,
  HomeFinalCTA,
  HomeHero,
  HomeHowItWorks,
  HomePerformers,
  HomeReviews,
} from "../../../widgets/home";

type HomePageProps = {
  onCreateOrder: () => void;
};

export function HomePage({ onCreateOrder }: HomePageProps) {
  return (
    <main>
      <HomeHero />
      <HomeHowItWorks />
      <HomePerformers />
      <HomeReviews />
      <HomeFAQ />
      <HomeFinalCTA onCreateOrder={onCreateOrder} />
    </main>
  );
}