"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  
  // Show sidebar on data-driven pages
  const showSidebar = [
    '/entity',
    '/video',
    '/explore',
    '/dashboard'
  ].some(path => pathname?.startsWith(path));

  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.main}>
        {showSidebar && <Sidebar />}
        <main className={styles.content}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout; 