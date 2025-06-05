import React from 'react';
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './page.module.scss';

// Mock data - replace with actual API calls
const mockSentimentData = [
  { name: 'Positive', value: 60 },
  { name: 'Neutral', value: 30 },
  { name: 'Negative', value: 10 },
];

const mockTrendData = Array.from({ length: 10 }, (_, i) => ({
  date: `2024-${(i + 1).toString().padStart(2, '0')}-01`,
  sentiment: Math.random() * 2 - 1, // Random sentiment between -1 and 1
  mentions: Math.floor(Math.random() * 100),
}));

const mockSnippets = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  videoTitle: `News Video ${i + 1}`,
  channel: `Channel ${i + 1}`,
  date: `2024-${(i + 1).toString().padStart(2, '0')}-01`,
  caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
  sentiment: Math.random() * 2 - 1,
}));

export default function EntityDashboard({ params }: { params: { entityName: string } }) {
  const { entityName } = params;
  const decodedEntityName = decodeURIComponent(entityName);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Analysis for: {decodedEntityName}</h1>
        <div className={styles.summaryStats}>
          <div className={styles.stat}>
            <h3>Total Mentions</h3>
            <p>1,234</p>
          </div>
          <div className={styles.stat}>
            <h3>Average Sentiment</h3>
            <p>0.65</p>
          </div>
        </div>
      </div>

      <div className={styles.charts}>
        {/* Sentiment Distribution */}
        <div className={styles.chartCard}>
          <h2>Overall Sentiment</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockSentimentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill={styles.primaryColor}
                  label
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Trend */}
        <div className={styles.chartCard}>
          <h2>Sentiment Trend</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke={styles.primaryColor}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Video Snippets */}
      <div className={styles.snippets}>
        <h2>Relevant Video Snippets</h2>
        <div className={styles.snippetList}>
          {mockSnippets.map((snippet) => (
            <div key={snippet.id} className={styles.snippetCard}>
              <div className={styles.snippetHeader}>
                <h3>{snippet.videoTitle}</h3>
                <span className={styles.channel}>{snippet.channel}</span>
                <span className={styles.date}>{snippet.date}</span>
              </div>
              <p className={styles.caption}>{snippet.caption}</p>
              <div className={styles.sentiment}>
                Sentiment: {snippet.sentiment.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 