"use client";

import React, { useMemo, useState, useEffect } from 'react';
import styles from './Panel.module.scss';
import snippetStyles from './ContextualSnippetsPanel.module.scss';
import { generateContextualSnippetsData } from '@/lib/mockData';

interface Snippet {
  sentence: string;
  sentiment: string;
  start: number;
  videoId: string;
  videoTitle: string;
}

interface ContextualSnippetsPanelProps {
  queries: { entity: string }[];
}

export const ContextualSnippetsPanel: React.FC<{ queries: { entity: string }[] }> = ({ queries = [] }) => {
  const [snippetsByEntity, setSnippetsByEntity] = useState<{ [key: string]: Snippet[] }>({});

  useEffect(() => {
    if (queries.length > 0) {
      const data: { [key: string]: Snippet[] } = {};
      queries.forEach(q => {
        // Pass the entity name to the generator to make snippets more relevant
        data[q.entity] = generateContextualSnippetsData(3, q.entity);
      });
      setSnippetsByEntity(data);
    } else {
      setSnippetsByEntity({});
    }
  }, [queries]);

  if (queries.length === 0) {
    return <div className={styles.noData}>Select entities to see contextual snippets.</div>;
  }

  return (
    <div className={snippetStyles.snippetsContainer}>
      {Object.entries(snippetsByEntity).map(([entity, snippets]) => (
        <div key={entity} className={snippetStyles.entityGroup}>
          <h4>Snippets for: {entity}</h4>
          {(snippets as any[]).map((snippet, index) => (
            <div key={index} className={snippetStyles.snippet}>
              <p className={snippetStyles.sentence}>"{snippet.sentence}"</p>
              <div className={snippetStyles.meta}>
                <span className={`${snippetStyles.sentiment} ${snippetStyles[snippet.sentiment.replace(/\s+/g, '')]}`}>
                  {snippet.sentiment}
                </span>
                <a 
                  href={`https://www.youtube.com/watch?v=${snippet.videoId}&t=${Math.floor(snippet.start)}s`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={snippetStyles.videoLink}
                >
                  Watch source
                </a>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}; 