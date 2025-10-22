'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Logo Section */}
        <Link href="/" className={styles.logoLink}>
          <img 
            src="https://cdn.prod.website-files.com/6865ac77d1a4f0d42c02ccbf/68e2eb07b8c19c27b99aba3e_Asset%203.png" 
            alt="Gatherings Logo" 
            className={styles.logo}
          />
        </Link>

        {/* Navigation Links */}
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>
            <span className={styles.navIcon}>📊</span>
            My Events
          </Link>
          <Link href="/addevents" className={styles.navLink}>
            <span className={styles.navIcon}>➕</span>
            Add Event
          </Link>
        </div>

        {/* User Section */}
        <div className={styles.userSection}>
          <UserButton 
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
          />
        </div>
      </div>
    </nav>
  );
}

