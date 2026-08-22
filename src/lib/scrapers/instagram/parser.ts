import { InstagramPostItem, InstagramScraperData } from '../types';

/**
 * Extracts clean Instagram username from URL or handle input
 */
export function extractInstagramUsername(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();

  // If already pure username or @username
  if (!trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed.replace(/^@/, '').toLowerCase();
  }

  try {
    // Check if it's a URL
    let urlStr = trimmed;
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      urlStr = `https://${urlStr}`;
    }

    const url = new URL(urlStr);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    if (pathSegments.length > 0) {
      // Handle /p/postId or /reel/reelId or /stories/username/...
      if (pathSegments[0] === 'stories' && pathSegments.length > 1) {
        return pathSegments[1].replace(/^@/, '').toLowerCase();
      }
      if (pathSegments[0] !== 'p' && pathSegments[0] !== 'reel' && pathSegments[0] !== 'reels') {
        return pathSegments[0].replace(/^@/, '').toLowerCase();
      }
    }
  } catch {
    // Fallback regex
  }

  const match = trimmed.match(/(?:instagram\.com\/)(?:@)?([a-zA-Z0-9._]+)/i);
  if (match) {
    return match[1].toLowerCase();
  }

  return trimmed.replace(/^@/, '').replace(/[^a-zA-Z0-9._]/g, '').toLowerCase();
}

/**
 * Compact number formatter (e.g. 5,192,315 -> 5.19M, 1,250 -> 1.3K)
 */
export function formatCompactNumber(num: number): string {
  if (!num || isNaN(num)) return '0';
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

/**
 * Parses public business email from bio text
 */
export function extractEmailFromBio(bio: string): string | undefined {
  if (!bio) return undefined;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const match = bio.match(emailRegex);
  return match ? match[1].toLowerCase() : undefined;
}

/**
 * Calculates aggregated metrics and average engagement rate
 */
export function calculateInstagramStats(
  posts: InstagramPostItem[],
  followerCount: number
): InstagramScraperData['stats'] {
  if (!posts || posts.length === 0) {
    return {
      totalPostsFetched: 0,
      avgLikesPerPost: 0,
      avgLikesFormatted: '0',
      avgCommentsPerPost: 0,
      avgCommentsFormatted: '0',
      avgEngagementRate: 0,
    };
  }

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);

  const avgLikes = Math.round(totalLikes / posts.length);
  const avgComments = Math.round(totalComments / posts.length);

  // Engagement Rate = ((Average Likes + Average Comments) / Followers) * 100
  let avgEngagementRate = 0;
  if (followerCount > 0) {
    avgEngagementRate = ((avgLikes + avgComments) / followerCount) * 100;
    avgEngagementRate = Math.round(avgEngagementRate * 100) / 100; // Round to 2 decimals
  }

  return {
    totalPostsFetched: posts.length,
    avgLikesPerPost: avgLikes,
    avgLikesFormatted: formatCompactNumber(avgLikes),
    avgCommentsPerPost: avgComments,
    avgCommentsFormatted: formatCompactNumber(avgComments),
    avgEngagementRate,
  };
}
