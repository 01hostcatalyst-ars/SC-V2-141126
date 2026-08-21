import { calculateInfluencerRate } from '../src/lib/calculator/engine';
import { PricingInput } from '../src/lib/calculator/types';

console.log('--- TEST 1: Zero-Cliff Boundary Check (9,999 vs 10,001 followers) ---');
const input9999: PricingInput = {
  creator: {
    followerCount: 9999,
    last3PostsAvgLikes: 200,
    last3PostsAvgComments: 20,
    primaryNicheId: 10, // Fashion
  },
  deliverables: [{ id: '1', platform: 'instagram', format: 'ig_reel', quantity: 1 }],
};

const input10001: PricingInput = {
  creator: {
    followerCount: 10001,
    last3PostsAvgLikes: 200,
    last3PostsAvgComments: 20,
    primaryNicheId: 10, // Fashion
  },
  deliverables: [{ id: '1', platform: 'instagram', format: 'ig_reel', quantity: 1 }],
};

const res9999 = calculateInfluencerRate(input9999);
const res10001 = calculateInfluencerRate(input10001);

console.log(`9,999 followers: Base Unit = $${res9999.lineItems.deliverables[0].unitInterpolatedBaseUSD}, Typical = ${res9999.valuationRange.formatted.typical}`);
console.log(`10,001 followers: Base Unit = $${res10001.lineItems.deliverables[0].unitInterpolatedBaseUSD}, Typical = ${res10001.valuationRange.formatted.typical}`);
const diff = Math.abs(res10001.valuationRange.typicalMedian - res9999.valuationRange.typicalMedian);
console.log(`Price delta across boundary: $${diff} (Should be <= $1)`);

console.log('\n--- TEST 2: Zero Interactions Penalty Check ---');
const inputZeroInteractions: PricingInput = {
  creator: {
    followerCount: 20000,
    last3PostsAvgLikes: 0,
    last3PostsAvgComments: 0,
    primaryNicheId: 10,
  },
  deliverables: [{ id: '1', platform: 'instagram', format: 'ig_reel', quantity: 1 }],
};
const resZero = calculateInfluencerRate(inputZeroInteractions);
console.log(`Zero Engagement Multiplier: ${resZero.metrics.performanceMultiplier} (Expected: 0.70)`);

console.log('\n--- TEST 3: Multi-Deliverable Bundle + Commercial Rights (Home Design 2.5K) ---');
const inputHomeDesign: PricingInput = {
  creator: {
    followerCount: 2500,
    last3PostsAvgLikes: 25,
    last3PostsAvgComments: 25,
    primaryNicheId: 1, // Home Design (2.0x)
    regionCode: 'US',
  },
  deliverables: [
    { id: '1', platform: 'instagram', format: 'ig_reel', quantity: 2 },
    { id: '2', platform: 'instagram', format: 'ig_static', quantity: 2 },
    { id: '3', platform: 'instagram', format: 'ig_story', quantity: 2 },
  ],
  commercialTerms: {
    usageRights: { scope: 'paid_partnership_ads', duration: '90_days' }, // +45%
    exclusivity: { scope: 'direct_competitors', duration: '30_days' }, // +25%
  },
};
const resHome = calculateInfluencerRate(inputHomeDesign);
console.log(`Gross Total USD: $${resHome.lineItems.grossTotalUSD}`);
console.log(`Bundle Discount: ${resHome.lineItems.bundleDiscountApplied} (-$${resHome.lineItems.bundleDiscountAmountUSD})`);
console.log(`Commercial Rights: +$${resHome.lineItems.commercialRightsFeeUSD}`);
console.log(`Valuation Range: Low: ${resHome.valuationRange.formatted.low} | Typical: ${resHome.valuationRange.formatted.typical} | High: ${resHome.valuationRange.formatted.high}`);

console.log('\n--- TEST 4: Regional Localization Check (Pakistan PKR) ---');
const inputPK: PricingInput = {
  ...inputHomeDesign,
  creator: {
    ...inputHomeDesign.creator,
    regionCode: 'PK',
  },
};
const resPK = calculateInfluencerRate(inputPK);
console.log(`Pakistan Localized Valuation: Low: ${resPK.valuationRange.formatted.low} | Typical: ${resPK.valuationRange.formatted.typical} | High: ${resPK.valuationRange.formatted.high}`);

console.log('\nALL VERIFICATION TESTS COMPLETED.');
