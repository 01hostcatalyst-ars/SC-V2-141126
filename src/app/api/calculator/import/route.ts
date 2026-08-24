import { NextRequest, NextResponse } from 'next/server';
import { detectPlatform, YouTubeScraper, InstagramScraper, TikTokScraper } from '@/lib/scrapers';
import { enrichCreatorWithAI } from '@/lib/ai/gemini';
import { calculateInfluencerRate } from '@/lib/calculator/engine';
import { PricingInput, DeliverableFormat, Platform, RegionCode } from '@/lib/calculator/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, requestedPlatform, regionCode } = body;

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing creator URL or username.' }, { status: 400 });
    }

    const platform: Platform = (requestedPlatform && requestedPlatform !== 'auto')
      ? requestedPlatform
      : (detectPlatform(input) !== 'unknown' ? detectPlatform(input) as Platform : 'instagram');

    console.log(`[Calculator Import API] Importing creator "${input}" on platform "${platform}"...`);

    let followerCount = 0;
    let avgLikes = 0;
    let avgComments = 0;
    let avgViews = 0;
    let avgShares = 0;
    let username = '';
    let displayName = '';
    let biography = '';
    let avatarUrl = '';
    let bioLink = '';
    let recentTitles: string[] = [];
    let externalLinks: Array<{ platform: string; url: string }> = [];
    let detectedCountry: RegionCode = (regionCode as RegionCode) || 'US';

    // 1. Resolve Data from Scrapers (Cache-First)
    if (platform === 'youtube') {
      let ytData = await YouTubeScraper.getRecentYouTubeSnapshot(input);
      if (!ytData) {
        ytData = await YouTubeScraper.scrapeYouTube(input);
        try {
          await YouTubeScraper.insertNewYouTubeSnapshot(ytData);
        } catch (e) {
          console.warn('DB save error for YT:', e);
        }
      }

      followerCount = ytData.channel.subscriberCount;
      avgViews = ytData.stats.avgLongVideoViews || ytData.channel.avgViewsPerVideo || 1000;
      avgLikes = Math.round(avgViews * 0.04);
      avgComments = Math.round(avgViews * 0.005);
      username = ytData.channel.handle || ytData.channel.title;
      displayName = ytData.channel.title;
      biography = ytData.channel.description;
      avatarUrl = ytData.channel.avatarUrl;
      recentTitles = [...ytData.longVideos, ...ytData.shortVideos].map((v) => v.title);
      detectedCountry = (ytData.channel.country as RegionCode) || 'US';

    } else if (platform === 'instagram') {
      let igData = await InstagramScraper.getRecentInstagramSnapshot(input);
      if (!igData) {
        igData = await InstagramScraper.scrapeInstagram(input, { fastMode: true });
        try {
          await InstagramScraper.insertNewInstagramSnapshot(igData);
        } catch (e) {
          console.warn('DB save error for IG:', e);
        }
      }

      followerCount = igData.profile.followerCount;
      avgLikes = igData.stats.avgLikesPerPost || 100;
      avgComments = igData.stats.avgCommentsPerPost || 10;
      username = igData.profile.username;
      displayName = igData.profile.fullName || igData.profile.username;
      biography = igData.profile.biography;
      avatarUrl = igData.profile.avatarUrl;
      recentTitles = igData.posts.map((p) => p.caption || '');
      bioLink = igData.profile.externalUrls?.[0]?.url || '';

      // Check external links from bio for cross-platform triggers
      if (igData.profile.externalUrls) {
        for (const u of igData.profile.externalUrls) {
          if (u.url?.includes('youtube.com') || u.url?.includes('youtu.be')) {
            externalLinks.push({ platform: 'youtube', url: u.url });
          }
          if (u.url?.includes('tiktok.com')) {
            externalLinks.push({ platform: 'tiktok', url: u.url });
          }
        }
      }

    } else if (platform === 'tiktok') {
      let ttData = await TikTokScraper.getRecentTikTokSnapshot(input);
      if (!ttData) {
        ttData = await TikTokScraper.scrapeTikTok(input);
        try {
          await TikTokScraper.insertNewTikTokSnapshot(ttData);
        } catch (e) {
          console.warn('DB save error for TT:', e);
        }
      }

      followerCount = ttData.profile.followerCount;
      avgLikes = ttData.stats.avgLikesPerVideo || 1000;
      avgComments = ttData.stats.avgCommentsPerVideo || 50;
      avgViews = ttData.stats.avgViewsPerVideo || 10000;
      avgShares = ttData.stats.avgSharesPerVideo || 20;
      username = ttData.profile.username;
      displayName = ttData.profile.nickname || ttData.profile.username;
      biography = ttData.profile.biography;
      avatarUrl = ttData.profile.avatarUrl;
      bioLink = ttData.profile.bioLink || '';
      recentTitles = ttData.videos.map((v) => v.description || '');

      if (bioLink.includes('youtube.com') || bioLink.includes('youtu.be')) {
        externalLinks.push({ platform: 'youtube', url: bioLink });
      }
    }

    // 2. AI Multi-Niche & Brand Summary Enrichment
    const aiEnrichment = await enrichCreatorWithAI({
      platform,
      username,
      name: displayName,
      biography,
      recentVideoTitles: recentTitles,
      bioLink,
      reportedCountry: detectedCountry,
    });

    const primaryNicheId = aiEnrichment.primaryNiche.id;
    const secondaryNicheIds = aiEnrichment.secondaryNiches.map((s) => s.id);
    const finalCountry: RegionCode = (regionCode as RegionCode) || (aiEnrichment.detectedCountry as RegionCode) || 'US';

    // 3. Persist AI Enrichment to Database Tables
    try {
      const { prisma } = await import('@/lib/prisma');
      if (platform === 'youtube') {
        await prisma.youTubeScrape.updateMany({
          where: { handle: username },
          data: {
            primaryNicheId,
            primaryNicheName: aiEnrichment.primaryNiche.name,
            secondaryNiches: aiEnrichment.secondaryNiches,
            aiCreatorSummary: aiEnrichment.creatorSummary,
            detectedCountry: finalCountry,
          },
        });
      } else if (platform === 'instagram') {
        await prisma.instagramScrape.updateMany({
          where: { instagramUsername: username },
          data: {
            primaryNicheId,
            primaryNicheName: aiEnrichment.primaryNiche.name,
            secondaryNiches: aiEnrichment.secondaryNiches,
            aiCreatorSummary: aiEnrichment.creatorSummary,
            detectedCountry: finalCountry,
          },
        });
      } else if (platform === 'tiktok') {
        await prisma.tikTokScrape.updateMany({
          where: { tiktokUsername: username },
          data: {
            primaryNicheId,
            primaryNicheName: aiEnrichment.primaryNiche.name,
            secondaryNiches: aiEnrichment.secondaryNiches,
            aiCreatorSummary: aiEnrichment.creatorSummary,
            detectedCountry: finalCountry,
          },
        });
      }
    } catch (dbErr) {
      console.warn('[DB AI Enrichment Save] Non-critical save warning:', dbErr);
    }

    // 4. Select Default Deliverables based on Platform
    const defaultDeliverables: Array<{ id: string; platform: Platform; format: DeliverableFormat; quantity: number }> = [];
    if (platform === 'youtube') {
      defaultDeliverables.push({ id: '1', platform: 'youtube', format: 'yt_integrated', quantity: 1 });
      defaultDeliverables.push({ id: '2', platform: 'youtube', format: 'yt_short', quantity: 1 });
    } else if (platform === 'instagram') {
      defaultDeliverables.push({ id: '1', platform: 'instagram', format: 'ig_reel', quantity: 1 });
    } else if (platform === 'tiktok') {
      defaultDeliverables.push({ id: '1', platform: 'tiktok', format: 'tiktok_video', quantity: 1 });
    }

    // 4. Run 9-Step 16-Knot Calculation Engine
    const pricingInput: PricingInput = {
      creator: {
        followerCount,
        last3PostsAvgLikes: avgLikes,
        last3PostsAvgComments: avgComments,
        last3PostsAvgViews: avgViews,
        last3PostsAvgShares: avgShares,
        primaryPlatform: platform,
        primaryNicheId,
        secondaryNicheIds,
        regionCode: finalCountry,
      },
      deliverables: defaultDeliverables,
      commercialTerms: {
        usageRights: { scope: 'organic_repost', duration: '30_days' },
      },
    };

    const calculationResult = calculateInfluencerRate(pricingInput);

    return NextResponse.json({
      success: true,
      creator: {
        username,
        displayName,
        avatarUrl,
        biography,
        bioLink,
        platform,
        followerCount,
        avgLikes,
        avgComments,
        avgViews,
        avgShares,
        externalLinks,
      },
      aiEnrichment,
      pricingInput,
      calculationResult,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to import creator and calculate rate.';
    console.error('[Calculator Import API] Error:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
