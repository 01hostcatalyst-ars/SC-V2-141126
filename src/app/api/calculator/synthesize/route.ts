import { calculatorBody, guardCalculatorRequest, calculatorError } from '@/lib/calculator/request-guard';
import { parseProfileInput, ProfileInputError } from '@/lib/calculator/profile-input';
import { getRecentYouTubeSnapshot } from '@/lib/scrapers/youtube';
import { getRecentInstagramSnapshot } from '@/lib/scrapers/instagram';
import { getRecentTikTokSnapshot } from '@/lib/scrapers/tiktok';
import { buildRefreshInput, RefreshPlatformData } from '@/lib/creators/refresh-input';
import { REGIONAL_CONFIG } from '@/lib/calculator/constants';
import { NextRequest, NextResponse } from 'next/server';
import { generateCompleteCreatorIntelligence, MultiPlatformCreatorInput, CreatorAIClassification } from '@/lib/ai/gemini';
import { prisma } from '@/lib/prisma';
import { RegionCode } from '@/lib/calculator/types';
import { upsertCreatorIdentityCluster } from '@/lib/creators/identity';

export async function POST(req: NextRequest) {
  try {
    const body = await calculatorBody(req, 256 * 1024);
    let { multiInput, regionCode } = body as {
      multiInput: MultiPlatformCreatorInput;
      regionCode?: string;
      bypassCache?: boolean;
    };

    if (!multiInput || (!multiInput.youtube && !multiInput.instagram && !multiInput.tiktok)) {
      return NextResponse.json({ success: false, error: 'No platform data provided for synthesis.' }, { status: 400 });
    }

    await guardCalculatorRequest(req, true);
    const sources: RefreshPlatformData = {};
    for (const platform of ['youtube', 'instagram', 'tiktok'] as const) {
      const channel = multiInput[platform];
      if (!channel) continue;
      const handle = platform === 'youtube' ? multiInput.youtube?.handle : platform === 'instagram' ? multiInput.instagram?.username : multiInput.tiktok?.username;
      const target = parseProfileInput(handle, platform);
      if (platform === 'youtube') sources.youtube = await getRecentYouTubeSnapshot(target.canonical) || undefined;
      if (platform === 'instagram') sources.instagram = await getRecentInstagramSnapshot(target.canonical) || undefined;
      if (platform === 'tiktok') sources.tiktok = await getRecentTikTokSnapshot(target.canonical) || undefined;
      if (!sources[platform]) throw new ProfileInputError('Collect this profile through the calculator before requesting insights.');
    }
    const region = regionCode && Object.hasOwn(REGIONAL_CONFIG, regionCode) ? regionCode as RegionCode : 'US';
    regionCode = region;
    const name = sources.youtube?.channel.title || sources.instagram?.profile.fullName || sources.tiktok?.profile.nickname || 'Creator';
    multiInput = buildRefreshInput(name, sources, region);

    if (regionCode && !multiInput.reportedCountry) {
      multiInput.reportedCountry = regionCode;
    }

    console.log(`[Calculator Synthesize API] Synthesizing complete 19-point intelligence for "${multiInput.creatorName}"...`);

    const completeIntel = await generateCompleteCreatorIntelligence(multiInput, false);

    const aiEnrichment: CreatorAIClassification = {
      primaryNiche: {
        id: completeIntel.profile.primaryNiche.id,
        name: completeIntel.profile.primaryNiche.name,
        multiplier: completeIntel.profile.primaryNiche.multiplier,
        confidence: completeIntel.profile.confidence || 0.95,
      },
      subNiche: completeIntel.profile.subNiche
        ? {
            id: completeIntel.profile.subNiche.id,
            name: completeIntel.profile.subNiche.name,
            multiplier: completeIntel.profile.subNiche.multiplier,
          }
        : undefined,
      secondaryNiches: completeIntel.profile.secondaryNiches,
      detectedCountry: completeIntel.geography?.countryCode || 'US',
      creatorSummary: completeIntel.summary?.brandSummary || completeIntel.summary?.oneLine || '',
    };

    const finalCountry: RegionCode =
      (regionCode as RegionCode) ||
      (completeIntel.geography?.countryCode as RegionCode) ||
      'US';

    // Persist quick-lookup columns to scraper tables
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

      // Persist to CreatorIdentityCluster so future searches on ANY handle immediately resolve all channels
      await upsertCreatorIdentityCluster({
        canonicalName: multiInput.creatorName || completeIntel.profile?.creatorType || 'Creator',
        youtubeHandle: multiInput.youtube?.handle,
        instagramUsername: multiInput.instagram?.username,
        tiktokUsername: multiInput.tiktok?.username,
        primaryNicheId: completeIntel.profile.primaryNiche.id,
        countryCode: finalCountry,
      });
    } catch (dbErr) {
      console.warn('[DB Synthesis Save] Non-critical warning:', dbErr);
    }

    return NextResponse.json({
      success: true,
      intelligence: completeIntel,
      aiEnrichment,
      finalCountry,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to synthesize multi-platform data.';
    console.error('[Calculator Synthesize API Error]:', err);
    return calculatorError(err);
  }
}
