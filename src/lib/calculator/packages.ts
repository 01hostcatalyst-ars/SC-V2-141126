import {
  Platform,
  DeliverableFormat,
  PricingInput,
  RegionCode,
  PlacementScope,
  RightsDuration,
  ExclusivityScope,
  ExclusivityDuration,
} from './types';
import { calculateInfluencerRate, roundCommercial } from './engine';
import { FORMAT_LABELS, REGIONAL_CONFIG } from './constants';
import {
  CompleteCreatorIntelligence,
  BespokeStrategyPackage,
  BespokeDeliverableItem,
  BespokeAdConcept,
  ConcreteAssetDeliverable,
  CriticalCollaborationGuideline,
  CreatorExecutiveBrief,
} from '@/lib/ai/types';

// ============================================================================
// Types
// ============================================================================

export type PackageId = 'reach' | 'paid_creative' | 'conversion' | 'content_library' | 'launch';
export type PackageSuitability = 'recommended' | 'suitable' | 'not_recommended';

export interface PlatformMetricsInput {
  status: 'idle' | 'loading' | 'ready' | 'error';
  followerCount?: number;
  avgLikes?: number;
  avgComments?: number;
  avgViews?: number;
  avgShortLikes?: number;
  avgShortComments?: number;
  avgShortViews?: number;
  engagementRate?: number;
  longEngagementRate?: number;
  shortEngagementRate?: number;
  username?: string;
  displayName?: string;
}

export interface PlatformRank {
  platform: Platform;
  score: number;
  role: 'primary' | 'secondary' | 'supporting';
  followerCount: number;
  avgViews: number;
  er: number;
}

export interface PhasedDeliverable {
  id: string;
  phase: string;
  platform: Platform;
  format: DeliverableFormat;
  quantity: number;
  title: string;
  description: string;
}

export interface PackageEntitlement {
  type: 'organic_repost' | 'brand_ads' | 'whitelisting' | 'profile_placement' | 'raw_footage' | 'repurposing' | 'exclusivity';
  label: string;
  detail: string;
}

export interface CalibratedDeliverableItem {
  id: string;
  phase: string;
  platform: Platform;
  formatKey: string;
  quantity: number;
  title: string;
  description: string;
  standaloneUnitFormatted: string;
  totalStandaloneFormatted: string;
  standaloneUnitLocalized: number;
  totalStandaloneLocalized: number;
}

export interface GeneratedPackage {
  id: PackageId;
  name: string;
  tag: string;
  objective: string;
  suitability: PackageSuitability;
  isRecommended: boolean;
  recommendationHeadline?: string;
  recommendationReason?: string;
  deliverables: PhasedDeliverable[];
  entitlements: PackageEntitlement[];
  pricing: {
    typicalMedian: number;
    lowP25: number;
    highP75: number;
    typicalFormatted: string;
    lowFormatted: string;
    highFormatted: string;
    savingsLocalized: number;
    savingsFormatted: string;
    usdEquivalentTypical?: string;
    currency: string;
    currencySymbol: string;
    standaloneBenchmarkSum?: number;
    standaloneBenchmarkFormatted?: string;
    recommendedBundleTarget?: number;
    recommendedBundleFormatted?: string;
    defendedNegotiationFloor?: number;
    defendedFloorFormatted?: string;
    agencyRepresentedCeiling?: number;
    agencyCeilingFormatted?: string;
    rawContentSumLocalized?: number;
    rawContentSumFormatted?: string;
    commercialRightsFeeLocalized?: number;
    commercialRightsFeeFormatted?: string;
  };
  discountPercentApplied: number;
  summaryPill: string;

  // Bespoke Strategy Additions
  calibratedDeliverables?: CalibratedDeliverableItem[];
  adConcepts?: BespokeAdConcept[];
  concreteAssets?: ConcreteAssetDeliverable[];
  collaborationGuidelines?: [
    CriticalCollaborationGuideline,
    CriticalCollaborationGuideline,
    CriticalCollaborationGuideline
  ];
  strategicRationale?: string;
}

// ============================================================================
// 1. Normalized Platform Strength Ranking
// ============================================================================

export function rankCreatorPlatforms(platforms: Record<Platform, PlatformMetricsInput>): PlatformRank[] {
  const readyPlatforms: Array<{
    platform: Platform;
    followers: number;
    views: number;
    er: number;
  }> = [];

  const platformKeys: Platform[] = ['instagram', 'youtube', 'tiktok'];

  for (const p of platformKeys) {
    const data = platforms[p];
    if (data && data.status === 'ready' && (data.followerCount || 0) > 0) {
      const followers = data.followerCount || 1000;
      const views = data.avgViews || Math.round(followers * 0.15);
      const er = data.engagementRate || 2.0;
      readyPlatforms.push({ platform: p, followers, views, er });
    }
  }

  if (readyPlatforms.length === 0) return [];

  // Find max values across available platforms for normalized 0-1 scale
  const maxFollowers = Math.max(...readyPlatforms.map((p) => p.followers), 1);
  const maxViews = Math.max(...readyPlatforms.map((p) => p.views), 1);
  const maxEr = Math.max(...readyPlatforms.map((p) => p.er), 0.1);

  const scored = readyPlatforms.map((p) => {
    const normFollowers = p.followers / maxFollowers;
    const normViews = p.views / maxViews;
    const normEr = p.er / maxEr;

    // Platform Strength Formula: 45% qualified views + 30% relative engagement + 25% follower scale
    const score = normViews * 0.45 + normEr * 0.30 + normFollowers * 0.25;

    return {
      platform: p.platform,
      score,
      followerCount: p.followers,
      avgViews: p.views,
      er: p.er,
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored.map((p, idx) => ({
    ...p,
    role: idx === 0 ? 'primary' : idx === 1 ? 'secondary' : 'supporting',
  }));
}

// ============================================================================
// 2. Profile Placement Helper
// ============================================================================

export function getPlatformProfilePlacement(
  platform: Platform,
  durationDays: number = 14,
  hasMultiPlatformSynergy: boolean = false
): { label: string; detail: string } {
  if (hasMultiPlatformSynergy) {
    return {
      label: `${durationDays}-Day Pinned Post & Pinned Top Comment`,
      detail: `Launch post pinned to the top of profile grid and sponsor comment pinned at the top of the video comment section for ${durationDays} days.`,
    };
  }

  switch (platform) {
    case 'instagram':
      return {
        label: `${durationDays}-Day Pinned Reel on Grid & Bio Link`,
        detail: `Launch post pinned to the top-3 grid slots on Instagram profile with active link in bio for ${durationDays} days.`,
      };
    case 'youtube':
      return {
        label: `${durationDays}-Day Pinned Top Comment on Video & Description Link`,
        detail: `Pinned sponsor comment with trackable referral link + top-3 lines of video description for ${durationDays} days.`,
      };
    case 'tiktok':
      return {
        label: `${durationDays}-Day Pinned Video on Profile & Bio Link`,
        detail: `Video pinned to the top of creator profile page with active link-in-bio redirect for ${durationDays} days.`,
      };
  }
}

// ============================================================================
// 3. Package Price Calculator
// ============================================================================

interface RawPackagePricing {
  typicalMedian: number;
  lowP25: number;
  highP75: number;
  savingsLocalized: number;
  discountPercentApplied: number;
  currency: string;
  currencySymbol: string;
  usdEquivalentTypical?: string;
  typicalFormatted: string;
  lowFormatted: string;
  highFormatted: string;
  savingsFormatted: string;
  standaloneBenchmarkSum?: number;
  standaloneBenchmarkFormatted?: string;
  rawContentSumLocalized?: number;
  rawContentSumFormatted?: string;
  commercialRightsFeeLocalized?: number;
  commercialRightsFeeFormatted?: string;
}

function calculatePackagePricing(
  deliverables: Array<{ platform: Platform; format: DeliverableFormat; quantity: number }>,
  platforms: Record<Platform, PlatformMetricsInput>,
  regionCode: RegionCode,
  primaryNicheId: number,
  subNicheId: number | undefined,
  commercialTerms: {
    usageScope: PlacementScope;
    duration: RightsDuration;
    whitelisting?: boolean;
    exclusivityScope?: ExclusivityScope;
    exclusivityDuration?: ExclusivityDuration;
  },
  productionAddons?: {
    rawFootageBuyout?: boolean;
    linkInBioDays?: number;
    pinnedHighlightMonths?: number;
  },
  secondaryNicheIds?: number[],
  productionLevel?: string,
  isLuxuryOrHighEnd?: boolean
): RawPackagePricing {
  const regConfig = REGIONAL_CONFIG[regionCode] || REGIONAL_CONFIG['US'];
  let grossTotalUSD = 0;

  // Step 1: Calculate each deliverable using its native platform metrics
  for (const item of deliverables) {
    const platData = platforms[item.platform];
    const isYtShort = item.platform === 'youtube' && item.format === 'yt_short';
    const itemLikes = isYtShort && platData.avgShortLikes !== undefined ? platData.avgShortLikes : platData.avgLikes;
    const itemComments = isYtShort && platData.avgShortComments !== undefined ? platData.avgShortComments : platData.avgComments;
    const itemViews = isYtShort && platData.avgShortViews !== undefined ? platData.avgShortViews : platData.avgViews;

    const singleInput: PricingInput = {
      creator: {
        followerCount: platData.followerCount || 25000,
        last3PostsAvgLikes: itemLikes || 500,
        last3PostsAvgComments: itemComments || 25,
        last3PostsAvgViews: itemViews,
        primaryPlatform: item.platform,
        primaryNicheId,
        subNicheId,
        secondaryNicheIds,
        productionLevel,
        isLuxuryOrHighEnd,
        regionCode,
      },
      deliverables: [{ id: 'item_1', platform: item.platform, format: item.format, quantity: item.quantity }],
      commercialTerms: { usageRights: { scope: 'organic_repost', duration: '30_days' } },
    };

    const res = calculateInfluencerRate(singleInput);
    grossTotalUSD += res.lineItems.grossTotalUSD;
  }

  // Step 2: Multi-Asset Production Efficiency Discount
  const totalAssetCount = deliverables.reduce((sum, d) => sum + d.quantity, 0);
  const bundleDiscountPercent = totalAssetCount >= 4 ? 0.15 : totalAssetCount >= 2 ? 0.10 : 0.00;
  const bundleDiscountAmountUSD = grossTotalUSD * bundleDiscountPercent;
  const netContentFeeUSD = grossTotalUSD - bundleDiscountAmountUSD;

  // Step 3: Commercial Rights Surcharges
  let usagePercent = 0.0;
  if (commercialTerms.usageScope === 'paid_partnership_ads') usagePercent = 0.25;
  else if (commercialTerms.usageScope === 'website_pdp') usagePercent = 0.20;

  let whitelistingPercent = commercialTerms.whitelisting ? 0.30 : 0.0;
  let exclusivityPercent = commercialTerms.exclusivityScope === 'direct_competitors' ? 0.35 : 0.0;

  const commercialRightsFeeUSD = netContentFeeUSD * (usagePercent + whitelistingPercent + exclusivityPercent);

  // Step 4: Production Addons (Raw footage buyout, Bio link, Pinned slot)
  let addonsUSD = 0;
  if (productionAddons?.rawFootageBuyout) {
    addonsUSD += netContentFeeUSD * 0.30;
  }
  if (productionAddons?.linkInBioDays) {
    addonsUSD += (productionAddons.linkInBioDays / 30) * 200;
  }
  if (productionAddons?.pinnedHighlightMonths) {
    addonsUSD += productionAddons.pinnedHighlightMonths * 100;
  }

  const totalUSD = netContentFeeUSD + commercialRightsFeeUSD + addonsUSD;
  const standaloneUSD = grossTotalUSD + commercialRightsFeeUSD + addonsUSD;

  // Step 5: PPP & FX Localization
  const localizedMedian = totalUSD * regConfig.pppIndex * regConfig.fxRateToUSD;
  const standaloneBenchmarkSum = roundCommercial(standaloneUSD * regConfig.pppIndex * regConfig.fxRateToUSD);
  const rawContentSumLocalized = roundCommercial(grossTotalUSD * regConfig.pppIndex * regConfig.fxRateToUSD);
  const commercialRightsFeeLocalized = roundCommercial((commercialRightsFeeUSD + addonsUSD) * regConfig.pppIndex * regConfig.fxRateToUSD);
  const lowP25 = roundCommercial(localizedMedian * 0.80);
  const typicalMedian = roundCommercial(localizedMedian * 1.00);
  const highP75 = roundCommercial(localizedMedian * 1.25);
  const savingsLocalized = roundCommercial(bundleDiscountAmountUSD * regConfig.pppIndex * regConfig.fxRateToUSD);

  // Foreign USD Equivalent calculation (real FX rate)
  const isForeign = regionCode !== 'US';
  const realUsdMedian = roundCommercial(typicalMedian / (regConfig.fxRateToUSD || 1));
  const usdEquivalent = isForeign ? `~$${realUsdMedian.toLocaleString()} USD` : undefined;

  return {
    typicalMedian,
    lowP25,
    highP75,
    savingsLocalized,
    discountPercentApplied: Math.round(bundleDiscountPercent * 100),
    currency: regConfig.currency,
    currencySymbol: regConfig.symbol,
    usdEquivalentTypical: usdEquivalent,
    typicalFormatted: `${regConfig.symbol}${typicalMedian.toLocaleString()}`,
    lowFormatted: `${regConfig.symbol}${lowP25.toLocaleString()}`,
    highFormatted: `${regConfig.symbol}${highP75.toLocaleString()}`,
    savingsFormatted: `${regConfig.symbol}${savingsLocalized.toLocaleString()} ${regConfig.currency}`,
    standaloneBenchmarkSum,
    standaloneBenchmarkFormatted: `${regConfig.symbol}${standaloneBenchmarkSum.toLocaleString()}`,
    rawContentSumLocalized,
    rawContentSumFormatted: `${regConfig.symbol}${rawContentSumLocalized.toLocaleString()}`,
    commercialRightsFeeLocalized,
    commercialRightsFeeFormatted: `${regConfig.symbol}${commercialRightsFeeLocalized.toLocaleString()}`,
  };
}

// ============================================================================
// 3b. Bespoke Strategy Suite Pricing Bridge
// ============================================================================

export function resolveDeliverablePlatformAndFormat(
  rawPlatform: string,
  rawFormatKey: string,
  readyPlatforms: Record<Platform, boolean>
): { platform: Platform; format: DeliverableFormat; isCommercialRight: boolean; rightType?: string } {
  const normKey = String(rawFormatKey || '').toLowerCase().trim();
  const normPlat = String(rawPlatform || '').toLowerCase().trim();

  // Commercial Rights
  if (normKey.includes('whitelisting') || normKey.includes('meta_white')) {
    return { platform: 'instagram', format: 'ig_reel', isCommercialRight: true, rightType: normKey.includes('60') ? 'whitelisting_60d' : 'whitelisting_30d' };
  }
  if (normKey.includes('pdp') || normKey.includes('website')) {
    return { platform: 'instagram', format: 'ig_reel', isCommercialRight: true, rightType: 'pdp_website_rights_90d' };
  }
  if (normKey.includes('exclusiv')) {
    return { platform: 'instagram', format: 'ig_reel', isCommercialRight: true, rightType: 'category_exclusivity_30d' };
  }
  if (normKey.includes('raw_b_roll') || normKey.includes('raw_footage') || normKey.includes('buyout')) {
    return { platform: 'instagram', format: 'ig_reel', isCommercialRight: true, rightType: 'raw_b_roll_buyout' };
  }
  if (normKey.includes('pinned')) {
    return { platform: 'youtube', format: 'yt_dedicated', isCommercialRight: true, rightType: 'pinned_placement_14d' };
  }

  // Tier 1: Format & Platform resolution
  let resolvedPlatform: Platform = 'instagram';
  let resolvedFormat: DeliverableFormat = 'ig_reel';

  if (normKey === 'yt_dedicated' || normKey.includes('dedicated') || normKey.includes('review') || (normPlat === 'youtube' && normKey.includes('video'))) {
    resolvedPlatform = 'youtube';
    resolvedFormat = 'yt_dedicated';
  } else if (normKey === 'yt_integrated' || normKey.includes('integrated') || normKey.includes('midroll') || normKey.includes('sponsor')) {
    resolvedPlatform = 'youtube';
    resolvedFormat = 'yt_integrated';
  } else if (normKey === 'yt_short' || (normPlat === 'youtube' && normKey.includes('short'))) {
    resolvedPlatform = 'youtube';
    resolvedFormat = 'yt_short';
  } else if (normKey === 'ig_reel' || normKey.includes('reel') || (normPlat === 'instagram' && normKey.includes('video'))) {
    resolvedPlatform = 'instagram';
    resolvedFormat = 'ig_reel';
  } else if (normKey === 'ig_story_sequence' || normKey === 'ig_story' || normKey.includes('story')) {
    resolvedPlatform = 'instagram';
    resolvedFormat = 'ig_story';
  } else if (normKey === 'ig_carousel' || normKey.includes('carousel')) {
    resolvedPlatform = 'instagram';
    resolvedFormat = 'ig_carousel';
  } else if (normKey === 'ig_static' || normKey.includes('photo') || normKey.includes('static')) {
    resolvedPlatform = 'instagram';
    resolvedFormat = 'ig_static';
  } else if (normKey === 'tiktok_video' || normPlat === 'tiktok' || normKey.includes('tiktok')) {
    resolvedPlatform = 'tiktok';
    resolvedFormat = 'tiktok_video';
  } else if (normPlat === 'youtube') {
    resolvedPlatform = 'youtube';
    resolvedFormat = 'yt_integrated';
  }

  // Tier 2: Platform Availability Fallback
  if (!readyPlatforms[resolvedPlatform]) {
    if (resolvedPlatform === 'tiktok') {
      if (readyPlatforms.instagram) {
        resolvedPlatform = 'instagram';
        resolvedFormat = 'ig_reel';
      } else if (readyPlatforms.youtube) {
        resolvedPlatform = 'youtube';
        resolvedFormat = 'yt_short';
      }
    } else if (resolvedPlatform === 'youtube') {
      if (readyPlatforms.instagram) {
        resolvedPlatform = 'instagram';
        resolvedFormat = 'ig_reel';
      } else if (readyPlatforms.tiktok) {
        resolvedPlatform = 'tiktok';
        resolvedFormat = 'tiktok_video';
      }
    } else if (resolvedPlatform === 'instagram') {
      if (readyPlatforms.youtube) {
        resolvedPlatform = 'youtube';
        resolvedFormat = 'yt_short';
      } else if (readyPlatforms.tiktok) {
        resolvedPlatform = 'tiktok';
        resolvedFormat = 'tiktok_video';
      }
    }
  }

  return { platform: resolvedPlatform, format: resolvedFormat, isCommercialRight: false };
}

export function generateCalibratedBespokePackages(
  bespokePackages: BespokeStrategyPackage[],
  platforms: Record<Platform, PlatformMetricsInput>,
  primaryNicheId: number,
  subNicheId: number | undefined,
  regionCode: RegionCode,
  secondaryNicheIds?: number[],
  productionLevel?: string,
  isLuxuryOrHighEnd?: boolean
): GeneratedPackage[] {
  const regConfig = REGIONAL_CONFIG[regionCode] || REGIONAL_CONFIG['US'];
  const isForeign = regionCode !== 'US';

  const readyPlatforms: Record<Platform, boolean> = {
    instagram: platforms.instagram?.status === 'ready' && (platforms.instagram?.followerCount || 0) > 0,
    youtube: platforms.youtube?.status === 'ready' && (platforms.youtube?.followerCount || 0) > 0,
    tiktok: platforms.tiktok?.status === 'ready' && (platforms.tiktok?.followerCount || 0) > 0,
  };

  const unitRateCache: Record<string, { medianLocalized: number; usdGross: number }> = {};

  const getUnitRate = (p: Platform, fmt: DeliverableFormat) => {
    const cacheKey = `${p}_${fmt}`;
    if (unitRateCache[cacheKey]) return unitRateCache[cacheKey];

    const platData = platforms[p] || {};
    const isYtShort = p === 'youtube' && fmt === 'yt_short';
    const itemLikes = isYtShort && platData.avgShortLikes !== undefined ? platData.avgShortLikes : platData.avgLikes;
    const itemComments = isYtShort && platData.avgShortComments !== undefined ? platData.avgShortComments : platData.avgComments;
    const itemViews = isYtShort && platData.avgShortViews !== undefined ? platData.avgShortViews : platData.avgViews;

    const singleInput: PricingInput = {
      creator: {
        followerCount: Math.max(platData.followerCount || 10000, 1000),
        last3PostsAvgLikes: itemLikes || 500,
        last3PostsAvgComments: itemComments || 25,
        last3PostsAvgViews: itemViews,
        primaryPlatform: p,
        primaryNicheId,
        subNicheId,
        secondaryNicheIds,
        productionLevel,
        isLuxuryOrHighEnd,
        regionCode,
      },
      deliverables: [{ id: 'item_1', platform: p, format: fmt, quantity: 1 }],
      commercialTerms: { usageRights: { scope: 'organic_repost', duration: '30_days' } },
    };

    const res = calculateInfluencerRate(singleInput);
    const medianLocalized = res.valuationRange.typicalMedian;
    const usdGross = res.lineItems.grossTotalUSD;

    unitRateCache[cacheKey] = { medianLocalized, usdGross };
    return unitRateCache[cacheKey];
  };

  return bespokePackages.map((bp) => {
    let rawContentSumLocalized = 0;
    const calibratedDeliverables: CalibratedDeliverableItem[] = [];
    const phasedDeliverables: PhasedDeliverable[] = [];

    // 1. Process and price each deliverable
    for (const d of bp.deliverables) {
      const resolved = resolveDeliverablePlatformAndFormat(d.platform, d.formatKey, readyPlatforms);

      if (resolved.isCommercialRight) {
        continue;
      }

      const unitRate = getUnitRate(resolved.platform, resolved.format);
      const qty = Math.max(d.quantity || 1, 1);
      const totalLoc = unitRate.medianLocalized * qty;

      rawContentSumLocalized += totalLoc;

      const sanitizedTitle = (d.title || '').replace(/^\d+x\s*/i, '').trim() || (FORMAT_LABELS[resolved.format]?.label || resolved.format);

      calibratedDeliverables.push({
        id: d.id,
        phase: d.phase,
        platform: resolved.platform,
        formatKey: d.formatKey,
        quantity: qty,
        title: sanitizedTitle,
        description: d.strategicDetail,
        standaloneUnitLocalized: unitRate.medianLocalized,
        totalStandaloneLocalized: totalLoc,
        standaloneUnitFormatted: `${regConfig.symbol}${roundCommercial(unitRate.medianLocalized).toLocaleString()}`,
        totalStandaloneFormatted: `${regConfig.symbol}${roundCommercial(totalLoc).toLocaleString()}`,
      });

      phasedDeliverables.push({
        id: d.id,
        phase: d.phase,
        platform: resolved.platform,
        format: resolved.format,
        quantity: qty,
        title: sanitizedTitle,
        description: d.strategicDetail,
      });
    }

    // Safety fallback: if package had 0 content deliverables
    if (calibratedDeliverables.length === 0) {
      const fallbackPlat: Platform = readyPlatforms.youtube ? 'youtube' : readyPlatforms.instagram ? 'instagram' : 'tiktok';
      const fallbackFmt: DeliverableFormat = fallbackPlat === 'youtube' ? 'yt_dedicated' : 'ig_reel';
      const unitRate = getUnitRate(fallbackPlat, fallbackFmt);
      rawContentSumLocalized += unitRate.medianLocalized;
      const fallbackTitle = FORMAT_LABELS[fallbackFmt]?.label || fallbackFmt;

      calibratedDeliverables.push({
        id: 'fallback_1',
        phase: 'Hero Anchor',
        platform: fallbackPlat,
        formatKey: fallbackFmt,
        quantity: 1,
        title: fallbackTitle,
        description: 'Core campaign anchor deliverable',
        standaloneUnitLocalized: unitRate.medianLocalized,
        totalStandaloneLocalized: unitRate.medianLocalized,
        standaloneUnitFormatted: `${regConfig.symbol}${roundCommercial(unitRate.medianLocalized).toLocaleString()}`,
        totalStandaloneFormatted: `${regConfig.symbol}${roundCommercial(unitRate.medianLocalized).toLocaleString()}`,
      });

      phasedDeliverables.push({
        id: 'fallback_1',
        phase: 'Hero Anchor',
        platform: fallbackPlat,
        format: fallbackFmt,
        quantity: 1,
        title: fallbackTitle,
        description: 'Core campaign anchor deliverable',
      });
    }

    // 2. Multi-Asset Production Efficiency Discount
    const totalAssetCount = calibratedDeliverables.reduce((sum, d) => sum + d.quantity, 0);
    const bundleDiscountPercent = totalAssetCount >= 4 ? 0.15 : totalAssetCount >= 2 ? 0.10 : 0.00;

    // 3. Commercial Rights and Entitlements Surcharges
    let rightsSurchargePercent = 0.0;
    for (const d of bp.deliverables) {
      const resolved = resolveDeliverablePlatformAndFormat(d.platform, d.formatKey, readyPlatforms);
      if (resolved.isCommercialRight) {
        if (resolved.rightType === 'whitelisting_60d') rightsSurchargePercent += 0.30;
        else if (resolved.rightType === 'whitelisting_30d') rightsSurchargePercent += 0.20;
        else if (resolved.rightType === 'pdp_website_rights_90d') rightsSurchargePercent += 0.20;
        else if (resolved.rightType === 'category_exclusivity_30d') rightsSurchargePercent += 0.25;
        else if (resolved.rightType === 'raw_b_roll_buyout') rightsSurchargePercent += 0.15;
        else if (resolved.rightType === 'pinned_placement_14d') rightsSurchargePercent += 0.10;
      }
    }
    for (const ent of bp.entitlements) {
      if (ent.type === 'whitelisting') rightsSurchargePercent += 0.20;
      else if (ent.type === 'exclusivity') rightsSurchargePercent += 0.25;
      else if (ent.type === 'raw_footage') rightsSurchargePercent += 0.15;
    }
    rightsSurchargePercent = Math.min(rightsSurchargePercent, 0.60);

    const rightsFeeLocalized = roundCommercial(rawContentSumLocalized * rightsSurchargePercent);
    const standaloneBenchmarkSum = roundCommercial(rawContentSumLocalized + rightsFeeLocalized);

    // 4. Bundle Negotiation Target
    const recommendedBundleTarget = roundCommercial(standaloneBenchmarkSum * (1 - bundleDiscountPercent));
    const defendedNegotiationFloor = roundCommercial(recommendedBundleTarget * 0.80);
    const agencyRepresentedCeiling = roundCommercial(recommendedBundleTarget * 1.25);
    const savingsLocalized = roundCommercial(standaloneBenchmarkSum - recommendedBundleTarget);

    const realUsdMedian = roundCommercial(recommendedBundleTarget / (regConfig.fxRateToUSD || 1));
    const usdEquivalent = isForeign ? `~$${realUsdMedian.toLocaleString()} USD` : undefined;

    const entitlements: PackageEntitlement[] = bp.entitlements.map((e) => ({
      type: e.type,
      label: e.title,
      detail: e.detail,
    }));

    const packageId = bp.packageId as PackageId;

    return {
      id: packageId,
      name: bp.packageName,
      tag: bp.packageTag,
      objective: bp.campaignObjective,
      suitability: bp.isRecommended ? 'recommended' : 'suitable',
      isRecommended: bp.isRecommended,
      recommendationHeadline: bp.isRecommended ? 'Defended Institutional Recommendation' : undefined,
      recommendationReason: bp.strategicRationale,
      deliverables: phasedDeliverables,
      entitlements,
      pricing: {
        typicalMedian: recommendedBundleTarget,
        lowP25: defendedNegotiationFloor,
        highP75: agencyRepresentedCeiling,
        typicalFormatted: `${regConfig.symbol}${recommendedBundleTarget.toLocaleString()}`,
        lowFormatted: `${regConfig.symbol}${defendedNegotiationFloor.toLocaleString()}`,
        highFormatted: `${regConfig.symbol}${agencyRepresentedCeiling.toLocaleString()}`,
        savingsLocalized,
        savingsFormatted: `${regConfig.symbol}${savingsLocalized.toLocaleString()} ${regConfig.currency}`,
        usdEquivalentTypical: usdEquivalent,
        currency: regConfig.currency,
        currencySymbol: regConfig.symbol,
        standaloneBenchmarkSum,
        standaloneBenchmarkFormatted: `${regConfig.symbol}${standaloneBenchmarkSum.toLocaleString()}`,
        recommendedBundleTarget,
        recommendedBundleFormatted: `${regConfig.symbol}${recommendedBundleTarget.toLocaleString()}`,
        defendedNegotiationFloor,
        defendedFloorFormatted: `${regConfig.symbol}${defendedNegotiationFloor.toLocaleString()}`,
        agencyRepresentedCeiling,
        agencyCeilingFormatted: `${regConfig.symbol}${agencyRepresentedCeiling.toLocaleString()}`,
        rawContentSumLocalized,
        rawContentSumFormatted: `${regConfig.symbol}${rawContentSumLocalized.toLocaleString()}`,
        commercialRightsFeeLocalized: rightsFeeLocalized,
        commercialRightsFeeFormatted: `${regConfig.symbol}${rightsFeeLocalized.toLocaleString()}`,
      },
      discountPercentApplied: Math.round(bundleDiscountPercent * 100),
      summaryPill: `${calibratedDeliverables.length} Line-Item Assets · Defended Package`,
      calibratedDeliverables,
      adConcepts: bp.adConcepts,
      concreteAssets: bp.concreteAssets,
      collaborationGuidelines: bp.collaborationGuidelines,
      strategicRationale: bp.strategicRationale,
    };
  });
}

// ============================================================================
// 4. The 5 Adaptive Package Recipe Builders
// ============================================================================

export function generateOmnichannelPackages(
  platforms: Record<Platform, PlatformMetricsInput>,
  creatorName: string,
  primaryNicheId: number,
  subNicheId: number | undefined,
  regionCode: RegionCode,
  intelligence?: CompleteCreatorIntelligence
): GeneratedPackage[] {
  const secondaryNicheIds = intelligence?.profile?.secondaryNiches?.map((s) => s.id);
  const productionLevel = intelligence?.content?.productionLevel;
  const isLuxuryOrHighEnd = intelligence?.profile?.isLuxuryOrHighEnd;

  // If completeIntelligence has bespoke omnichannel packages from Gemini, calibrate and return them!
  if (
    intelligence?.omnichannelStrategySuite?.packages &&
    Array.isArray(intelligence.omnichannelStrategySuite.packages) &&
    intelligence.omnichannelStrategySuite.packages.length > 0
  ) {
    return generateCalibratedBespokePackages(
      intelligence.omnichannelStrategySuite.packages,
      platforms,
      primaryNicheId,
      subNicheId,
      regionCode,
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd
    );
  }

  const ranked = rankCreatorPlatforms(platforms);
  if (ranked.length === 0) return [];

  const primary = ranked[0];
  const secondary = ranked.length > 1 ? ranked[1] : undefined;
  const supporting = ranked.length > 2 ? ranked[2] : undefined;

  const hasInstagram = platforms.instagram?.status === 'ready';
  const hasYouTube = platforms.youtube?.status === 'ready';
  const hasTikTok = platforms.tiktok?.status === 'ready';

  const packages: GeneratedPackage[] = [];

  // Determine Creator Primary Strengths for Intelligence Verdict
  const hasHighPurchaseIntent = Boolean(intelligence?.audience?.purchaseIntent?.toLowerCase().includes("high"));
  const isInstagramDominant = primary.platform === "instagram";
  const isYouTubeDominant = primary.platform === "youtube";
  const isTikTokDominant = primary.platform === "tiktok";
  const hasHighER = primary.er >= 3.5;

  const isLaunchBestFit: boolean = isYouTubeDominant && primary.followerCount >= 500000;
  const isPaidBestFit: boolean = !isLaunchBestFit && hasHighPurchaseIntent && (isTikTokDominant || (isInstagramDominant && primary.er >= 4.0));
  const isReachBestFit: boolean = !isLaunchBestFit && !isPaidBestFit && !isYouTubeDominant && ranked.length >= 2 && !hasHighER;
  const isConversionBestFit: boolean = !isLaunchBestFit && !isPaidBestFit && !isReachBestFit;

  // --------------------------------------------------------------------------
  // PACKAGE 1: REACH CAMPAIGN (Awareness)
  // --------------------------------------------------------------------------
  {
    const rawDeliverables: Array<{ platform: Platform; format: DeliverableFormat; quantity: number }> = [];
    const phasedDeliverables: PhasedDeliverable[] = [];

    if (ranked.length >= 3) {
      // 3 Platforms: 1 Reel + 1 TikTok + 1 Short
      rawDeliverables.push({ platform: 'instagram', format: 'ig_reel', quantity: 1 });
      rawDeliverables.push({ platform: 'tiktok', format: 'tiktok_video', quantity: 1 });
      rawDeliverables.push({ platform: 'youtube', format: 'yt_short', quantity: 1 });

      phasedDeliverables.push({
        id: 'r1',
        phase: 'Broadcast Day',
        platform: 'instagram',
        format: 'ig_reel',
        quantity: 1,
        title: 'Instagram Reel Broadcast',
        description: 'High-visibility 9:16 vertical video hitting the main explore & reels feed.',
      });
      phasedDeliverables.push({
        id: 'r2',
        phase: 'Broadcast Day',
        platform: 'tiktok',
        format: 'tiktok_video',
        quantity: 1,
        title: 'TikTok Viral Syndication',
        description: 'Synchronized short-form release targeting the algorithmic For You page.',
      });
      phasedDeliverables.push({
        id: 'r3',
        phase: 'Broadcast Day',
        platform: 'youtube',
        format: 'yt_short',
        quantity: 1,
        title: 'YouTube Short Cross-Post',
        description: 'Persistent vertical short-form asset optimized for the YouTube Shorts feed.',
      });
    } else if (ranked.length === 2 && secondary) {
      // 2 Platforms: 1 Short asset on each
      const fmtPrimary: DeliverableFormat = primary.platform === 'youtube' ? 'yt_short' : primary.platform === 'tiktok' ? 'tiktok_video' : 'ig_reel';
      const fmtSecondary: DeliverableFormat = secondary.platform === 'youtube' ? 'yt_short' : secondary.platform === 'tiktok' ? 'tiktok_video' : 'ig_reel';

      rawDeliverables.push({ platform: primary.platform, format: fmtPrimary, quantity: 1 });
      rawDeliverables.push({ platform: secondary.platform, format: fmtSecondary, quantity: 1 });

      phasedDeliverables.push({
        id: 'r1',
        phase: 'Broadcast Day',
        platform: primary.platform,
        format: fmtPrimary,
        quantity: 1,
        title: `${FORMAT_LABELS[fmtPrimary].label} (Primary)`,
        description: `Flagship organic post across ${creatorName}'s strongest channel.`,
      });
      phasedDeliverables.push({
        id: 'r2',
        phase: 'Broadcast Day',
        platform: secondary.platform,
        format: fmtSecondary,
        quantity: 1,
        title: `${FORMAT_LABELS[fmtSecondary].label} (Syndication)`,
        description: `Parallel organic cross-post to capture complementary audience segments.`,
      });
    } else {
      // 1 Platform: 2 Short assets on Primary
      const fmt: DeliverableFormat = primary.platform === 'youtube' ? 'yt_short' : primary.platform === 'tiktok' ? 'tiktok_video' : 'ig_reel';
      rawDeliverables.push({ platform: primary.platform, format: fmt, quantity: 2 });

      phasedDeliverables.push({
        id: 'r1',
        phase: 'Drop 1',
        platform: primary.platform,
        format: fmt,
        quantity: 1,
        title: `Primary ${FORMAT_LABELS[fmt].tag} Launch`,
        description: `Top-of-funnel introduction post reaching the active follower core.`,
      });
      phasedDeliverables.push({
        id: 'r2',
        phase: 'Drop 2 (+7 Days)',
        platform: primary.platform,
        format: fmt,
        quantity: 1,
        title: `Follow-Up ${FORMAT_LABELS[fmt].tag}`,
        description: `Secondary push scheduled 7 days later to capture non-engaged viewers.`,
      });
    }

    const pricing = calculatePackagePricing(
      rawDeliverables,
      platforms,
      regionCode,
      primaryNicheId,
      subNicheId,
      { usageScope: 'organic_repost', duration: '30_days' },
      undefined,
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd
    );

    packages.push({
      id: 'reach',
      name: 'Reach Campaign',
      tag: 'Awareness & Virality',
      objective: 'Maximum top-of-funnel audience attention across the creator’s strongest social feeds.',
      suitability: isReachBestFit ? 'recommended' : isYouTubeDominant && ranked.length === 1 ? 'not_recommended' : 'suitable',
      isRecommended: isReachBestFit,
      recommendationHeadline: isReachBestFit ? `Best for Rapid Eyeballs across ${ranked.length} Feeds` : undefined,
      recommendationReason: isReachBestFit
        ? `Ideal entry package: distributes a synchronized 9:16 vertical video asset across ${ranked.map((r) => r.platform).join(' + ')} with minimal creator friction.`
        : isYouTubeDominant && ranked.length === 1
        ? 'Sub-optimal: This creator’s core equity is in long-form storytelling; standalone short-form does not leverage their full community trust.'
        : undefined,
      deliverables: phasedDeliverables,
      entitlements: [
        { type: 'organic_repost', label: '30-Day Organic Brand Repost', detail: 'Brand may repost and pin the creative on brand social profiles for 30 days.' },
        { type: 'profile_placement', label: 'Pinned Sponsor Comment', detail: 'Includes pinned comment with brand attribution & native tags on each post.' },
      ],
      pricing,
      discountPercentApplied: pricing.discountPercentApplied,
      summaryPill: `${phasedDeliverables.length} Assets • Organic Feed Reach`,
    });
  }

  // --------------------------------------------------------------------------
  // PACKAGE 2: PAID CREATIVE / UGC (Ad Performance)
  // --------------------------------------------------------------------------
  {
    const primaryFormat: DeliverableFormat = primary.platform === 'youtube' ? 'yt_short' : primary.platform === 'tiktok' ? 'tiktok_video' : 'ig_reel';
    const rawDeliverables = [{ platform: primary.platform, format: primaryFormat, quantity: 1 }];

    const phasedDeliverables: PhasedDeliverable[] = [
      {
        id: 'pc1',
        phase: 'Master Asset',
        platform: primary.platform,
        format: primaryFormat,
        quantity: 1,
        title: `High-Converting ${FORMAT_LABELS[primaryFormat].tag} Ad Creative`,
        description: 'Native hook, problem/solution demonstration, and clear commercial call-to-action.',
      },
      {
        id: 'pc2',
        phase: 'Production Cut',
        platform: primary.platform,
        format: primaryFormat,
        quantity: 1,
        title: 'Alternative Hook Cut & Clean Raw Stems',
        description: 'Secondary 0-3s hook variation + clean unbranded master files for A/B testing in ad manager.',
      },
    ];

    const pricing = calculatePackagePricing(
      rawDeliverables,
      platforms,
      regionCode,
      primaryNicheId,
      subNicheId,
      { usageScope: 'paid_partnership_ads', duration: '30_days', whitelisting: true },
      { rawFootageBuyout: true },
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd
    );

    packages.push({
      id: 'paid_creative',
      name: 'Paid Creative (UGC & Ads)',
      tag: 'Ad Funnels & Spark Ads',
      objective: 'High-converting creator assets engineered specifically for Meta Partnership & TikTok Spark Ad funnels.',
      suitability: isPaidBestFit ? 'recommended' : 'suitable',
      isRecommended: isPaidBestFit,
      recommendationHeadline: isPaidBestFit ? 'Top Choice for Performance Marketers' : undefined,
      recommendationReason: isPaidBestFit
        ? `Built for media buyers: includes 30-day Meta/TikTok ad authorization code, 2 hook variations, and raw stems for paid retargeting.`
        : undefined,
      deliverables: phasedDeliverables,
      entitlements: [
        { type: 'whitelisting', label: '30-Day Paid Ad Whitelisting Code', detail: 'Authorized Partnership / Spark Ad authorization code to run dark ads from creator handle.' },
        { type: 'raw_footage', label: 'Raw Footage & B-Roll Buyout', detail: 'Full commercial buyout of raw uncompressed footage stems and audio tracks.' },
        { type: 'brand_ads', label: 'Meta & TikTok Paid Ad Usage', detail: '30-day paid media placement rights across Instagram, Facebook, and TikTok ads.' },
      ],
      pricing,
      discountPercentApplied: pricing.discountPercentApplied,
      summaryPill: `1 Hero Ad + Raw Stems • 30d Whitelisting`,
    });
  }

  // --------------------------------------------------------------------------
  // PACKAGE 3: CONVERSION CAMPAIGN (Sales & Clicks)
  // --------------------------------------------------------------------------
  {
    const rawDeliverables: Array<{ platform: Platform; format: DeliverableFormat; quantity: number }> = [];
    const phasedDeliverables: PhasedDeliverable[] = [];

    if (hasInstagram) {
      rawDeliverables.push({ platform: 'instagram', format: 'ig_reel', quantity: 1 });
      rawDeliverables.push({ platform: 'instagram', format: 'ig_story', quantity: 1 });

      phasedDeliverables.push({
        id: 'c1',
        phase: 'Phase 1 (Day 1)',
        platform: 'instagram',
        format: 'ig_reel',
        quantity: 1,
        title: 'Launch Reel Announcement',
        description: 'Dedicated in-feed Reel introducing the value proposition with promo code in caption.',
      });
      phasedDeliverables.push({
        id: 'c2',
        phase: 'Phase 2 (Day 7)',
        platform: 'instagram',
        format: 'ig_story',
        quantity: 1,
        title: 'Direct-Response Story Set (3 Frames)',
        description: '3-frame sequence featuring native Link Sticker, swipe-up, and urgency reminder.',
      });
    } else if (hasYouTube) {
      rawDeliverables.push({ platform: 'youtube', format: 'yt_integrated', quantity: 1 });

      phasedDeliverables.push({
        id: 'c1',
        phase: 'Phase 1 (Day 1)',
        platform: 'youtube',
        format: 'yt_integrated',
        quantity: 1,
        title: '60s Mid-Roll Integration',
        description: 'High-retention brand segment natively woven into regular long-form content.',
      });
      phasedDeliverables.push({
        id: 'c2',
        phase: 'Phase 2 (Day 7)',
        platform: 'youtube',
        format: 'yt_short',
        quantity: 1,
        title: 'Short-Form Conversion Teaser',
        description: 'Secondary short driving viewers to the main video integration and description link.',
      });
    } else {
      rawDeliverables.push({ platform: 'tiktok', format: 'tiktok_video', quantity: 1 });

      phasedDeliverables.push({
        id: 'c1',
        phase: 'Phase 1 (Day 1)',
        platform: 'tiktok',
        format: 'tiktok_video',
        quantity: 1,
        title: 'Dedicated TikTok Product Showcase',
        description: 'Engaging product integration with pinned comment CTA and coupon code.',
      });
      phasedDeliverables.push({
        id: 'c2',
        phase: 'Phase 2 (Day 7)',
        platform: 'tiktok',
        format: 'tiktok_video',
        quantity: 1,
        title: 'Comment Reply & FAQ Follow-up',
        description: 'Secondary video addressing audience questions and reinforcing the call-to-action.',
      });
    }

    const placementInfo = getPlatformProfilePlacement(primary.platform, 14, false);

    const pricing = calculatePackagePricing(
      rawDeliverables,
      platforms,
      regionCode,
      primaryNicheId,
      subNicheId,
      { usageScope: 'organic_repost', duration: '30_days' },
      { linkInBioDays: 14, pinnedHighlightMonths: 1 },
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd
    );

    packages.push({
      id: 'conversion',
      name: 'Conversion Campaign',
      tag: 'Sales, Clicks & Leads',
      objective: 'Multi-touchpoint conversion funnel designed to drive trackable clicks, app installs, and promo sales.',
      suitability: isConversionBestFit ? 'recommended' : 'suitable',
      isRecommended: isConversionBestFit,
      recommendationHeadline: isConversionBestFit ? `Recommended: Strongest Conversion Fit for ${creatorName}` : undefined,
      recommendationReason: isConversionBestFit
        ? `Best commercial fit: combines a Day-1 launch post with a Day-7 urgency reminder and 14-day profile placement to capture buyers who need multiple touchpoints.`
        : undefined,
      deliverables: phasedDeliverables,
      entitlements: [
        { type: 'profile_placement', label: placementInfo.label, detail: placementInfo.detail },
        { type: 'organic_repost', label: '2-Phase Campaign Flighting', detail: 'Structured schedule: Day-1 Launch + Day-7 Reminder to double direct-response sales.' },
        { type: 'profile_placement', label: 'Trackable Link & Code Integration', detail: 'Exclusive coupon code anchor in caption, top comment, and direct-link placements.' },
      ],
      pricing,
      discountPercentApplied: pricing.discountPercentApplied,
      summaryPill: `2 Phased Drops • 14d Bio Link Placement`,
    });
  }

  // --------------------------------------------------------------------------
  // PACKAGE 4: CONTENT LIBRARY (Multi-Asset Bank)
  // --------------------------------------------------------------------------
  {
    const rawDeliverables: Array<{ platform: Platform; format: DeliverableFormat; quantity: number }> = [];
    const phasedDeliverables: PhasedDeliverable[] = [];

    if (hasInstagram && hasTikTok) {
      rawDeliverables.push({ platform: 'instagram', format: 'ig_reel', quantity: 2 });
      rawDeliverables.push({ platform: 'tiktok', format: 'tiktok_video', quantity: 1 });
      rawDeliverables.push({ platform: 'instagram', format: 'ig_carousel', quantity: 1 });

      phasedDeliverables.push({
        id: 'cl1',
        phase: 'Asset 1',
        platform: 'instagram',
        format: 'ig_reel',
        quantity: 1,
        title: 'Unboxing & First Impression Reel',
        description: 'Aesthetic high-tempo visual showcase of product unboxing and styling.',
      });
      phasedDeliverables.push({
        id: 'cl2',
        phase: 'Asset 2',
        platform: 'instagram',
        format: 'ig_reel',
        quantity: 1,
        title: 'Deep-Dive Feature Demo Reel',
        description: 'Comprehensive walkthrough explaining key features and day-in-the-life utility.',
      });
      phasedDeliverables.push({
        id: 'cl3',
        phase: 'Asset 3',
        platform: 'tiktok',
        format: 'tiktok_video',
        quantity: 1,
        title: 'Viral TikTok Trend Integration',
        description: 'Punchy trend-aligned short format built for algorithmic discoverability.',
      });
      phasedDeliverables.push({
        id: 'cl4',
        phase: 'Asset 4',
        platform: 'instagram',
        format: 'ig_carousel',
        quantity: 1,
        title: 'Editorial 5-Slide Carousel',
        description: 'High-res educational slide carousel for reference, saving, and bookmarking.',
      });
    } else if (hasInstagram) {
      rawDeliverables.push({ platform: 'instagram', format: 'ig_reel', quantity: 2 });
      rawDeliverables.push({ platform: 'instagram', format: 'ig_carousel', quantity: 1 });
      rawDeliverables.push({ platform: 'instagram', format: 'ig_story', quantity: 1 });

      phasedDeliverables.push({
        id: 'cl1',
        phase: 'Asset 1',
        platform: 'instagram',
        format: 'ig_reel',
        quantity: 1,
        title: 'Primary Product Launch Reel',
        description: 'Flagship organic video for the main feed.',
      });
      phasedDeliverables.push({
        id: 'cl2',
        phase: 'Asset 2',
        platform: 'instagram',
        format: 'ig_reel',
        quantity: 1,
        title: 'Alternative Angle / Lifestyle Reel',
        description: 'Secondary storytelling reel targeting lifestyle integration.',
      });
      phasedDeliverables.push({
        id: 'cl3',
        phase: 'Asset 3',
        platform: 'instagram',
        format: 'ig_carousel',
        quantity: 1,
        title: 'In-Depth Carousel Guide (4-5 Slides)',
        description: 'Static visual guide ideal for bookmarking and brand re-sharing.',
      });
      phasedDeliverables.push({
        id: 'cl4',
        phase: 'Asset 4',
        platform: 'instagram',
        format: 'ig_story',
        quantity: 1,
        title: 'Behind-The-Scenes Story Sequence',
        description: 'Authentic 3-frame story sequence capturing genuine reaction.',
      });
    } else if (hasYouTube) {
      rawDeliverables.push({ platform: 'youtube', format: 'yt_integrated', quantity: 1 });
      rawDeliverables.push({ platform: 'youtube', format: 'yt_short', quantity: 2 });

      phasedDeliverables.push({
        id: 'cl1',
        phase: 'Asset 1',
        platform: 'youtube',
        format: 'yt_integrated',
        quantity: 1,
        title: '60s Dedicated Segment in Long-Form',
        description: 'Permanent brand feature in high-retention video.',
      });
      phasedDeliverables.push({
        id: 'cl2',
        phase: 'Asset 2',
        platform: 'youtube',
        format: 'yt_short',
        quantity: 1,
        title: 'Key Moment Shorts Highlight',
        description: 'Punchy edit of the integration formatted for vertical feeds.',
      });
      phasedDeliverables.push({
        id: 'cl3',
        phase: 'Asset 3',
        platform: 'youtube',
        format: 'yt_short',
        quantity: 1,
        title: 'Stand-Alone Product Review Short',
        description: 'Independent vertical asset for multi-channel usage.',
      });
    } else {
      rawDeliverables.push({ platform: 'tiktok', format: 'tiktok_video', quantity: 3 });

      phasedDeliverables.push({
        id: 'cl1',
        phase: 'Asset 1',
        platform: 'tiktok',
        format: 'tiktok_video',
        quantity: 1,
        title: 'Unboxing & First Impression',
        description: 'High-energy hook and reveal.',
      });
      phasedDeliverables.push({
        id: 'cl2',
        phase: 'Asset 2',
        platform: 'tiktok',
        format: 'tiktok_video',
        quantity: 1,
        title: 'Day-in-the-Life Integration',
        description: 'Subtle lifestyle placement.',
      });
      phasedDeliverables.push({
        id: 'cl3',
        phase: 'Asset 3',
        platform: 'tiktok',
        format: 'tiktok_video',
        quantity: 1,
        title: 'Dedicated Feature Tutorial',
        description: 'Focused demonstration answering common questions.',
      });
    }

    const pricing = calculatePackagePricing(
      rawDeliverables,
      platforms,
      regionCode,
      primaryNicheId,
      subNicheId,
      { usageScope: 'website_pdp', duration: '90_days' },
      { rawFootageBuyout: true },
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd
    );

    packages.push({
      id: 'content_library',
      name: 'Content Library',
      tag: 'Brand Asset Bank',
      objective: 'Build a multi-asset content bank to fuel your brand’s own organic channels, e-commerce, and ads.',
      suitability: 'suitable',
      isRecommended: false,
      deliverables: phasedDeliverables,
      entitlements: [
        { type: 'repurposing', label: '90-Day Extended Brand Repurposing', detail: 'Brand may post, edit, and repurpose all assets across company social feeds for 90 days.' },
        { type: 'repurposing', label: 'E-Commerce Website PDP Embedding', detail: 'License to embed videos directly on product landing pages and checkout funnels.' },
        { type: 'raw_footage', label: 'Raw Master Files Included', detail: 'Full-resolution video exports delivered via cloud drive within 7 business days.' },
      ],
      pricing,
      discountPercentApplied: pricing.discountPercentApplied,
      summaryPill: `${phasedDeliverables.length} Assets • 90d Website & Social Usage`,
    });
  }

  // --------------------------------------------------------------------------
  // PACKAGE 5: CAMPAIGN LAUNCH (Flagship 360 Takeover)
  // --------------------------------------------------------------------------
  {
    const rawDeliverables: Array<{ platform: Platform; format: DeliverableFormat; quantity: number }> = [];
    const phasedDeliverables: PhasedDeliverable[] = [];

    if (hasYouTube) {
      rawDeliverables.push({ platform: 'youtube', format: 'yt_dedicated', quantity: 1 });
      if (hasInstagram) rawDeliverables.push({ platform: 'instagram', format: 'ig_reel', quantity: 1 });
      if (hasTikTok) rawDeliverables.push({ platform: 'tiktok', format: 'tiktok_video', quantity: 1 });
      else rawDeliverables.push({ platform: 'youtube', format: 'yt_short', quantity: 1 });

      phasedDeliverables.push({
        id: 'l1',
        phase: 'Hero Anchor',
        platform: 'youtube',
        format: 'yt_dedicated',
        quantity: 1,
        title: 'Dedicated YouTube Anchor Video',
        description: 'Complete dedicated video centered around your brand/product launch with permanent SEO archive.',
      });
      if (hasInstagram) {
        phasedDeliverables.push({
          id: 'l2',
          phase: 'Launch Amplification',
          platform: 'instagram',
          format: 'ig_reel',
          quantity: 1,
          title: 'Instagram Launch Reel',
          description: 'High-production companion reel channeling Instagram followers to the launch.',
        });
      }
      if (hasTikTok) {
        phasedDeliverables.push({
          id: 'l3',
          phase: 'Viral Pulse',
          platform: 'tiktok',
          format: 'tiktok_video',
          quantity: 1,
          title: 'TikTok Viral Pulse Video',
          description: 'Fast-paced algorithmic short capturing high-velocity short-form discovery.',
        });
      } else {
        phasedDeliverables.push({
          id: 'l3',
          phase: 'Shorts Synergy',
          platform: 'youtube',
          format: 'yt_short',
          quantity: 1,
          title: 'YouTube Short Companion',
          description: 'Vertical companion short driving viewers directly to the dedicated long-form hero.',
        });
      }
    } else if (hasInstagram) {
      rawDeliverables.push({ platform: 'instagram', format: 'ig_reel', quantity: 2 });
      rawDeliverables.push({ platform: 'instagram', format: 'ig_story', quantity: 1 });
      if (hasTikTok) rawDeliverables.push({ platform: 'tiktok', format: 'tiktok_video', quantity: 1 });

      phasedDeliverables.push({
        id: 'l1',
        phase: 'Hero Anchor',
        platform: 'instagram',
        format: 'ig_reel',
        quantity: 1,
        title: 'Hero High-Production Launch Reel',
        description: 'Primary centerpiece creative published at peak creator audience engagement hours.',
      });
      phasedDeliverables.push({
        id: 'l2',
        phase: 'Story Takeover',
        platform: 'instagram',
        format: 'ig_story',
        quantity: 1,
        title: 'Full Story Takeover (4 Frames + Link)',
        description: 'Extended unboxing sequence with direct link sticker and swipe-up access.',
      });
      phasedDeliverables.push({
        id: 'l3',
        phase: 'Week-2 Pulse',
        platform: 'instagram',
        format: 'ig_reel',
        quantity: 1,
        title: 'Sustained Momentum Reel',
        description: 'Follow-up showcase addressing audience reactions and product results.',
      });
      if (hasTikTok) {
        phasedDeliverables.push({
          id: 'l4',
          phase: 'Cross-Network Push',
          platform: 'tiktok',
          format: 'tiktok_video',
          quantity: 1,
          title: 'TikTok Companion Release',
          description: 'Synchronized cross-platform short ensuring full audience coverage.',
        });
      }
    } else {
      rawDeliverables.push({ platform: 'tiktok', format: 'tiktok_video', quantity: 3 });

      phasedDeliverables.push({
        id: 'l1',
        phase: 'Hero Launch',
        platform: 'tiktok',
        format: 'tiktok_video',
        quantity: 1,
        title: 'Dedicated Launch Video',
        description: 'High-impact main launch video.',
      });
      phasedDeliverables.push({
        id: 'l2',
        phase: 'Engagement Push',
        platform: 'tiktok',
        format: 'tiktok_video',
        quantity: 1,
        title: 'Duet / Stitch Community Challenge',
        description: 'Interactive follow-up encouraging audience comments.',
      });
      phasedDeliverables.push({
        id: 'l3',
        phase: 'Social Proof',
        platform: 'tiktok',
        format: 'tiktok_video',
        quantity: 1,
        title: 'Week-2 Results & Social Proof',
        description: 'Reinforces conversion before campaign window closes.',
      });
    }

    const hasMultiPlatform = hasYouTube && (hasInstagram || hasTikTok);
    const placementInfo = getPlatformProfilePlacement(primary.platform, 30, hasMultiPlatform);

    const pricing = calculatePackagePricing(
      rawDeliverables,
      platforms,
      regionCode,
      primaryNicheId,
      subNicheId,
      {
        usageScope: 'paid_partnership_ads',
        duration: '60_days',
        whitelisting: true,
        exclusivityScope: 'direct_competitors',
        exclusivityDuration: '30_days',
      },
      { pinnedHighlightMonths: 1, rawFootageBuyout: true },
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd
    );

    packages.push({
      id: 'launch',
      name: 'Campaign Launch',
      tag: 'Full 360° Dominance',
      objective: 'Flagship full-funnel takeover combining hero long-form authority, cross-platform amplification, and category exclusivity.',
      suitability: isLaunchBestFit ? 'recommended' : 'suitable',
      isRecommended: isLaunchBestFit,
      recommendationHeadline: isLaunchBestFit ? `Recommended: Maximum Impact for ${creatorName}` : undefined,
      recommendationReason: isLaunchBestFit
        ? `Best enterprise fit: leverages ${creatorName}'s massive YouTube authority with a Dedicated anchor, supported by cross-network shorts, 60-day whitelisting, and competitor exclusivity.`
        : undefined,
      deliverables: phasedDeliverables,
      entitlements: [
        { type: 'whitelisting', label: '60-Day Paid Ad Whitelisting', detail: 'Extended authorization to amplify all campaign assets via Meta Partnership and TikTok Spark Ads.' },
        { type: 'exclusivity', label: '30-Day Direct Competitor Exclusivity', detail: 'Creator is legally barred from accepting sponsorships from direct industry competitors for 30 days.' },
        { type: 'profile_placement', label: placementInfo.label, detail: placementInfo.detail },
        { type: 'raw_footage', label: 'Full Commercial Raw Master Buyout', detail: 'Clean 4K exports and uncompressed project audio delivered for corporate archive.' },
      ],
      pricing,
      discountPercentApplied: pricing.discountPercentApplied,
      summaryPill: `${phasedDeliverables.length} Assets • 60d Whitelisting + Exclusivity`,
    });
  }

  // Ensure exactly one package is marked as recommended
  const hasRecommended = packages.some((p) => p.isRecommended);
  if (!hasRecommended && packages.length > 0) {
    // Default to Conversion if available, otherwise first package
    const conv = packages.find((p) => p.id === 'conversion') || packages[0];
    conv.isRecommended = true;
    conv.suitability = 'recommended';
    conv.recommendationHeadline = `Top Commercial Recommendation for ${creatorName}`;
    conv.recommendationReason = `Delivers the highest commercial ROI by blending high-visibility feed placements with direct conversion touchpoints.`;
  }

  return packages;
}
