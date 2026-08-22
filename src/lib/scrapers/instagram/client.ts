import {
  InstagramScraperData,
  InstagramProfile,
  InstagramPostItem,
  InstagramHighlightItem,
  InstagramExternalUrl,
} from '../types';
import {
  extractInstagramUsername,
  formatCompactNumber,
  extractEmailFromBio,
  calculateInstagramStats,
} from './parser';

const BRIGHTDATA_BASE_URL = 'https://api.brightdata.com/datasets/v3/scrape';
const DATASET_PROFILES = 'gd_l1vikfch901nx3by4'; // Bright Data Instagram Profiles & Posts Dataset

/**
 * Scrapes complete Instagram creator profile and recent posts via Bright Data
 */
export async function scrapeInstagram(input: string): Promise<InstagramScraperData> {
  const username = extractInstagramUsername(input);
  if (!username) {
    throw new Error('Invalid Instagram handle or URL. Please provide a valid username (e.g. @mkbhd).');
  }

  const apiKey = process.env.BRIGHTDATA_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Missing BRIGHTDATA_API_KEY in environment variables. Please check your .env configuration.');
  }

  const targetProfileUrl = `https://www.instagram.com/${username}/`;
  console.log(`[Instagram Scraper] Fetching live data for @${username} via Bright Data...`);

  const response = await fetch(`${BRIGHTDATA_BASE_URL}?dataset_id=${DATASET_PROFILES}&include_errors=true&format=json`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      { url: targetProfileUrl }
    ]),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Bright Data API request failed (${response.status} ${response.statusText}): ${errText.slice(0, 200)}`);
  }

  const payload = await response.json();
  const rawItem = Array.isArray(payload) ? payload[0] : payload;

  if (!rawItem || rawItem.error) {
    const msg = rawItem?.error || 'Profile not found or restricted by Instagram.';
    throw new Error(`Failed to scrape @${username}: ${msg}`);
  }

  // 1. Parse Profile Identity & Followers
  const followerCount = Number(rawItem.followers || 0);
  const followingCount = Number(rawItem.following || 0);
  const postsCount = Number(rawItem.posts_count || 0);
  const bio = rawItem.biography || '';

  const externalUrls: InstagramExternalUrl[] = Array.isArray(rawItem.external_urls)
    ? rawItem.external_urls.filter((u: { url?: string }) => Boolean(u?.url))
    : rawItem.external_url
    ? [{ url: rawItem.external_url }]
    : [];

  const highlights: InstagramHighlightItem[] = Array.isArray(rawItem.highlights)
    ? rawItem.highlights.map((h: { id?: string; title?: string; image?: string; highlight_url?: string }) => ({
        id: h.id || '',
        title: h.title || 'Highlight',
        image: h.image,
        highlightUrl: h.highlight_url || '',
      }))
    : [];

  const profile: InstagramProfile = {
    username: rawItem.account || username,
    fullName: rawItem.full_name || rawItem.profile_name || username,
    biography: bio,
    avatarUrl: rawItem.profile_image_link || '',
    isVerified: Boolean(rawItem.is_verified),
    isBusinessAccount: Boolean(rawItem.is_business_account || rawItem.is_professional_account),
    followerCount,
    followerCountFormatted: formatCompactNumber(followerCount),
    followingCount,
    followingCountFormatted: formatCompactNumber(followingCount),
    postsCount,
    postsCountFormatted: formatCompactNumber(postsCount),
    externalUrls,
    highlights,
    extractedEmail: rawItem.email_address || extractEmailFromBio(bio),
    categoryName: rawItem.category_name || rawItem.business_category_name || undefined,
  };

  // 2. Parse 10-12 Recent Posts / Reels
  const rawPosts: Array<Record<string, unknown>> = Array.isArray(rawItem.posts) ? rawItem.posts : [];

  const posts: InstagramPostItem[] = rawPosts.slice(0, 10).map((p, idx) => {
    const postLikes = Number(p.likes || 0);
    const postComments = Number(p.comments || 0);
    const postUrl = (p.url as string) || `https://www.instagram.com/p/${p.id || idx}/`;

    return {
      id: String(p.id || idx),
      url: postUrl,
      caption: (p.caption as string) || undefined,
      contentType: (p.content_type as string) || 'Image',
      datetime: (p.datetime as string) || undefined,
      imageUrl: (p.image_url as string) || '',
      videoUrl: (p.video_url as string) || undefined,
      likes: postLikes,
      likesFormatted: formatCompactNumber(postLikes),
      commentsCount: postComments,
      commentsCountFormatted: formatCompactNumber(postComments),
      isPinned: Boolean(p.is_pinned),
      postHashtags: Array.isArray(p.post_hashtags) ? (p.post_hashtags as string[]) : undefined,
    };
  });

  // 3. Compute Aggregated Stats & Engagement Rate
  const stats = calculateInstagramStats(posts, followerCount);

  return {
    profile,
    posts,
    stats,
    scrapedAt: new Date().toISOString(),
    isCached: false,
    cacheAgeHours: 0,
  };
}
