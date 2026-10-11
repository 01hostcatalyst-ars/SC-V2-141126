import { MetadataRoute } from "next";
import { getKnowledgeArticles } from "@/lib/gdocs";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/creators`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/instant`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/influencer-rate-calculator`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/knowledge`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/survey`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/vision`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/verify`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Dynamic article routes fetched live from Google Docs
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await getKnowledgeArticles();
    articleRoutes = articles.map((article) => ({
      url: `${baseUrl}/knowledge/${article.slug}`,
      lastModified: article.modifiedTime ? new Date(article.modifiedTime) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Failed to fetch knowledge articles for sitemap:", error);
  }

  // Dynamic creator profile routes fetched from CreatorIdentityCluster
  let creatorRoutes: MetadataRoute.Sitemap = [];
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
    });

    creatorRoutes = creators
      .filter((creator): creator is { slug: string; updatedAt: Date } => Boolean(creator.slug && creator.slug.trim()))
      .map((creator) => ({
        url: `${baseUrl}/creators/${creator.slug.trim()}`,
        lastModified: creator.updatedAt ? new Date(creator.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
  } catch (error) {
    console.error("Failed to fetch creator profiles for sitemap:", error);
  }

  return [...staticRoutes, ...articleRoutes, ...creatorRoutes];
}
