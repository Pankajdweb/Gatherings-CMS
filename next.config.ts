import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No static export needed since we have API routes
  
  // Optimize for Netlify deployment
  output: 'standalone',
  
  // Enable SWC minification
  swcMinify: true,
  
  // Image optimization for Webflow images
  images: {
    domains: ['uploads-ssl.webflow.com', 'assets.website-files.com'],
    unoptimized: false,
  },
};

export default nextConfig;
