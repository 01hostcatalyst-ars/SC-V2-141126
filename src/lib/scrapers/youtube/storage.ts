import { prisma } from '@/lib/prisma';
import { YouTubeScraperData, YouTubeExternalLink, YouTubeVideoItem } from '../types';
import { formatCompactNumber, extractYouTubeIdentifier, computeYouTubeTrimmedMetrics } from './parser';

const CACHE_WINDOW_HOURS = 24;

/**
 * Checks if a valid snapshot already exists in the database within the last 24 hours.
 */
export async function getRecentYouTubeSnapshot(
  input: string,
  maxAgeHours: number = CACHE_WINDOW_HOURS
): Promise<YouTubeScraperData | null> {
  const parsed = extractYouTubeIdentifier(input);
  const cleanVal = parsed.value.trim().replace(/^@/, '');

  if (!cleanVal) return null;

  // Query the latest snapshot for this channel (fast indexed query)
  const latestRecord = await prisma.youTubeScrape.findFirst({
    where: {
      OR: [
        { youtubeChannelId: cleanVal },
        { handle: { equals: `@${cleanVal}`, mode: 'insensitive' } },
        { handle: { equals: cleanVal, mode: 'insensitive' } },
        { customUrl: { equals: `@${cleanVal}`, mode: 'insensitive' } },
        { customUrl: { equals: cleanVal, mode: 'insensitive' } },
        { title: { equals: cleanVal, mode: 'insensitive' } },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!latestRecord) return null;

  const now = new Date().getTime();
  const recordTime = new Date(latestRecord.createdAt).getTime();
  const ageInHours = (now - recordTime) / (1000 * 60 * 60);

  // If the record is younger than 24 hours, return it as a valid cache hit
  if (ageInHours < maxAgeHours) {
    const formatted = formatDbRecordToScraperData(latestRecord);

    // Safeguard: Never serve an incomplete snapshot that has 0 videos captured if the channel has uploads
    const totalVideos = formatted.longVideos.length + formatted.shortVideos.length;
    const channelVideoCount = Number(latestRecord.videoCount || 0);
    if (channelVideoCount > 0 && totalVideos === 0) {
      console.warn(`[YouTube Storage] Cached snapshot for "${latestRecord.title}" had 0 videos captured. Ignoring cache to trigger fresh fetch.`);
      return null;
    }

    formatted.isCached = true;
    formatted.cacheAgeHours = Math.round(ageInHours * 10) / 10;
    return formatted;
  }

  // Older than 24 hours -> cache expired, ready for a new snapshot row
  return null;
}

/**
 * Inserts a brand new immutable snapshot row into `youtube_scrapes` table.
 * Preserves all historical records for analytics.
 */
export async function insertNewYouTubeSnapshot(data: YouTubeScraperData): Promise<YouTubeScraperData> {
  if (!data?.channel?.id) {
    throw new Error('Cannot save snapshot: missing YouTube channel ID.');
  }

  const channel = data.channel;

  // Safeguard: Do not persist empty video snapshots if the channel actually has uploads
  const totalVideos = (data.longVideos?.length || 0) + (data.shortVideos?.length || 0);
  const channelVideoCount = Number(channel.videoCount || 0);
  if (channelVideoCount > 0 && totalVideos === 0) {
    console.warn(`[YouTube Storage] Skipping DB insert for "${channel.title}" because 0 videos were captured despite channel having ${channelVideoCount} uploads.`);
    return data;
  }

  const newRecord = await prisma.youTubeScrape.create({
    data: {
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

  console.log(`[YouTube Storage] Inserted new 24h snapshot row for "${newRecord.title}" (ID: ${newRecord.id})`);

  const formatted = formatDbRecordToScraperData(newRecord);
  formatted.isCached = false;
  formatted.cacheAgeHours = 0;
  return formatted;
}

/**
 * Formats a Prisma database record into the standard YouTubeScraperData structure
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
  createdAt: Date;
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

  // Dynamically calculate robust long-form and short-form metrics from stored uploads using trimmed-mean
  const longMetrics = computeYouTubeTrimmedMetrics(longVideos, 6);
  const shortMetrics = computeYouTubeTrimmedMetrics(shortVideos, 6);

  const stats = {
    totalLongVideosFetched: longVideos.length,
    totalShortVideosFetched: shortVideos.length,
    avgLongVideoViews: longMetrics.avgViews,
    avgShortVideoViews: shortMetrics.avgViews,
    avgLongEngagementRate: longMetrics.avgEngagementRate,
    avgShortEngagementRate: shortMetrics.avgEngagementRate,
  };

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
    snapshotId: record.id,
    scrapedAt: record.createdAt.toISOString(),
  };
}
