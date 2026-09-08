import { prisma } from '@/lib/prisma';
import {
  PlatformKnot,
  NicheDefinition,
  SubNicheDefinition,
  INSTAGRAM_16_KNOTS,
  TIKTOK_16_KNOTS,
  YOUTUBE_16_KNOTS,
  PRIMARY_NICHES,
  SUB_NICHES,
  USAGE_RATES,
  EXCLUSIVITY_RATES,
  REGIONAL_CONFIG,
} from './constants';
import {
  Platform,
  DeliverableFormat,
  PlacementScope,
  RightsDuration,
  ExclusivityScope,
  ExclusivityDuration,
  RegionCode,
  PricingInput,
  CalculationResult,
} from './types';

export interface DatabaseCalculatorConstants {
  instagramKnots: PlatformKnot[];
  tiktokKnots: PlatformKnot[];
  youtubeKnots: PlatformKnot[];
  primaryNiches: NicheDefinition[];
  subNiches: SubNicheDefinition[];
  usageRates: Record<PlacementScope, Record<RightsDuration, number>>;
  exclusivityRates: Record<ExclusivityScope, Record<ExclusivityDuration, number>>;
  regionalConfigs: Record<
    RegionCode,
    {
      name: string;
      pppIndex: number;
      currency: string;
      fxRateToUSD: number;
      symbol: string;
    }
  >;
}

// In-memory cache for server-side requests (revalidated every 5 minutes)
let cachedConstants: { data: DatabaseCalculatorConstants; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Fetch all calculation constants directly from the PostgreSQL database via Prisma.
 * Uses fallbacks to ensure absolute zero-downtime reliability.
 */
export async function getCalculatorDatabaseConstants(): Promise<DatabaseCalculatorConstants> {
  const now = Date.now();
  if (cachedConstants && now - cachedConstants.timestamp < CACHE_TTL_MS) {
    return cachedConstants.data;
  }

  try {
    const [dbKnots, dbNiches, dbSubNiches, dbCommercialRates, dbRegions] = await Promise.all([
      prisma.calculatorPlatformKnot.findMany({ orderBy: { followers: 'asc' } }),
      prisma.calculatorNiche.findMany({ orderBy: { id: 'asc' } }),
      prisma.calculatorSubNiche.findMany({ orderBy: { id: 'asc' } }),
      prisma.calculatorCommercialRate.findMany(),
      prisma.calculatorRegionalConfig.findMany({ orderBy: { name: 'asc' } }),
    ]);

    // Parse Knots from Database
    const igKnots: PlatformKnot[] = [];
    const ttKnots: PlatformKnot[] = [];
    const ytKnots: PlatformKnot[] = [];

    for (const knot of dbKnots) {
      const parsedKnot: PlatformKnot = {
        knotId: knot.knotId,
        followers: knot.followers,
        benchmarkEr: Number(knot.benchmarkEr),
        expectedViews: knot.expectedViews ?? undefined,
        rates: (knot.rates as Record<string, number>) || {},
      };

      if (knot.platform === 'instagram') igKnots.push(parsedKnot);
      else if (knot.platform === 'tiktok') ttKnots.push(parsedKnot);
      else if (knot.platform === 'youtube') ytKnots.push(parsedKnot);
    }

    // Parse Niches from Database
    const niches: NicheDefinition[] = dbNiches.map((n) => ({
      id: n.id,
      name: n.name,
      multiplier: Number(n.multiplier),
      description: n.description,
      evidenceSource: n.evidenceSource,
    }));

    // Parse Sub-Niches from Database
    const subNiches: SubNicheDefinition[] = dbSubNiches.map((s) => ({
      id: s.id,
      primaryNicheId: s.primaryNicheId,
      name: s.name,
      multiplier: Number(s.multiplier),
      description: s.description,
      keywords: s.keywords,
    }));

    // Parse Commercial Rates from Database
    const usageRates: Record<PlacementScope, Record<RightsDuration, number>> = JSON.parse(
      JSON.stringify(USAGE_RATES)
    );
    const exclusivityRates: Record<ExclusivityScope, Record<ExclusivityDuration, number>> = JSON.parse(
      JSON.stringify(EXCLUSIVITY_RATES)
    );

    for (const rate of dbCommercialRates) {
      if (rate.rateType === 'USAGE' && rate.scope && rate.duration) {
        const scope = rate.scope as PlacementScope;
        const duration = rate.duration as RightsDuration;
        if (!usageRates[scope]) usageRates[scope] = {} as Record<RightsDuration, number>;
        usageRates[scope][duration] = Number(rate.surchargePct);
      } else if (rate.rateType === 'EXCLUSIVITY' && rate.scope && rate.duration) {
        const scope = rate.scope as ExclusivityScope;
        const duration = rate.duration as ExclusivityDuration;
        if (!exclusivityRates[scope]) exclusivityRates[scope] = {} as Record<ExclusivityDuration, number>;
        exclusivityRates[scope][duration] = Number(rate.surchargePct);
      }
    }

    // Parse Regional Config from Database
    const regionalConfigs: Record<
      RegionCode,
      { name: string; pppIndex: number; currency: string; fxRateToUSD: number; symbol: string }
    > = JSON.parse(JSON.stringify(REGIONAL_CONFIG));

    for (const reg of dbRegions) {
      const code = reg.countryCode as RegionCode;
      regionalConfigs[code] = {
        name: reg.name,
        currency: reg.currency,
        pppIndex: Number(reg.pppIndex),
        fxRateToUSD: Number(reg.fxRateToUSD),
        symbol: reg.symbol,
      };
    }

    const finalConstants: DatabaseCalculatorConstants = {
      instagramKnots: igKnots.length >= 16 ? igKnots : INSTAGRAM_16_KNOTS,
      tiktokKnots: ttKnots.length >= 16 ? ttKnots : TIKTOK_16_KNOTS,
      youtubeKnots: ytKnots.length >= 16 ? ytKnots : YOUTUBE_16_KNOTS,
      primaryNiches: niches.length >= 16 ? niches : PRIMARY_NICHES,
      subNiches: subNiches.length >= 64 ? subNiches : SUB_NICHES,
      usageRates,
      exclusivityRates,
      regionalConfigs,
    };

    cachedConstants = { data: finalConstants, timestamp: now };
    return finalConstants;
  } catch (err) {
    console.warn('[Calculator DB Service] Fallback to verified constant definitions:', err);
    return {
      instagramKnots: INSTAGRAM_16_KNOTS,
      tiktokKnots: TIKTOK_16_KNOTS,
      youtubeKnots: YOUTUBE_16_KNOTS,
      primaryNiches: PRIMARY_NICHES,
      subNiches: SUB_NICHES,
      usageRates: USAGE_RATES,
      exclusivityRates: EXCLUSIVITY_RATES,
      regionalConfigs: REGIONAL_CONFIG,
    };
  }
}

/**
 * Log valuation calculation history to PostgreSQL for auditability and insights.
 */
export async function logCalculatorValuation(
  input: PricingInput,
  result: CalculationResult,
  userId?: string
): Promise<void> {
  try {
    const primaryPlatform = input.creator.primaryPlatform || input.deliverables[0]?.platform || 'instagram';
    await prisma.calculatorValuationHistory.create({
      data: {
        userId: userId || null,
        platform: primaryPlatform,
        followerCount: input.creator.followerCount,
        inputSnapshot: input as unknown as object,
        calculationResult: result as unknown as object,
      },
    });
  } catch (err) {
    console.warn('[Calculator DB Log] Non-critical valuation logging error:', err);
  }
}
