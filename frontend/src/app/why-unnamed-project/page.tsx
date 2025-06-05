"use client";

import React from 'react';
import { GlobeIcon, MagnifyingGlassIcon, LightningBoltIcon, PieChartIcon, LayersIcon } from '@radix-ui/react-icons';
import styles from './page.module.scss';

interface DifferentiatorProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
}

const Differentiator: React.FC<DifferentiatorProps> = ({ icon, title, subtitle, description }) => (
  <div className={styles.differentiator}>
    <div className={styles.iconWrapper}>{icon}</div>
    <h3>{title}</h3>
    <h4>{subtitle}</h4>
    <p>{description}</p>
  </div>
);

export default function WhyUnnamedProjectPage() {
  const differentiators = [
    {
      icon: <GlobeIcon className={styles.icon} />,
      title: "Unique & Diverse Source Coverage",
      subtitle: "Beyond the Echo Chamber",
      description: "Our platform ingests and analyzes content from a carefully curated selection of global and independent news channels. This includes sources often underrepresented in typical media tracking, providing you with a richer, more multifaceted understanding of events and a counterpoint to mainstream narratives."
    },
    {
      icon: <LightningBoltIcon className={styles.icon} />,
      title: "Advanced AI for Nuanced Understanding",
      subtitle: "More Than Just Keywords and Basic Sentiment",
      description: "We employ sophisticated Natural Language Processing (NLP) to not only identify who and what is being discussed but also how. Our sentiment analysis captures intensity and expected values, complemented by Valence-Arousal-Dominance (VAD) scores to reveal the emotional undercurrent of the discourse."
    },
    {
      icon: <MagnifyingGlassIcon className={styles.icon} />,
      title: "Direct Contextual Insight",
      subtitle: "From Data Point to Source Video in a Click",
      description: "Insights are powerful, but context is critical. Unnamed Project allows you to instantly navigate from any data point – a sentiment score, an entity mention, a trend – directly to the relevant segment in the video transcript and the video itself. Verify, explore, and understand the source material with ease."
    },
    {
      icon: <PieChartIcon className={styles.icon} />,
      title: "Dynamic Trend & Narrative Tracking",
      subtitle: "See the Story Evolve",
      description: "News is not static. Our platform is built to track how coverage, sentiment, and the portrayal of entities change over time. Identify inflection points, understand the longevity of narratives, and anticipate shifts in public and media perception."
    },
    {
      icon: <LayersIcon className={styles.icon} />,
      title: "Empowering Exploration & Research",
      subtitle: "Tools for Discovery and Deep Dives",
      description: "Whether you're conducting academic research, monitoring brand reputation, analyzing market trends, or simply a curious individual, Unnamed Project provides intuitive tools and visualizations to help you ask better questions and find meaningful answers within video news content."
    }
  ];

  return (
    <main className={styles.whyPage}>
      <div className="container">
        <header className={styles.header}>
          <h1>The Unnamed Project Difference</h1>
          <h2>Go Deeper Than the Surface. Understand the Real Narrative.</h2>
          <p className={styles.intro}>
            In a world saturated with information, Unnamed Project offers a unique
            lens to understand how news is shaped and perceived. We're not just
            another news aggregator; we're an analytical engine designed to provide
            clarity and depth from the complex world of video journalism.
          </p>
        </header>

        <section className={styles.differentiators}>
          {differentiators.map((diff, index) => (
            <Differentiator
              key={index}
              icon={diff.icon}
              title={diff.title}
              subtitle={diff.subtitle}
              description={diff.description}
            />
          ))}
        </section>

        <section className={styles.conclusion}>
          <p>
            Unnamed Project is committed to providing transparent, insightful, and
            accessible tools for navigating the complex world of video news.
          </p>
          <div className={styles.cta}>
            <a href="/" className={styles.primaryButton}>
              Start Exploring Today
            </a>
            <a href="/pricing" className={styles.secondaryButton}>
              View Pricing Options
            </a>
          </div>
        </section>
      </div>
    </main>
  );
} 