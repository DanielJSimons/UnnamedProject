"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  // Don't show any navigation while auth state is loading
  if (isLoading) {
    return (
      <div className={styles.layout}>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    );
  }

  // Always show sidebar when logged in
  const showSidebar = user || [
    '/entity',
    '/video',
    '/explore',
    '/dashboard'
  ].some(path => pathname?.startsWith(path));

  return (
    <div className={styles.layout}>
      {!user && <Header />}
      <div className={styles.main}>
        {showSidebar && <Sidebar />}
        <main className={`${styles.content} ${showSidebar ? styles.withSidebar : ''}`}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout; 