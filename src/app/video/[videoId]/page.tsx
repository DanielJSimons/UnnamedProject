import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './page.module.scss';

// Mock data - replace with actual API calls
const mockVideoData = {
  id: 'abc123',
  title: 'Example News Video',
  channel: 'News Channel',
  date: '2024-03-01',
  description: 'This is a sample news video with transcript analysis.',
};

const mockSentimentData = Array.from({ length: 20 }, (_, i) => ({
  timestamp: i * 30, // Every 30 seconds
  sentiment: Math.random() * 2 - 1, // Random sentiment between -1 and 1
}));

const mockTranscript = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  timestamp: i * 30,
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  sentiment: Math.random() * 2 - 1,
  entities: ['Entity 1', 'Entity 2'].map(e => ({
    name: e,
    sentiment: Math.random() * 2 - 1,
  })),
}));

const mockEntities = [
  { name: 'Entity 1', mentions: 15, avgSentiment: 0.6 },
  { name: 'Entity 2', mentions: 8, avgSentiment: -0.3 },
  { name: 'Entity 3', mentions: 12, avgSentiment: 0.2 },
];

export default function VideoDetail({ params }: { params: { videoId: string } }) {
  const { videoId } = params;

  return (
    <div className={styles.videoDetail}>
      <div className={styles.header}>
        <h1>{mockVideoData.title}</h1>
        <div className={styles.metadata}>
          <span>{mockVideoData.channel}</span>
          <span>{mockVideoData.date}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.mainColumn}>
          {/* Video Player Placeholder */}
          <div className={styles.videoPlayer}>
            <div className={styles.placeholder}>
              Video Player Placeholder
              <br />
              ID: {videoId}
            </div>
          </div>

          {/* Sentiment Timeline */}
          <div className={styles.sentimentTimeline}>
            <h2>Sentiment Arc</h2>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mockSentimentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`}
                  />
                  <YAxis domain={[-1, 1]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sentiment"
                    stroke="var(--primary-color)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Transcript */}
          <div className={styles.transcript}>
            <h2>Interactive Transcript</h2>
            <div className={styles.transcriptContent}>
              {mockTranscript.map((segment) => (
                <div
                  key={segment.id}
                  className={styles.transcriptSegment}
                  style={{
                    borderLeft: `4px solid ${
                      segment.sentiment > 0
                        ? 'var(--success-color)'
                        : segment.sentiment < 0
                        ? 'var(--error-color)'
                        : 'var(--border-color)'
                    }`,
                  }}
                >
                  <div className={styles.timestamp}>
                    {Math.floor(segment.timestamp / 60)}:
                    {(segment.timestamp % 60).toString().padStart(2, '0')}
                  </div>
                  <p>{segment.text}</p>
                  {segment.entities.length > 0 && (
                    <div className={styles.segmentEntities}>
                      {segment.entities.map((entity) => (
                        <span
                          key={entity.name}
                          className={styles.entity}
                          style={{
                            backgroundColor:
                              entity.sentiment > 0
                                ? 'var(--success-color)'
                                : 'var(--error-color)',
                          }}
                        >
                          {entity.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Entities Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.entitiesCard}>
            <h2>Key Entities</h2>
            <div className={styles.entityList}>
              {mockEntities.map((entity) => (
                <div key={entity.name} className={styles.entityItem}>
                  <div className={styles.entityHeader}>
                    <h3>{entity.name}</h3>
                    <span className={styles.mentions}>
                      {entity.mentions} mentions
                    </span>
                  </div>
                  <div className={styles.entitySentiment}>
                    Sentiment: {entity.avgSentiment.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 