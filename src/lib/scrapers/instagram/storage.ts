import { prisma } from '@/lib/prisma';
import {
  InstagramScraperData,
  InstagramProfile,
  InstagramPostItem,
  InstagramExternalUrl,
} from '../types';
import { extractInstagramUsername, formatCompactNumber, calculateInstagramStats } from './parser';

const CACHE_WINDOW_HOURS = 24;

/**
 * Checks if a valid snapshot already exists in the database within the last 24 hours.
 */
export async function getRecentInstagramSnapshot(
  input: string,
  maxAgeHours: number = CACHE_WINDOW_HOURS
): Promise<InstagramScraperData | null> {
  const username = extractInstagramUsername(input);
  if (!username) return null;

  const latestRecord = await prisma.instagramScrape.findFirst({
    where: {
      instagramUsername: { equals: username, mode: 'insensitive' },
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
    const statsObj = latestRecord.stats as Record<string, unknown> | null;
    const postsArray = (Array.isArray(latestRecord.posts) ? latestRecord.posts : []) as Array<Record<string, unknown>>;
    const hasPostLikes = (Number(statsObj?.avgLikesPerPost) > 0) || (postsArray.length > 0 && Number(postsArray[0]?.likes) > 0);

    // If an account has posts (> 0) but 0 likes were saved because of an earlier timeout, bypass stale 0 cache
    if (hasPostLikes || latestRecord.postsCount === 0 || maxAgeHours > 1000) {
      const formatted = formatDbRecordToInstagramData(latestRecord);
      formatted.isCached = true;
      formatted.cacheAgeHours = Math.round(ageInHours * 10) / 10;
      return formatted;
    }
  }

  return null;
}

/**
 * Inserts a brand new immutable snapshot row into `instagram_scrapes` table.
 * Preserves all historical records for analytics.
 */
export async function insertNewInstagramSnapshot(data: InstagramScraperData): Promise<InstagramScraperData> {
  if (!data?.profile?.username) {
    throw new Error('Cannot save Instagram snapshot: missing username.');
  }

  const profile = data.profile;

  const newRecord = await prisma.instagramScrape.create({
    data: {
      instagramUsername: profile.username.toLowerCase(),
      instagramUserId: profile.userId || null,
      fullName: profile.fullName || null,
      biography: profile.biography || null,
      avatarUrl: profile.avatarUrl,
      isVerified: profile.isVerified,
      isBusinessAccount: profile.isBusinessAccount,
      extractedEmail: profile.extractedEmail || null,
      externalUrls: JSON.parse(JSON.stringify(profile.externalUrls || [])),
      categoryName: profile.categoryName || null,
      followerCount: BigInt(profile.followerCount || 0),
      followingCount: profile.followingCount || 0,
      postsCount: profile.postsCount || 0,
      avgEngagementRate: data.stats.avgEngagementRate || 0,
      posts: JSON.parse(JSON.stringify(data.posts || [])),
      stats: JSON.parse(JSON.stringify(data.stats || {})),
      rawMetadata: JSON.parse(JSON.stringify(data)),
      lastScrapedAt: new Date(),
    },
  });

  console.log(`[Instagram Storage] Inserted new 24h snapshot row for "@${newRecord.instagramUsername}" (ID: ${newRecord.id})`);

  const formatted = formatDbRecordToInstagramData(newRecord);
  formatted.isCached = false;
  formatted.cacheAgeHours = 0;
  return formatted;
}

/**
 * Formats a Prisma database record into the standard InstagramScraperData structure
 */
export function formatDbRecordToInstagramData(record: {
  id: string;
  instagramUsername: string;
  instagramUserId: string | null;
  fullName: string | null;
  biography: string | null;
  avatarUrl: string;
  isVerified: boolean;
  isBusinessAccount: boolean;
  extractedEmail: string | null;
  externalUrls: unknown;
  categoryName: string | null;
  followerCount: bigint;
  followingCount: number;
  postsCount: number;
  avgEngagementRate: number;
  posts: unknown;
  stats: unknown;
  lastScrapedAt: Date;
  createdAt: Date;
}): InstagramScraperData {
  const followerCount = Number(record.followerCount);

  const externalUrls = (Array.isArray(record.externalUrls)
    ? record.externalUrls
    : []) as InstagramExternalUrl[];

  const posts = (Array.isArray(record.posts)
    ? record.posts
    : []) as InstagramPostItem[];

  let stats = (record.stats && typeof record.stats === 'object'
    ? { ...(record.stats as Record<string, unknown>) }
    : {
        totalPostsFetched: posts.length,
        avgLikesPerPost: 0,
        avgLikesFormatted: '0',
        avgCommentsPerPost: 0,
        avgCommentsFormatted: '0',
        avgEngagementRate: record.avgEngagementRate || 0,
      }) as unknown as InstagramScraperData['stats'];

  const unpinnedPosts = posts.filter((p) => !p.isPinned);
  const targetPosts = unpinnedPosts.length > 0 ? unpinnedPosts.slice(0, 12) : posts.slice(0, 12);

  // Dynamically recompute stats using trimmed mean (middle 4 posts by engagement) — also tags isEnrichedSample
  if (targetPosts.length > 0) {
    const recalculatedStats = calculateInstagramStats(targetPosts, followerCount);
    if (recalculatedStats.avgLikesPerPost > 0 || recalculatedStats.avgCommentsPerPost > 0) {
      stats = recalculatedStats;
    }
  }

  const rawData = record as unknown as { rawMetadata?: { profile?: Partial<InstagramProfile> } };
  const rawProfile = rawData.rawMetadata?.profile;

  const profile: InstagramProfile = {
    username: record.instagramUsername,
    fullName: record.fullName || record.instagramUsername,
    userId: record.instagramUserId || rawProfile?.userId || undefined,
    fbid: rawProfile?.fbid || undefined,
    biography: record.biography || '',
    avatarUrl: record.avatarUrl,
    isVerified: record.isVerified,
    isBusinessAccount: record.isBusinessAccount,
    isPrivate: Boolean(rawProfile?.isPrivate),
    isJoinedRecently: Boolean(rawProfile?.isJoinedRecently),
    followerCount,
    followerCountFormatted: formatCompactNumber(followerCount),
    followingCount: record.followingCount,
    followingCountFormatted: formatCompactNumber(record.followingCount),
    postsCount: record.postsCount,
    postsCountFormatted: formatCompactNumber(record.postsCount),
    externalUrls,
    bioHashtags: rawProfile?.bioHashtags || [],
    extractedEmail: record.extractedEmail || undefined,
    businessPhone: rawProfile?.businessPhone || undefined,
    businessAddress: rawProfile?.businessAddress || undefined,
    city: rawProfile?.city || undefined,
    pronouns: rawProfile?.pronouns || undefined,
    categoryName: record.categoryName || undefined,
  };

  return {
    profile,
    posts: targetPosts,
    stats,
    snapshotId: record.id,
    scrapedAt: record.createdAt.toISOString(),
  };
}
