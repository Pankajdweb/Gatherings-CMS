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
            src="/Dark Background.png" 
            alt="Gatherings Logo" 
            className={styles.logo}
          />
        </Link>

        {/* Navigation Links */}
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>
            My Events
          </Link>
          <Link href="/addevents" className={styles.navLink}>
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


