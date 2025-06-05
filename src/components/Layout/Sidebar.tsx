import React from 'react';
import Link from 'next/link';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { FaHome, FaChartLine, FaTachometerAlt } from 'react-icons/fa';
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
            <FaHome className={styles.icon} />
            {isOpen && <span>Search/Home</span>}
          </Link>
          <Link href="/explore" className={styles.navItem}>
            <FaChartLine className={styles.icon} />
            {isOpen && <span>Explore Trends</span>}
          </Link>
          <Link href="/dashboard" className={styles.navItem}>
            <FaTachometerAlt className={styles.icon} />
            {isOpen && <span>My Dashboard</span>}
          </Link>
          {/* TODO: Add contextual filters based on page view */}
          {/* TODO: Add "Saved Searches" for logged-in users */}
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