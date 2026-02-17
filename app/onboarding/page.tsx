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

  const metadata = (sessionClaims as any)?.unsafeMetadata || {};
  const hasCompletedOnboarding = metadata.onboardingComplete === true;

  // Skip redirect if already on onboarding page (prevent loop)
  if (isOnboardingRoute(request)) {
    if (hasCompletedOnboarding) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Check if coming from onboarding (has a special param)
  const url = new URL(request.url);
  if (url.searchParams.get('from') === 'onboarding') {
    // Allow through - user just completed onboarding
    return NextResponse.next();
  }

  // Redirect to onboarding if not complete
  if (!hasCompletedOnboarding) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
