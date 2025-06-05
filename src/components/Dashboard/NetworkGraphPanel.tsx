"use client";

import React, { useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './Panel.module.scss';
import { useSize } from '../ReactBits/useSize';

// Dynamic import for ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false }) as any;

interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
    val: number;
  }>;
  links: Array<{
    source: string;
    target: string;
    value: number;
  }>;
}

const generateMockNetworkData = (entity: string): GraphData => {
  // This would be replaced with real data in production
  return {
    nodes: [
      { id: entity, name: entity, val: 20 },
      { id: 'topic1', name: 'AI', val: 10 },
      { id: 'topic2', name: 'Technology', val: 15 },
      { id: 'topic3', name: 'Innovation', val: 8 },
      { id: 'topic4', name: 'Research', val: 12 },
      { id: 'topic5', name: 'Development', val: 9 },
    ],
    links: [
      { source: entity, target: 'topic1', value: 5 },
      { source: entity, target: 'topic2', value: 8 },
      { source: entity, target: 'topic3', value: 3 },
      { source: entity, target: 'topic4', value: 6 },
      { source: entity, target: 'topic5', value: 4 },
      { source: 'topic1', target: 'topic2', value: 2 },
      { source: 'topic2', target: 'topic3', value: 1 },
      { source: 'topic3', target: 'topic4', value: 3 },
      { source: 'topic4', target: 'topic5', value: 2 },
    ],
  };
};

const SizedForceGraph = ({ graphData }: { graphData: GraphData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useSize(containerRef);

  return (
    <div ref={containerRef} style={{ height: 300, background: 'rgba(0, 0, 0, 0.05)', borderRadius: '8px', position: 'relative' }}>
      {width > 0 && height > 0 && (
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="name"
          nodeRelSize={6}
          linkWidth={1}
          linkColor={() => 'rgba(100, 100,120, 0.2)'}
          nodeColor={() => '#6c63ff'}
          width={width}
          height={height}
        />
      )}
    </div>
  );
};

export const NetworkGraphPanel: React.FC<{ queries: { entity: string }[] }> = ({ queries = [] }) => {
  const networkDataByEntity = useMemo(() => {
    if (queries.length === 0) return {};
    
    const data: { [key: string]: GraphData } = {};
    queries.forEach(q => {
      data[q.entity] = generateMockNetworkData(q.entity);
    });
    return data;
  }, [queries]);

  if (queries.length === 0) {
    return <div className={styles.noData}>Select entities to see network analysis.</div>;
  }

  return (
    <div className={styles.smallMultiplesGrid}>
      {Object.entries(networkDataByEntity).map(([entity, graphData]) => (
        <div key={entity} className={styles.smallMultiple}>
          <h4>{entity}</h4>
          <SizedForceGraph graphData={graphData} />
        </div>
      ))}
    </div>
  );
}; 