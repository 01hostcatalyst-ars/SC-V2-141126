import { NextRequest, NextResponse } from 'next/server';
import { YouTubeScraper, InstagramScraper, TikTokScraper } from '@/lib/scrapers';
import { generateCompleteCreatorIntelligence, MultiPlatformCreatorInput } from '@/lib/ai/gemini';
import { getRecentCreatorIntelligence } from '@/lib/ai/storage';
import { calculateInfluencerRate, roundCommercial } from '@/lib/calculator/engine';
import { prisma } from '@/lib/prisma';
import {
  PricingInput,
  DeliverableFormat,
  Platform,
  RegionCode,
} from '@/lib/calculator/types';
import {
  FORMAT_LABELS,
  REGIONAL_CONFIG,
  PRIMARY_NICHES,
  SUB_NICHES,
} from '@/lib/calculator/constants';
import {
  generateOmnichannelPackages,
  PlatformMetricsInput,
  GeneratedPackage,
} from '@/lib/calculator/packages';
import { upsertCreatorIdentityCluster, generateCreatorSlug } from '@/lib/creators/identity';
import { unrollAggregatorLinks, isLinkAggregatorUrl } from '@/lib/scrapers/linktree';

// 30-Day Cache Window for Batch Ingest (30 days * 24 hours = 720 hours)
// If profile data is available in the database within 30 days, do not scrape again.
const CACHE_WINDOW_HOURS = 30 * 24; // 720 hours

function normalizePlatform(raw: string): Platform {
  const p = (raw || '').toLowerCase().trim();
  if (p === 'yt' || p === 'youtube') return 'youtube';
  if (p === 'tt' || p === 'tiktok') return 'tiktok';
  return 'instagram';
}

function cleanHandle(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let cleaned = raw.trim();

  // If full URL was provided, extract the core handle segment
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.includes('.com/')) {
    try {
      const urlStr = cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
      const parsed = new URL(urlStr);
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        if (segments[0] === 'channel' || segments[0] === 'c' || segments[0] === 'user') {
          cleaned = segments[1] || segments[0];
        } else {
          cleaned = segments[0];
        }
      }
    } catch {
      // Fallback regex
    }
  }

  // Strip URL prefixes if remaining
  cleaned = cleaned.replace(/^https?:\/\/(?:www\.)?(?:instagram\.com|youtube\.com|tiktok\.com)\/?(?:@|channel\/|c\/|user\/)?/i, '');
  // Strip trailing subpaths (/videos, /shorts, /reels), query params (?si=...), and hash
  cleaned = cleaned.split('/')[0].split('?')[0].split('#')[0];
  return cleaned.replace(/^@+/, '').replace(/\/+$/, '').trim().toLowerCase();
}

function extractYouTubeComments(longVideos: any[] = [], shortVideos: any[] = []): string[] {
  const all = [...longVideos, ...shortVideos];
  const comments: string[] = [];
  for (const v of all.slice(0, 5)) {
    if (Array.isArray(v.comments)) {
      for (const c of v.comments.slice(0, 5)) {
        if (c.textDisplay) comments.push(c.textDisplay);
      }
    }
  }
  return comments.slice(0, 15);
}

function extractInstagramComments(posts: any[] = []): string[] {
  const comments: string[] = [];
  for (const p of posts.slice(0, 4)) {
    if (Array.isArray(p.comments)) {
      for (const c of p.comments.slice(0, 5)) {
        if (c.text) comments.push(c.text);
      }
    }
  }
  return comments.slice(0, 12);
}

function extractTikTokComments(videos: any[] = []): string[] {
  const comments: string[] = [];
  for (const v of videos.slice(0, 5)) {
    if (Array.isArray(v.comments)) {
      for (const c of v.comments.slice(0, 5)) {
        if (c.text) comments.push(c.text);
      }
    }
  }
  return comments.slice(0, 12);
}

function computePlatformRates(
  platform: Platform,
  followers: number,
  avgLikes: number,
  avgComments: number,
  avgViews: number,
  avgShares: number = 0,
  primaryNicheId: number = 8,
  regionCode: RegionCode = 'US',
  extraMetrics?: {
    avgShortLikes?: number;
    avgShortComments?: number;
    avgShortViews?: number;
  },
  subNicheId?: number,
  secondaryNicheIds?: number[],
  productionLevel?: string,
  isLuxuryOrHighEnd?: boolean
) {
  const platformFormats: Record<Platform, DeliverableFormat[]> = {
    instagram: ['ig_reel', 'ig_carousel', 'ig_static', 'ig_story'],
    youtube: ['yt_dedicated', 'yt_integrated', 'yt_short'],
    tiktok: ['tiktok_video'],
  };

  const formats = platformFormats[platform] || ['ig_reel'];

  return formats.map((fmt, idx) => {
    const isYtShort = platform === 'youtube' && fmt === 'yt_short';
    const itemLikes = isYtShort && extraMetrics?.avgShortLikes !== undefined ? extraMetrics.avgShortLikes : avgLikes;
    const itemComments = isYtShort && extraMetrics?.avgShortComments !== undefined ? extraMetrics.avgShortComments : avgComments;
    const itemViews = isYtShort && extraMetrics?.avgShortViews !== undefined ? extraMetrics.avgShortViews : avgViews;

    const pricingInput: PricingInput = {
      creator: {
        followerCount: Math.max(followers, 1000),
        last3PostsAvgLikes: itemLikes,
        last3PostsAvgComments: itemComments,
        last3PostsAvgViews: itemViews,
        last3PostsAvgShares: avgShares,
        primaryPlatform: platform,
        primaryNicheId,
        subNicheId,
        secondaryNicheIds,
        productionLevel,
        isLuxuryOrHighEnd,
        regionCode,
      },
      deliverables: [{ id: String(idx + 1), platform, format: fmt, quantity: 1 }],
      commercialTerms: { usageRights: { scope: 'organic_repost', duration: '30_days' } },
    };

    const res = calculateInfluencerRate(pricingInput);
    return {
      format: fmt,
      label: FORMAT_LABELS[fmt]?.label || fmt,
      ...res.valuationRange,
    };
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  // Verify authorization: allow dev localhost auto-access, require passkey in production
  const host = req.headers.get('host') || '';
  const isDevLocal = process.env.NODE_ENV !== 'production' && (host.includes('localhost') || host.includes('127.0.0.1'));
  const configuredKey = (process.env.ADMIN_BATCH_INGEST_KEY || process.env.ADMIN_PASSWORD || 'signcollab-admin-ingest-2026').trim();
  const providedKey = (req.headers.get('x-admin-key') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '').trim();

  if (!isDevLocal && providedKey !== configuredKey) {
    return NextResponse.json({
      success: false,
      status: 'failed',
      error: 'Unauthorized: Valid admin passkey required to execute batch ingestion.',
    }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { handle: rawHandle, platform: rawPlatform, regionCode: inputRegionCode = 'US', forceRefresh = false } = body;

    if (!rawHandle || typeof rawHandle !== 'string') {
      return NextResponse.json({
        success: false,
        status: 'failed',
        error: 'Missing creator handle or URL.',
      }, { status: 400 });
    }

    const platform: Platform = normalizePlatform(rawPlatform);
    const handle = cleanHandle(rawHandle);

    if (!handle) {
      return NextResponse.json({
        success: false,
        status: 'failed',
        error: 'Invalid handle after sanitization.',
      }, { status: 400 });
    }

    let selectedRegion: RegionCode = (inputRegionCode as RegionCode) || 'US';

    console.log(`[Batch Ingest API] Processing @${handle} on ${platform.toUpperCase()} (forceRefresh: ${Boolean(forceRefresh)})...`);

    // -------------------------------------------------------------------------
    // 1. 30-Day Database Cache Check (Avoid re-scraping existing profiles)
    // -------------------------------------------------------------------------
    if (!forceRefresh) {
      let cachedSnapshot: any = null;

      if (platform === 'youtube') {
        cachedSnapshot = await YouTubeScraper.getRecentYouTubeSnapshot(handle, CACHE_WINDOW_HOURS);
      } else if (platform === 'instagram') {
        cachedSnapshot = await InstagramScraper.getRecentInstagramSnapshot(handle, CACHE_WINDOW_HOURS);
      } else if (platform === 'tiktok') {
        cachedSnapshot = await TikTokScraper.getRecentTikTokSnapshot(handle, CACHE_WINDOW_HOURS);
      }

      if (cachedSnapshot) {
        const cachedIntel = await getRecentCreatorIntelligence(handle, CACHE_WINDOW_HOURS);

        if (cachedIntel?.intelligence && cachedIntel.intelligence.omnichannelStrategySuite?.packages?.length) {
          const intel = cachedIntel.intelligence;
          const displayName =
            cachedSnapshot.channel?.title ||
            cachedSnapshot.profile?.fullName ||
            cachedSnapshot.profile?.nickname ||
            handle;
          const avatarUrl =
            cachedSnapshot.channel?.avatarUrl ||
            cachedSnapshot.profile?.avatarUrl ||
            '';
          const followerCount =
            cachedSnapshot.channel?.subscriberCount ||
            cachedSnapshot.profile?.followerCount ||
            0;

          if (platform === 'youtube' && cachedSnapshot.channel?.country && REGIONAL_CONFIG[cachedSnapshot.channel.country.toUpperCase() as RegionCode]) {
            selectedRegion = cachedSnapshot.channel.country.toUpperCase() as RegionCode;
          }

          const detectedCountry = (intel.geography?.countryCode as RegionCode) || selectedRegion;
          const finalCountry: RegionCode = REGIONAL_CONFIG[detectedCountry] ? detectedCountry : selectedRegion;
          const primaryNicheId = intel.profile?.primaryNiche?.id || 8;
          const subNicheId = intel.profile?.subNiche?.id;
          const secondaryNicheIds = intel.profile?.secondaryNiches?.map((s) => s.id);
          const productionLevel = intel.content?.productionLevel;
          const isLuxuryOrHighEnd = intel.profile?.isLuxuryOrHighEnd;

          // Compute accurate rates from cached data with exact parity
          const extraMetrics = platform === 'youtube'
            ? {
                avgShortLikes: 0,
                avgShortComments: 0,
                avgShortViews: cachedSnapshot.stats?.avgShortVideoViews || 0,
              }
            : undefined;

          const rateCards = computePlatformRates(
            platform,
            followerCount,
            cachedSnapshot.stats?.avgLikes || cachedSnapshot.stats?.avgLikesPerPost || cachedSnapshot.stats?.avgLikesPerVideo || 0,
            cachedSnapshot.stats?.avgComments || cachedSnapshot.stats?.avgCommentsPerPost || cachedSnapshot.stats?.avgCommentsPerVideo || 0,
            platform === 'instagram' ? 0 : (cachedSnapshot.stats?.avgLongVideoViews || cachedSnapshot.stats?.avgViews || cachedSnapshot.stats?.avgViewsPerVideo || 0),
            platform === 'tiktok' ? (cachedSnapshot.stats?.avgSharesPerVideo || cachedSnapshot.stats?.avgShares || 0) : 0,
            primaryNicheId,
            finalCountry,
            extraMetrics,
            subNicheId,
            secondaryNicheIds,
            productionLevel,
            isLuxuryOrHighEnd
          );

          const primaryRate = rateCards[0];
          const allLow = rateCards.map((r) => r.lowP25);
          const allHigh = rateCards.map((r) => r.highP75);
          const minTypical = Math.min(...allLow);
          const maxTypical = Math.max(...allHigh);

          const slug = generateCreatorSlug(displayName, handle);

          console.log(`[Batch Ingest API] [CACHE HIT 30d] @${handle} found in database (${cachedIntel.cacheAgeHours || 0}h old). Returning calibrated rates.`);

          return NextResponse.json({
            success: true,
            status: 'cached',
            latencyMs: Date.now() - startTime,
            creator: {
              username: handle,
              displayName,
              avatarUrl,
              platform,
              followerCount,
              combinedFollowers: followerCount,
              slug,
              countryCode: finalCountry,
              countryName: intel.geography?.countryName || REGIONAL_CONFIG[finalCountry]?.name,
              primaryNiche: intel.profile?.primaryNiche?.name || 'Verified Creator',
              subNiche: intel.profile?.subNiche?.name,
              rateCardTypical: primaryRate ? primaryRate.formatted.typical : '$1,000',
              rateMinUsd: minTypical,
              rateMaxUsd: maxTypical,
              cacheAgeHours: cachedIntel.cacheAgeHours || 0,
              platforms: {
                [platform]: {
                  followers: followerCount,
                  er: cachedSnapshot.stats?.avgEngagementRate || 2.5,
                  rates: rateCards,
                },
              },
            },
            aiDossierSummary:
              intel.summary?.oneLine ||
              intel.summary?.brandSummary ||
              'Active creator profile retrieved from database.',
            primaryNiche: intel.profile?.primaryNiche?.name || 'Verified Creator',
            rateCardTypical: primaryRate ? primaryRate.formatted.typical : '$1,000',
            packagesCount: intel.omnichannelStrategySuite?.packages?.length || 5,
          });
        }
      }
    }

    // -------------------------------------------------------------------------
    // 2. Scrape Seed Platform (Full Data + Comments + ER Parity)
    // -------------------------------------------------------------------------
    let followerCount = 0;
    let avgLikes = 0;
    let avgComments = 0;
    let avgViews = 0;
    let avgShares = 0;
    let observedEr = 0;
    let displayName = handle;
    let biography = '';
    let avatarUrl = '';
    let city: string | undefined = undefined;
    let recentTitles: string[] = [];
    let topComments: string[] = [];
    const discoveredExternalLinks: Array<{ platform: Platform; url: string }> = [];

    let ytDataForMulti: any = null;
    let igDataForMulti: any = null;
    let ttDataForMulti: any = null;

    if (platform === 'youtube') {
      let ytData = !forceRefresh ? await YouTubeScraper.getRecentYouTubeSnapshot(handle, CACHE_WINDOW_HOURS) : null;
      if (!ytData) {
        ytData = await YouTubeScraper.scrapeYouTube(handle);
        try {
          await YouTubeScraper.insertNewYouTubeSnapshot(ytData);
        } catch (saveErr) {
          console.warn('[Batch Ingest API] Warning saving YouTube snapshot:', saveErr);
        }
      }

      const channel = ytData.channel || {};
      const stats = ytData.stats || {};
      followerCount = channel.subscriberCount || 0;
      let avgLongViews = stats.avgLongVideoViews || 0;
      let avgShortViews = stats.avgShortVideoViews || 0;
      let avgLongEngagementRate = stats.avgLongEngagementRate || 0;
      let avgShortEngagementRate = stats.avgShortEngagementRate || 0;
      let avgShortLikes = 0;
      let avgShortComments = 0;

      // Channel country detection (100% matches InfluencerRadarDashboard)
      if (channel.country && REGIONAL_CONFIG[channel.country.toUpperCase() as RegionCode]) {
        selectedRegion = channel.country.toUpperCase() as RegionCode;
      }

      const longVids = Array.isArray(ytData.longVideos) ? ytData.longVideos : [];
      const shortVids = Array.isArray(ytData.shortVideos) ? ytData.shortVideos : [];

      const sampleLongVids = longVids.filter((v: any) => v.isErSample);
      const targetLongVids = sampleLongVids.length > 0 ? sampleLongVids : longVids;

      const sampleShortVids = shortVids.filter((v: any) => v.isErSample);
      const targetShortVids = sampleShortVids.length > 0 ? sampleShortVids : shortVids;

      if (targetLongVids.length > 0) {
        avgLikes = Math.round(targetLongVids.reduce((s: number, v: any) => s + (v.likeCount || 0), 0) / targetLongVids.length);
        avgComments = Math.round(targetLongVids.reduce((s: number, v: any) => s + (v.commentCount || 0), 0) / targetLongVids.length);
        avgViews = avgLongViews || Math.round(targetLongVids.reduce((s: number, v: any) => s + (v.viewCount || 0), 0) / targetLongVids.length);
        if (avgLongEngagementRate === 0 && avgViews > 0 && (avgLikes > 0 || avgComments > 0)) {
          avgLongEngagementRate = Number((((avgLikes + avgComments) / avgViews) * 100).toFixed(2));
        }
      }

      if (targetShortVids.length > 0) {
        avgShortLikes = Math.round(targetShortVids.reduce((s: number, v: any) => s + (v.likeCount || 0), 0) / targetShortVids.length);
        avgShortComments = Math.round(targetShortVids.reduce((s: number, v: any) => s + (v.commentCount || 0), 0) / targetShortVids.length);
        avgShortViews = avgShortViews || Math.round(targetShortVids.reduce((s: number, v: any) => s + (v.viewCount || 0), 0) / targetShortVids.length);
        if (avgShortEngagementRate === 0 && avgShortViews > 0 && (avgShortLikes > 0 || avgShortComments > 0)) {
          avgShortEngagementRate = Number((((avgShortLikes + avgShortComments) / avgShortViews) * 100).toFixed(2));
        }
      }

      observedEr = avgLongEngagementRate || avgShortEngagementRate || 0;
      if (observedEr === 0 && avgViews > 0 && (avgLikes > 0 || avgComments > 0)) {
        observedEr = Number((((avgLikes + avgComments) / avgViews) * 100).toFixed(2));
      }

      displayName = channel.title || handle;
      biography = channel.description || '';
      avatarUrl = channel.avatarUrl || '';
      recentTitles = ytData.longVideos.map((v: any) => v.title).filter(Boolean).slice(0, 15);
      topComments = extractYouTubeComments(ytData.longVideos, ytData.shortVideos);

      // Extract external channel links
      if (Array.isArray(ytData.channel.externalLinks)) {
        for (const l of ytData.channel.externalLinks) {
          if (l.url?.includes('instagram.com')) discoveredExternalLinks.push({ platform: 'instagram', url: l.url });
          if (l.url?.includes('tiktok.com')) discoveredExternalLinks.push({ platform: 'tiktok', url: l.url });
          if (isLinkAggregatorUrl(l.url)) {
            const unrolled = await unrollAggregatorLinks(l.url);
            if (unrolled.instagramUrl) discoveredExternalLinks.push({ platform: 'instagram', url: unrolled.instagramUrl });
            if (unrolled.tiktokUrl) discoveredExternalLinks.push({ platform: 'tiktok', url: unrolled.tiktokUrl });
          }
        }
      }
      if (biography) {
        const igMatch = biography.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/i);
        if (igMatch && !discoveredExternalLinks.some((l) => l.platform === 'instagram')) {
          discoveredExternalLinks.push({ platform: 'instagram', url: `https://www.instagram.com/${igMatch[1].replace(/\/$/, '')}` });
        }
        const ttMatch = biography.match(/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?([a-zA-Z0-9._]+)/i);
        if (ttMatch && !discoveredExternalLinks.some((l) => l.platform === 'tiktok')) {
          discoveredExternalLinks.push({ platform: 'tiktok', url: `https://www.tiktok.com/@${ttMatch[1]}` });
        }
      }

      ytDataForMulti = {
        handle,
        title: displayName,
        subscriberCount: followerCount,
        avgViews,
        country: channel.country || selectedRegion,
        recentTitles,
        topComments,
        observedEr,
        avgLikes,
        avgComments,
        avgShortViews,
        avgShortLikes,
        avgShortComments,
        longEngagementRate: avgLongEngagementRate,
        shortEngagementRate: avgShortEngagementRate,
      };

    } else if (platform === 'instagram') {
      let igData = !forceRefresh ? await InstagramScraper.getRecentInstagramSnapshot(handle, CACHE_WINDOW_HOURS) : null;
      if (!igData) {
        igData = await InstagramScraper.scrapeInstagram(handle, { fastMode: false });
        try {
          await InstagramScraper.insertNewInstagramSnapshot(igData);
        } catch (saveErr) {
          console.warn('[Batch Ingest API] Warning saving Instagram snapshot:', saveErr);
        }
      }

      const profile = igData.profile || {};
      const stats = igData.stats || {};
      followerCount = profile.followerCount || 0;
      avgLikes = stats.avgLikesPerPost || 0;
      avgComments = stats.avgCommentsPerPost || 0;
      avgViews = 0; // Exactly matches InfluencerRadarDashboard.tsx
      observedEr = stats.avgEngagementRate ?? (followerCount > 0 ? Number((((avgLikes + avgComments) / followerCount) * 100).toFixed(2)) : 0);

      displayName = profile.fullName || profile.username || handle;
      biography = profile.biography || '';
      avatarUrl = profile.avatarUrl || '';
      city = profile.city || profile.businessAddress;
      recentTitles = igData.posts.map((p: any) => p.caption || '').filter(Boolean).slice(0, 12);
      topComments = extractInstagramComments(igData.posts);

      if (Array.isArray(profile.externalUrls)) {
        for (const u of profile.externalUrls) {
          if (u.url?.includes('youtube.com') || u.url?.includes('youtu.be')) {
            discoveredExternalLinks.push({ platform: 'youtube', url: u.url });
          }
          if (u.url?.includes('tiktok.com')) {
            discoveredExternalLinks.push({ platform: 'tiktok', url: u.url });
          }
          if (isLinkAggregatorUrl(u.url)) {
            const unrolled = await unrollAggregatorLinks(u.url);
            if (unrolled.youtubeUrl) discoveredExternalLinks.push({ platform: 'youtube', url: unrolled.youtubeUrl });
            if (unrolled.tiktokUrl) discoveredExternalLinks.push({ platform: 'tiktok', url: unrolled.tiktokUrl });
          }
        }
      }
      if (biography) {
        const ytMatch = biography.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:@|c\/|user\/)?|youtu\.be\/)([a-zA-Z0-9._-]+)/i);
        if (ytMatch && !discoveredExternalLinks.some((l) => l.platform === 'youtube')) {
          discoveredExternalLinks.push({ platform: 'youtube', url: `https://www.youtube.com/@${ytMatch[1]}` });
        }
        const ttMatch = biography.match(/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?([a-zA-Z0-9._]+)/i);
        if (ttMatch && !discoveredExternalLinks.some((l) => l.platform === 'tiktok')) {
          discoveredExternalLinks.push({ platform: 'tiktok', url: `https://www.tiktok.com/@${ttMatch[1]}` });
        }
      }

      igDataForMulti = {
        username: handle,
        fullName: displayName,
        city,
        followerCount,
        avgLikes,
        recentCaptions: recentTitles,
        topComments,
        observedEr,
        avgComments,
      };

    } else if (platform === 'tiktok') {
      let ttData = !forceRefresh ? await TikTokScraper.getRecentTikTokSnapshot(handle, CACHE_WINDOW_HOURS) : null;
      if (!ttData) {
        ttData = await TikTokScraper.scrapeTikTok(handle);
        try {
          await TikTokScraper.insertNewTikTokSnapshot(ttData);
        } catch (saveErr) {
          console.warn('[Batch Ingest API] Warning saving TikTok snapshot:', saveErr);
        }
      }

      const profile = ttData.profile || {};
      const stats = ttData.stats || {};
      followerCount = profile.followerCount || 0;
      avgViews = stats.avgViewsPerVideo || 0;
      avgLikes = stats.avgLikesPerVideo || 0;
      avgComments = stats.avgCommentsPerVideo || 0;
      avgShares = stats.avgSharesPerVideo || 0;
      observedEr = stats.avgEngagementRate ?? (avgViews > 0 ? Number((((avgLikes + avgComments + avgShares) / avgViews) * 100).toFixed(2)) : 0);

      displayName = profile.nickname || profile.username || handle;
      biography = profile.biography || '';
      avatarUrl = profile.avatarUrl || '';
      recentTitles = ttData.videos.map((v: any) => v.description || '').filter(Boolean).slice(0, 12);
      topComments = extractTikTokComments(ttData.videos);

      const bioLink = profile.bioLink || '';
      if (bioLink.includes('youtube.com') || bioLink.includes('youtu.be')) {
        discoveredExternalLinks.push({ platform: 'youtube', url: bioLink });
      }
      if (isLinkAggregatorUrl(bioLink)) {
        const unrolled = await unrollAggregatorLinks(bioLink);
        if (unrolled.youtubeUrl) discoveredExternalLinks.push({ platform: 'youtube', url: unrolled.youtubeUrl });
        if (unrolled.instagramUrl) discoveredExternalLinks.push({ platform: 'instagram', url: unrolled.instagramUrl });
      }
      if (biography) {
        const ytMatch = biography.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:@|c\/|user\/)?|youtu\.be\/)([a-zA-Z0-9._-]+)/i);
        if (ytMatch && !discoveredExternalLinks.some((l) => l.platform === 'youtube')) {
          discoveredExternalLinks.push({ platform: 'youtube', url: `https://www.youtube.com/@${ytMatch[1]}` });
        }
        const igMatch = biography.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/i);
        if (igMatch && !discoveredExternalLinks.some((l) => l.platform === 'instagram')) {
          discoveredExternalLinks.push({ platform: 'instagram', url: `https://www.instagram.com/${igMatch[1].replace(/\/$/, '')}` });
        }
      }

      ttDataForMulti = {
        username: handle,
        nickname: displayName,
        followerCount,
        avgViews,
        recentDescriptions: recentTitles,
        topComments,
        observedEr,
        avgLikes,
        avgComments,
        avgShares,
      };
    }

    // -------------------------------------------------------------------------
    // 3. Secondary Cross-Platform Discovery Scraping (Full Context + Comments Parity)
    // -------------------------------------------------------------------------
    const secondaryDiscovered: string[] = [];

    for (const link of discoveredExternalLinks) {
      if (link.platform === 'youtube' && !ytDataForMulti) {
        try {
          let secYt = !forceRefresh ? await YouTubeScraper.getRecentYouTubeSnapshot(link.url, CACHE_WINDOW_HOURS) : null;
          if (!secYt) {
            secYt = await YouTubeScraper.scrapeYouTube(link.url);
            try {
              await YouTubeScraper.insertNewYouTubeSnapshot(secYt);
            } catch (saveErr) {
              console.warn('[Batch Ingest API] Warning saving secondary YouTube snapshot:', saveErr);
            }
          }

          const channel = secYt.channel || {};
          const stats = secYt.stats || {};
          const secFollowerCount = channel.subscriberCount || 0;
          let secAvgLongViews = stats.avgLongVideoViews || 0;
          let secAvgShortViews = stats.avgShortVideoViews || 0;
          let secAvgLongEngagementRate = stats.avgLongEngagementRate || 0;
          let secAvgShortEngagementRate = stats.avgShortEngagementRate || 0;

          if (channel.country && REGIONAL_CONFIG[channel.country.toUpperCase() as RegionCode]) {
            selectedRegion = channel.country.toUpperCase() as RegionCode;
          }

          const longVids = Array.isArray(secYt.longVideos) ? secYt.longVideos : [];
          const shortVids = Array.isArray(secYt.shortVideos) ? secYt.shortVideos : [];

          const sampleLongVids = longVids.filter((v: any) => v.isErSample);
          const targetLongVids = sampleLongVids.length > 0 ? sampleLongVids : longVids;

          const sampleShortVids = shortVids.filter((v: any) => v.isErSample);
          const targetShortVids = sampleShortVids.length > 0 ? sampleShortVids : shortVids;

          let secLikes = 0;
          let secComments = 0;
          let secViews = 0;
          let secShortLikes = 0;
          let secShortComments = 0;

          if (targetLongVids.length > 0) {
            secLikes = Math.round(targetLongVids.reduce((s: number, v: any) => s + (v.likeCount || 0), 0) / targetLongVids.length);
            secComments = Math.round(targetLongVids.reduce((s: number, v: any) => s + (v.commentCount || 0), 0) / targetLongVids.length);
            secViews = secAvgLongViews || Math.round(targetLongVids.reduce((s: number, v: any) => s + (v.viewCount || 0), 0) / targetLongVids.length);
            if (secAvgLongEngagementRate === 0 && secViews > 0 && (secLikes > 0 || secComments > 0)) {
              secAvgLongEngagementRate = Number((((secLikes + secComments) / secViews) * 100).toFixed(2));
            }
          }

          if (targetShortVids.length > 0) {
            secShortLikes = Math.round(targetShortVids.reduce((s: number, v: any) => s + (v.likeCount || 0), 0) / targetShortVids.length);
            secShortComments = Math.round(targetShortVids.reduce((s: number, v: any) => s + (v.commentCount || 0), 0) / targetShortVids.length);
            secAvgShortViews = secAvgShortViews || Math.round(targetShortVids.reduce((s: number, v: any) => s + (v.viewCount || 0), 0) / targetShortVids.length);
            if (secAvgShortEngagementRate === 0 && secAvgShortViews > 0 && (secShortLikes > 0 || secShortComments > 0)) {
              secAvgShortEngagementRate = Number((((secShortLikes + secShortComments) / secAvgShortViews) * 100).toFixed(2));
            }
          }

          let secEr = secAvgLongEngagementRate || secAvgShortEngagementRate || 0;
          if (secEr === 0 && secViews > 0 && (secLikes > 0 || secComments > 0)) {
            secEr = Number((((secLikes + secComments) / secViews) * 100).toFixed(2));
          }

          const secHandle = (channel.handle || channel.title || link.url).replace(/^@+/, '');
          const secTitle = channel.title || secHandle;

          ytDataForMulti = {
            handle: secHandle,
            title: secTitle,
            description: channel.description || '',
            country: channel.country || selectedRegion,
            recentTitles: [...longVids, ...shortVids].map((v: any) => v.title).filter(Boolean).slice(0, 15),
            topComments: extractYouTubeComments(longVids, shortVids),
            subscriberCount: secFollowerCount,
            avgViews: secViews,
            avgLikes: secLikes,
            avgComments: secComments,
            avgShortViews: secAvgShortViews,
            avgShortLikes: secShortLikes,
            avgShortComments: secShortComments,
            longEngagementRate: secAvgLongEngagementRate,
            shortEngagementRate: secAvgShortEngagementRate,
            observedEr: secEr,
          };
          secondaryDiscovered.push(`YouTube (@${ytDataForMulti.handle})`);
          if (channel.avatarUrl) avatarUrl = channel.avatarUrl;
        } catch (e) {
          console.warn('[Batch Ingest API] Discovered YouTube scrape warning:', e);
        }
      }

      if (link.platform === 'instagram' && !igDataForMulti) {
        try {
          let secIg = !forceRefresh ? await InstagramScraper.getRecentInstagramSnapshot(link.url, CACHE_WINDOW_HOURS) : null;
          if (!secIg) {
            secIg = await InstagramScraper.scrapeInstagram(link.url, { fastMode: false });
            try {
              await InstagramScraper.insertNewInstagramSnapshot(secIg);
            } catch (saveErr) {
              console.warn('[Batch Ingest API] Warning saving secondary Instagram snapshot:', saveErr);
            }
          }
          const profile = secIg.profile || {};
          const stats = secIg.stats || {};
          const secFollowers = profile.followerCount || 0;
          const secLikes = stats.avgLikesPerPost || 0;
          const secComments = stats.avgCommentsPerPost || 0;
          const secEr = stats.avgEngagementRate ?? (secFollowers > 0 ? Number((((secLikes + secComments) / secFollowers) * 100).toFixed(2)) : 3.2);

          igDataForMulti = {
            username: (profile.username || link.url).replace(/^@+/, ''),
            fullName: profile.fullName || profile.username || '',
            city: (profile as any).countryCode || profile.city || profile.businessAddress,
            followerCount: secFollowers,
            avgLikes: secLikes,
            avgComments: secComments,
            avgViews: 0,
            recentCaptions: (secIg.posts || []).map((p: any) => p.caption || '').filter(Boolean).slice(0, 12),
            topComments: extractInstagramComments(secIg.posts),
            observedEr: secEr,
          };
          secondaryDiscovered.push(`Instagram (@${igDataForMulti.username})`);
        } catch (e) {
          console.warn('[Batch Ingest API] Discovered Instagram scrape warning:', e);
        }
      }

      if (link.platform === 'tiktok' && !ttDataForMulti) {
        try {
          let secTt = !forceRefresh ? await TikTokScraper.getRecentTikTokSnapshot(link.url, CACHE_WINDOW_HOURS) : null;
          if (!secTt) {
            secTt = await TikTokScraper.scrapeTikTok(link.url);
            try {
              await TikTokScraper.insertNewTikTokSnapshot(secTt);
            } catch (saveErr) {
              console.warn('[Batch Ingest API] Warning saving secondary TikTok snapshot:', saveErr);
            }
          }
          const profile = secTt.profile || {};
          const stats = secTt.stats || {};
          const secFollowers = profile.followerCount || 0;
          const secLikes = stats.avgLikesPerVideo || 0;
          const secComments = stats.avgCommentsPerVideo || 0;
          const secViews = stats.avgViewsPerVideo || 0;
          const secShares = stats.avgSharesPerVideo || 0;
          const secEr = stats.avgEngagementRate ?? (secViews > 0 ? Number((((secLikes + secComments + secShares) / secViews) * 100).toFixed(2)) : 4.5);

          ttDataForMulti = {
            username: (profile.username || link.url).replace(/^@+/, ''),
            nickname: profile.nickname || profile.username || '',
            biography: profile.biography || '',
            recentDescriptions: (secTt.videos || []).map((v: any) => v.description || '').filter(Boolean).slice(0, 12),
            topComments: extractTikTokComments(secTt.videos),
            followerCount: secFollowers,
            avgViews: secViews,
            avgLikes: secLikes,
            avgComments: secComments,
            avgShares: secShares,
            observedEr: secEr,
          };
          secondaryDiscovered.push(`TikTok (@${ttDataForMulti.username})`);
        } catch (e) {
          console.warn('[Batch Ingest API] Discovered TikTok scrape warning:', e);
        }
      }
    }

    // -------------------------------------------------------------------------
    // 4. Complete 19-Point AI Intelligence Synthesis (100% IDENTICAL PROMPT)
    // -------------------------------------------------------------------------
    const multiInput: MultiPlatformCreatorInput = {
      creatorName: displayName,
      primaryPlatform: platform,
      reportedCountry: REGIONAL_CONFIG[selectedRegion]?.name || selectedRegion,
      youtube: ytDataForMulti ? {
        handle: ytDataForMulti.handle,
        title: ytDataForMulti.title,
        subscriberCount: ytDataForMulti.subscriberCount,
        avgViews: ytDataForMulti.avgViews,
        country: ytDataForMulti.country,
        recentTitles: ytDataForMulti.recentTitles,
        topComments: ytDataForMulti.topComments,
        observedEr: ytDataForMulti.observedEr,
      } : undefined,
      instagram: igDataForMulti ? {
        username: igDataForMulti.username,
        fullName: igDataForMulti.fullName,
        city: igDataForMulti.city,
        followerCount: igDataForMulti.followerCount,
        avgLikes: igDataForMulti.avgLikes,
        recentCaptions: igDataForMulti.recentCaptions,
        topComments: igDataForMulti.topComments,
        observedEr: igDataForMulti.observedEr,
      } : undefined,
      tiktok: ttDataForMulti ? {
        username: ttDataForMulti.username,
        nickname: ttDataForMulti.nickname,
        followerCount: ttDataForMulti.followerCount,
        avgViews: ttDataForMulti.avgViews,
        recentDescriptions: ttDataForMulti.recentDescriptions,
        topComments: ttDataForMulti.topComments,
        observedEr: ttDataForMulti.observedEr,
      } : undefined,
    };

    console.log(`[Batch Ingest API] Calling Gemini 3.7 with complete multiInput and comment context (30d cache window)...`);
    const completeIntel = await generateCompleteCreatorIntelligence(multiInput, Boolean(forceRefresh), CACHE_WINDOW_HOURS);

    const detectedCountry = (completeIntel.geography?.countryCode as RegionCode) || selectedRegion;
    const finalCountry: RegionCode = (detectedCountry && REGIONAL_CONFIG[detectedCountry]) ? detectedCountry : selectedRegion;

    const primaryNicheId = completeIntel.profile.primaryNiche.id;
    const subNicheId = completeIntel.profile.subNiche?.id;
    const secondaryNicheIds = completeIntel.profile.secondaryNiches?.map((n) => n.id) || [];
    const productionLevel = completeIntel.content?.productionLevel;
    const isLuxuryOrHighEnd = completeIntel.profile?.isLuxuryOrHighEnd;

    // Persist quick-lookup columns to scraper tables (100% parity with calculator synthesize route)
    try {
      if (multiInput.youtube?.handle) {
        await prisma.youTubeScrape.updateMany({
          where: { handle: multiInput.youtube.handle },
          data: {
            primaryNicheId: completeIntel.profile.primaryNiche.id,
            primaryNicheName: completeIntel.profile.primaryNiche.name,
            secondaryNiches: completeIntel.profile.secondaryNiches,
            aiCreatorSummary: completeIntel.summary?.brandSummary || completeIntel.summary?.oneLine,
            detectedCountry: finalCountry,
          },
        });
      }
      if (multiInput.instagram?.username) {
        await prisma.instagramScrape.updateMany({
          where: { instagramUsername: multiInput.instagram.username.toLowerCase() },
          data: {
            primaryNicheId: completeIntel.profile.primaryNiche.id,
            primaryNicheName: completeIntel.profile.primaryNiche.name,
            secondaryNiches: completeIntel.profile.secondaryNiches,
            aiCreatorSummary: completeIntel.summary?.brandSummary || completeIntel.summary?.oneLine,
            detectedCountry: finalCountry,
          },
        });
      }
      if (multiInput.tiktok?.username) {
        await prisma.tikTokScrape.updateMany({
          where: { tiktokUsername: multiInput.tiktok.username.toLowerCase() },
          data: {
            primaryNicheId: completeIntel.profile.primaryNiche.id,
            primaryNicheName: completeIntel.profile.primaryNiche.name,
            secondaryNiches: completeIntel.profile.secondaryNiches,
            aiCreatorSummary: completeIntel.summary?.brandSummary || completeIntel.summary?.oneLine,
            detectedCountry: finalCountry,
          },
        });
      }
    } catch (dbErr) {
      console.warn('[Batch Ingest DB Scrape Sync] Non-critical warning:', dbErr);
    }

    // -------------------------------------------------------------------------
    // 5. Complete 16-Knot Rate Engine & Omnichannel Packages (100% PARITY)
    // -------------------------------------------------------------------------
    // Platform status is set to 'ready' whenever data exists — NO follower threshold.
    // This matches InfluencerRadarDashboard which marks platforms 'ready' immediately
    // after scraping completes, regardless of follower count.
    const platformMetricsForPackages: Record<Platform, PlatformMetricsInput> = {
      youtube: {
        status: ytDataForMulti ? 'ready' : 'idle',
        followerCount: ytDataForMulti?.subscriberCount || 0,
        avgLikes: ytDataForMulti?.avgLikes || 0,
        avgComments: ytDataForMulti?.avgComments || 0,
        avgViews: ytDataForMulti?.avgViews || 0,
        avgShortViews: ytDataForMulti?.avgShortViews || 0,
        avgShortLikes: ytDataForMulti?.avgShortLikes || 0,
        avgShortComments: ytDataForMulti?.avgShortComments || 0,
        engagementRate: ytDataForMulti?.observedEr || 1.8,
        longEngagementRate: ytDataForMulti?.longEngagementRate,
        shortEngagementRate: ytDataForMulti?.shortEngagementRate,
        username: ytDataForMulti?.handle,
        displayName: ytDataForMulti?.title,
      },
      instagram: {
        status: igDataForMulti ? 'ready' : 'idle',
        followerCount: igDataForMulti?.followerCount || 0,
        avgLikes: igDataForMulti?.avgLikes || 0,
        avgComments: igDataForMulti?.avgComments || 0,
        avgViews: 0,
        engagementRate: igDataForMulti?.observedEr || 3.2,
        username: igDataForMulti?.username,
        displayName: igDataForMulti?.fullName,
      },
      tiktok: {
        status: ttDataForMulti ? 'ready' : 'idle',
        followerCount: ttDataForMulti?.followerCount || 0,
        avgLikes: ttDataForMulti?.avgLikes || 0,
        avgComments: ttDataForMulti?.avgComments || 0,
        avgViews: ttDataForMulti?.avgViews || 0,
        engagementRate: ttDataForMulti?.observedEr || 4.5,
        username: ttDataForMulti?.username,
        displayName: ttDataForMulti?.nickname,
      },
    };

    // Calculate rates across all connected platforms
    const allCalculatedRates: Record<string, any[]> = {};
    const allRatesList: number[] = [];

    if (platformMetricsForPackages.youtube.status === 'ready') {
      const ytRates = computePlatformRates(
        'youtube',
        platformMetricsForPackages.youtube.followerCount || 0,
        platformMetricsForPackages.youtube.avgLikes || 0,
        platformMetricsForPackages.youtube.avgComments || 0,
        platformMetricsForPackages.youtube.avgViews || 0,
        0,
        primaryNicheId,
        finalCountry,
        {
          avgShortLikes: 0,
          avgShortComments: 0,
          avgShortViews: ytDataForMulti?.avgShortViews || 0,
        },
        subNicheId,
        secondaryNicheIds,
        productionLevel,
        isLuxuryOrHighEnd
      );
      allCalculatedRates.youtube = ytRates;
      for (const r of ytRates) {
        allRatesList.push(r.lowP25, r.highP75);
      }
    }

    if (platformMetricsForPackages.instagram.status === 'ready') {
      const igRates = computePlatformRates(
        'instagram',
        platformMetricsForPackages.instagram.followerCount || 0,
        platformMetricsForPackages.instagram.avgLikes || 0,
        platformMetricsForPackages.instagram.avgComments || 0,
        0,
        0,
        primaryNicheId,
        finalCountry,
        undefined,
        subNicheId,
        secondaryNicheIds,
        productionLevel,
        isLuxuryOrHighEnd
      );
      allCalculatedRates.instagram = igRates;
      for (const r of igRates) {
        allRatesList.push(r.lowP25, r.highP75);
      }
    }

    if (platformMetricsForPackages.tiktok.status === 'ready') {
      const ttRates = computePlatformRates(
        'tiktok',
        platformMetricsForPackages.tiktok.followerCount || 0,
        platformMetricsForPackages.tiktok.avgLikes || 0,
        platformMetricsForPackages.tiktok.avgComments || 0,
        platformMetricsForPackages.tiktok.avgViews || 0,
        ttDataForMulti?.avgShares || 0,
        primaryNicheId,
        finalCountry,
        undefined,
        subNicheId,
        secondaryNicheIds,
        productionLevel,
        isLuxuryOrHighEnd
      );
      allCalculatedRates.tiktok = ttRates;
      for (const r of ttRates) {
        allRatesList.push(r.lowP25, r.highP75);
      }
    }

    // Generate full 5 Omnichannel Strategy Packages with calculated prices
    const generatedPackages = generateOmnichannelPackages(
      platformMetricsForPackages,
      displayName,
      primaryNicheId,
      subNicheId,
      finalCountry,
      completeIntel
    );

    const minTypicalUsd = allRatesList.length > 0 ? Math.min(...allRatesList) : 500;
    const maxTypicalUsd = allRatesList.length > 0 ? Math.max(...allRatesList) : 10000;

    // Pick typical primary rate
    const primaryDeliverables = allCalculatedRates[platform] || allCalculatedRates.youtube || allCalculatedRates.instagram || allCalculatedRates.tiktok || [];
    const typicalRateFormatted = primaryDeliverables[0]?.formatted?.typical || '$1,000';

    // -------------------------------------------------------------------------
    // 6. Persist to CreatorIdentityCluster (Matching Calculator Parity — No Follower Gate)
    // -------------------------------------------------------------------------
    const hasYt = !!ytDataForMulti;
    const hasIg = !!igDataForMulti;
    const hasTt = !!ttDataForMulti;

    const cleanYtHandle = hasYt ? (ytDataForMulti?.handle || (platform === 'youtube' ? handle : undefined)) : undefined;
    const cleanIgUsername = hasIg ? (igDataForMulti?.username || (platform === 'instagram' ? handle : undefined)) : undefined;
    const cleanTtUsername = hasTt ? (ttDataForMulti?.username || (platform === 'tiktok' ? handle : undefined)) : undefined;

    let combinedFollowers = 0;
    if (hasYt) combinedFollowers += ytDataForMulti?.subscriberCount || 0;
    if (hasIg) combinedFollowers += igDataForMulti?.followerCount || 0;
    if (hasTt) combinedFollowers += ttDataForMulti?.followerCount || 0;
    if (combinedFollowers === 0) combinedFollowers = followerCount;

    // Pick primary platform from highest followers
    let activePrimaryPlatform = platform;
    const candidates: Array<{ p: Platform; count: number }> = [];
    if (hasYt) candidates.push({ p: 'youtube', count: ytDataForMulti?.subscriberCount || 0 });
    if (hasIg) candidates.push({ p: 'instagram', count: igDataForMulti?.followerCount || 0 });
    if (hasTt) candidates.push({ p: 'tiktok', count: ttDataForMulti?.followerCount || 0 });
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.count - a.count);
      activePrimaryPlatform = candidates[0].p;
    }

    const calculatedAvgEr = observedEr || 2.5;

    let savedCluster: any = null;
    if (combinedFollowers > 0) {
      try {
        savedCluster = await upsertCreatorIdentityCluster({
          canonicalName: displayName || completeIntel.profile?.creatorType || handle,
          brandName: displayName || handle,
          youtubeHandle: cleanYtHandle,
          instagramUsername: cleanIgUsername,
          tiktokUsername: cleanTtUsername,
          primaryNicheId: completeIntel.profile.primaryNiche.id,
          primaryNicheName: completeIntel.profile.primaryNiche.name,
          countryCode: finalCountry,
          combinedFollowers: BigInt(combinedFollowers),
          primaryPlatform: activePrimaryPlatform,
          avatarUrl: avatarUrl || undefined,
          typicalRateMinUsd: minTypicalUsd,
          typicalRateMaxUsd: maxTypicalUsd,
          avgEngagementRate: calculatedAvgEr,
        });
      } catch (clusterErr) {
        console.warn('[Batch Ingest API] Non-critical cluster save warning:', clusterErr);
      }
    }

    const slug = savedCluster?.slug || generateCreatorSlug(displayName, handle);

    return NextResponse.json({
      success: true,
      status: 'success',
      latencyMs: Date.now() - startTime,
      creator: {
        username: handle,
        displayName,
        avatarUrl,
        slug,
        platform: activePrimaryPlatform,
        followerCount,
        combinedFollowers,
        countryCode: finalCountry,
        countryName: completeIntel.geography?.countryName || REGIONAL_CONFIG[finalCountry]?.name,
        primaryNiche: completeIntel.profile.primaryNiche.name,
        subNiche: completeIntel.profile.subNiche?.name,
        rateCardTypical: typicalRateFormatted,
        rateMinUsd: minTypicalUsd,
        rateMaxUsd: maxTypicalUsd,
        secondaryPlatformsDiscovered: secondaryDiscovered,
        platforms: {
          ...(hasYt ? { youtube: { followers: ytDataForMulti?.subscriberCount, er: ytDataForMulti?.observedEr, rates: allCalculatedRates.youtube } } : {}),
          ...(hasIg ? { instagram: { followers: igDataForMulti?.followerCount, er: igDataForMulti?.observedEr, rates: allCalculatedRates.instagram } } : {}),
          ...(hasTt ? { tiktok: { followers: ttDataForMulti?.followerCount, er: ttDataForMulti?.observedEr, rates: allCalculatedRates.tiktok } } : {}),
        },
      },
      aiDossierSummary: completeIntel.summary?.oneLine || completeIntel.summary?.brandSummary || '',
      primaryNiche: completeIntel.profile.primaryNiche.name,
      subNiche: completeIntel.profile.subNiche?.name,
      rateCardTypical: typicalRateFormatted,
      packagesCount: generatedPackages.length,
    });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown batch ingestion error.';
    console.error('[Batch Ingest API] Execution failed:', err);

    return NextResponse.json({
      success: false,
      status: 'failed',
      latencyMs: Date.now() - startTime,
      error: errorMsg,
    }, { status: 200 });
  }
}
