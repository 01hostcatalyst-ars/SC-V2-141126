import {
  TikTokScraperData,
  TikTokProfile,
  TikTokVideoItem,
} from '../types';
import {
  extractTikTokUsername,
  formatCompactNumber,
  calculateTikTokStats,
} from './parser';

const BRIGHTDATA_BASE_URL = 'https://api.brightdata.com/datasets/v3';
const DATASET_TIKTOK = 'gd_l1villgoiiidt09ci'; // TikTok Profiles & Top Videos Dataset

/**
 * Universal Bright Data Requester with safe JSON parsing and fast adaptive polling
 */
async function fetchBrightDataWithPolling(
  datasetId: string,
  inputItems: Array<Record<string, unknown>>,
  apiKey: string
): Promise<Array<Record<string, unknown>>> {
  console.log(`[TikTok Scraper] Triggering scrape on dataset ${datasetId} for ${inputItems.length} input(s)...`);

  const initialRes = await fetch(`${BRIGHTDATA_BASE_URL}/scrape?dataset_id=${datasetId}&include_errors=true&format=json`, {
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
    console.log(`[TikTok Scraper] Direct response with ${flat.length} items`);
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

  console.log(`[TikTok Scraper] Async snapshot queued: ${snapshotId}. Fast adaptive polling...`);

  const startTime = Date.now();
  const maxWaitMs = 120000; // 2 minutes max
  let pollInterval = 1200;  // Start at 1.2s for ultra-fast response

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
        console.log(`[TikTok Scraper] Snapshot ${snapshotId} completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s with ${flatSnap.length} records!`);
        return flatSnap;
      }

      if (progData.status === 'failed') {
        throw new Error(`Bright Data scrape snapshot ${snapshotId} failed: ${JSON.stringify(progData)}`);
      }
    } catch (pollErr: unknown) {
      if (pollErr instanceof Error && pollErr.message.includes('failed')) {
        throw pollErr;
      }
      console.warn(`[TikTok Scraper] Polling check for ${snapshotId}...`);
    }
  }

  throw new Error(`Bright Data snapshot ${snapshotId} timed out after 2 minutes.`);
}

/**
 * Scrapes complete TikTok creator profile and recent video analytics
 */
export async function scrapeTikTok(input: string): Promise<TikTokScraperData> {
  const username = extractTikTokUsername(input);
  if (!username) {
    throw new Error('Invalid TikTok handle or URL. Please provide a valid username (e.g. @mrbeast).');
  }

  const apiKey = process.env.BRIGHTDATA_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Missing BRIGHTDATA_API_KEY in environment variables. Please check your .env configuration.');
  }

  const targetProfileUrl = `https://www.tiktok.com/@${username}`;
  console.log(`[TikTok Scraper] Fetching complete TikTok data for @${username}...`);

  const results = await fetchBrightDataWithPolling(
    DATASET_TIKTOK,
    [{ url: targetProfileUrl }],
    apiKey
  );

  const rawItem = results[0] || {};

  if (!rawItem || rawItem.error) {
    const msg = (rawItem?.error as string) || 'TikTok creator profile not found or restricted.';
    throw new Error(`Failed to scrape TikTok creator @${username}: ${msg}`);
  }

  const followerCount = Number(rawItem.followers || rawItem.follower_count || 0);
  const followingCount = Number(rawItem.following || rawItem.following_count || 0);
  const heartCount = Number(rawItem.likes || rawItem.heart_count || rawItem.likes_count || 0);
  const videoCount = Number(rawItem.videos_count || rawItem.posts_count || 0);
  const bio = (rawItem.biography as string) || (rawItem.signature as string) || '';

  const avatarUrl =
    (rawItem.profile_pic_url_hd as string) ||
    (rawItem.profile_pic_url as string) ||
    (rawItem.avatar as string) ||
    (rawItem.profile_image_link as string) ||
    '';

  const profile: TikTokProfile = {
    username: (rawItem.account_id as string) || username,
    nickname: (rawItem.nickname as string) || (rawItem.name as string) || username,
    biography: bio,
    avatarUrl,
    isVerified: Boolean(rawItem.is_verified || rawItem.verified),
    isCommerceUser: Boolean(rawItem.is_commerce_user),
    isPrivate: Boolean(rawItem.is_private),
    bioLink: (rawItem.bio_link as string) || undefined,
    followerCount,
    followerCountFormatted: formatCompactNumber(followerCount),
    followingCount,
    followingCountFormatted: formatCompactNumber(followingCount),
    heartCount,
    heartCountFormatted: formatCompactNumber(heartCount),
    videoCount,
    videoCountFormatted: formatCompactNumber(videoCount),
    createTime: (rawItem.create_time as string) || undefined,
  };

  // Extract Top Videos & Descriptions (up to 15 items)
  const topVideos = Array.isArray(rawItem.top_videos) ? (rawItem.top_videos as Array<Record<string, unknown>>) : [];
  const topPostsData = Array.isArray(rawItem.top_posts_data) ? (rawItem.top_posts_data as Array<Record<string, unknown>>) : [];

  const postDescMap = new Map<string, string>();
  for (const p of topPostsData) {
    if (p.video_id || p.post_id) {
      const vid = String(p.video_id || p.post_id);
      postDescMap.set(vid, (p.description as string) || '');
    }
  }

  const allVideos: TikTokVideoItem[] = topVideos.map((v, idx) => {
    const videoId = String(v.video_id || v.id || idx);
    const videoUrl = (v.video_url as string) || `https://www.tiktok.com/@${profile.username}/video/${videoId}`;
    const playCount = Number(v.playcount || v.views || 0);
    const diggCount = Number(v.diggcount || v.likes || 0);
    const commentCount = Number(v.commentcount || v.comments || 0);
    const shareCount = Number(v.share_count || v.shares || 0);
    const favoritesCount = Number(v.favorites_count || v.saves || 0);

    const description = postDescMap.get(videoId) || (v.description as string) || '';
    const isExplicitlyPinned = Boolean(v.is_pinned || v.pinned || v.is_top || v.is_pinned_item);

    return {
      id: videoId,
      url: videoUrl,
      description,
      coverImage: (v.cover_image as string) || (v.thumbnail as string) || '',
      playCount,
      playCountFormatted: formatCompactNumber(playCount),
      diggCount,
      diggCountFormatted: formatCompactNumber(diggCount),
      commentCount,
      commentCountFormatted: formatCompactNumber(commentCount),
      shareCount,
      shareCountFormatted: formatCompactNumber(shareCount),
      favoritesCount,
      favoritesCountFormatted: formatCompactNumber(favoritesCount),
      createDate: (v.create_date as string) || undefined,
      postType: 'video',
      isPinned: isExplicitlyPinned,
    };
  });

  // Detect chronological inversion in top items (TikTok places older pinned videos at the top of the feed)
  for (let i = 0; i < Math.min(3, allVideos.length - 1); i++) {
    const currentVideoTime = allVideos[i].createDate ? new Date(allVideos[i].createDate!).getTime() : 0;
    const nextVideoTime = allVideos[i + 1].createDate ? new Date(allVideos[i + 1].createDate!).getTime() : 0;
    if (currentVideoTime > 0 && nextVideoTime > 0 && (nextVideoTime - currentVideoTime) > (5 * 24 * 60 * 60 * 1000)) {
      allVideos[i].isPinned = true;
    }
  }

  // Filter out any pinned videos so we strictly process and return unpinned recent uploads
  const unpinnedVideos = allVideos.filter((v) => !v.isPinned).slice(0, 15);

  const reportedRate = typeof rawItem.awg_engagement_rate === 'number' ? rawItem.awg_engagement_rate : undefined;
  const stats = calculateTikTokStats(unpinnedVideos, followerCount, reportedRate);

  return {
    profile,
    videos: unpinnedVideos,
    stats,
    scrapedAt: new Date().toISOString(),
    isCached: false,
    cacheAgeHours: 0,
  };
}
