import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/contracts/[id]/pdf": ["node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/contracts/[id]/sign": ["node_modules/@sparticuz/chromium/bin/**/*"],
  },
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

