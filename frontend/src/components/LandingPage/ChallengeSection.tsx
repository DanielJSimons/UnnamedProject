"use client";

import React from 'react';
import styles from './ChallengeSection.module.scss';

export const ChallengeSection: React.FC = () => {
  return (
    <section className={styles.challenge}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.visualContainer}>
            <div className={styles.chaosVisual}>
              {/* Animated news snippets visualization */}
              <div className={styles.newsSnippets}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={styles.snippet} style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
            <div className={styles.insightVisual}>
              {/* Simple trend line visualization */}
              <div className={styles.trendLine}>
                <svg viewBox="0 0 100 50" className={styles.trendSvg}>
                  <path
                    d="M0,25 Q25,40 50,20 T100,25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <h2 className={styles.title}>Drowning in Data? We Find the Signal.</h2>
          
          <p className={styles.description}>
            Every day, countless hours of video news are produced. Manually tracking mentions,
            gauging sentiment, or understanding the narrative arc around specific entities
            is an impossible task. Key context gets lost, trends are missed, and true
            understanding remains elusive.
          </p>
          
          <p className={styles.transition}>
            Unnamed Project cuts through the noise.
          </p>
        </div>
      </div>
    </section>
  );
}; 