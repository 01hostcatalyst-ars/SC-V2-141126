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

const BRIGHTDATA_BASE_URL = 'https://api.brightdata.com/datasets/v3';
const DATASET_PROFILES = 'gd_l1vikfch901nx3by4'; // Profiles & Post URLs Dataset
const DATASET_POSTS = 'gd_lk5ns7kz21pck8jpis';   // Posts Details, Likes & Comments Dataset

/**
 * Universal Bright Data Requester with automatic snapshot resolution
 */
async function fetchBrightDataWithPolling(
  datasetId: string,
  inputItems: Array<Record<string, unknown>>,
  apiKey: string
): Promise<Array<Record<string, unknown>>> {
  console.log(`[BrightData Engine] Triggering scrape on dataset ${datasetId} for ${inputItems.length} input(s)...`);

  const initialRes = await fetch(`${BRIGHTDATA_BASE_URL}/scrape?dataset_id=${datasetId}&include_errors=true&format=json`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inputItems),
  });

  if (!initialRes.ok) {
    const errText = await initialRes.text().catch(() => '');
    throw new Error(`Bright Data API request failed (${initialRes.status} ${initialRes.statusText}): ${errText.slice(0, 200)}`);
  }

  const rawJson = await initialRes.json();

  // 1. Direct Array Response
  if (Array.isArray(rawJson) && rawJson.length > 0 && !rawJson[0]?.snapshot_id) {
    const flat = rawJson.flat(2) as Array<Record<string, unknown>>;
    console.log(`[BrightData Engine] Direct response with ${flat.length} items`);
    return flat;
  }

  // 2. Asynchronous Snapshot Response
  const snapshotId =
    rawJson?.snapshot_id ||
    (Array.isArray(rawJson) && rawJson[0]?.snapshot_id);

  if (!snapshotId) {
    const single = (Array.isArray(rawJson) ? rawJson[0] : rawJson) as Record<string, unknown>;
    return single ? [single] : [];
  }

  console.log(`[BrightData Engine] Async snapshot queued: ${snapshotId}. Polling for completion...`);

  const startTime = Date.now();
  const maxWaitMs = 120000; // 2 minutes max

  while (Date.now() - startTime < maxWaitMs) {
    await new Promise((resolve) => setTimeout(resolve, 3500));

    try {
      const progRes = await fetch(`${BRIGHTDATA_BASE_URL}/progress/${snapshotId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      const progData = await progRes.json();

      if (progData.status === 'ready' || progData.status === 'done') {
        const snapRes = await fetch(`${BRIGHTDATA_BASE_URL}/snapshot/${snapshotId}?format=json`, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        const snapData = await snapRes.json();
        const flatSnap = (Array.isArray(snapData) ? snapData.flat(2) : [snapData]) as Array<Record<string, unknown>>;
        console.log(`[BrightData Engine] Snapshot ${snapshotId} completed with ${flatSnap.length} records!`);
        return flatSnap;
      }

      if (progData.status === 'failed') {
        throw new Error(`Bright Data scrape snapshot ${snapshotId} failed: ${JSON.stringify(progData)}`);
      }
    } catch (pollErr: unknown) {
      if (pollErr instanceof Error && pollErr.message.includes('failed')) {
        throw pollErr;
      }
      console.warn(`[BrightData Engine] Polling check for ${snapshotId}...`);
    }
  }

  throw new Error(`Bright Data snapshot ${snapshotId} timed out after 2 minutes.`);
}

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
  console.log(`[Instagram Scraper] 1. Fetching profile info for @${username}...`);

  // 1. Fetch Profile Data with Snapshot Resolver
  const profileRecords = await fetchBrightDataWithPolling(
    DATASET_PROFILES,
    [{ url: targetProfileUrl }],
    apiKey
  );

  const rawItem = profileRecords[0] || {};

  if (!rawItem || rawItem.error) {
    const msg = (rawItem?.error as string) || 'Profile not found or restricted by Instagram.';
    throw new Error(`Failed to scrape @${username}: ${msg}`);
  }

  // 2. Parse Profile Details & Followers
  const followerCount = Number(rawItem.followers || 0);
  const followingCount = Number(rawItem.following || 0);
  const postsCount = Number(rawItem.posts_count || 0);
  const bio = (rawItem.biography as string) || '';

  // Avatar URL resolution across all potential key names
  const avatarUrl =
    (rawItem.profile_image_link as string) ||
    (rawItem.profile_pic_url as string) ||
    (rawItem.profile_pic_url_hd as string) ||
    (rawItem.image as string) ||
    '';

  // External URLs resolution
  let externalUrls: InstagramExternalUrl[] = [];
  if (Array.isArray(rawItem.external_urls)) {
    externalUrls = (rawItem.external_urls as Array<{ title?: string; url?: string }>)
      .filter((u) => Boolean(u?.url))
      .map((u) => ({ title: u.title, url: u.url as string }));
  } else if (Array.isArray(rawItem.external_url)) {
    externalUrls = (rawItem.external_url as string[]).map((u) => ({ url: u }));
  } else if (typeof rawItem.external_url === 'string') {
    externalUrls = [{ url: rawItem.external_url }];
  }

  // Highlights
  const highlights: InstagramHighlightItem[] = Array.isArray(rawItem.highlights)
    ? (rawItem.highlights as Array<Record<string, unknown>>).map((h) => ({
        id: String(h.id || ''),
        title: (h.title as string) || 'Highlight',
        image: (h.image as string) || undefined,
        highlightUrl: (h.highlight_url as string) || '',
      }))
    : [];

  const profile: InstagramProfile = {
    username: (rawItem.account as string) || username,
    fullName: (rawItem.full_name as string) || (rawItem.profile_name as string) || username,
    biography: bio,
    avatarUrl,
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
    extractedEmail: (rawItem.email_address as string) || extractEmailFromBio(bio),
    categoryName: (rawItem.category_name as string) || (rawItem.business_category_name as string) || undefined,
  };

  // 3. Extract Recent Posts (Top 10)
  const rawPosts = Array.isArray(rawItem.posts) ? (rawItem.posts as Array<Record<string, unknown>>).slice(0, 10) : [];

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

  // 4. Batch Enrich Exact Likes & Comments for Posts
  const postUrlsToEnrich = basePosts
    .filter((p) => Boolean(p.url))
    .slice(0, 10)
    .map((p) => ({ url: p.url }));

  if (postUrlsToEnrich.length > 0) {
    try {
      console.log(`[Instagram Scraper] 2. Enriching likes & comments for ${postUrlsToEnrich.length} posts via dataset ${DATASET_POSTS}...`);
      const enrichedList = await fetchBrightDataWithPolling(
        DATASET_POSTS,
        postUrlsToEnrich,
        apiKey
      );

      if (Array.isArray(enrichedList)) {
        const metricsMap = new Map<string, { likes: number; comments: number; description?: string }>();

        for (const item of enrichedList) {
          if (item && item.url) {
            const cleanUrl = (item.url as string).replace(/\/$/, '').toLowerCase();
            metricsMap.set(cleanUrl, {
              likes: Number(item.likes || 0),
              comments: Number(item.num_comments || item.comments || 0),
              description: item.description as string,
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
    } catch (enrichErr) {
      console.warn('[Instagram Scraper] Note: Could not batch-enrich post metrics:', enrichErr);
    }
  }

  // 5. Compute Aggregated Stats & Engagement Rate
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
