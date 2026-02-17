import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding']);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Always allow onboarding route
  if (isOnboardingRoute(request)) {
    return NextResponse.next();
  }

  // For all other routes, check if onboarding is complete
  const metadata = (sessionClaims as any)?.unsafeMetadata || {};
  const hasCompletedOnboarding = metadata.onboardingComplete === true;

  // If onboarding not complete, redirect to onboarding
  if (!hasCompletedOnboarding) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // Onboarding is complete, allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
