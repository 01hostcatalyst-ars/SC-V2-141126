import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/instant", "/features", "/pricing", "/vision", "/terms", "/calculator", "/knowledge", "/survey", "/verify", "/contact"],
        disallow: ["/api/", "/dashboard/", "/scrapers/", "/scrapers"],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "OAI-SearchBot",
          "ClaudeBot",
          "Claude-Web",
          "Google-Extended",
          "PerplexityBot",
          "CCBot",
          "Googlebot",
          "bingbot",
        ],
        allow: ["/", "/about", "/instant", "/features", "/pricing", "/vision", "/terms", "/calculator", "/knowledge", "/survey", "/verify", "/contact"],
        disallow: ["/api/", "/dashboard/", "/scrapers/", "/scrapers"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
