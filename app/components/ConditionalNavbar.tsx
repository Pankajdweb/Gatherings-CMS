'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();

  // Pages where we should hide the navbar even if not authenticated
  const authPages = ['/sign-in', '/sign-up'];
  const isAuthPage = authPages.some(page => pathname?.startsWith(page));

  // Don't render anything until Clerk is loaded to avoid flash
  if (!isLoaded) {
    return null;
  }

  // Hide navbar on auth pages or when user is not signed in
  if (isAuthPage || !isSignedIn) {
    return null;
  }

  // Show navbar when user is signed in and not on auth pages
  return <Navbar />;
}

