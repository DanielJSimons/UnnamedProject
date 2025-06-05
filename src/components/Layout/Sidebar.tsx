import React from 'react';
import Link from 'next/link';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { FaHome, FaChartLine, FaTachometerAlt, FaUserCog, FaSignOutAlt, FaDollarSign } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import styles from './Sidebar.module.scss';

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const { user, logout } = useAuth();

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

        {user && (
          <div className={styles.userSection}>
            <Link href="/settings" className={styles.navItem}>
              <FaUserCog className={styles.icon} />
              {isOpen && <span>Settings</span>}
            </Link>
            <Link href="/pricing" className={styles.navItem}>
              <FaDollarSign className={styles.icon} />
              {isOpen && <span>Pricing</span>}
            </Link>
            <button onClick={logout} className={styles.navItem}>
              <FaSignOutAlt className={styles.icon} />
              {isOpen && <span>Sign Out</span>}
            </button>
          </div>
        )}

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