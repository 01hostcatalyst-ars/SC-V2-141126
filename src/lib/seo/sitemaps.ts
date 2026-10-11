import { prisma } from "@/lib/prisma";
import { getKnowledgeArticles } from "@/lib/gdocs";

export const CREATORS_PER_SITEMAP = 500;

export interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export async function getCreatorBatchCount(): Promise<number> {
  try {
    const total = await prisma.creatorIdentityCluster.count({
      where: {
        slug: {
          not: null,
        },
      },
    });
    return Math.max(1, Math.ceil(total / CREATORS_PER_SITEMAP));
  } catch (error) {
    console.error("Failed to count creator clusters for sitemap:", error);
    return 6;
  }
}

export function buildSitemapIndexXml(subSitemaps: Array<{ loc: string; lastmod?: string | Date }>): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const item of subSitemaps) {
    xml += "  <sitemap>\n";
    xml += `    <loc>${escapeXml(item.loc)}</loc>\n`;
    if (item.lastmod) {
      const dateStr = item.lastmod instanceof Date ? item.lastmod.toISOString() : new Date(item.lastmod).toISOString();
      xml += `    <lastmod>${dateStr}</lastmod>\n`;
    }
    xml += "  </sitemap>\n";
  }

  xml += "</sitemapindex>";
  return xml;
}

export function buildUrlSetXml(entries: SitemapEntry[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const item of entries) {
    xml += "  <url>\n";
    xml += `    <loc>${escapeXml(item.url)}</loc>\n`;
    if (item.lastModified) {
      const dateStr = item.lastModified instanceof Date ? item.lastModified.toISOString() : new Date(item.lastModified).toISOString();
      xml += `    <lastmod>${dateStr}</lastmod>\n`;
    }
    if (item.changeFrequency) {
      xml += `    <changefreq>${item.changeFrequency}</changefreq>\n`;
    }
    if (typeof item.priority === "number") {
      xml += `    <priority>${item.priority.toFixed(2)}</priority>\n`;
    }
    xml += "  </url>\n";
  }

  xml += "</urlset>";
  return xml;
}

export function getStaticSitemapEntries(baseUrl: string): SitemapEntry[] {
  const now = new Date();
  return [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/creators`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/instant`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/influencer-rate-calculator`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/knowledge`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/survey`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/vision`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/verify`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}

export async function getKnowledgeSitemapEntries(baseUrl: string): Promise<SitemapEntry[]> {
  try {
    const articles = await getKnowledgeArticles();
    return articles.map((article) => ({
      url: `${baseUrl}/knowledge/${article.slug}`,
      lastModified: article.modifiedTime ? new Date(article.modifiedTime) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Failed to fetch knowledge articles for sitemap:", error);
    return [];
  }
}

export async function getCreatorBatchEntries(
  baseUrl: string,
  batchNumber: number
): Promise<{ entries: SitemapEntry[]; totalInBatch: number }> {
  const skip = (batchNumber - 1) * CREATORS_PER_SITEMAP;
  const take = CREATORS_PER_SITEMAP;

  try {
    const creators = await prisma.creatorIdentityCluster.findMany({
      where: {
        slug: {
          not: null,
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        combinedFollowers: "desc",
      },
      skip,
      take,
    });

    const entries: SitemapEntry[] = creators
      .filter((creator): creator is { slug: string; updatedAt: Date } => Boolean(creator.slug && creator.slug.trim()))
      .map((creator) => ({
        url: `${baseUrl}/creators/${creator.slug.trim()}`,
        lastModified: creator.updatedAt ? new Date(creator.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    return { entries, totalInBatch: entries.length };
  } catch (error) {
    console.error(`Failed to fetch creator profiles for batch ${batchNumber}:`, error);
    return { entries: [], totalInBatch: 0 };
  }
}
