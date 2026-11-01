import { parseProfileInput } from '@/lib/calculator/profile-input';
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
 try { return parseProfileInput(input, 'tiktok').identifier; } catch { return ''; }
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

  // Reset all ER sample flags — parser owns tagging
  videos.forEach((v) => { v.isEnrichedSample = false; });

  // Collect unpinned videos with valid metrics for trimmed mean selection
  const unpinnedWithMetrics = videos.filter(
    (v) => !v.isPinned && ((v.playCount || 0) > 0 || (v.diggCount || 0) > 0)
  );

  // Sort by views (ascending) to identify the middle 4 (trimmed mean approach)
  const sortedByViews = [...unpinnedWithMetrics].sort((a, b) => (a.playCount || 0) - (b.playCount || 0));

  // Select middle 4 videos: discard top & bottom outliers for a stable ER signal
  let sampleVideos: TikTokVideoItem[];
  if (sortedByViews.length >= 4) {
    const skipCount = Math.floor((sortedByViews.length - 4) / 2);
    sampleVideos = sortedByViews.slice(skipCount, skipCount + 4);
  } else {
    // Fewer than 4 valid videos — use whatever we have
    sampleVideos = sortedByViews.length > 0 ? sortedByViews : videos.filter((v) => !v.isPinned);
  }

  // Tag the selected trimmed-mean sample videos for frontend badge display
  sampleVideos.forEach((v) => { v.isEnrichedSample = true; });

  const sampleCount = sampleVideos.length > 0 ? sampleVideos.length : count;
  const targetVideos = sampleVideos.length > 0 ? sampleVideos : videos;

  const totalViews = targetVideos.reduce((acc, v) => acc + (v.playCount || 0), 0);
  const totalLikes = targetVideos.reduce((acc, v) => acc + (v.diggCount || 0), 0);
  const totalComments = targetVideos.reduce((acc, v) => acc + (v.commentCount || 0), 0);
  const totalShares = targetVideos.reduce((acc, v) => acc + (v.shareCount || 0), 0);

  const avgViews = Math.round(totalViews / sampleCount);
  const avgLikes = Math.round(totalLikes / sampleCount);
  const avgComments = Math.round(totalComments / sampleCount);
  const avgShares = Math.round(totalShares / sampleCount);

  let calculatedRate = 0;
  if (avgViews > 0) {
    // Trimmed Mean TikTok ER: (Avg Likes + Avg Comments + Avg Shares) / Avg Views of middle 4 videos
    calculatedRate = ((avgLikes + avgComments + avgShares) / avgViews) * 100;
  } else if (followerCount > 0) {
    calculatedRate = ((avgLikes + avgComments) / followerCount) * 100;
  }

  const finalRate = parseFloat(calculatedRate.toFixed(2));

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
