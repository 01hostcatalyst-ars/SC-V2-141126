import { parseProfileInput } from '@/lib/calculator/profile-input';
import { withCalculatorWork } from '@/lib/calculator/request-guard';
import {
  InstagramScraperData,
  InstagramProfile,
  InstagramPostItem,
  InstagramTaggedUser,
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
 * Universal Bright Data Requester with safe JSON parsing and fast adaptive polling
 */
async function fetchBrightDataWithPolling(
  datasetId: string,
  inputItems: Array<Record<string, unknown>>,
  apiKey: string
): Promise<Array<Record<string, unknown>>> {
  console.log(`[BrightData Engine] Triggering scrape on dataset ${datasetId} for ${inputItems.length} input(s)...`);

  const initialRes = await fetch(`${BRIGHTDATA_BASE_URL}/trigger?dataset_id=${datasetId}&include_errors=true&format=json`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inputItems),
  });

  const rawText = await initialRes.text().catch(() => '');

  if (!initialRes.ok) {
    throw new Error(`Bright Data API request failed (${initialRes.status} ${initialRes.statusText}): ${rawText.slice(0, 200)}`);
  }

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(rawText);
  } catch {
    throw new Error(`Bright Data returned unexpected response: ${rawText.slice(0, 200)}`);
  }

  // 1. Direct Array Response
  if (Array.isArray(rawJson) && rawJson.length > 0 && !rawJson[0]?.snapshot_id) {
    const flat = rawJson.flat(2) as Array<Record<string, unknown>>;
    console.log(`[BrightData Engine] Direct response with ${flat.length} items`);
    return flat;
  }

  // 2. Asynchronous Snapshot Response
  const recordObj = rawJson as Record<string, unknown>;
  const snapshotId =
    (recordObj?.snapshot_id as string) ||
    (Array.isArray(rawJson) && (rawJson[0]?.snapshot_id as string));

  if (!snapshotId) {
    const single = (Array.isArray(rawJson) ? rawJson[0] : rawJson) as Record<string, unknown>;
    return single ? [single] : [];
  }

  console.log(`[BrightData Engine] Async snapshot queued: ${snapshotId}. Fast adaptive polling...`);

  const startTime = Date.now();
  const maxWaitMs = 120000; // 2 minutes max
  let pollInterval = 1200;  // Start at 1.2s

  while (Date.now() - startTime < maxWaitMs) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    pollInterval = Math.min(pollInterval + 300, 2000);

    try {
      const progRes = await fetch(`${BRIGHTDATA_BASE_URL}/progress/${snapshotId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      const progText = await progRes.text();
      let progData: { status?: string } = {};
      try {
        progData = JSON.parse(progText);
      } catch {
        continue;
      }

      if (progData.status === 'ready' || progData.status === 'done') {
        const snapRes = await fetch(`${BRIGHTDATA_BASE_URL}/snapshot/${snapshotId}?format=json`, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        const snapText = await snapRes.text();
        let snapData: unknown = [];
        try {
          snapData = JSON.parse(snapText);
        } catch {
          throw new Error(`Failed to parse completed snapshot data: ${snapText.slice(0, 200)}`);
        }

        const flatSnap = (Array.isArray(snapData) ? snapData.flat(2) : [snapData]) as Array<Record<string, unknown>>;
        console.log(`[BrightData Engine] Snapshot ${snapshotId} completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s with ${flatSnap.length} records!`);
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
 * Scrapes complete Instagram creator profile (Process 1) and enriched 12 posts (Process 2)
 */
async function scrapeInstagramImpl(
  input: string,
  options?: { fastMode?: boolean }
): Promise<InstagramScraperData> {
  const username = extractInstagramUsername(input);
  if (!username) {
    throw new Error('Invalid Instagram handle or URL. Please provide a valid username (e.g. @mkbhd).');
  }

  const apiKey = process.env.BRIGHTDATA_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Missing BRIGHTDATA_API_KEY in environment variables. Please check your .env configuration.');
  }

  const targetProfileUrl = `https://www.instagram.com/${username}/`;
  console.log(`[Instagram Scraper] 1. Fetching complete profile info for @${username}...`);

  // ==========================================
  // PROCESS 1: Profile & Initial Posts
  // ==========================================
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

  const followerCount = Number(rawItem.followers || 0);
  const followingCount = Number(rawItem.following || 0);
  const postsCount = Number(rawItem.posts_count || 0);
  const bio = (rawItem.biography as string) || '';

  const avatarUrl =
    (rawItem.profile_image_link as string) ||
    (rawItem.profile_pic_url as string) ||
    (rawItem.profile_pic_url_hd as string) ||
    (rawItem.image as string) ||
    '';

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

  const bioHashtags: string[] = Array.isArray(rawItem.bio_hashtags)
    ? (rawItem.bio_hashtags as string[])
    : [];

  const profile: InstagramProfile = {
    username: (rawItem.account as string) || username,
    fullName: (rawItem.full_name as string) || (rawItem.profile_name as string) || username,
    userId: rawItem.id ? String(rawItem.id) : undefined,
    fbid: rawItem.fbid ? String(rawItem.fbid) : undefined,
    biography: bio,
    avatarUrl,
    isVerified: Boolean(rawItem.is_verified),
    isBusinessAccount: Boolean(rawItem.is_business_account || rawItem.is_professional_account),
    isPrivate: Boolean(rawItem.is_private),
    isJoinedRecently: Boolean(rawItem.is_joined_recently),
    followerCount,
    followerCountFormatted: formatCompactNumber(followerCount),
    followingCount,
    followingCountFormatted: formatCompactNumber(followingCount),
    postsCount,
    postsCountFormatted: formatCompactNumber(postsCount),
    externalUrls,
    bioHashtags,
    extractedEmail: (rawItem.email_address as string) || extractEmailFromBio(bio),
    businessPhone: (rawItem.contact_phone_number as string) || (rawItem.public_phone_number as string) || (rawItem.business_phone_number as string) || undefined,
    businessAddress: (rawItem.business_address as string) || (rawItem.address_street as string) || undefined,
    city: (rawItem.city_name as string) || (rawItem.city as string) || undefined,
    pronouns: Array.isArray(rawItem.pronouns) ? (rawItem.pronouns as string[]) : (typeof rawItem.pronouns === 'string' ? [rawItem.pronouns] : undefined),
    categoryName: (rawItem.category_name as string) || (rawItem.business_category_name as string) || undefined,
  };

  // ==========================================
  // PROCESS 2: 6 Unpinned Recent Posts Enrichment
  // ==========================================
  const rawPosts = Array.isArray(rawItem.posts) ? (rawItem.posts as Array<Record<string, unknown>>) : [];

  // 3. Detect and exclude pinned posts so only chronological recent uploads are extracted & enriched
  const allPosts: InstagramPostItem[] = rawPosts.map((p, idx) => {
    let postUrl = (p.url as string) || '';
    if (!postUrl && p.id) {
      postUrl = `https://www.instagram.com/p/${p.id}/`;
    }

    const isExplicitlyPinned = Boolean(p.is_pinned || p.pinned);

    return {
      id: String(p.id || idx),
      shortcode: postUrl ? postUrl.split('/p/')[1]?.replace(/\/$/, '') : undefined,
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
      isPinned: isExplicitlyPinned,
      postHashtags: Array.isArray(p.post_hashtags) ? (p.post_hashtags as string[]) : undefined,
    };
  });

  // Detect chronological inversion in top 3 items:
  // On Instagram, pinned posts are placed at indices 0, 1, or 2, but have older upload dates than subsequent uploads.
  for (let i = 0; i < Math.min(3, allPosts.length); i++) {
    const postTime = allPosts[i].datetime ? new Date(allPosts[i].datetime!).getTime() : 0;
    if (postTime > 0) {
      // Check if any subsequent post has a newer timestamp than this post (indicating this post is pinned)
      for (let j = i + 1; j < Math.min(6, allPosts.length); j++) {
        const laterPostTime = allPosts[j].datetime ? new Date(allPosts[j].datetime!).getTime() : 0;
        if (laterPostTime > 0 && (laterPostTime - postTime) > (24 * 60 * 60 * 1000)) {
          allPosts[i].isPinned = true;
          break;
        }
      }
    }
  }

  // Filter out any pinned post so we strictly extract and return unpinned recent uploads
  const unpinnedPosts = allPosts.filter((p) => !p.isPinned).slice(0, 12);

  // Partition unpinned posts by format: prioritize Reels/Videos, then backfill with Carousels/Images
  const unpinnedReels = unpinnedPosts.filter(
    (p) =>
      p.contentType?.toLowerCase() === 'reel' ||
      p.contentType?.toLowerCase() === 'video' ||
      Boolean(p.videoUrl)
  );
  const unpinnedOther = unpinnedPosts.filter(
    (p) =>
      p.contentType?.toLowerCase() !== 'reel' &&
      p.contentType?.toLowerCase() !== 'video' &&
      !p.videoUrl
  );

  // Target 4 candidates: first choice is Reels, backfilled with Carousels/Images if < 4 Reels exist
  const candidatePosts: InstagramPostItem[] = [
    ...unpinnedReels.slice(0, 4),
    ...unpinnedOther.slice(0, Math.max(0, 4 - unpinnedReels.length)),
  ].slice(0, 4);

  if (options?.fastMode) {
    console.log(`[Instagram Scraper] Fast mode enabled: returning Process 1 summary for @${username} in sub-6s.`);
  } else {
    // Enrich the 4 selected candidate posts (Reels prioritized) for exact engagement baseline
    const postUrlsToEnrich = candidatePosts
      .filter((p) => Boolean(p.url))
      .map((p) => ({ url: p.url }));

      if (postUrlsToEnrich.length > 0) {
        try {
          console.log(`[Instagram Scraper] 2. Enriching all metadata for ${postUrlsToEnrich.length} unpinned posts (${unpinnedReels.length} Reels available) via dataset ${DATASET_POSTS}...`);
          
          // 120-second timeout race to ensure reliable Bright Data delivery
          const fetchPromise = fetchBrightDataWithPolling(
            DATASET_POSTS,
            postUrlsToEnrich,
            apiKey
          );
          
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Process 2 timeout')), 120000)
          );

          const enrichedList = await Promise.race([fetchPromise, timeoutPromise]);

          if (Array.isArray(enrichedList)) {
            const metricsMap = new Map<string, Record<string, unknown>>();

            for (const item of enrichedList) {
              if (item) {
                if (item.url) {
                  const cleanUrl = String(item.url).replace(/\/$/, '').toLowerCase();
                  metricsMap.set(cleanUrl, item);
                  metricsMap.set(cleanUrl.replace('://www.', '://'), item);
                }
                const inputObj = item.input as { url?: string } | undefined;
                if (inputObj?.url) {
                  const cleanInput = String(inputObj.url).replace(/\/$/, '').toLowerCase();
                  metricsMap.set(cleanInput, item);
                  metricsMap.set(cleanInput.replace('://www.', '://'), item);
                }
                if (item.shortcode) {
                  metricsMap.set(String(item.shortcode).toLowerCase(), item);
                }
                if (item.content_id) {
                  metricsMap.set(String(item.content_id).toLowerCase(), item);
                }
                if (item.id || item.post_id || item.pk) {
                  metricsMap.set(String(item.id || item.post_id || item.pk).toLowerCase(), item);
                }
              }
            }

            // Merge complete rich metadata into allPosts
            for (let pIdx = 0; pIdx < allPosts.length; pIdx++) {
              const post = allPosts[pIdx];
              const cleanPostUrl = post.url ? post.url.replace(/\/$/, '').toLowerCase() : '';
              const cleanNoWww = cleanPostUrl.replace('://www.', '://');
              const postShortcode = post.shortcode ? post.shortcode.toLowerCase() : '';
              const postId = post.id ? String(post.id).toLowerCase() : '';

              const item = metricsMap.get(cleanPostUrl) || 
                           metricsMap.get(cleanNoWww) ||
                           (postShortcode ? metricsMap.get(postShortcode) : undefined) ||
                           (postId ? metricsMap.get(postId) : undefined);

              if (item) {
                const likes = Number(
                  item.likes ?? item.likes_count ?? item.like_count ?? item.num_likes ?? item.likesCount ?? 0
                );
                const comments = Array.isArray(item.comments)
                  ? item.comments.length
                  : Number(item.num_comments ?? item.comments_count ?? item.comment_count ?? item.comments ?? 0);

                post.likes = likes;
                post.likesFormatted = formatCompactNumber(likes);
                post.commentsCount = comments;
                post.commentsCountFormatted = formatCompactNumber(comments);

                if (item.description || item.caption) {
                  post.caption = (item.description || item.caption) as string;
                }
                if (item.shortcode) {
                  post.shortcode = item.shortcode as string;
                }
                if (item.date_posted || item.datetime) {
                  post.datetime = (item.date_posted || item.datetime) as string;
                }
                if (item.location) {
                  post.location = typeof item.location === 'string' ? item.location : ((item.location as { name?: string })?.name || String(item.location));
                }
                if (Array.isArray(item.hashtags)) {
                  post.postHashtags = item.hashtags as string[];
                }

                // Extract top 5 comments for the sample posts (at zero extra Bright Data credit cost)
                if (Array.isArray(item.comments)) {
                  post.comments = (item.comments as Array<Record<string, unknown>>)
                    .slice(0, 5)
                    .map((c, cIdx) => ({
                      id: String(c.comment_id || c.id || cIdx),
                      authorUsername: (c.user as { username?: string })?.username || (c.owner as { username?: string })?.username || (c.author as string) || undefined,
                      text: (c.comments as string) || (c.text as string) || '',
                      date: (c.date_of_comment as string) || (c.created_at as string) || undefined,
                      likes: Number(c.likes || 0),
                    }))
                    .filter((c) => Boolean(c.text));
                }
              }
            }
          }
        } catch (enrichErr) {
          console.warn('[Instagram Scraper] Note: Could not batch-enrich post metrics:', enrichErr);
        }
      }
    }

  // Compute Aggregated Stats & Engagement Rate on unpinned posts
  const stats = calculateInstagramStats(allPosts, followerCount);

  return {
    profile,
    posts: allPosts,
    stats,
    scrapedAt: new Date().toISOString(),
    isCached: false,
    cacheAgeHours: 0,
  };
}

export async function scrapeInstagram(...args: Parameters<typeof scrapeInstagramImpl>): Promise<Awaited<ReturnType<typeof scrapeInstagramImpl>>> {
 const target = parseProfileInput(args[0], 'instagram');
 args[0] = target.canonical;
 return withCalculatorWork('scrape', target.key, () => scrapeInstagramImpl(...args));
}
