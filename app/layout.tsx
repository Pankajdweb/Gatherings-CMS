import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import ConditionalNavbar from './components/ConditionalNavbar';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gatherings CMS - Event Management",
  description: "Manage Webflow CMS collections for Gatherings events platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning={true}>
          <ConditionalNavbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
