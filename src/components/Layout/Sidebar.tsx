import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { 
  FaHome, 
  FaChartLine, 
  FaTachometerAlt, 
  FaUserCog, 
  FaSignOutAlt, 
  FaDollarSign,
  FaBookmark,
  FaBell,
  FaHistory
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import styles from './Sidebar.module.scss';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const mainNavItems: NavItem[] = [
    {
      href: '/',
      icon: <FaHome className={styles.icon} />,
      label: 'Search/Home'
    },
    {
      href: '/explore',
      icon: <FaChartLine className={styles.icon} />,
      label: 'Explore Trends'
    },
    {
      href: '/dashboard',
      icon: <FaTachometerAlt className={styles.icon} />,
      label: 'My Dashboard'
    },
    {
      href: '/bookmarks',
      icon: <FaBookmark className={styles.icon} />,
      label: 'Saved Items'
    },
    {
      href: '/history',
      icon: <FaHistory className={styles.icon} />,
      label: 'History'
    },
    {
      href: '/notifications',
      icon: <FaBell className={styles.icon} />,
      label: 'Notifications'
    }
  ];

  const userNavItems: NavItem[] = [
    {
      href: '/settings',
      icon: <FaUserCog className={styles.icon} />,
      label: 'Settings'
    },
    {
      href: '/pricing',
      icon: <FaDollarSign className={styles.icon} />,
      label: 'Pricing'
    }
  ];

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    return (
      <Link 
        key={item.href} 
        href={item.href} 
        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
      >
        {item.icon}
        {isOpen && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
    >
      <div className={styles.content}>
        <nav className={styles.navigation}>
          {mainNavItems.map(renderNavItem)}
        </nav>

        <div className={styles.userSection}>
          {userNavItems.map(renderNavItem)}
          <button onClick={logout} className={styles.navItem}>
            <FaSignOutAlt className={styles.icon} />
            {isOpen && <span>Sign Out</span>}
          </button>
        </div>

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