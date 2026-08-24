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
  getKnotsForFormat,
  PRIMARY_NICHES,
  SUB_NICHES,
  USAGE_RATES,
  EXCLUSIVITY_RATES,
  REGIONAL_CONFIG,
} from './constants';

/**
 * Continuous 16-Knot Piecewise Linear Interpolator
 */
export function interpolateKnot(
  followers: number,
  deliverableKey: string,
  knots: PlatformKnot[]
): { baseRate: number; targetBenchmarkEr: number; expectedViews: number } {
  const safeFollowers = Math.max(followers, 1000);

  if (safeFollowers <= knots[0].followers) {
    return {
      baseRate: knots[0].rates[deliverableKey] || 100,
      targetBenchmarkEr: knots[0].benchmarkEr,
      expectedViews: knots[0].expectedViews || Math.round(safeFollowers * 0.1),
    };
  }

  if (safeFollowers >= knots[knots.length - 1].followers) {
    const last = knots[knots.length - 1];
    const prev = knots[knots.length - 2];
    const slopeRate = (last.rates[deliverableKey] - prev.rates[deliverableKey]) / (last.followers - prev.followers);
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
 */
export function calculateInfluencerRate(input: PricingInput): CalculationResult {
  const { creator, deliverables, commercialTerms, productionAddons } = input;
  const followers = Math.max(creator.followerCount || 1000, 1000);

  // 1. Resolve Primary & Secondary Niche Multipliers
  const subNicheObj = creator.subNicheId ? SUB_NICHES.find((s) => s.id === creator.subNicheId) : undefined;
  const primaryNicheObj = PRIMARY_NICHES.find((p) => p.id === creator.primaryNicheId) || PRIMARY_NICHES[7]; // Default Lifestyle (1.00x)

  let nicheMultiplier = subNicheObj ? subNicheObj.multiplier : primaryNicheObj.multiplier;
  if (creator.isLuxuryOrHighEnd) {
    nicheMultiplier *= 1.25;
  }

  const secondaryNiches: NicheInfo[] = [];
  if (creator.secondaryNicheIds) {
    for (const id of creator.secondaryNicheIds) {
      const p = PRIMARY_NICHES.find((item) => item.id === id);
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

  // 2. Performance Multiplier Calculation (Platform-Native)
  let observedER = 0;
  let benchmarkER = 1.0;
  let clampedPerfMultiplier = 1.0;

  // Interactions
  const likes = Math.max(0, creator.last3PostsAvgLikes || 0);
  const comments = Math.max(0, creator.last3PostsAvgComments || 0);
  const shares = Math.max(0, creator.last3PostsAvgShares || 0);
  const views = Math.max(1, creator.last3PostsAvgViews || 1);

  const platform = creator.primaryPlatform || (deliverables[0]?.platform || 'instagram');

  if (platform === 'instagram') {
    // Track 1: Follower-Based Interaction Rate (Instagram deprecated public views)
    observedER = ((likes + comments) / followers) * 100;
    const knotInfo = interpolateKnot(followers, 'ig_reel', INSTAGRAM_16_KNOTS);
    benchmarkER = knotInfo.targetBenchmarkEr;

    const ratio = observedER === 0 ? 0.05 : Math.max(observedER / benchmarkER, 0.05);
    const erLogFactor = 0.15 * Math.log2(ratio);
    clampedPerfMultiplier = Math.min(Math.max(1.0 + erLogFactor, 0.70), 1.40);

  } else if (platform === 'tiktok') {
    // Track 2: View-Based Interaction Rate including Shares
    observedER = ((likes + comments + shares) / views) * 100;
    const knotInfo = interpolateKnot(followers, 'tiktok_video', TIKTOK_16_KNOTS);
    benchmarkER = knotInfo.targetBenchmarkEr;

    const erRatio = observedER === 0 ? 0.05 : Math.max(observedER / benchmarkER, 0.05);
    const erLogFactor = 0.15 * Math.log2(erRatio);

    const expectedViews = knotInfo.expectedViews || Math.max(1, followers * 0.1);
    const viewRatio = views === 0 ? 0.05 : Math.max(views / expectedViews, 0.05);
    const viewLogFactor = 0.15 * Math.log2(viewRatio);

    clampedPerfMultiplier = Math.min(Math.max(1.0 + erLogFactor + viewLogFactor, 0.70), 1.40);

  } else if (platform === 'youtube') {
    const isShorts = deliverables.some(d => d.format === 'yt_short');
    if (isShorts && !deliverables.some(d => d.format !== 'yt_short')) {
      // Track B: YouTube Shorts
      observedER = ((likes + comments) / views) * 100;
      benchmarkER = 4.50; // Shorts baseline
      const knotInfo = interpolateKnot(followers, 'yt_short', YOUTUBE_16_KNOTS);

      const erRatio = observedER === 0 ? 0.05 : Math.max(observedER / benchmarkER, 0.05);
      const erLogFactor = 0.15 * Math.log2(erRatio);

      const expectedViews = knotInfo.expectedViews || Math.max(1, followers * 0.2);
      const viewRatio = views === 0 ? 0.05 : Math.max(views / expectedViews, 0.05);
      const viewLogFactor = 0.15 * Math.log2(viewRatio);

      clampedPerfMultiplier = Math.min(Math.max(1.0 + erLogFactor + viewLogFactor, 0.70), 1.40);
    } else {
      // Track A: YouTube Long-Form (Dedicated & 60s Integration)
      observedER = ((likes + comments) / views) * 100;
      const knotInfo = interpolateKnot(followers, 'yt_integrated', YOUTUBE_16_KNOTS);
      benchmarkER = knotInfo.targetBenchmarkEr;

      const erRatio = observedER === 0 ? 0.05 : Math.max(observedER / benchmarkER, 0.05);
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
    const knots = getKnotsForFormat(item.format);
    const { baseRate } = interpolateKnot(followers, item.format, knots);

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
    usagePercent = USAGE_RATES[scope]?.[duration] || 0.0;
  }

  let exclusivityPercent = 0.0;
  if (commercialTerms?.exclusivity) {
    const { scope, duration } = commercialTerms.exclusivity;
    exclusivityPercent = EXCLUSIVITY_RATES[scope]?.[duration] || 0.0;
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
  const regConfig = REGIONAL_CONFIG[regionCode] || REGIONAL_CONFIG['US'];
  const totalUSDMedian = netDeliverableFeeUSD + commercialRightsFeeUSD + productionAddonsUSD;

  // Localized Target Median = Total Global USD × PPP Index × FX Rate
  const localizedMedian = totalUSDMedian * regConfig.pppIndex * regConfig.fxRateToUSD;

  const lowP25 = Math.round(localizedMedian * 0.80);
  const typicalMedian = Math.round(localizedMedian * 1.00);
  const highP75 = Math.round(localizedMedian * 1.25);

  return {
    metrics: {
      followerCount: followers,
      observedER: Number(observedER.toFixed(2)),
      benchmarkER: Number(benchmarkER.toFixed(2)),
      performanceMultiplier: Number(clampedPerfMultiplier.toFixed(2)),
      nicheMultiplier: Number(nicheMultiplier.toFixed(2)),
      primaryNicheName: primaryNicheObj.name,
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
