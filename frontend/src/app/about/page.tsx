import React from 'react';
import styles from './page.module.scss';

export default function About() {
  return (
    <div className={styles.about}>
      <div className="container">
        <div className={styles.content}>
          <h1>About Unnamed Project</h1>
          <p className={styles.intro}>
            Unnamed Project is a powerful platform that analyzes news video
            transcripts to provide insights about how people, companies, and topics
            are discussed in the media.
          </p>

          <section className={styles.section}>
            <h2>Our Mission</h2>
            <p>
              Our mission is to make video content more accessible and analyzable,
              helping researchers, analysts, and curious minds understand media
              narratives and trends through data-driven insights.
            </p>
          </section>

          <section className={styles.section}>
            <h2>How It Works</h2>
            <div className={styles.steps}>
              <div className={styles.step}>
                <h3>1. Video Processing</h3>
                <p>
                  We process thousands of news videos daily, converting speech to
                  text and identifying key entities.
                </p>
              </div>
              <div className={styles.step}>
                <h3>2. Entity Recognition</h3>
                <p>
                  Advanced AI identifies and tracks mentions of people,
                  organizations, and topics.
                </p>
              </div>
              <div className={styles.step}>
                <h3>3. Sentiment Analysis</h3>
                <p>
                  We analyze the context and tone of each mention to understand how
                  entities are portrayed.
                </p>
              </div>
              <div className={styles.step}>
                <h3>4. Trend Analysis</h3>
                <p>
                  Our platform aggregates data to reveal patterns and trends in
                  media coverage over time.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Use Cases</h2>
            <div className={styles.useCases}>
              <div className={styles.useCase}>
                <h3>Media Research</h3>
                <p>
                  Analyze how topics and entities are covered across different news
                  sources and over time.
                </p>
              </div>
              <div className={styles.useCase}>
                <h3>Brand Monitoring</h3>
                <p>
                  Track mentions and sentiment of your brand or competitors in news
                  media.
                </p>
              </div>
              <div className={styles.useCase}>
                <h3>Academic Research</h3>
                <p>
                  Study media narratives and their evolution with data-backed
                  insights.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Contact Us</h2>
            <p>
              Have questions about our platform or interested in a custom solution?
              We'd love to hear from you.
            </p>
            <a href="mailto:contact@example.com" className={styles.contactButton}>
              Get in Touch
            </a>
          </section>
        </div>
      </div>
    </div>
  );
} 