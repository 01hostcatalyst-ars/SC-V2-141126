import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { CompleteCreatorIntelligence } from './types';

export interface CreatorIntelligenceDbRecord {
  id: string;
  creatorHandle: string;
  creatorName: string;
  primaryPlatform: string;
  intelligence: CompleteCreatorIntelligence;
  createdAt: Date;
  isCached: boolean;
  cacheAgeHours: number;
}

/**
 * Normalizes handle for consistent cache matching (e.g. "@mrbeast" -> "mrbeast")
 */
export function normalizeCreatorHandle(rawHandle: string): string {
  return rawHandle.trim().toLowerCase().replace(/^@/, '');
}

/**
 * Retrieves the most recent CreatorIntelligence snapshot from PostgreSQL if it is younger than maxAgeHours (Default: 24h)
 */
export async function getRecentCreatorIntelligence(
  rawHandle: string,
  maxAgeHours = 24
): Promise<CreatorIntelligenceDbRecord | null> {
  const cleanHandle = normalizeCreatorHandle(rawHandle);
  if (!cleanHandle) return null;

  try {
    const latest = await prisma.creatorIntelligence.findFirst({
      where: {
        OR: [
          { creatorHandle: cleanHandle },
          { creatorHandle: `@${cleanHandle}` },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!latest) return null;

    const ageHours = (Date.now() - new Date(latest.createdAt).getTime()) / (1000 * 60 * 60);

    // Return cached if within the 24h window
    if (ageHours <= maxAgeHours) {
      const raw = latest.rawLlmResponse as unknown as CompleteCreatorIntelligence;
      return {
        id: latest.id,
        creatorHandle: latest.creatorHandle,
        creatorName: latest.creatorName,
        primaryPlatform: latest.primaryPlatform,
        intelligence: raw,
        createdAt: latest.createdAt,
        isCached: true,
        cacheAgeHours: Math.round(ageHours * 10) / 10,
      };
    }
  } catch (err) {
    console.warn('[CreatorIntelligence Storage Read Error]:', err);
  }

  return null;
}

/**
 * Saves a newly generated 19-point Creator Intelligence dossier into PostgreSQL
 */
export async function saveCreatorIntelligence(params: {
  creatorHandle: string;
  creatorName: string;
  primaryPlatform: string;
  intelligence: CompleteCreatorIntelligence;
  youtubeScrapeId?: string;
  instagramScrapeId?: string;
  tiktokScrapeId?: string;
  modelUsed?: string;
}): Promise<string> {
  const cleanHandle = normalizeCreatorHandle(params.creatorHandle);

  try {
    const intel = params.intelligence;

    const record = await prisma.creatorIntelligence.create({
      data: {
        creatorHandle: cleanHandle,
        creatorName: params.creatorName || cleanHandle,
        primaryPlatform: params.primaryPlatform || 'instagram',
        youtubeScrapeId: params.youtubeScrapeId,
        instagramScrapeId: params.instagramScrapeId,
        tiktokScrapeId: params.tiktokScrapeId,

        // 1. Profile & Identity
        creatorType: intel.profile?.creatorType || 'Content Creator',
        profilePositioning: intel.profile?.profilePositioning || '',
        primaryNicheId: intel.profile?.primaryNiche?.id || 8,
        primaryNicheName: intel.profile?.primaryNiche?.name || 'General Lifestyle',
        secondaryNiches: intel.profile?.secondaryNiches || [],
        microNiches: intel.profile?.microNiches || [],
        creatorDescription: intel.profile?.creatorDescription || '',
        identityConfidence: intel.profile?.confidence || 0.95,

        // 2. Geography Intelligence
        countryCode: intel.geography?.countryCode || null,
        countryName: intel.geography?.countryName || null,
        city: intel.geography?.city || null,
        region: intel.geography?.region || null,
        geographyConfidence: intel.geography?.confidence || 0.9,
        geographyEvidence: intel.geography?.evidence || [],

        // 3. Audience Intelligence
        audienceIntelligence: intel.audience || {},

        // 4. Content & Theme Intelligence
        contentIntelligence: intel.content || {},
        contentThemes: intel.contentThemes || [],
        contentFormatIntel: intel.contentFormatIntelligence || {},

        // 5. Performance & Engagement Intelligence
        performanceIntel: intel.performanceIntelligence || {},
        engagementIntel: intel.engagementIntelligence || {},

        // 6. Commercial & Brand Fit Intelligence
        commercialIntel: intel.commercialIntelligence || {},
        brandFit: intel.brandFit || {},
        brandSafety: intel.brandSafety || {},

        // 7. Qualitative Strategy & Recommendations
        strengths: intel.strengths || [],
        considerations: intel.considerations || [],
        partnershipRecs: intel.partnershipRecommendations || [],

        // 8. 3-Tier Summaries
        oneLineSummary: intel.summary?.oneLine || '',
        brandSummary: intel.summary?.brandSummary || '',
        detailedSummary: intel.summary?.detailedSummary || '',

        // 9. Meta & Explainability
        confidenceScores: intel.confidence || {},
        evidence: intel.evidence || {},
        uncertainties: intel.uncertainties || [],

        rawLlmResponse: intel as unknown as Prisma.InputJsonValue,
        llmModelUsed: params.modelUsed || 'gemini-3.7-flash',
      },
    });

    return record.id;
  } catch (err) {
    console.error('[CreatorIntelligence Save Error]:', err);
    throw err;
  }
}
