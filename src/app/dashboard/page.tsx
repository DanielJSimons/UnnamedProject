"use client";

import React, { useState } from 'react';
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
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import styles from './page.module.scss';

const months = Array.from({ length: 12 }, (_, i) =>
  `2024-${(i + 1).toString().padStart(2, '0')}-01`
);

interface QueryPoint {
  date: string;
  value: number;
}

interface Query {
  id: number;
  term: string;
  color: string;
  data: QueryPoint[];
}

const generateQueryData = (): QueryPoint[] =>
  months.map((date) => ({ date, value: parseFloat((Math.random() * 2 - 1).toFixed(2)) }));

const queryColors = [
  '#00695C',
  '#B8860B',
  '#B71C1C',
  '#512DA8',
  '#F8BBD0',
  '#B2DFDB',
];

// Static mock data for optional panels


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
  const [queries, setQueries] = useState<Query[]>([]);
  const [nextId, setNextId] = useState(1);
  const [inputTerm, setInputTerm] = useState('');
  const [showTopEntities, setShowTopEntities] = useState(true);
  const [showComparison, setShowComparison] = useState(true);
  const [showVAD, setShowVAD] = useState(true);

  const addQuery = () => {
    if (!inputTerm.trim()) return;
    setQueries((qs) => [
      ...qs,
      {
        id: nextId,
        term: inputTerm.trim(),
        color: queryColors[(nextId - 1) % queryColors.length],
        data: generateQueryData(),
      },
    ]);
    setNextId((id) => id + 1);
    setInputTerm('');
  };

  const removeQuery = (id: number) =>
    setQueries((qs) => qs.filter((q) => q.id !== id));

  const chartData = months.map((date, idx) => {
    const obj: Record<string, number | string> = { date };
    queries.forEach((q) => {
      obj[q.term] = q.data[idx].value;
    });
    return obj;
  });

  return (
    <main className={styles.dashboardPage}>
      <header className={styles.header}>
        <SplitText text="Your News Dashboard" className={styles.title} />
        <BlurText
          text="All your tracked entities and sentiment insights in one place."
          className={styles.subtitle}
        />
      </header>

      <div className={styles.queryControls}>
        <input
          type="text"
          value={inputTerm}
          onChange={(e) => setInputTerm(e.target.value)}
          placeholder="Add term or channel"
        />
        <button type="button" onClick={addQuery}>Add</button>
      </div>
      <div className={styles.queryList}>
        {queries.map((q) => (
          <span
            key={q.id}
            className={styles.queryItem}
            style={{ backgroundColor: q.color }}
          >
            {q.term}
            <button onClick={() => removeQuery(q.id)} aria-label="Remove">
              &times;
            </button>
          </span>
        ))}
      </div>

      <section className={styles.fullRow}>
        <h2>Term Trend Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[-1, 1]} />
            <Tooltip />
            <Legend />
            {queries.map((q) => (
              <Line
                key={q.id}
                type="monotone"
                dataKey={q.term}
                stroke={q.color}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </section>

      <div className={styles.toggleControls}>
        <label>
          <input
            type="checkbox"
            checked={showTopEntities}
            onChange={(e) => setShowTopEntities(e.target.checked)}
          />
          Top Entities
        </label>
        <label>
          <input
            type="checkbox"
            checked={showComparison}
            onChange={(e) => setShowComparison(e.target.checked)}
          />
          Channel Comparison
        </label>
        <label>
          <input
            type="checkbox"
            checked={showVAD}
            onChange={(e) => setShowVAD(e.target.checked)}
          />
          Sentiment Details
        </label>
      </div>

      {showTopEntities && (
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
      )}

      {showComparison && (
        <section className={styles.fullRow}>
          <h2>Channel Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mentions" name="Mentions" />
              <YAxis dataKey="sentiment" name="Sentiment" domain={[-1, 1]} />
              <ZAxis range={[100]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={mockComparison} fill="#00695C" />
            </ScatterChart>
          </ResponsiveContainer>
        </section>
      )}

      {showVAD && (
        <section className={styles.chartsRow}>
          <div className={styles.chartCard}>
            <h2>VAD Snapshot</h2>
            <div className={styles.heatmap}>
              {mockVAD.map((v) => (
                <div
                  key={v.emotion}
                  className={styles.heatCell}
                  style={{ opacity: v.value }}
                >
                  {v.emotion}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.chartCard}>
            <h2>Contextual Snippets</h2>
            <ul className={styles.snippetList}>
              {mockSnippets.map((s) => (
                <li key={s.id}>
                  <span className={styles.time}>
                    {Math.floor(s.timestamp / 60)}:{String(s.timestamp % 60).padStart(2, '0')}
                  </span>
                  {s.text} <a href="#">({s.video})</a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
