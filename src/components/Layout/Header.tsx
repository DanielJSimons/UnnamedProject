"use client";

import * as React from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import styles from './Header.module.scss';

export const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <Link href="/" className={styles.logo}>
          Unnamed Project
        </Link>

        <NavigationMenu.Root>
          <NavigationMenu.List className={styles.navigationList}>
            <NavigationMenu.Item>
              <NavigationMenu.Link asChild>
                <Link href="/explore" className={styles.navigationLink}>
                  Explore Trends
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <NavigationMenu.Link asChild>
                <Link href="/why-unnamed-project" className={styles.navigationLink}>
                  Why Unnamed Project?
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <NavigationMenu.Link asChild>
                <Link href="/pricing" className={styles.navigationLink}>
                  Pricing
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <NavigationMenu.Link asChild>
                <Link href="/auth" className={styles.navigationLink}>
                  Log In
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>
    </header>
  );
};

export default Header; 