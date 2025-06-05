"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './page.module.scss';

// Temporary mock data - replace with real data later
const mockTopEntities = [
  { name: 'OpenAI', mentions: 342 },
  { name: 'Elon Musk', mentions: 289 },
  { name: 'Microsoft', mentions: 245 },
  { name: 'Ukraine', mentions: 198 },
  { name: 'Apple', mentions: 176 },
].map(item => ({
  ...item,
  mentions: item.mentions + Math.floor(Math.random() * 50), // Add some randomness
}));

const mockSentimentData = [
  { sentiment: 'Very Positive', count: 156, color: '#00695C' },
  { sentiment: 'Positive', count: 423, color: '#B2DFDB' },
  { sentiment: 'Neutral', count: 589, color: '#CFD8DC' },
  { sentiment: 'Negative', count: 267, color: '#F8BBD0' },
  { sentiment: 'Very Negative', count: 89, color: '#B71C1C' },
];

interface SentimentData {
  sentiment: string;
  count: number;
  color: string;
}

export default function ExplorePage() {
  return (
    <main className={styles.explorePage}>
      <div className="container">
        <header className={styles.header}>
          <h1>Explore News Narrative Trends</h1>
          <h2>Discover What's Shaping the Conversation</h2>
          <p className={styles.intro}>
            Dive into the broader landscape of video news. This dashboard reveals
            platform-wide trends, highlighting the most discussed entities, overall
            sentiment shifts, and patterns across our diverse range of curated news
            sources. See the bigger picture and identify emerging narratives before
            they hit the mainstream.
          </p>
        </header>

        <section className={styles.section}>
          <h2>Who and What is Dominating the News Cycle?</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={mockTopEntities}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="mentions" fill="#00695C" />
              </BarChart>
            </ResponsiveContainer>
            <p className={styles.chartDescription}>
              This chart shows the entities (people, organizations, locations, etc.)
              most frequently mentioned across all analyzed videos in the selected
              period. Click on an entity to explore its detailed sentiment profile.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>What's the General Tone of Coverage?</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={mockSentimentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sentiment" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Number of Mentions">
                  {mockSentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className={styles.chartDescription}>
              Understand the aggregate sentiment distribution for all identified
              entities. This provides a baseline of how positively or negatively
              subjects are generally portrayed across the platform.
            </p>
          </div>
        </section>

        <section className={styles.comingSoon}>
          <div className={styles.feature}>
            <h2>Trending Entities</h2>
            <h3>Spotlighting Rapid Risers & Fallers</h3>
            <p>
              Soon, you'll be able to see entities experiencing significant shifts
              in mention frequency or sentiment scores, helping you identify
              breakout topics and changing perceptions.
            </p>
          </div>

          <div className={styles.feature}>
            <h2>Sentiment by Source/Category</h2>
            <h3>Compare Narratives Across Channels</h3>
            <p>
              We're working on tools to let you compare how different news
              channels or categories of sources cover the same topics and entities.
            </p>
          </div>
        </section>

        <div className={styles.cta}>
          <h2>Have a specific entity in mind?</h2>
          <a href="/" className={styles.ctaButton}>
            Start Your Own Analysis
          </a>
        </div>
      </div>
    </main>
  );
} 