import {
  PricingInput,
  CalculationResult,
  TurnaroundSpeed,
  RegionCode,
  DeliverableFormat,
  NicheInfo,
} from './types';
import {
  INSTAGRAM_16_KNOTS,
  TIKTOK_16_KNOTS,
  YOUTUBE_16_KNOTS,
  PlatformKnot,
  PRIMARY_NICHES,
  SUB_NICHES,
  USAGE_RATES,
  EXCLUSIVITY_RATES,
  REGIONAL_CONFIG,
  NicheDefinition,
  SubNicheDefinition,
} from './constants';

export interface DynamicCalculationOverrides {
  instagramKnots?: PlatformKnot[];
  tiktokKnots?: PlatformKnot[];
  youtubeKnots?: PlatformKnot[];
  primaryNiches?: NicheDefinition[];
  subNiches?: SubNicheDefinition[];
  usageRates?: Record<string, Record<string, number>>;
  exclusivityRates?: Record<string, Record<string, number>>;
  regionalConfigs?: Record<
    string,
    {
      name: string;
      pppIndex: number;
      currency: string;
      fxRateToUSD: number;
      symbol: string;
    }
  >;
}

/**
 * Rounds monetary amounts to clean, executive commercial brackets:
 * - >= 100,000 (PKR, INR, JPY, NGN, high-magnitude currencies): round to nearest 1,000 (e.g. 1,230,220 -> 1,230,000)
 * - 10,000 - 99,999: round to nearest 100 (e.g. 14,218 -> 14,200)
 * - 1,000 - 9,999 (standard USD / EUR / GBP rates): round to nearest 25 (e.g. 4,417 -> 4,425)
 * - 100 - 999: round to nearest 10
 * - < 100: round to nearest whole integer
 */
export function roundCommercial(amount: number): number {
  if (amount >= 100_000) {
    return Math.round(amount / 1000) * 1000;
  } else if (amount >= 10_000) {
    return Math.round(amount / 100) * 100;
  } else if (amount >= 1_000) {
    return Math.round(amount / 25) * 25;
  } else if (amount >= 100) {
    return Math.round(amount / 10) * 10;
  }
  return Math.round(amount);
}

/**
 * Continuous 16-Knot Piecewise Linear Interpolator
 */
export function interpolateKnot(
  followers: number,
  deliverableKey: string,
  knots: PlatformKnot[]
): { baseRate: number; targetBenchmarkEr: number; expectedViews: number } {
  const safeFollowers = Math.max(followers, 1000);

  if (!knots || knots.length === 0) {
    return { baseRate: 100, targetBenchmarkEr: 2.0, expectedViews: Math.round(safeFollowers * 0.1) };
  }

  if (safeFollowers <= knots[0].followers) {
    return {
      baseRate: knots[0].rates[deliverableKey] || 100,
      targetBenchmarkEr: knots[0].benchmarkEr,
      expectedViews: knots[0].expectedViews || Math.round(safeFollowers * 0.1),
    };
  }

  if (safeFollowers >= knots[knots.length - 1].followers) {
    const last = knots[knots.length - 1];
    const prev = knots[knots.length - 2] || last;
    const slopeRate = (last.rates[deliverableKey] - prev.rates[deliverableKey]) / Math.max(1, last.followers - prev.followers);
    const extrapolatedRate = last.rates[deliverableKey] + slopeRate * (safeFollowers - last.followers);

    return {
      baseRate: Math.round(extrapolatedRate),
      targetBenchmarkEr: last.benchmarkEr,
      expectedViews: last.expectedViews || Math.round(safeFollowers * 0.05),
    };
  }

  for (let i = 0; i < knots.length - 1; i++) {
    const k0 = knots[i];
    const k1 = knots[i + 1];

    if (safeFollowers >= k0.followers && safeFollowers <= k1.followers) {
      const progress = (safeFollowers - k0.followers) / (k1.followers - k0.followers);
      const rate0 = k0.rates[deliverableKey] || 100;
      const rate1 = k1.rates[deliverableKey] || rate0;
      const interpolatedRate = rate0 + progress * (rate1 - rate0);
      const interpolatedEr = k0.benchmarkEr + progress * (k1.benchmarkEr - k0.benchmarkEr);
      const interpolatedViews = (k0.expectedViews || 0) + progress * ((k1.expectedViews || 0) - (k0.expectedViews || 0));

      return {
        baseRate: Math.round(interpolatedRate),
        targetBenchmarkEr: parseFloat(interpolatedEr.toFixed(4)),
        expectedViews: Math.round(interpolatedViews),
      };
    }
  }

  return {
    baseRate: knots[0].rates[deliverableKey] || 100,
    targetBenchmarkEr: knots[0].benchmarkEr,
    expectedViews: 0,
  };
}

/**
 * Universal 9-Step Deterministic Valuation Engine for SignCollab
 * Sourced directly from PostgreSQL Database Knots, Niches & Constants
 */
export function calculateInfluencerRate(
  input: PricingInput,
  overrides?: DynamicCalculationOverrides
): CalculationResult {
  const { creator, deliverables, commercialTerms, productionAddons } = input;
  const followers = Math.max(creator.followerCount || 1000, 1000);

  // Active Constants (Dynamic from Database or Verified Defaults)
  const activeIgKnots = overrides?.instagramKnots || INSTAGRAM_16_KNOTS;
  const activeTtKnots = overrides?.tiktokKnots || TIKTOK_16_KNOTS;
  const activeYtKnots = overrides?.youtubeKnots || YOUTUBE_16_KNOTS;
  const activePrimaryNiches = overrides?.primaryNiches || PRIMARY_NICHES;
  const activeSubNiches = overrides?.subNiches || SUB_NICHES;
  const activeUsageRates = overrides?.usageRates || (USAGE_RATES as Record<string, Record<string, number>>);
  const activeExclusivityRates = overrides?.exclusivityRates || (EXCLUSIVITY_RATES as Record<string, Record<string, number>>);
  const activeRegionalConfigs = overrides?.regionalConfigs || (REGIONAL_CONFIG as Record<string, { name: string; pppIndex: number; currency: string; fxRateToUSD: number; symbol: string }>);

  // 1. Resolve Primary & Secondary Niche Multipliers (Triple-Layer Defense)
  const subNicheObj = creator.subNicheId ? activeSubNiches.find((s) => s.id === creator.subNicheId) : undefined;
  const primaryNicheObj =
    activePrimaryNiches.find((p) => p.id === creator.primaryNicheId) ||
    (subNicheObj ? activePrimaryNiches.find((p) => p.id === subNicheObj.primaryNicheId) : undefined) ||
    activePrimaryNiches[7]; // Default Lifestyle (1.00x)

  const primaryTargetMultiplier = subNicheObj ? subNicheObj.multiplier : (primaryNicheObj?.multiplier ?? 1.0);

  const secondaryNiches: NicheInfo[] = [];
  if (creator.secondaryNicheIds && creator.secondaryNicheIds.length > 0) {
    for (const id of creator.secondaryNicheIds) {
      const p = activePrimaryNiches.find((item) => item.id === id);
      if (p) {
        secondaryNiches.push({
          id: p.id,
          name: p.name,
          multiplier: p.multiplier,
          description: p.description,
        });
      }
    }
  }

  // Layer 2: Blended Composite Niche Multiplier (65% Primary, 20% Sec1, 15% Sec2)
  // Eliminates winner-takes-all rate shock from discrete category classification
  let nicheMultiplier = primaryTargetMultiplier;
  if (secondaryNiches.length > 0) {
    const sec1 = secondaryNiches[0]?.multiplier ?? primaryTargetMultiplier;
    const sec2 = secondaryNiches[1]?.multiplier ?? sec1;
    nicheMultiplier = (primaryTargetMultiplier * 0.65) + (sec1 * 0.20) + (sec2 * 0.15);
  }

  // Layer 3: Production-Grade Quality Floor
  // Elite creators with verified High or Medium-High production (cinematic cameras, pro color grading, studio sound)
  // command an empirical baseline floor (1.20x for High, 1.15x for Medium-High) to prevent downward distortion.
  const prodLevel = (creator.productionLevel || '').toLowerCase();
  if (prodLevel.includes('high') && !prodLevel.includes('medium')) {
    nicheMultiplier = Math.max(nicheMultiplier, 1.20);
  } else if (prodLevel.includes('medium-high')) {
    nicheMultiplier = Math.max(nicheMultiplier, 1.15);
  }

  if (creator.isLuxuryOrHighEnd) {
    nicheMultiplier *= 1.25;
  }

  // 2. Performance Multiplier Calculation (Platform-Native)
  let observedER = 0;
  let benchmarkER = 1.0;
  let clampedPerfMultiplier = 1.0;

  const likes = Math.max(0, creator.last3PostsAvgLikes || 0);
  const comments = Math.max(0, creator.last3PostsAvgComments || 0);
  const shares = Math.max(0, creator.last3PostsAvgShares || 0);
  const views = Math.max(1, creator.last3PostsAvgViews || 1);

  const platform = creator.primaryPlatform || (deliverables[0]?.platform || 'instagram');

  if (platform === 'instagram') {
    // Follower-Based Interaction Rate (Instagram deprecated public view counts)
    observedER = ((likes + comments) / followers) * 100;
    const knotInfo = interpolateKnot(followers, 'ig_reel', activeIgKnots);
    benchmarkER = knotInfo.targetBenchmarkEr;

    const ratio = observedER === 0 ? 0.05 : Math.max(observedER / Math.max(0.01, benchmarkER), 0.05);
    const erLogFactor = 0.15 * Math.log2(ratio);
    clampedPerfMultiplier = Math.min(Math.max(1.0 + erLogFactor, 0.70), 1.40);

  } else if (platform === 'tiktok') {
    // View-Based Interaction Rate including Shares
    observedER = ((likes + comments + shares) / views) * 100;
    const knotInfo = interpolateKnot(followers, 'tiktok_video', activeTtKnots);
    benchmarkER = knotInfo.targetBenchmarkEr;

    const erRatio = observedER === 0 ? 0.05 : Math.max(observedER / Math.max(0.01, benchmarkER), 0.05);
    const erLogFactor = 0.15 * Math.log2(erRatio);

    const expectedViews = knotInfo.expectedViews || Math.max(1, followers * 0.1);
    const viewRatio = views === 0 ? 0.05 : Math.max(views / expectedViews, 0.05);
    const viewLogFactor = 0.15 * Math.log2(viewRatio);

    clampedPerfMultiplier = Math.min(Math.max(1.0 + erLogFactor + viewLogFactor, 0.70), 1.40);

  } else if (platform === 'youtube') {
    const isShorts = deliverables.some((d) => d.format === 'yt_short');
    if (isShorts && !deliverables.some((d) => d.format !== 'yt_short')) {
      // Track B: YouTube Shorts
      observedER = ((likes + comments) / views) * 100;
      benchmarkER = 4.50; // Shorts baseline
      const knotInfo = interpolateKnot(followers, 'yt_short', activeYtKnots);

      const erRatio = observedER === 0 ? 0.05 : Math.max(observedER / benchmarkER, 0.05);
      const erLogFactor = 0.15 * Math.log2(erRatio);

      const expectedViews = knotInfo.expectedViews || Math.max(1, followers * 0.2);
      const viewRatio = views === 0 ? 0.05 : Math.max(views / expectedViews, 0.05);
      const viewLogFactor = 0.15 * Math.log2(viewRatio);

      clampedPerfMultiplier = Math.min(Math.max(1.0 + erLogFactor + viewLogFactor, 0.70), 1.40);
    } else {
      // Track A: YouTube Long-Form (Dedicated & 60s Integration)
      observedER = ((likes + comments) / views) * 100;
      const knotInfo = interpolateKnot(followers, 'yt_integrated', activeYtKnots);
      benchmarkER = knotInfo.targetBenchmarkEr;

      const erRatio = observedER === 0 ? 0.05 : Math.max(observedER / Math.max(0.01, benchmarkER), 0.05);
      const erLogFactor = 0.15 * Math.log2(erRatio);

      const expectedViews = knotInfo.expectedViews || Math.max(1, followers * 0.1);
      const viewRatio = views === 0 ? 0.05 : Math.max(views / expectedViews, 0.05);
      const viewLogFactor = 0.15 * Math.log2(viewRatio);

      clampedPerfMultiplier = Math.min(Math.max(1.0 + erLogFactor + viewLogFactor, 0.70), 1.40);
    }
  }

  // 3. Itemized Deliverables with Damped Base Cap (2.25x unadjusted base)
  let grossDeliverablesTotalUSD = 0;
  let totalAssetCount = 0;

  const itemizedBreakdown = deliverables.map((item) => {
    let knotArray = activeIgKnots;
    if (item.format.startsWith('ig_')) knotArray = activeIgKnots;
    else if (item.format === 'tiktok_video') knotArray = activeTtKnots;
    else if (item.format.startsWith('yt_')) knotArray = activeYtKnots;

    let { baseRate } = interpolateKnot(followers, item.format, knotArray);

    // Dynamic Tier & LF ER Calibration for YouTube 60s Integration:
    // Mid-roll value scales with creator tier (40% to 45%) and viewer retention/engagement (LF ER)
    if (item.format === 'yt_integrated') {
      const dedicatedInfo = interpolateKnot(followers, 'yt_dedicated', knotArray);

      // 1. Base Tier Ratio: 40.0% (at 1k subs) to 45.0% (at 5M+ subs)
      const logSubs = Math.log10(Math.max(1000, followers));
      const tierProgress = Math.min(Math.max((logSubs - 3) / (Math.log10(5000000) - 3), 0), 1);
      const baseTierRatio = 0.40 + tierProgress * 0.05;

      // 2. LF ER Retention Sensitivity:
      // Low ER drops integration ratio towards ~34% (passive drop-off discount)
      // High ER rewards creator loyalty up to ~48% (community conversion boost)
      const erRatio = benchmarkER > 0 ? observedER / benchmarkER : 1.0;
      const erDelta = 0.05 * Math.log2(Math.max(0.25, Math.min(erRatio, 2.5)));
      const dynamicRatio = Math.max(0.34, Math.min(0.48, baseTierRatio + erDelta));

      baseRate = Math.round(dedicatedInfo.baseRate * dynamicRatio);
    }

    let quantityAdjusted = baseRate * item.quantity;
    if (item.isCrossPost) {
      quantityAdjusted *= 0.50; // 50% discount for cross-posted secondary asset
    }

    const unconstrainedFee = quantityAdjusted * nicheMultiplier * clampedPerfMultiplier;
    const maxCap = quantityAdjusted * 2.25; // Damped cap against runaway compounding
    const effectiveFeeUSD = Math.min(unconstrainedFee, maxCap);

    grossDeliverablesTotalUSD += effectiveFeeUSD;
    totalAssetCount += item.quantity;

    return {
      id: item.id,
      format: item.format,
      platform: item.platform,
      quantity: item.quantity,
      unitInterpolatedBaseUSD: Math.round(baseRate),
      finalDeliverableFeeUSD: Math.round(effectiveFeeUSD),
    };
  });

  // 4. Multi-Asset Volume Bundle Discount (0% / 10% / 15%)
  let bundleDiscountPercent = 0.00;
  if (totalAssetCount >= 4) bundleDiscountPercent = 0.15;
  else if (totalAssetCount >= 2) bundleDiscountPercent = 0.10;

  const bundleDiscountAmountUSD = grossDeliverablesTotalUSD * bundleDiscountPercent;
  const netDeliverableFeeUSD = grossDeliverablesTotalUSD - bundleDiscountAmountUSD;

  // 5. Additive Commercial Rights & Exclusivity Surcharges
  let usagePercent = 0.0;
  if (commercialTerms?.usageRights) {
    const { scope, duration } = commercialTerms.usageRights;
    usagePercent = activeUsageRates[scope]?.[duration] || 0.0;
  }

  let exclusivityPercent = 0.0;
  if (commercialTerms?.exclusivity) {
    const { scope, duration } = commercialTerms.exclusivity;
    exclusivityPercent = activeExclusivityRates[scope]?.[duration] || 0.0;
  }

  let whitelistingPercent = commercialTerms?.whitelisting ? 0.30 : 0.0;

  const commercialRightsFeeUSD = netDeliverableFeeUSD * (usagePercent + exclusivityPercent + whitelistingPercent);

  // 6. Production Addons & Turnaround Fees
  let productionAddonsUSD = 0;
  if (productionAddons?.turnaround) {
    const rushMap: Record<TurnaroundSpeed, number> = {
      standard: 0.0,
      expedited_72h: 0.25,
      rush_48h: 0.35,
      ultra_rush_24h: 0.50,
    };
    productionAddonsUSD += netDeliverableFeeUSD * (rushMap[productionAddons.turnaround] || 0.0);
  }
  if (productionAddons?.rawFootageBuyout) {
    productionAddonsUSD += netDeliverableFeeUSD * 0.30;
  }
  if (productionAddons?.extraRevisionsCount) {
    productionAddonsUSD += productionAddons.extraRevisionsCount * 150;
  }
  if (productionAddons?.linkInBioDays) {
    productionAddonsUSD += (productionAddons.linkInBioDays / 30) * 200;
  }
  if (productionAddons?.pinnedHighlightMonths) {
    productionAddonsUSD += productionAddons.pinnedHighlightMonths * 100;
  }
  if (productionAddons?.reimbursedExpenses) {
    productionAddonsUSD += productionAddons.reimbursedExpenses;
  }

  // 7. Global GDP PPP & FX Calibration (20 Countries)
  const regionCode: RegionCode = creator.regionCode || 'US';
  const regConfig = activeRegionalConfigs[regionCode] || activeRegionalConfigs['US'] || {
    name: 'United States',
    currency: 'USD',
    pppIndex: 1.00,
    fxRateToUSD: 1.00,
    symbol: '$',
  };
  const totalUSDMedian = netDeliverableFeeUSD + commercialRightsFeeUSD + productionAddonsUSD;

  // Localized Target Median = Total Global USD × PPP Index × FX Rate
  const localizedMedian = totalUSDMedian * regConfig.pppIndex * regConfig.fxRateToUSD;

  const lowP25 = roundCommercial(localizedMedian * 0.80);
  const typicalMedian = roundCommercial(localizedMedian * 1.00);
  const highP75 = roundCommercial(localizedMedian * 1.25);

  return {
    metrics: {
      followerCount: followers,
      observedER: Number(observedER.toFixed(2)),
      benchmarkER: Number(benchmarkER.toFixed(2)),
      performanceMultiplier: Number(clampedPerfMultiplier.toFixed(2)),
      nicheMultiplier: Number(nicheMultiplier.toFixed(2)),
      primaryNicheName: primaryNicheObj?.name || 'Lifestyle & Daily Vlogs',
      subNicheId: subNicheObj?.id,
      subNicheName: subNicheObj?.name,
      secondaryNiches,
      regionApplied: regionCode,
      currency: regConfig.currency,
      currencySymbol: regConfig.symbol,
    },
    lineItems: {
      deliverables: itemizedBreakdown,
      grossTotalUSD: Math.round(grossDeliverablesTotalUSD),
      bundleDiscountApplied: `${Math.round(bundleDiscountPercent * 100)}%`,
      bundleDiscountAmountUSD: Math.round(bundleDiscountAmountUSD),
      netContentFeeUSD: Math.round(netDeliverableFeeUSD),
      commercialRightsFeeUSD: Math.round(commercialRightsFeeUSD),
      productionAddonsFeeUSD: Math.round(productionAddonsUSD),
      totalUSD: Math.round(totalUSDMedian),
    },
    valuationRange: {
      lowP25,
      typicalMedian,
      highP75,
      formatted: {
        low: `${regConfig.symbol}${lowP25.toLocaleString()}`,
        typical: `${regConfig.symbol}${typicalMedian.toLocaleString()}`,
        high: `${regConfig.symbol}${highP75.toLocaleString()}`,
      },
    },
    negotiationRange: {
      budgetOffer: lowP25,
      typicalMedian: typicalMedian,
      premiumAsk: highP75,
    },
  };
}
