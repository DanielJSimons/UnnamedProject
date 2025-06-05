"use client";

import React from 'react';
import SplitText from '@/components/ReactBits/SplitText';
import BlurText from '@/components/ReactBits/BlurText';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import styles from './page.module.scss';

// Mock data placeholders
const mockTrend = Array.from({ length: 12 }, (_, i) => ({
  date: `2024-${(i + 1).toString().padStart(2, '0')}-01`,
  sentiment: parseFloat((Math.random() * 2 - 1).toFixed(2)),
  combinedScore: parseFloat((Math.random() * 2 - 1).toFixed(2)),
  valence: parseFloat((Math.random() * 2 - 1).toFixed(2)),
  continuousScore: parseFloat((Math.random() * 2 - 1).toFixed(2)),
  signedValue: parseFloat((Math.random() * 2 - 1).toFixed(2)),
  score: parseFloat((Math.random() * 2 - 1).toFixed(2)),
  expSent: parseFloat((Math.random() * 2 - 1).toFixed(2)),
  mentions: Math.floor(Math.random() * 100) + 20,
}));

const mockDistribution = [
  { name: 'Positive', value: 45, color: '#B2DFDB' },
  { name: 'Neutral', value: 35, color: '#CFD8DC' },
  { name: 'Negative', value: 20, color: '#F8BBD0' },
];

const mockTopEntities = [
  { name: 'OpenAI', count: 120 },
  { name: 'Elon Musk', count: 110 },
  { name: 'Apple', count: 90 },
  { name: 'Microsoft', count: 80 },
];

const mockComparison = [
  { channel: 'News A', sentiment: 0.5, mentions: 80 },
  { channel: 'News B', sentiment: -0.2, mentions: 60 },
  { channel: 'News C', sentiment: 0.1, mentions: 70 },
];

const mockVAD = [
  { emotion: 'Valence', value: 0.7 },
  { emotion: 'Arousal', value: 0.4 },
  { emotion: 'Dominance', value: 0.6 },
];

const mockSnippets = Array.from({ length: 3 }, (_, i) => ({
  id: i+1,
  timestamp: i*45,
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
  video: `Video ${i+1}`,
}));

export default function DashboardPage() {
  return (
    <main className={styles.dashboardPage}>
      <header className={styles.header}>
        <SplitText text="Your News Dashboard" className={styles.title} />
        <BlurText
          text="All your tracked entities and sentiment insights in one place."
          className={styles.subtitle}
        />
      </header>

      {/* Trend & Distribution */}
      <section className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h2>Sentiment Metrics Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[-1, 1]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sentiment" stroke="#00695C" />
              <Line type="monotone" dataKey="combinedScore" stroke="#B8860B" />
              <Line type="monotone" dataKey="valence" stroke="#B71C1C" />
              <Line type="monotone" dataKey="continuousScore" stroke="#B2DFDB" />
              <Line type="monotone" dataKey="signedValue" stroke="#CFD8DC" />
              <Line type="monotone" dataKey="score" stroke="#F8BBD0" />
              <Line type="monotone" dataKey="expSent" stroke="#512DA8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.chartCard}>
          <h2>Overall Sentiment</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={mockDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {mockDistribution.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Top Entities */}
      <section className={styles.fullRow}>
        <h2>Top Entities</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockTopEntities}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#B8860B" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Entity Comparison */}
      <section className={styles.fullRow}>
        <h2>Channel Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mentions" name="Mentions" />
            <YAxis dataKey="sentiment" name="Sentiment" domain={[-1,1]} />
            <ZAxis range={[100]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={mockComparison} fill="#00695C" />
          </ScatterChart>
        </ResponsiveContainer>
      </section>

      {/* VAD Heatmap */}
      <section className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h2>VAD Snapshot</h2>
          <div className={styles.heatmap}>
            {mockVAD.map(v => (
              <div key={v.emotion} className={styles.heatCell} style={{opacity: v.value}}>
                {v.emotion}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.chartCard}>
          <h2>Contextual Snippets</h2>
          <ul className={styles.snippetList}>
            {mockSnippets.map(s => (
              <li key={s.id}>
                <span className={styles.time}>{Math.floor(s.timestamp/60)}:{String(s.timestamp%60).padStart(2,'0')}</span>
                {s.text} <a href="#">({s.video})</a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
