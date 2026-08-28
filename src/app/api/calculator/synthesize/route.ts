import { NextRequest, NextResponse } from 'next/server';
import { enrichMultiPlatformCreatorWithAI, MultiPlatformCreatorInput } from '@/lib/ai/gemini';
import { prisma } from '@/lib/prisma';
import { RegionCode } from '@/lib/calculator/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { multiInput, regionCode } = body as { multiInput: MultiPlatformCreatorInput; regionCode?: string };

    if (!multiInput || (!multiInput.youtube && !multiInput.instagram && !multiInput.tiktok)) {
      return NextResponse.json({ success: false, error: 'No platform data provided for synthesis.' }, { status: 400 });
    }

    console.log(`[Calculator Synthesize API] Synthesizing multi-platform creator "${multiInput.creatorName}"...`);

    const aiEnrichment = await enrichMultiPlatformCreatorWithAI(multiInput);
    const finalCountry: RegionCode = (regionCode as RegionCode) || (aiEnrichment.detectedCountry as RegionCode) || 'US';

    // Persist unified AI enrichment to all active platform database records
    try {
      if (multiInput.youtube?.handle) {
        await prisma.youTubeScrape.updateMany({
          where: { handle: multiInput.youtube.handle },
          data: {
            primaryNicheId: aiEnrichment.primaryNiche.id,
            primaryNicheName: aiEnrichment.primaryNiche.name,
            secondaryNiches: aiEnrichment.secondaryNiches,
            aiCreatorSummary: aiEnrichment.creatorSummary,
            detectedCountry: finalCountry,
          },
        });
      }
      if (multiInput.instagram?.username) {
        await prisma.instagramScrape.updateMany({
          where: { instagramUsername: multiInput.instagram.username.toLowerCase() },
          data: {
            primaryNicheId: aiEnrichment.primaryNiche.id,
            primaryNicheName: aiEnrichment.primaryNiche.name,
            secondaryNiches: aiEnrichment.secondaryNiches,
            aiCreatorSummary: aiEnrichment.creatorSummary,
            detectedCountry: finalCountry,
          },
        });
      }
      if (multiInput.tiktok?.username) {
        await prisma.tikTokScrape.updateMany({
          where: { tiktokUsername: multiInput.tiktok.username.toLowerCase() },
          data: {
            primaryNicheId: aiEnrichment.primaryNiche.id,
            primaryNicheName: aiEnrichment.primaryNiche.name,
            secondaryNiches: aiEnrichment.secondaryNiches,
            aiCreatorSummary: aiEnrichment.creatorSummary,
            detectedCountry: finalCountry,
          },
        });
      }
    } catch (dbErr) {
      console.warn('[DB Synthesis Save] Non-critical warning:', dbErr);
    }

    return NextResponse.json({
      success: true,
      aiEnrichment,
      finalCountry,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to synthesize multi-platform data.';
    console.error('[Calculator Synthesize API Error]:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
