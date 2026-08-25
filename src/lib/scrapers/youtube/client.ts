import {
  YouTubeScraperData,
  YouTubeChannelProfile,
  YouTubeVideoItem,
  YouTubeCommentItem,
} from '../types';
import {
  extractYouTubeIdentifier,
  parseYouTubeDuration,
  formatCompactNumber,
  extractEmailFromText,
  extractOfficialProfileLinks,
} from './parser';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

function getApiKey(): string {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not configured in server environment variables.');
  }
  return apiKey;
}

interface RawYouTubeChannel {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    customUrl?: string;
    publishedAt?: string;
    country?: string;
    thumbnails?: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
  statistics?: {
    subscriberCount?: string;
    viewCount?: string;
    videoCount?: string;
    hiddenSubscriberCount?: boolean;
  };
  brandingSettings?: {
    image?: {
      bannerExternalUrl?: string;
    };
    channel?: {
      keywords?: string;
    };
  };
  topicDetails?: {
    topicCategories?: string[];
  };
  contentDetails?: {
    relatedPlaylists?: {
      uploads?: string;
    };
  };
}

interface RawPlaylistItem {
  contentDetails?: {
    videoId?: string;
  };
}

interface RawVideoItem {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    tags?: string[];
    thumbnails?: {
      maxres?: { url: string };
      standard?: { url: string };
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
  contentDetails?: {
    duration?: string;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

interface RawCommentThread {
  id: string;
  snippet?: {
    topLevelComment?: {
      id?: string;
      snippet?: {
        authorDisplayName?: string;
        authorProfileImageUrl?: string;
        authorChannelUrl?: string;
        textDisplay?: string;
        likeCount?: number;
        publishedAt?: string;
      };
    };
  };
}

/**
 * Core YouTube Scraper function
 */
export async function scrapeYouTube(inputUrl: string): Promise<YouTubeScraperData> {
  const apiKey = getApiKey();
  const parsedInput = extractYouTubeIdentifier(inputUrl);

  if (parsedInput.type === 'unknown' || !parsedInput.value) {
    throw new Error(`Invalid YouTube URL or handle provided: "${inputUrl}"`);
  }

  let channelId = '';
  let handle = '';
  let username = '';

  // If user provided a video URL, resolve its channel ID first
  if (parsedInput.type === 'videoId') {
    const videoUrl = `${BASE_URL}/videos?part=snippet&id=${parsedInput.value}&key=${apiKey}`;
    const vRes = await fetch(videoUrl);
    const vData = await vRes.json();

    if (vData.error) {
      throw new Error(`YouTube API Error: ${vData.error.message || JSON.stringify(vData.error)}`);
    }

    const item = vData.items?.[0];
    if (!item || !item.snippet?.channelId) {
      throw new Error(`Could not find channel for video ID "${parsedInput.value}"`);
    }
    channelId = item.snippet.channelId;
  } else if (parsedInput.type === 'channelId') {
    channelId = parsedInput.value;
  } else if (parsedInput.type === 'handle') {
    handle = parsedInput.value;
  } else if (parsedInput.type === 'username') {
    username = parsedInput.value;
  }

  // 1. Fetch Channel Details
  let channelQueryParam = '';
  if (handle) {
    channelQueryParam = `forHandle=${encodeURIComponent(handle)}`;
  } else if (channelId) {
    channelQueryParam = `id=${encodeURIComponent(channelId)}`;
  } else if (username) {
    channelQueryParam = `forUsername=${encodeURIComponent(username)}`;
  }

  const channelUrl = `${BASE_URL}/channels?part=snippet,contentDetails,statistics,brandingSettings,topicDetails&${channelQueryParam}&key=${apiKey}`;
  const chRes = await fetch(channelUrl);
  const chData = await chRes.json();

  if (chData.error) {
    throw new Error(`YouTube API Error: ${chData.error.message || JSON.stringify(chData.error)}`);
  }

  let rawChannel: RawYouTubeChannel | undefined = chData.items?.[0];

  // Fallback: If forHandle didn't find anything, try searching by handle as username
  if (!rawChannel && handle) {
    const fallbackUrl = `${BASE_URL}/channels?part=snippet,contentDetails,statistics,brandingSettings,topicDetails&forUsername=${encodeURIComponent(handle)}&key=${apiKey}`;
    const fbRes = await fetch(fallbackUrl);
    const fbData = await fbRes.json();
    rawChannel = fbData.items?.[0];
  }

  if (!rawChannel) {
    throw new Error(`No YouTube channel found matching "${inputUrl}". Please check the handle or link.`);
  }

  const subscriberCount = parseInt(rawChannel.statistics?.subscriberCount || '0', 10);
  const lifetimeViewCount = parseInt(rawChannel.statistics?.viewCount || '0', 10);
  const videoCount = parseInt(rawChannel.statistics?.videoCount || '0', 10);
  const avgViewsPerVideo = videoCount > 0 ? Math.round(lifetimeViewCount / videoCount) : 0;

  const description = rawChannel.snippet?.description || '';
  const extractedEmail = extractEmailFromText(description);

  // Optional: Fetch public channel page for rich custom header links
  let rawPageHtml = '';
  try {
    const targetHandle = rawChannel.snippet?.customUrl || handle || rawChannel.id;
    const pageUrl = targetHandle.startsWith('@')
      ? `https://www.youtube.com/${targetHandle}`
      : `https://www.youtube.com/@${targetHandle}`;
    const pageRes = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    if (pageRes.ok) {
      rawPageHtml = await pageRes.text();
    }
  } catch {
    // Graceful fallback to description links only
  }

  const externalLinks = extractOfficialProfileLinks(rawPageHtml);

  // Also parse channel description for any direct Instagram or TikTok URLs
  if (description) {
    const igMatch = description.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/i);
    if (igMatch && !externalLinks.some(l => l.domain?.includes('instagram.com') || l.url?.includes('instagram.com'))) {
      externalLinks.push({
        title: 'Instagram',
        url: `https://www.instagram.com/${igMatch[1].replace(/\/$/, '')}`,
        domain: 'instagram.com',
      });
    }
    const ttMatch = description.match(/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?([a-zA-Z0-9._]+)/i);
    if (ttMatch && !externalLinks.some(l => l.domain?.includes('tiktok.com') || l.url?.includes('tiktok.com'))) {
      externalLinks.push({
        title: 'TikTok',
        url: `https://www.tiktok.com/@${ttMatch[1].replace(/\/$/, '')}`,
        domain: 'tiktok.com',
      });
    }
  }

  const uploadsPlaylistId = rawChannel.contentDetails?.relatedPlaylists?.uploads || '';

  const channelProfile: YouTubeChannelProfile = {
    id: rawChannel.id,
    title: rawChannel.snippet?.title || 'Unknown Channel',
    customUrl: rawChannel.snippet?.customUrl,
    handle: rawChannel.snippet?.customUrl || (handle ? `@${handle}` : undefined),
    description,
    publishedAt: rawChannel.snippet?.publishedAt || '',
    country: rawChannel.snippet?.country,
    avatarUrl:
      rawChannel.snippet?.thumbnails?.high?.url ||
      rawChannel.snippet?.thumbnails?.medium?.url ||
      rawChannel.snippet?.thumbnails?.default?.url ||
      '',
    bannerUrl: rawChannel.brandingSettings?.image?.bannerExternalUrl,
    subscriberCount,
    subscriberCountFormatted: formatCompactNumber(subscriberCount),
    lifetimeViewCount,
    lifetimeViewCountFormatted: formatCompactNumber(lifetimeViewCount),
    videoCount,
    avgViewsPerVideo,
    keywords: rawChannel.brandingSettings?.channel?.keywords
      ? rawChannel.brandingSettings.channel.keywords.split(/\s+/).filter(Boolean)
      : undefined,
    topicCategories: rawChannel.topicDetails?.topicCategories?.map(url => {
      const parts = url.split('/');
      return decodeURIComponent(parts[parts.length - 1] || url).replace(/_/g, ' ');
    }),
    extractedEmail,
    externalLinks,
    uploadsPlaylistId,
  };

  // 2. Fetch Uploaded Videos with Pagination to ALWAYS collect 10 Long & 10 Shorts
  const longVideos: YouTubeVideoItem[] = [];
  const shortVideos: YouTubeVideoItem[] = [];

  if (uploadsPlaylistId) {
    let pageToken = '';
    let pagesFetched = 0;
    const maxPages = 4; // Fetch up to 200 items maximum to find 10 long & 10 shorts

    while ((longVideos.length < 10 || shortVideos.length < 10) && pagesFetched < maxPages) {
      pagesFetched++;
      const pageParam = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '';
      const plUrl = `${BASE_URL}/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50${pageParam}&key=${apiKey}`;
      const plRes = await fetch(plUrl);
      const plData = await plRes.json();

      const rawPlaylistItems: RawPlaylistItem[] = plData.items || [];
      if (rawPlaylistItems.length === 0) break;

      const videoIds = rawPlaylistItems
        .map(item => item.contentDetails?.videoId)
        .filter((id): id is string => Boolean(id));

      if (videoIds.length > 0) {
        // Query video stats and duration in one batch
        const vUrl = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(',')}&key=${apiKey}`;
        const vRes = await fetch(vUrl);
        const vData = await vRes.json();

        const rawVideos: RawVideoItem[] = vData.items || [];

        for (const item of rawVideos) {
          const dur = parseYouTubeDuration(item.contentDetails?.duration);
          const thumbs = item.snippet?.thumbnails;
          const bestThumb =
            thumbs?.maxres?.url ||
            thumbs?.standard?.url ||
            thumbs?.high?.url ||
            thumbs?.medium?.url ||
            thumbs?.default?.url ||
            '';

          const videoObj: YouTubeVideoItem = {
            id: item.id,
            title: item.snippet?.title || 'Untitled',
            description: item.snippet?.description || '',
            publishedAt: item.snippet?.publishedAt || '',
            thumbnailUrl: bestThumb,
            durationIso: item.contentDetails?.duration || '',
            durationSeconds: dur.seconds,
            durationFormatted: dur.formatted,
            viewCount: parseInt(item.statistics?.viewCount || '0', 10),
            likeCount: parseInt(item.statistics?.likeCount || '0', 10),
            commentCount: parseInt(item.statistics?.commentCount || '0', 10),
            tags: item.snippet?.tags,
            url: `https://www.youtube.com/watch?v=${item.id}`,
            comments: [],
          };

          // Shorts: duration <= 60 seconds
          if (dur.seconds <= 60 && shortVideos.length < 10) {
            shortVideos.push(videoObj);
          } else if (dur.seconds > 60 && longVideos.length < 10) {
            longVideos.push(videoObj);
          }

          if (longVideos.length >= 10 && shortVideos.length >= 10) {
            break;
          }
        }
      }

      pageToken = plData.nextPageToken;
      if (!pageToken) break; // Reached end of channel's uploads
    }
  }

  // 3. Fetch Top 5 Comments for the 3 Most Recent Long-Form Videos
  for (let i = 0; i < Math.min(3, longVideos.length); i++) {
    const vid = longVideos[i];
    try {
      const cUrl = `${BASE_URL}/commentThreads?part=snippet&videoId=${vid.id}&maxResults=5&order=time&key=${apiKey}`;
      const cRes = await fetch(cUrl);
      const cData = await cRes.json();

      if (cData.items) {
        vid.comments = (cData.items as RawCommentThread[]).map(c => {
          const top = c.snippet?.topLevelComment?.snippet;
          return {
            id: c.id,
            authorDisplayName: top?.authorDisplayName || 'Anonymous',
            authorProfileImageUrl: top?.authorProfileImageUrl,
            authorChannelUrl: top?.authorChannelUrl,
            textDisplay: top?.textDisplay || '',
            likeCount: top?.likeCount || 0,
            publishedAt: top?.publishedAt || '',
          };
        });
      }
    } catch {
      vid.comments = [];
    }
  }

  // 4. Fetch Top 5 Comments for the 3 Most Recent Shorts
  for (let i = 0; i < Math.min(3, shortVideos.length); i++) {
    const vid = shortVideos[i];
    try {
      const cUrl = `${BASE_URL}/commentThreads?part=snippet&videoId=${vid.id}&maxResults=5&order=time&key=${apiKey}`;
      const cRes = await fetch(cUrl);
      const cData = await cRes.json();

      if (cData.items) {
        vid.comments = (cData.items as RawCommentThread[]).map(c => {
          const top = c.snippet?.topLevelComment?.snippet;
          return {
            id: c.id,
            authorDisplayName: top?.authorDisplayName || 'Anonymous',
            authorProfileImageUrl: top?.authorProfileImageUrl,
            authorChannelUrl: top?.authorChannelUrl,
            textDisplay: top?.textDisplay || '',
            likeCount: top?.likeCount || 0,
            publishedAt: top?.publishedAt || '',
          };
        });
      }
    } catch {
      vid.comments = [];
    }
  }

  // 5. Aggregate Analytics
  const totalLongViews = longVideos.reduce((sum, v) => sum + v.viewCount, 0);
  const avgLongVideoViews = longVideos.length > 0 ? Math.round(totalLongViews / longVideos.length) : 0;

  const totalShortViews = shortVideos.reduce((sum, v) => sum + v.viewCount, 0);
  const avgShortVideoViews = shortVideos.length > 0 ? Math.round(totalShortViews / shortVideos.length) : 0;

  const avgLongEngagementRate =
    totalLongViews > 0
      ? (longVideos.reduce((sum, v) => sum + v.likeCount + v.commentCount, 0) / totalLongViews) * 100
      : 0;

  const avgShortEngagementRate =
    totalShortViews > 0
      ? (shortVideos.reduce((sum, v) => sum + v.likeCount + v.commentCount, 0) / totalShortViews) * 100
      : 0;

  return {
    channel: channelProfile,
    longVideos,
    shortVideos,
    stats: {
      totalLongVideosFetched: longVideos.length,
      totalShortVideosFetched: shortVideos.length,
      avgLongVideoViews,
      avgShortVideoViews,
      avgLongEngagementRate: parseFloat(avgLongEngagementRate.toFixed(2)),
      avgShortEngagementRate: parseFloat(avgShortEngagementRate.toFixed(2)),
    },
    scrapedAt: new Date().toISOString(),
  };
}
