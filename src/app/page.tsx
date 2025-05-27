"use client";

import React from 'react';
import { HeroSection } from '@/components/LandingPage/HeroSection';
import { ChallengeSection } from '@/components/LandingPage/ChallengeSection';
import { SolutionSection } from '@/components/LandingPage/SolutionSection';

export default function Home() {
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
