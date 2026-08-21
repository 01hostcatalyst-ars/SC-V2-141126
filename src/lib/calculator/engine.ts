import {
  PricingInput,
  CalculationResult,
  TurnaroundSpeed,
  RegionCode,
} from './types';
import {
  ANCHOR_KNOTS,
  BENCHMARK_ER_KNOTS,
  EXPECTED_VIEW_RATE_KNOTS,
  PRIMARY_NICHES,
  SUB_NICHES,
  USAGE_RATES,
  EXCLUSIVITY_RATES,
  REGIONAL_CONFIG,
} from './constants';

export function interpolateLinear(knots: Array<[number, number]>, x: number): number {
  if (x <= knots[0][0]) return knots[0][1];
  if (x >= knots[knots.length - 1][0]) {
    const last = knots[knots.length - 1];
    const prev = knots[knots.length - 2];
    const slope = (last[1] - prev[1]) / (last[0] - prev[0]);
    return last[1] + slope * (x - last[0]);
  }
  for (let i = 0; i < knots.length - 1; i++) {
    const [x0, y0] = knots[i];
    const [x1, y1] = knots[i + 1];
    if (x >= x0 && x <= x1) {
      const progress = (x - x0) / (x1 - x0);
      return y0 + progress * (y1 - y0);
    }
  }
  return knots[0][1];
}

export function calculateInfluencerRate(input: PricingInput): CalculationResult {
  const { creator, deliverables, commercialTerms, productionAddons } = input;
  const followers = Math.max(creator.followerCount || 1000, 1000);

  // 1. Smooth ER Calculation & Resolution
  const totalInteractions = Math.max(0, (creator.last3PostsAvgLikes || 0) + (creator.last3PostsAvgComments || 0));
  const observedER = (totalInteractions / followers) * 100;
  const smoothBaselineER = interpolateLinear(BENCHMARK_ER_KNOTS, followers);

  // Explicit safety against JavaScript 0 falsy bug: clamp to 0.05 min ratio
  const erRatio = totalInteractions === 0 ? 0.05 : Math.max(observedER / smoothBaselineER, 0.05);
  const erLogFactor = 0.15 * Math.log2(erRatio);

  // 2. Smooth View Velocity Factor
  let viewLogFactor = 0.0;
  if (creator.last3PostsAvgViews !== undefined && creator.last3PostsAvgViews >= 0) {
    const expectedRate = interpolateLinear(EXPECTED_VIEW_RATE_KNOTS, followers);
    const expectedViews = Math.max(1, followers * expectedRate);
    const viewRatio = creator.last3PostsAvgViews === 0 ? 0.05 : Math.max(creator.last3PostsAvgViews / expectedViews, 0.05);
    viewLogFactor = 0.15 * Math.log2(viewRatio);
  }

  // Clamped performance multiplier [0.70x, 1.40x]
  const performanceMultiplier = Math.min(Math.max(1.0 + erLogFactor + viewLogFactor, 0.70), 1.40);

  // 3. Niche Modifier Resolution
  const subNicheObj = creator.subNicheId ? SUB_NICHES.find((s) => s.id === creator.subNicheId) : undefined;
  const primaryNicheObj = PRIMARY_NICHES.find((p) => p.id === creator.primaryNicheId);

  let nicheMultiplier = subNicheObj ? subNicheObj.multiplier : primaryNicheObj ? primaryNicheObj.multiplier : 1.00;

  if (creator.isLuxuryOrHighEnd) {
    nicheMultiplier *= 1.25;
  }

  // 4. Itemized Deliverables Calculation with Damped Base Cap (2.25x unadjusted base)
  let grossDeliverablesTotalUSD = 0;
  let totalAssetCount = 0;

  const itemizedBreakdown = deliverables.map((item) => {
    const knots = ANCHOR_KNOTS[item.format] || ANCHOR_KNOTS['ig_reel'];
    const rawInterpolatedBase = interpolateLinear(knots, followers);
    let quantityAdjusted = rawInterpolatedBase * item.quantity;

    if (item.isCrossPost) {
      quantityAdjusted *= 0.50; // 50% discount for cross-posted secondary asset
    }

    const unconstrainedFee = quantityAdjusted * nicheMultiplier * performanceMultiplier;
    const maxCap = quantityAdjusted * 2.25; // Damped cap against runaway compounding
    const effectiveFeeUSD = Math.min(unconstrainedFee, maxCap);

    grossDeliverablesTotalUSD += effectiveFeeUSD;
    totalAssetCount += item.quantity;

    return {
      id: item.id,
      format: item.format,
      platform: item.platform,
      quantity: item.quantity,
      unitInterpolatedBaseUSD: Math.round(rawInterpolatedBase),
      finalDeliverableFeeUSD: Math.round(effectiveFeeUSD),
    };
  });

  // 5. Volume Bundle Discount
  let bundleDiscountPercent = 0.00;
  if (totalAssetCount >= 2 && totalAssetCount <= 3) bundleDiscountPercent = 0.10;
  else if (totalAssetCount >= 4) bundleDiscountPercent = 0.15;

  const bundleDiscountAmountUSD = grossDeliverablesTotalUSD * bundleDiscountPercent;
  const netDeliverableFeeUSD = grossDeliverablesTotalUSD - bundleDiscountAmountUSD;

  // 6. Additive Commercial Rights & Exclusivity Upcharges
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

  const commercialRightsFeeUSD = netDeliverableFeeUSD * (usagePercent + exclusivityPercent);

  // 7. Production Surcharges & Out-of-Pocket Expenses
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

  // 8. Regional Calibration & Currency Output
  const regionCode: RegionCode = creator.regionCode || 'US';
  const regConfig = REGIONAL_CONFIG[regionCode] || REGIONAL_CONFIG['US'];
  const totalUSDMedian = netDeliverableFeeUSD + commercialRightsFeeUSD + productionAddonsUSD;

  // Localized Economic Value = USD Valuation × Regional Purchasing Power Index × FX Rate
  const localizedMedian = totalUSDMedian * regConfig.pppIndex * regConfig.fxRateToUSD;

  return {
    metrics: {
      followerCount: followers,
      observedER: Number(observedER.toFixed(2)),
      benchmarkER: Number(smoothBaselineER.toFixed(2)),
      performanceMultiplier: Number(performanceMultiplier.toFixed(2)),
      nicheMultiplier: Number(nicheMultiplier.toFixed(2)),
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
      lowP25: Math.round(localizedMedian * 0.80),
      typicalMedian: Math.round(localizedMedian),
      highP75: Math.round(localizedMedian * 1.25),
      formatted: {
        low: `${regConfig.symbol}${Math.round(localizedMedian * 0.80).toLocaleString()}`,
        typical: `${regConfig.symbol}${Math.round(localizedMedian).toLocaleString()}`,
        high: `${regConfig.symbol}${Math.round(localizedMedian * 1.25).toLocaleString()}`,
      },
    },
  };
}
