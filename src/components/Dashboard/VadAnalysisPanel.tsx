"use client";

import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './Panel.module.scss';
import { generateVadAnalysisData } from '@/lib/mockData';

interface VadData {
  name: string;
  value: number;
}

interface VadAnalysisPanelProps {
  queries: { entity: string }[];
}

const SingleEntityVadChart: React.FC<{ data: any[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
      <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
      <PolarAngleAxis dataKey="name" stroke="rgba(255, 255, 255, 0.7)" fontSize={12} />
      <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
      <Radar name="Score" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
      <Tooltip
        contentStyle={{
          backgroundColor: 'rgba(20, 20, 30, 0.8)',
          borderColor: 'rgba(100, 100, 120, 0.5)',
        }}
      />
    </RadarChart>
  </ResponsiveContainer>
);

export const VadAnalysisPanel: React.FC<{ queries: { entity: string }[] }> = ({ queries }) => {
  const vadDataByEntity = useMemo(() => {
    if (queries.length === 0) return {};
    
    const data: { [key: string]: VadData[] } = {};
    queries.forEach(q => {
      data[q.entity] = generateVadAnalysisData();
    });
    return data;
  }, [queries]);

  if (queries.length === 0) {
    return <div className={styles.noData}>Select entities to see VAD analysis.</div>;
  }

  return (
    <div className={styles.smallMultiplesGrid}>
      {Object.entries(vadDataByEntity).map(([entity, data]) => (
        <div key={entity} className={styles.smallMultiple}>
          <h4>{entity}</h4>
          <SingleEntityVadChart data={data as any[]} />
        </div>
      ))}
    </div>
  );
}; 