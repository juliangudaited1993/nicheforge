import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,

  // Image optimization (Netlify CDN handles well)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Experimental for better build performance (Next 16)
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Environment variable validation at build time (optional)
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site.netlify.app',
  },
};

export default nextConfig;
