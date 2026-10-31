const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
const { buildCalculatorProfile } = require('../src/lib/calculator/profile-presentation.ts');
const rate = { format: 'yt_dedicated', amount: 1307000, lowAmount: 1046000, highAmount: 1634000, formattedAmount: 'Rs. 1,307,000', formattedLow: 'Rs. 1,046,000', formattedHigh: 'Rs. 1,634,000', currency: 'PKR' };
const sample = { id: 'core', viewCount: 338600, isErSample: true, isShort: false };
function input() {
  return {
    creator: { displayName: 'Creator', primaryUsername: 'creator', primaryPlatform: 'youtube' },
    platforms: {
      youtube: { status: 'ready', username: 'creator', followerCount: 3030000, engagementRate: 1.68, longEngagementRate: 1.68, shortEngagementRate: 3.88, avgLongViews: 120000, avgShortViews: 20000, collectedAt: '2026-10-31T10:00:00Z', videos: [sample], rateCardItems: [rate] },
      instagram: { status: 'idle' }, tiktok: { status: 'error', videos: [{ id: 'stale' }] },
    },
    intelligence: { audience: { primaryMarket: 'United States', genderSkew: 'Balanced', likelyAgeRange: '18-34', purchaseIntent: 'Moderate Intent', secondaryMarkets: [], interests: [] } },
    packages: [{ id: 'reach', pricing: { typicalMedian: 2093000 } }], region: 'PK', nicheId: 8,
  };
}
test('presentation keeps calculator rate amounts, currency, package prices, and LF/SF metrics intact', () => {
  const source = input();
  const result = buildCalculatorProfile(source);
  assert.equal(result.platforms.youtube.rates[0].recommendedAmount, rate.amount);
  assert.equal(result.platforms.youtube.rates[0].lowAmount, rate.lowAmount);
  assert.equal(result.platforms.youtube.rates[0].highAmount, rate.highAmount);
  assert.equal(result.platforms.youtube.rates[0].formattedRecommended, rate.formattedAmount);
  assert.equal(result.platforms.youtube.rates[0].currency, 'PKR');
  assert.equal(result.platforms.youtube.lfEr, 1.68);
  assert.equal(result.platforms.youtube.sfEr, 3.88);
  assert.equal(result.platforms.youtube.avgViews, 120000);
  assert.equal(result.platforms.youtube.avgShortViews, 20000);
  assert.equal(result.omnichannelPackages, source.packages);
});
test('pricing market does not replace audience geography or append Intent twice', () => {
  const result = buildCalculatorProfile(input());
  assert.equal(result.countryName, 'Pakistan');
  assert.equal(result.intelligence.audience.primaryMarket, 'United States');
  assert.equal(result.intelligence.audience.commercialBuyerIntent, 'Moderate Intent');
});
test('only completed platforms expose samples; original flags and collection dates survive', () => {
  const result = buildCalculatorProfile(input());
  assert.equal(result.platforms.instagram, null);
  assert.equal(result.platforms.tiktok, null);
  assert.deepEqual(result.recentMedia.youtubeVideos, [sample]);
  assert.deepEqual(result.recentMedia.tiktokVideos, []);
  assert.deepEqual(result.recentMedia.collectedAt, { youtube: '2026-10-31T10:00:00Z' });
});
test('missing insights and collection dates are not invented', () => {
  const source = input();
  source.intelligence = null;
  delete source.platforms.youtube.collectedAt;
  const result = buildCalculatorProfile(source);
  assert.equal(result.intelligence.audience.primaryMarket, undefined);
  assert.equal(result.intelligence.audience.commercialBuyerIntent, undefined);
  assert.equal(result.intelligence.brandSafety.overallRisk, 'Not available');
  assert.deepEqual(result.recentMedia.collectedAt, {});
});
