import {
  HomeFAQ,
  HomeFinalCTA,
  HomeHero,
  HomeHowItWorks,
  HomePerformers,
  HomeReviews,
} from "@/widgets/home";


export function HomePage() {
  return (
    <main>
      <HomeHero />
      <HomeHowItWorks />
      <HomePerformers />
      <HomeReviews />
      <HomeFAQ />
      <HomeFinalCTA />
    </main>
  );
}