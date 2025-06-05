"use client";

import React, { useMemo, useRef } from 'react';
import { WordCloud, Word } from '@isoterik/react-word-cloud';
import styles from './Panel.module.scss';
import { useSize } from '../ReactBits/useSize';

const generateMockWordCloudData = (entity: string): Word[] => {
  // This would be replaced with real data in production
  return [
    { text: 'innovation', value: 64 },
    { text: 'technology', value: 55 },
    { text: 'future', value: 42 },
    { text: 'development', value: 38 },
    { text: 'research', value: 35 },
    { text: 'progress', value: 32 },
    { text: 'growth', value: 28 },
    { text: 'investment', value: 25 },
    { text: 'market', value: 22 },
    { text: 'global', value: 20 },
  ];
};

const SizedWordCloud = ({ words }: { words: Word[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useSize(containerRef);

  return (
    <div ref={containerRef} style={{ height: 200, width: '100%' }}>
      {width > 0 && height > 0 && (
        <WordCloud
          words={words}
          width={width}
          height={height}
          font="Impact"
          fontStyle="normal"
          fontWeight="normal"
          fill={(word, index) => ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'][index % 6]}
          padding={1}
          rotate={() => (Math.random() > 0.5 ? 0 : 90)}
          spiral="archimedean"
          enableTooltip
        />
      )}
    </div>
  );
};

export const WordCloudPanel: React.FC<{ queries: { entity: string }[] }> = ({ queries = [] }) => {
  const wordCloudDataByEntity = useMemo(() => {
    if (queries.length === 0) return {};
    
    const data: { [key: string]: Word[] } = {};
    queries.forEach(q => {
      data[q.entity] = generateMockWordCloudData(q.entity);
    });
    return data;
  }, [queries]);

  if (queries.length === 0) {
    return <div className={styles.noData}>Select entities to see word cloud analysis.</div>;
  }

  return (
    <div className={styles.smallMultiplesGrid}>
      {Object.entries(wordCloudDataByEntity).map(([entity, words]) => (
        <div key={entity} className={styles.smallMultiple}>
          <h4>{entity}</h4>
          <SizedWordCloud words={words} />
        </div>
      ))}
    </div>
  );
}; 