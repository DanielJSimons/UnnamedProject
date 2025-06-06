"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: React.ReactNode;
}

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/bookmarks',
  '/history',
  '/notifications',
  '/settings'
];

// Define public routes that should always be accessible
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/pricing',
  '/about',
  '/contact'
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  // Sidebar open/closed state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Apply dashboard theme if on the dashboard page
  const isDashboard = pathname.startsWith('/dashboard');

  useEffect(() => {
    if (isLoading || !pathname) return;

    // Check if current path is a protected route
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathname.startsWith(route)
    );

    // Check if current path is a public route
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    if (!user && isProtectedRoute) {
      // Only redirect to auth if trying to access a protected route while not authenticated
      router.push('/auth');
    } else if (user && pathname === '/auth') {
      // Redirect to dashboard if trying to access auth page while authenticated
      router.push('/dashboard');
    }

    // For non-existent routes (not protected or public), let Next.js handle 404
  }, [isLoading, user, pathname, router]);

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

  // Show sidebar only for authenticated users
  const showSidebar = Boolean(user);

  return (
    <div className={`${styles.layout} ${isDashboard ? styles.dashboardTheme : ''}`}>
      {!user && <Header />}
      <div className={styles.main}>
        {showSidebar && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
        <main className={`${styles.content} ${showSidebar ? (isSidebarOpen ? styles.withSidebarExpanded : styles.withSidebarCollapsed) : ''}`}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout; 