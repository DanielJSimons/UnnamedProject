"use client";

import React, { useMemo, useState, useEffect } from 'react';
import styles from './Panel.module.scss';

interface HeatmapData {
  hour: number;
  day: string;
  value: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const generateMockHeatmapData = (entity: string): HeatmapData[] => {
  // This would be replaced with real data in production
  return DAYS.flatMap(day => 
    HOURS.map(hour => ({
      hour,
      day,
      value: Math.floor(Math.random() * 100),
    }))
  );
};

const getColor = (value: number): string => {
  // Color scale from light to dark purple
  const minValue = 0;
  const maxValue = 100;
  const normalizedValue = (value - minValue) / (maxValue - minValue);
  const alpha = 0.1 + normalizedValue * 0.9; // Ranges from 0.1 to 1.0
  return `rgba(108, 99, 255, ${alpha})`;
};

export const HeatmapPanel: React.FC<{ queries: { entity: string }[] }> = ({ queries = [] }) => {
  const [heatmapDataByEntity, setHeatmapDataByEntity] = useState<{ [key: string]: HeatmapData[] }>({});

  useEffect(() => {
    if (queries.length > 0) {
      const data: { [key: string]: HeatmapData[] } = {};
      queries.forEach(q => {
        data[q.entity] = generateMockHeatmapData(q.entity);
      });
      setHeatmapDataByEntity(data);
    } else {
      setHeatmapDataByEntity({});
    }
  }, [queries]);

  if (queries.length === 0) {
    return <div className={styles.noData}>Select entities to see temporal patterns.</div>;
  }

  return (
    <div className={styles.smallMultiplesGrid}>
      {Object.entries(heatmapDataByEntity).map(([entity, data]) => (
        <div key={entity} className={styles.smallMultiple}>
          <h4>{entity}</h4>
          <div className={styles.heatmapContainer}>
            <div className={styles.heatmapGrid}>
              <div className={styles.heatmapHeader}>
                <div className={styles.heatmapCorner} />
                {HOURS.map(hour => (
                  <div key={hour} className={styles.heatmapHourLabel}>
                    {hour}
                  </div>
                ))}
              </div>
              {DAYS.map(day => (
                <div key={day} className={styles.heatmapRow}>
                  <div className={styles.heatmapDayLabel}>{day}</div>
                  {HOURS.map(hour => {
                    const cellData = data.find(d => d.day === day && d.hour === hour);
                    return (
                      <div
                        key={hour}
                        className={styles.heatmapCell}
                        style={{
                          backgroundColor: cellData ? getColor(cellData.value) : 'transparent',
                        }}
                        title={`${day} ${hour}:00 - Value: ${cellData?.value || 0}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 