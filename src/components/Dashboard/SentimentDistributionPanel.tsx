"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import styles from './Panel.module.scss';
import { generateSentimentDistributionData } from '@/lib/mockData';

interface SentimentData {
  name: 'Very Positive' | 'Positive' | 'Neutral' | 'Negative' | 'Very Negative';
  value: number;
}

interface SentimentDistributionPanelProps {
  queries: { entity: string }[];
}

const COLORS = {
  'Very Positive': '#4CAF50',
  'Positive': '#8BC34A',
  'Neutral': '#FFC107',
  'Negative': '#FF5722',
  'Very Negative': '#F44336',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.customTooltip}>
        <p className="label">{`${data.name} : ${data.value}`}</p>
      </div>
    );
  }
  return null;
};

const SingleEntitySentimentChart: React.FC<{ data: SentimentData[] }> = ({ data }) => {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const order = ['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative'];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <XAxis type="number" />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={90}
          tick={{ fill: '#e0e0e0', fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const SentimentDistributionPanel: React.FC<{ queries: { entity: string }[] }> = ({ queries = [] }) => {
  const sentimentDataByEntity = useMemo(() => {
    if (queries.length === 0) return {};
    
    const data: { [key: string]: SentimentData[] } = {};
    queries.forEach(q => {
      data[q.entity] = generateSentimentDistributionData();
    });
    return data;
  }, [queries]);

  if (queries.length === 0) {
    return <div className={styles.noData}>Select entities to see sentiment distribution.</div>;
  }

  return (
    <div className={styles.smallMultiplesGrid}>
      {Object.entries(sentimentDataByEntity).map(([entity, data]) => (
        <div key={entity} className={styles.smallMultiple}>
          <h4>{entity}</h4>
          <SingleEntitySentimentChart data={data} />
        </div>
      ))}
    </div>
  );
}; 