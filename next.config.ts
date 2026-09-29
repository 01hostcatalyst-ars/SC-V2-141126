import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/calculator/export-pdf": ["node_modules/@sparticuz/chromium/bin/**/*"],
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
        source: "/signup",
        destination: "/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

