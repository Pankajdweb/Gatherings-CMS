import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No static export needed since we have API routes
  
  // Image optimization for Webflow images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploads-ssl.webflow.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.website-files.com',
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
