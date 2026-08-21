import { prisma } from '@/lib/prisma';
import { YouTubeScraperData, YouTubeExternalLink, YouTubeVideoItem } from '../types';
import { formatCompactNumber } from './parser';

/**
 * Saves or updates scraped YouTube channel data into `youtube_scrapes` and returns the DB record.
 */
export async function saveAndFetchYouTubeScrape(data: YouTubeScraperData): Promise<YouTubeScraperData> {
  if (!data?.channel?.id) {
    throw new Error('Cannot save scrape: missing channel ID.');
  }

  const channel = data.channel;

  // 1. Store / Upsert in Database first
  const record = await prisma.youTubeScrape.upsert({
    where: {
      youtubeChannelId: channel.id,
    },
    update: {
      handle: channel.handle || null,
      title: channel.title,
      customUrl: channel.customUrl || null,
      description: channel.description || null,
      country: channel.country || null,
      avatarUrl: channel.avatarUrl,
      extractedEmail: channel.extractedEmail || null,
      subscriberCount: BigInt(channel.subscriberCount || 0),
      lifetimeViewCount: BigInt(channel.lifetimeViewCount || 0),
      videoCount: channel.videoCount || 0,
      avgViewsPerVideo: BigInt(channel.avgViewsPerVideo || 0),
      externalLinks: JSON.parse(JSON.stringify(channel.externalLinks || [])),
      longVideos: JSON.parse(JSON.stringify(data.longVideos || [])),
      shortVideos: JSON.parse(JSON.stringify(data.shortVideos || [])),
      stats: JSON.parse(JSON.stringify(data.stats || {})),
      keywords: channel.keywords || [],
      topicCategories: channel.topicCategories || [],
      uploadsPlaylistId: channel.uploadsPlaylistId || null,
      rawMetadata: JSON.parse(JSON.stringify(data)),
      lastScrapedAt: new Date(),
    },
    create: {
      youtubeChannelId: channel.id,
      handle: channel.handle || null,
      title: channel.title,
      customUrl: channel.customUrl || null,
      description: channel.description || null,
      country: channel.country || null,
      avatarUrl: channel.avatarUrl,
      extractedEmail: channel.extractedEmail || null,
      subscriberCount: BigInt(channel.subscriberCount || 0),
      lifetimeViewCount: BigInt(channel.lifetimeViewCount || 0),
      videoCount: channel.videoCount || 0,
      avgViewsPerVideo: BigInt(channel.avgViewsPerVideo || 0),
      externalLinks: JSON.parse(JSON.stringify(channel.externalLinks || [])),
      longVideos: JSON.parse(JSON.stringify(data.longVideos || [])),
      shortVideos: JSON.parse(JSON.stringify(data.shortVideos || [])),
      stats: JSON.parse(JSON.stringify(data.stats || {})),
      keywords: channel.keywords || [],
      topicCategories: channel.topicCategories || [],
      uploadsPlaylistId: channel.uploadsPlaylistId || null,
      rawMetadata: JSON.parse(JSON.stringify(data)),
      lastScrapedAt: new Date(),
    },
  });

  console.log(`[YouTube Storage] Stored & queried record from database for: "${record.title}" (${record.youtubeChannelId})`);

  // 2. Format database record into YouTubeScraperData to return to frontend
  return formatDbRecordToScraperData(record);
}

/**
 * Retrieves a saved record directly from the database
 */
export async function getSavedYouTubeScrape(identifier: string): Promise<YouTubeScraperData | null> {
  const cleanId = identifier.trim().replace(/^@/, '');

  const record = await prisma.youTubeScrape.findFirst({
    where: {
      OR: [
        { youtubeChannelId: cleanId },
        { handle: `@${cleanId}` },
        { handle: cleanId },
        { customUrl: `@${cleanId}` },
        { title: { equals: cleanId, mode: 'insensitive' } },
      ],
    },
  });

  if (!record) return null;
  return formatDbRecordToScraperData(record);
}

/**
 * Formats a raw Prisma database record into YouTubeScraperData for the frontend
 */
export function formatDbRecordToScraperData(record: {
  id: string;
  youtubeChannelId: string;
  handle: string | null;
  title: string;
  customUrl: string | null;
  description: string | null;
  country: string | null;
  avatarUrl: string;
  extractedEmail: string | null;
  subscriberCount: bigint;
  lifetimeViewCount: bigint;
  videoCount: number;
  avgViewsPerVideo: bigint;
  externalLinks: unknown;
  longVideos: unknown;
  shortVideos: unknown;
  stats: unknown;
  keywords: string[];
  topicCategories: string[];
  uploadsPlaylistId: string | null;
  lastScrapedAt: Date;
}): YouTubeScraperData {
  const subCount = Number(record.subscriberCount);
  const viewsCount = Number(record.lifetimeViewCount);
  const avgViews = Number(record.avgViewsPerVideo);

  const externalLinks = (Array.isArray(record.externalLinks)
    ? record.externalLinks
    : []) as YouTubeExternalLink[];

  const longVideos = (Array.isArray(record.longVideos)
    ? record.longVideos
    : []) as YouTubeVideoItem[];

  const shortVideos = (Array.isArray(record.shortVideos)
    ? record.shortVideos
    : []) as YouTubeVideoItem[];

  const stats = (record.stats && typeof record.stats === 'object'
    ? record.stats
    : {
        totalLongVideosFetched: longVideos.length,
        totalShortVideosFetched: shortVideos.length,
        avgLongVideoViews: 0,
        avgShortVideoViews: 0,
        avgLongEngagementRate: 0,
        avgShortEngagementRate: 0,
      }) as YouTubeScraperData['stats'];

  return {
    channel: {
      id: record.youtubeChannelId,
      title: record.title,
      handle: record.handle || undefined,
      customUrl: record.customUrl || undefined,
      description: record.description || '',
      publishedAt: '',
      country: record.country || undefined,
      avatarUrl: record.avatarUrl,
      subscriberCount: subCount,
      subscriberCountFormatted: formatCompactNumber(subCount),
      lifetimeViewCount: viewsCount,
      lifetimeViewCountFormatted: formatCompactNumber(viewsCount),
      videoCount: record.videoCount,
      avgViewsPerVideo: avgViews,
      keywords: record.keywords,
      topicCategories: record.topicCategories,
      extractedEmail: record.extractedEmail || undefined,
      externalLinks,
      uploadsPlaylistId: record.uploadsPlaylistId || '',
    },
    longVideos,
    shortVideos,
    stats,
    scrapedAt: record.lastScrapedAt.toISOString(),
  };
}
