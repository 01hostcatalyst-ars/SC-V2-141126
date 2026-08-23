import { TikTokVideoItem } from '../types';

/**
 * Extracts and normalizes a clean TikTok handle from raw input or URL.
 * Handles inputs like:
 * - "@mrbeast" -> "mrbeast"
 * - "mrbeast" -> "mrbeast"
 * - "https://www.tiktok.com/@mrbeast" -> "mrbeast"
 * - "https://tiktok.com/@mrbeast?lang=en" -> "mrbeast"
 */
export function extractTikTokUsername(input: string): string {
  if (!input) return '';

  let clean = input.trim();

  // Strip query params and hashes
  clean = clean.split('?')[0].split('#')[0];

  // Match URL patterns: tiktok.com/@username
  const urlMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([a-zA-Z0-9_.-]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].toLowerCase().replace(/^@/, '');
  }

  // Handle direct handles or @handles
  clean = clean.replace(/^@/, '').replace(/\/$/, '');
  return clean.toLowerCase();
}

/**
 * Formats large integers into compact human-readable strings (e.g. 138.3M, 1.4B, 74.2K).
 */
export function formatCompactNumber(num: number): string {
  if (!num || isNaN(num) || num <= 0) return '0';

  if (num >= 1_000_000_000) {
    const formatted = (num / 1_000_000_000).toFixed(1);
    return formatted.endsWith('.0') ? `${Math.floor(num / 1_000_000_000)}B` : `${formatted}B`;
  }
  if (num >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(1);
    return formatted.endsWith('.0') ? `${Math.floor(num / 1_000_000)}M` : `${formatted}M`;
  }
  if (num >= 1_000) {
    const formatted = (num / 1_000).toFixed(1);
    return formatted.endsWith('.0') ? `${Math.floor(num / 1_000)}K` : `${formatted}K`;
  }

  return num.toLocaleString();
}

/**
 * Calculates aggregated TikTok engagement metrics from recent videos.
 */
export function calculateTikTokStats(
  videos: TikTokVideoItem[],
  followerCount: number,
  reportedRate?: number
) {
  const count = videos.length;

  if (count === 0) {
    return {
      totalVideosFetched: 0,
      avgViewsPerVideo: 0,
      avgViewsFormatted: '0',
      avgLikesPerVideo: 0,
      avgLikesFormatted: '0',
      avgCommentsPerVideo: 0,
      avgCommentsFormatted: '0',
      avgSharesPerVideo: 0,
      avgSharesFormatted: '0',
      avgEngagementRate: reportedRate ? Math.round(reportedRate * 10000) / 100 : 0,
    };
  }

  const totalViews = videos.reduce((acc, v) => acc + (v.playCount || 0), 0);
  const totalLikes = videos.reduce((acc, v) => acc + (v.diggCount || 0), 0);
  const totalComments = videos.reduce((acc, v) => acc + (v.commentCount || 0), 0);
  const totalShares = videos.reduce((acc, v) => acc + (v.shareCount || 0), 0);

  const avgViews = Math.round(totalViews / count);
  const avgLikes = Math.round(totalLikes / count);
  const avgComments = Math.round(totalComments / count);
  const avgShares = Math.round(totalShares / count);

  let calculatedRate = 0;
  if (followerCount > 0 && avgViews > 0) {
    // Standard industry engagement rate for TikTok: (Avg Likes + Avg Comments + Avg Shares) / Avg Views
    calculatedRate = ((avgLikes + avgComments + avgShares) / avgViews) * 100;
  } else if (followerCount > 0) {
    calculatedRate = ((avgLikes + avgComments) / followerCount) * 100;
  }

  const finalRate = reportedRate && reportedRate > 0
    ? Math.round(reportedRate * 10000) / 100
    : Math.round(calculatedRate * 100) / 100;

  return {
    totalVideosFetched: count,
    avgViewsPerVideo: avgViews,
    avgViewsFormatted: formatCompactNumber(avgViews),
    avgLikesPerVideo: avgLikes,
    avgLikesFormatted: formatCompactNumber(avgLikes),
    avgCommentsPerVideo: avgComments,
    avgCommentsFormatted: formatCompactNumber(avgComments),
    avgSharesPerVideo: avgShares,
    avgSharesFormatted: formatCompactNumber(avgShares),
    avgEngagementRate: finalRate,
  };
}
