"use client";

import React from 'react';
import { GlobeIcon, CircleIcon, BarChartIcon } from '@radix-ui/react-icons';
import styles from './SolutionSection.module.scss';

interface FeatureBlockProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const FeatureBlock: React.FC<FeatureBlockProps> = ({ icon, title, text }) => (
  <div className={styles.featureBlock}>
    <div className={styles.iconWrapper}>
      {icon}
    </div>
    <h3 className={styles.featureTitle}>{title}</h3>
    <p className={styles.featureText}>{text}</p>
  </div>
);

export const SolutionSection: React.FC = () => {
  const features = [
    {
      icon: <GlobeIcon className={styles.icon} />,
      title: "Beyond the Usual Feeds",
      text: "We tap into a unique collection of news channels, including those often overlooked by standard aggregators. Get a broader, more diverse perspective on global events and narratives."
    },
    {
      icon: <CircleIcon className={styles.icon} />,
      title: "From Pixels to Perspective",
      text: "Our advanced AI transcribes, identifies key entities (people, organizations, locations), and performs nuanced sentiment analysis on every relevant segment. We don't just count words; we understand meaning."
    },
    {
      icon: <BarChartIcon className={styles.icon} />,
      title: "Clarity at a Glance",
      text: "Explore interactive dashboards. Track sentiment over time, compare entity portrayals, and dive into the exact video moments that matter. Turn raw footage into strategic knowledge."
    }
  ];

  return (
    <section className={styles.solution}>
      <div className="container">
        <div className={styles.content}>
          <h2 className={styles.title}>
            Our Solution: Intelligent Video News Analysis
          </h2>
          
          <div className={styles.features}>
            {features.map((feature, index) => (
              <FeatureBlock
                key={index}
                icon={feature.icon}
                title={feature.title}
                text={feature.text}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}; 