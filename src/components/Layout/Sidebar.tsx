import React from 'react';
import Link from 'next/link';
import * as Collapsible from '@radix-ui/react-collapsible';
import { HomeIcon, BarChartIcon, ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import styles from './Sidebar.module.scss';

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
    >
      <div className={styles.content}>
        <nav className={styles.navigation}>
          <Link href="/" className={styles.navItem}>
            <HomeIcon className={styles.icon} />
            {isOpen && <span>Search/Home</span>}
          </Link>
          <Link href="/explore" className={styles.navItem}>
            <BarChartIcon className={styles.icon} />
            {isOpen && <span>Explore Trends</span>}
          </Link>
          {/* TODO: Add contextual filters based on page view */}
          {/* TODO: Add "My Dashboard", "Saved Searches" for logged-in users */}
        </nav>

        <Collapsible.Trigger asChild>
          <button className={styles.trigger}>
            {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </button>
        </Collapsible.Trigger>
      </div>
    </Collapsible.Root>
  );
};

export default Sidebar; 