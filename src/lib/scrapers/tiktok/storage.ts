import { prisma } from '@/lib/prisma';
import {
  TikTokScraperData,
  TikTokProfile,
  TikTokVideoItem,
} from '../types';
import { extractTikTokUsername, formatCompactNumber } from './parser';

const CACHE_WINDOW_HOURS = 24;

/**
 * Checks if a valid snapshot already exists in the database within the last 24 hours.
 */
export async function getRecentTikTokSnapshot(
  input: string,
  maxAgeHours: number = CACHE_WINDOW_HOURS
): Promise<TikTokScraperData | null> {
  const username = extractTikTokUsername(input);
  if (!username) return null;

  const latestRecord = await prisma.tikTokScrape.findFirst({
    where: {
      tiktokUsername: { equals: username, mode: 'insensitive' },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!latestRecord) return null;

  const now = new Date().getTime();
  const recordTime = new Date(latestRecord.createdAt).getTime();
  const ageInHours = (now - recordTime) / (1000 * 60 * 60);

  if (ageInHours < maxAgeHours) {
    const formatted = formatDbRecordToTikTokData(latestRecord);
    formatted.isCached = true;
    formatted.cacheAgeHours = Math.round(ageInHours * 10) / 10;
    return formatted;
  }

  return null;
}

/**
 * Inserts a brand new immutable snapshot row into `tiktok_scrapes` table.
 * Preserves all historical records for analytics.
 */
export async function insertNewTikTokSnapshot(data: TikTokScraperData): Promise<TikTokScraperData> {
  if (!data?.profile?.username) {
    throw new Error('Cannot save TikTok snapshot: missing username.');
  }

  const profile = data.profile;

  const newRecord = await prisma.tikTokScrape.create({
    data: {
      tiktokUsername: profile.username.toLowerCase(),
      nickname: profile.nickname || null,
      biography: profile.biography || null,
      avatarUrl: profile.avatarUrl,
      isVerified: profile.isVerified,
      isCommerceUser: profile.isCommerceUser,
      bioLink: profile.bioLink || null,
      followerCount: BigInt(profile.followerCount || 0),
      followingCount: profile.followingCount || 0,
      heartCount: BigInt(profile.heartCount || 0),
      videoCount: profile.videoCount || 0,
      avgEngagementRate: data.stats.avgEngagementRate || 0,
      videos: JSON.parse(JSON.stringify(data.videos || [])),
      stats: JSON.parse(JSON.stringify(data.stats || {})),
      rawMetadata: JSON.parse(JSON.stringify(data)),
      lastScrapedAt: new Date(),
    },
  });

  console.log(`[TikTok Storage] Inserted new 24h snapshot row for "@${newRecord.tiktokUsername}" (ID: ${newRecord.id})`);

  const formatted = formatDbRecordToTikTokData(newRecord);
  formatted.isCached = false;
  formatted.cacheAgeHours = 0;
  return formatted;
}

/**
 * Formats a Prisma database record into the standard TikTokScraperData structure
 */
export function formatDbRecordToTikTokData(record: {
  id: string;
  tiktokUsername: string;
  nickname: string | null;
  biography: string | null;
  avatarUrl: string;
  isVerified: boolean;
  isCommerceUser: boolean;
  bioLink: string | null;
  followerCount: bigint;
  followingCount: number;
  heartCount: bigint;
  videoCount: number;
  avgEngagementRate: number;
  videos: unknown;
  stats: unknown;
  lastScrapedAt: Date;
  createdAt: Date;
}): TikTokScraperData {
  const followerCount = Number(record.followerCount);
  const heartCount = Number(record.heartCount);

  const videos = (Array.isArray(record.videos)
    ? record.videos
    : []) as TikTokVideoItem[];

  const stats = (record.stats && typeof record.stats === 'object'
    ? record.stats
    : {
        totalVideosFetched: videos.length,
        avgViewsPerVideo: 0,
        avgViewsFormatted: '0',
        avgLikesPerVideo: 0,
        avgLikesFormatted: '0',
        avgCommentsPerVideo: 0,
        avgCommentsFormatted: '0',
        avgSharesPerVideo: 0,
        avgSharesFormatted: '0',
        avgEngagementRate: record.avgEngagementRate || 0,
      }) as TikTokScraperData['stats'];

  const profile: TikTokProfile = {
    username: record.tiktokUsername,
    nickname: record.nickname || record.tiktokUsername,
    biography: record.biography || '',
    avatarUrl: record.avatarUrl,
    isVerified: record.isVerified,
    isCommerceUser: record.isCommerceUser,
    isPrivate: false,
    bioLink: record.bioLink || undefined,
    followerCount,
    followerCountFormatted: formatCompactNumber(followerCount),
    followingCount: record.followingCount,
    followingCountFormatted: formatCompactNumber(record.followingCount),
    heartCount,
    heartCountFormatted: formatCompactNumber(heartCount),
    videoCount: record.videoCount,
    videoCountFormatted: formatCompactNumber(record.videoCount),
  };

  return {
    profile,
    videos,
    stats,
    scrapedAt: record.createdAt.toISOString(),
  };
}
