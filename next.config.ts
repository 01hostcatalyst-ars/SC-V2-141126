import type { NextConfig } from "next";
import { randomUUID } from "node:crypto";

const nextConfig: NextConfig = {
  // Scope public homepage snapshots to a deployment, including non-Vercel builds.
  env: { HOME_CACHE_VERSION: process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_URL || randomUUID() },
  // Allows production verification without overwriting the active dev server's .next.
  distDir: process.env.SIGNCOLLAB_BUILD_DIR || ".next",
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/calculator/export-pdf": ["node_modules/@sparticuz/chromium/bin/**/*", "public/fonts/**/*"],
    "/api/contracts/[id]/pdf": ["node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/contracts/[id]/sign": ["node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/contracts/[id]/certificate": ["node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/contracts/share/[token]/pdf": ["node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/contracts/share/[token]/sign": ["node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/contracts/share/[token]/certificate": ["node_modules/@sparticuz/chromium/bin/**/*"],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/calculator",
        destination: "/influencer-rate-calculator",
        permanent: true,
      },
      {
        source: "/influancer-rate-calculator",
        destination: "/influencer-rate-calculator",
        permanent: true,
      },
      {
        source: "/scrapers",
        destination: "/influencer-rate-calculator",
        permanent: true,
      },
      {
        source: "/scrapers/instagram",
        destination: "/influencer-rate-calculator",
        permanent: true,
      },
      {
        source: "/scrapers/youtube",
        destination: "/influencer-rate-calculator",
        permanent: true,
      },
      {
        source: "/scrapers/tiktok",
        destination: "/influencer-rate-calculator",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

