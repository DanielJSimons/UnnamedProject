"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  FaHistory,
  FaUser,
  FaCog
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import styles from './Sidebar.module.scss';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from './Dialog';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'profile' | 'appSettings' | 'pricing' | 'signout'>('profile');
  const pathname = usePathname();
  const router = useRouter();

  // Debug log
  React.useEffect(() => {
    console.log('Auth state:', { user, isAuthenticated: !!user });
  }, [user]);

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

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    return (
      <Link 
        key={item.href} 
        href={item.href} 
        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAccountOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderUserProfile = () => {
    if (!user) return null;

    return (
      <div className={styles.userProfileSection}>
        <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
          <DialogTrigger asChild>
            <button className={styles.profileTrigger}>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  <FaUser />
                </div>
                <div className={styles.userDetails}>
                  <span className={styles.userName}>{user.name || 'User'}</span>
                  <span className={styles.userEmail}>{user.email}</span>
                </div>
              </div>
            </button>
          </DialogTrigger>

          <DialogContent
            style={{
              left: isOpen ? 'calc(50% + 130px)' : 'calc(50% + 40px)'
            }}
            className="w-[75vw] h-[75vh]"
          >
            <DialogHeader>
              <DialogTitle>Account</DialogTitle>
            </DialogHeader>
            <div className={styles.accountModal}>
              <nav className={styles.accountNav}>
                <button
                  className={selectedTab === 'profile' ? styles.activeTab : styles.tab}
                  onClick={() => setSelectedTab('profile')}
                >
                  <FaUser className={styles.icon} />
                  <span>Profile</span>
                </button>
                <button
                  className={selectedTab === 'appSettings' ? styles.activeTab : styles.tab}
                  onClick={() => setSelectedTab('appSettings')}
                >
                  <FaCog className={styles.icon} />
                  <span>Application Settings</span>
                </button>
                <button
                  className={selectedTab === 'pricing' ? styles.activeTab : styles.tab}
                  onClick={() => setSelectedTab('pricing')}
                >
                  <FaDollarSign className={styles.icon} />
                  <span>Pricing</span>
                </button>
                <button
                  className={selectedTab === 'signout' ? styles.activeTab : styles.tab}
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className={styles.icon} />
                  <span>Sign Out</span>
                </button>
              </nav>
              <div className={styles.accountBody}>
                {selectedTab === 'profile' && (
                  <div>Profile content goes here</div>
                )}
                {selectedTab === 'appSettings' && (
                  <div>Application settings content goes here</div>
                )}
                {selectedTab === 'pricing' && (
                  <div>Pricing content goes here</div>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose className={styles.closeButton}>Close</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
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

        {renderUserProfile()}

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