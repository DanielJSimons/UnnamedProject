import { HeroSection } from './HeroSection';
import { ChallengeSection } from './ChallengeSection';
import { SolutionSection } from './SolutionSection';

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <ChallengeSection />
      <SolutionSection />
      {/* TODO: Add remaining sections:
        - UseCasesSection
        - WhyUsSection
        - FinalCTASection
      */}
    </main>
  );
} 