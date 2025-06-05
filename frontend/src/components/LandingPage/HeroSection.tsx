"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './HeroSection.module.scss';

export const HeroSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/entity/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.background}>
        {/* TODO: Add dynamic background with data flow animation */}
        <div className={styles.overlay} />
      </div>
      
      <div className="container">
        <div className={styles.content}>
          <h1 className={styles.title}>
            Decode Video News
          </h1>
          
          <h2 className={styles.subtitle}>
            Track Sentiment & Entities. Instantly.
          </h2>
          
          <p className={styles.description}>
            Go beyond soundbites. Unnamed Project analyzes thousands of news videos,
            revealing how key figures, organizations, and events are truly portrayed.
            Understand the full narrative.
          </p>
          
          <form className={styles.searchForm} onSubmit={handleSubmit}>
            <div className={styles.searchInputWrapper}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search e.g., 'OpenAI', 'Ukraine Crisis', 'Elon Musk'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search entities"
              />
              <span className={styles.searchIcon}>
                {/* TODO: Add search icon */}
                🔍
              </span>
            </div>
            
            <button type="submit" className={styles.searchButton}>
              Analyze Now
            </button>
          </form>
          
          <p className={styles.disclaimer}>
            Start exploring free. No sign-up needed for initial search.
          </p>
        </div>
      </div>
    </section>
  );
}; 