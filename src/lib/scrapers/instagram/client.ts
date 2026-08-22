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
const DATASET_PROFILES = 'gd_l1vikfch901nx3by4'; // Profiles & Post URLs Dataset
const DATASET_POSTS = 'gd_lk5ns7kz21pck8jpis';   // Posts Details, Likes & Comments Dataset

/**
 * Scrapes complete Instagram creator profile and enriches recent posts with exact likes and comments
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
  console.log(`[Instagram Scraper] 1. Fetching profile info for @${username} via Bright Data...`);

  // 1. Fetch Profile Data
  const profileRes = await fetch(`${BRIGHTDATA_BASE_URL}?dataset_id=${DATASET_PROFILES}&include_errors=true&format=json`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      { url: targetProfileUrl }
    ]),
  });

  if (!profileRes.ok) {
    const errText = await profileRes.text().catch(() => '');
    throw new Error(`Bright Data Profile API request failed (${profileRes.status} ${profileRes.statusText}): ${errText.slice(0, 200)}`);
  }

  const profilePayload = await profileRes.json();
  const rawItem = Array.isArray(profilePayload) ? profilePayload[0] : profilePayload;

  if (!rawItem || rawItem.error) {
    const msg = rawItem?.error || 'Profile not found or restricted by Instagram.';
    throw new Error(`Failed to scrape @${username}: ${msg}`);
  }

  // Parse Profile Identity & Followers
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

  // 2. Extract Recent Posts (Top 10)
  const rawPosts: Array<Record<string, unknown>> = Array.isArray(rawItem.posts) ? rawItem.posts.slice(0, 10) : [];
  
  // Normalize post items
  const basePosts: InstagramPostItem[] = rawPosts.map((p, idx) => {
    let postUrl = (p.url as string) || '';
    if (!postUrl && p.id) {
      postUrl = `https://www.instagram.com/p/${p.id}/`;
    }

    return {
      id: String(p.id || idx),
      url: postUrl,
      caption: (p.caption as string) || undefined,
      contentType: (p.content_type as string) || 'Image',
      datetime: (p.datetime as string) || undefined,
      imageUrl: (p.image_url as string) || '',
      videoUrl: (p.video_url as string) || undefined,
      likes: Number(p.likes || 0),
      likesFormatted: formatCompactNumber(Number(p.likes || 0)),
      commentsCount: Number(p.comments || p.num_comments || 0),
      commentsCountFormatted: formatCompactNumber(Number(p.comments || p.num_comments || 0)),
      isPinned: Boolean(p.is_pinned),
      postHashtags: Array.isArray(p.post_hashtags) ? (p.post_hashtags as string[]) : undefined,
    };
  });

  // 3. Batch Enrich Exact Likes & Comments for Posts
  const postUrlsToEnrich = basePosts
    .filter((p) => Boolean(p.url))
    .slice(0, 10)
    .map((p) => ({ url: p.url }));

  if (postUrlsToEnrich.length > 0) {
    try {
      console.log(`[Instagram Scraper] 2. Enriching likes & comments for ${postUrlsToEnrich.length} posts via dataset ${DATASET_POSTS}...`);
      const postsRes = await fetch(`${BRIGHTDATA_BASE_URL}?dataset_id=${DATASET_POSTS}&include_errors=true&format=json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postUrlsToEnrich),
      });

      if (postsRes.ok) {
        const enrichedList = await postsRes.json();
        if (Array.isArray(enrichedList)) {
          // Create lookup map by clean URL / Shortcode
          const metricsMap = new Map<string, { likes: number; comments: number; description?: string }>();
          
          for (const item of enrichedList) {
            if (item && item.url) {
              const cleanUrl = item.url.replace(/\/$/, '').toLowerCase();
              metricsMap.set(cleanUrl, {
                likes: Number(item.likes || 0),
                comments: Number(item.num_comments || item.comments || 0),
                description: item.description,
              });
            }
          }

          // Merge metrics into basePosts
          for (const post of basePosts) {
            const cleanPostUrl = post.url.replace(/\/$/, '').toLowerCase();
            const metrics = metricsMap.get(cleanPostUrl);
            if (metrics) {
              post.likes = metrics.likes;
              post.likesFormatted = formatCompactNumber(metrics.likes);
              post.commentsCount = metrics.comments;
              post.commentsCountFormatted = formatCompactNumber(metrics.comments);
              if (!post.caption && metrics.description) {
                post.caption = metrics.description;
              }
            }
          }
        }
      }
    } catch (enrichErr) {
      console.warn('[Instagram Scraper] Note: Could not batch-enrich post metrics:', enrichErr);
    }
  }

  // 4. Compute Aggregated Stats & Engagement Rate
  const stats = calculateInstagramStats(basePosts, followerCount);

  return {
    profile,
    posts: basePosts,
    stats,
    scrapedAt: new Date().toISOString(),
    isCached: false,
    cacheAgeHours: 0,
  };
}
