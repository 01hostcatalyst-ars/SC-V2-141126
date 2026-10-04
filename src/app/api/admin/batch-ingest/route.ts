import { NextRequest, NextResponse } from 'next/server';
import { YouTubeScraper, InstagramScraper, TikTokScraper } from '@/lib/scrapers';
import { generateCompleteCreatorIntelligence, MultiPlatformCreatorInput } from '@/lib/ai/gemini';
import { getRecentCreatorIntelligence } from '@/lib/ai/storage';
import { calculateInfluencerRate } from '@/lib/calculator/engine';
import { PricingInput, DeliverableFormat, Platform, RegionCode } from '@/lib/calculator/types';
import { upsertCreatorIdentityCluster } from '@/lib/creators/identity';
import { unrollAggregatorLinks, isLinkAggregatorUrl } from '@/lib/scrapers/linktree';

const CACHE_WINDOW_HOURS = 72; // 3-Day Snapshot Cache

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

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { handle: rawHandle, platform: rawPlatform, regionCode = 'US', forceRefresh = false } = body;

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

    console.log(`[Batch Ingest API] Processing @${handle} on ${platform.toUpperCase()} (forceRefresh: ${Boolean(forceRefresh)})...`);

    // -------------------------------------------------------------------------
    // 1. 3-Day Cache Check (72 Hours)
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

        const displayName = cachedSnapshot.channel?.title || cachedSnapshot.profile?.fullName || cachedSnapshot.profile?.nickname || handle;
        const avatarUrl = cachedSnapshot.channel?.avatarUrl || cachedSnapshot.profile?.avatarUrl || '';
        const followerCount = cachedSnapshot.channel?.subscriberCount || cachedSnapshot.profile?.followerCount || 0;

        console.log(`[Batch Ingest API] [CACHE HIT] @${handle} found in database (${cachedSnapshot.cacheAgeHours || 0}h old). Returning instant result.`);

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
            cacheAgeHours: cachedSnapshot.cacheAgeHours || 0,
          },
          aiDossierSummary: cachedIntel?.intelligence?.summary?.oneLine || cachedIntel?.intelligence?.summary?.brandSummary || 'Pre-computed dossier active in 72h database cache.',
          primaryNiche: cachedIntel?.intelligence?.profile?.primaryNiche?.name || 'Verified Creator',
          rateCardTypical: 'Active (72h Cached)',
        });
      }
    }

    // -------------------------------------------------------------------------
    // 2. Scrape Seed Platform
    // -------------------------------------------------------------------------
    let followerCount = 0;
    let avgLikes = 0;
    let avgComments = 0;
    let avgViews = 0;
    let avgShares = 0;
    let displayName = handle;
    let biography = '';
    let avatarUrl = '';
    let recentTitles: string[] = [];
    const discoveredExternalLinks: Array<{ platform: string; url: string }> = [];

    let ytDataForMulti: any = null;
    let igDataForMulti: any = null;
    let ttDataForMulti: any = null;

    if (platform === 'youtube') {
      const ytData = await YouTubeScraper.scrapeYouTube(handle);
      try {
        await YouTubeScraper.insertNewYouTubeSnapshot(ytData);
      } catch (saveErr) {
        console.warn('[Batch Ingest API] Warning saving YouTube snapshot:', saveErr);
      }

      followerCount = ytData.channel.subscriberCount;
      displayName = ytData.channel.title || handle;
      biography = ytData.channel.description || '';
      avatarUrl = ytData.channel.avatarUrl || '';
      recentTitles = [...ytData.longVideos, ...ytData.shortVideos].map((v) => v.title);

      const sampleLong = ytData.longVideos.filter((v) => v.isErSample);
      const targetLong = sampleLong.length > 0 ? sampleLong : ytData.longVideos;
      const sampleShort = ytData.shortVideos.filter((v) => v.isErSample);
      const targetShort = sampleShort.length > 0 ? sampleShort : ytData.shortVideos;
      const allCore = [...targetLong, ...targetShort];

      if (allCore.length > 0) {
        avgViews = Math.round(allCore.reduce((sum, v) => sum + (v.viewCount || 0), 0) / allCore.length);
        avgLikes = Math.round(allCore.reduce((sum, v) => sum + (v.likeCount || 0), 0) / allCore.length);
        avgComments = Math.round(allCore.reduce((sum, v) => sum + (v.commentCount || 0), 0) / allCore.length);
      }

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

      ytDataForMulti = {
        handle,
        title: displayName,
        description: biography,
        country: ytData.channel.country || regionCode,
        recentTitles,
        subscriberCount: followerCount,
        avgViews,
      };

    } else if (platform === 'instagram') {
      const igData = await InstagramScraper.scrapeInstagram(handle, { fastMode: false });
      try {
        await InstagramScraper.insertNewInstagramSnapshot(igData);
      } catch (saveErr) {
        console.warn('[Batch Ingest API] Warning saving Instagram snapshot:', saveErr);
      }

      followerCount = igData.profile.followerCount;
      avgLikes = igData.stats.avgLikesPerPost || 0;
      avgComments = igData.stats.avgCommentsPerPost || 0;
      displayName = igData.profile.fullName || igData.profile.username || handle;
      biography = igData.profile.biography || '';
      avatarUrl = igData.profile.avatarUrl || '';
      recentTitles = igData.posts.map((p) => p.caption || '');

      // Check external URLs
      if (Array.isArray(igData.profile.externalUrls)) {
        for (const u of igData.profile.externalUrls) {
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

      // Check bio text regex
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
        biography,
        recentCaptions: recentTitles,
        followerCount,
        avgLikes,
      };

    } else if (platform === 'tiktok') {
      const ttData = await TikTokScraper.scrapeTikTok(handle);
      try {
        await TikTokScraper.insertNewTikTokSnapshot(ttData);
      } catch (saveErr) {
        console.warn('[Batch Ingest API] Warning saving TikTok snapshot:', saveErr);
      }

      followerCount = ttData.profile.followerCount;
      avgLikes = ttData.stats.avgLikesPerVideo || 0;
      avgComments = ttData.stats.avgCommentsPerVideo || 0;
      avgViews = ttData.stats.avgViewsPerVideo || 0;
      avgShares = ttData.stats.avgSharesPerVideo || 0;
      displayName = ttData.profile.nickname || ttData.profile.username || handle;
      biography = ttData.profile.biography || '';
      avatarUrl = ttData.profile.avatarUrl || '';
      recentTitles = ttData.videos.map((v) => v.description || '');

      const bioLink = ttData.profile.bioLink || '';
      if (bioLink.includes('youtube.com') || bioLink.includes('youtu.be')) {
        discoveredExternalLinks.push({ platform: 'youtube', url: bioLink });
      }
      if (isLinkAggregatorUrl(bioLink)) {
        const unrolled = await unrollAggregatorLinks(bioLink);
        if (unrolled.youtubeUrl) discoveredExternalLinks.push({ platform: 'youtube', url: unrolled.youtubeUrl });
        if (unrolled.instagramUrl) discoveredExternalLinks.push({ platform: 'instagram', url: unrolled.instagramUrl });
      }

      ttDataForMulti = {
        username: handle,
        nickname: displayName,
        biography,
        recentDescriptions: recentTitles,
        followerCount,
        avgViews,
      };
    }

    // -------------------------------------------------------------------------
    // 3. Secondary Cross-Platform Discovery Scraping
    // -------------------------------------------------------------------------
    const secondaryDiscovered: string[] = [];

    for (const link of discoveredExternalLinks) {
      if (link.platform === 'youtube' && !ytDataForMulti) {
        try {
          let secYt = !forceRefresh ? await YouTubeScraper.getRecentYouTubeSnapshot(link.url, CACHE_WINDOW_HOURS) : null;
          if (!secYt) {
            secYt = await YouTubeScraper.scrapeYouTube(link.url);
            await YouTubeScraper.insertNewYouTubeSnapshot(secYt);
          }
          ytDataForMulti = {
            handle: (secYt.channel.handle || secYt.channel.title || '').replace(/^@+/, ''),
            title: secYt.channel.title,
            description: secYt.channel.description,
            country: secYt.channel.country || regionCode,
            recentTitles: [...secYt.longVideos, ...secYt.shortVideos].map((v) => v.title),
            subscriberCount: secYt.channel.subscriberCount,
            avgViews: secYt.channel.avgViewsPerVideo || 0,
          };
          secondaryDiscovered.push(`YouTube (@${ytDataForMulti.handle})`);
          // Use YouTube permanent avatar if current avatar is Instagram
          if (secYt.channel.avatarUrl) {
            avatarUrl = secYt.channel.avatarUrl;
          }
        } catch (e) {
          console.warn('[Batch Ingest API] Discovered YouTube scrape warning:', e);
        }
      }

      if (link.platform === 'instagram' && !igDataForMulti) {
        try {
          let secIg = !forceRefresh ? await InstagramScraper.getRecentInstagramSnapshot(link.url, CACHE_WINDOW_HOURS) : null;
          if (!secIg) {
            secIg = await InstagramScraper.scrapeInstagram(link.url, { fastMode: false });
            await InstagramScraper.insertNewInstagramSnapshot(secIg);
          }
          igDataForMulti = {
            username: secIg.profile.username,
            fullName: secIg.profile.fullName,
            biography: secIg.profile.biography,
            recentCaptions: secIg.posts.map((p) => p.caption || ''),
            followerCount: secIg.profile.followerCount,
            avgLikes: secIg.stats.avgLikesPerPost || 0,
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
            await TikTokScraper.insertNewTikTokSnapshot(secTt);
          }
          ttDataForMulti = {
            username: secTt.profile.username,
            nickname: secTt.profile.nickname,
            biography: secTt.profile.biography,
            recentDescriptions: secTt.videos.map((v) => v.description || ''),
            followerCount: secTt.profile.followerCount,
            avgViews: secTt.stats.avgViewsPerVideo || 0,
          };
          secondaryDiscovered.push(`TikTok (@${ttDataForMulti.username})`);
        } catch (e) {
          console.warn('[Batch Ingest API] Discovered TikTok scrape warning:', e);
        }
      }
    }

    // -------------------------------------------------------------------------
    // 4. Complete 19-Point AI Intelligence Synthesis (Vertex AI Gemini)
    // -------------------------------------------------------------------------
    const multiInput: MultiPlatformCreatorInput = {
      creatorName: displayName,
      primaryPlatform: platform,
      reportedCountry: regionCode,
      youtube: ytDataForMulti || undefined,
      instagram: igDataForMulti || undefined,
      tiktok: ttDataForMulti || undefined,
    };

    const completeIntel = await generateCompleteCreatorIntelligence(multiInput, Boolean(forceRefresh));

    const finalCountry: RegionCode =
      (regionCode as RegionCode) ||
      (completeIntel.geography?.countryCode as RegionCode) ||
      'US';

    // -------------------------------------------------------------------------
    // 5. Persist to CreatorIdentityCluster
    // -------------------------------------------------------------------------
    try {
      await upsertCreatorIdentityCluster({
        canonicalName: displayName || completeIntel.profile?.creatorType || handle,
        youtubeHandle: ytDataForMulti?.handle,
        instagramUsername: igDataForMulti?.username,
        tiktokUsername: ttDataForMulti?.username,
        primaryNicheId: completeIntel.profile.primaryNiche.id,
        countryCode: finalCountry,
      });
    } catch (clusterErr) {
      console.warn('[Batch Ingest API] Non-critical cluster save warning:', clusterErr);
    }

    // -------------------------------------------------------------------------
    // 6. Compute itemized rate card for default format
    // -------------------------------------------------------------------------
    const defaultFormat: DeliverableFormat = platform === 'youtube' ? 'yt_integrated' : (platform === 'tiktok' ? 'tiktok_video' : 'ig_reel');
    const pricingInput: PricingInput = {
      creator: {
        followerCount,
        last3PostsAvgLikes: avgLikes,
        last3PostsAvgComments: avgComments,
        last3PostsAvgViews: avgViews,
        last3PostsAvgShares: avgShares,
        primaryPlatform: platform,
        primaryNicheId: completeIntel.profile.primaryNiche.id,
        subNicheId: completeIntel.profile.subNiche?.id,
        secondaryNicheIds: completeIntel.profile.secondaryNiches.map((n) => n.id),
        regionCode: finalCountry,
      },
      deliverables: [{ id: '1', platform, format: defaultFormat, quantity: 1 }],
      commercialTerms: { usageRights: { scope: 'organic_repost', duration: '30_days' } },
    };

    const calculationResult = calculateInfluencerRate(pricingInput);

    return NextResponse.json({
      success: true,
      status: 'success',
      latencyMs: Date.now() - startTime,
      creator: {
        username: handle,
        displayName,
        avatarUrl,
        platform,
        followerCount,
        avgLikes,
        avgViews,
        secondaryPlatformsDiscovered: secondaryDiscovered,
      },
      aiDossierSummary: completeIntel.summary?.oneLine || completeIntel.summary?.brandSummary || '',
      primaryNiche: completeIntel.profile.primaryNiche.name,
      rateCardTypical: calculationResult.valuationRange.formatted.typical,
      packagesCount: completeIntel.omnichannelStrategySuite?.packages?.length || 5,
    });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown batch ingestion error.';
    console.error('[Batch Ingest API] Execution failed:', err);

    return NextResponse.json({
      success: false,
      status: 'failed',
      latencyMs: Date.now() - startTime,
      error: errorMsg,
    }, { status: 200 }); // Return 200 with structured status: failed so browser queue handles it cleanly
  }
}
