const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(spec, ...args) { return originalResolve.call(this, spec.startsWith('@/') ? path.join(process.cwd(), 'src', spec.slice(2)) : spec, ...args); };
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, file);
const policy = require('../src/lib/creators/refresh-policy.ts');
const { discoverRefreshAccounts, accountHandle } = require('../src/lib/creators/refresh-discovery.ts');
const { buildRefreshInput } = require('../src/lib/creators/refresh-input.ts');
const { runProfileRefresh } = require('../src/lib/creators/run-profile-refresh.ts');

test('freshness uses strict seven-day source age, including missing/invalid timestamps', () => {
 const now = Date.parse('2026-10-27T12:00:00Z');
 assert.equal(policy.refreshIsDue(new Date(now - policy.PROFILE_MAX_AGE_MS), now), false);
 assert.equal(policy.refreshIsDue(new Date(now - policy.PROFILE_MAX_AGE_MS - 1), now), true);
 for (const date of [null, undefined, 'invalid', new Date(now + 1)]) assert.equal(policy.refreshIsDue(date, now), true);
 assert.equal(policy.oldestSourceDate([new Date(now), undefined]), null);
 assert.equal(policy.oldestSourceDate([new Date(now), new Date(now - 8 * 86400000)]), '2026-10-19T12:00:00.000Z');
});

test('discovery preserves saved relationships, handles cycles, and ignores video/non-platform links', () => {
 const saved = { youtube: 'creator', instagram: 'saved_ig' };
 assert.deepEqual(discoverRefreshAccounts(['https://instagram.com/replacement https://tiktok.com/@new_tt https://youtube.com/@creator'], saved), { tiktok: 'new_tt' });
 assert.deepEqual(discoverRefreshAccounts(['https://youtube.com/watch?v=x https://instagram.com/p/123 https://evil.com/person'], {}), {});
 assert.equal(accountHandle('youtube', 'https://youtube.com/@Creator/videos'), 'creator');
 assert.equal(accountHandle('instagram', 'https://evil.com/creator'), null);
 assert.deepEqual(discoverRefreshAccounts(['https://youtube.com/@creator'], { youtube: 'creator' }), {});
});

async function simulate(initial, responses) {
 const calls = []; const stages = [];
 await runProfileRefresh(async body => {
  calls.push(body.action === 'platform' ? body.platform : body.action);
  if (body.action === 'start') return { success: true, id: 'run', token: 'token', accounts: initial };
  if (body.action === 'platform') return responses[body.platform] || { success: true, accounts: initial };
  return { success: true };
 }, value => stages.push(value.stage));
 return { calls, stages };
}
for (const initial of [{ youtube: 'yt' }, { youtube: 'yt', instagram: 'ig' }, { youtube: 'yt', instagram: 'ig', tiktok: 'tt' }]) {
 test(`${Object.keys(initial).length}-platform result completes without requiring absent accounts`, async () => {
  const { calls } = await simulate(initial, {});
  assert.deepEqual(calls, ['start', ...policy.PLATFORMS.filter(p => initial[p]), 'complete']);
 });
}

test('starts new discoveries while original scans are running, deduplicates, and waits for all before LLM', async () => {
 const calls = []; let releaseInstagram;
 const instagram = new Promise(resolve => { releaseInstagram = resolve; });
 await runProfileRefresh(async body => {
  if (body.action === 'start') return { success: true, id: 'r', token: 't', accounts: { youtube: 'yt', instagram: 'ig' } };
  if (body.action === 'platform') {
   calls.push(body.platform);
   if (body.platform === 'instagram') { await instagram; return { success: true, accounts: { youtube: 'yt', instagram: 'ig', tiktok: 'tt' } }; }
   if (body.platform === 'tiktok') { releaseInstagram(); return { success: true, accounts: { youtube: 'yt', instagram: 'ig', tiktok: 'tt' } }; }
   return { success: true, accounts: { youtube: 'yt', instagram: 'ig', tiktok: 'tt' } };
  }
  assert.equal(body.action, 'complete'); calls.push('complete'); return { success: true };
 }, () => {});
 assert.deepEqual(calls, ['youtube', 'instagram', 'tiktok', 'complete']);
});

test('a known-platform failure never starts synthesis; prior profile remains the published result', async () => {
 const calls = [];
 await assert.rejects(runProfileRefresh(async body => {
  calls.push(body.action);
  if (body.action === 'start') return { success: true, id: 'r', token: 't', accounts: { youtube: 'yt' } };
  if (body.action === 'platform') return { success: false, error: 'provider failed' };
  return { success: true };
 }, () => {}), /provider failed/);
 assert.deepEqual(calls, ['start', 'platform', 'fail']);
});

function fixture(platform, bio = '') {
 if (platform === 'youtube') return { channel: { id: 'UC123', handle: '@creator', title: 'Creator', subscriberCount: 50000, videoCount: 1, country: 'US', description: bio, externalLinks: [] }, longVideos: [{ title: 'Long', isErSample: true, viewCount: 10000, likeCount: 500, commentCount: 20, comments: [{ textDisplay: 'yt comment' }] }], shortVideos: [{ title: 'Short', isErSample: true, viewCount: 20000, likeCount: 900, commentCount: 40, comments: [] }], stats: { avgLongVideoViews: 10000, avgShortVideoViews: 20000, avgLongEngagementRate: 5.2, avgShortEngagementRate: 4.7 } };
 if (platform === 'instagram') return { profile: { username: 'creator_ig', fullName: 'Creator', followerCount: 20000, biography: bio, postsCount: 1, externalUrls: [] }, posts: [{ caption: 'caption', comments: [{ text: 'ig comment' }] }], stats: { avgLikesPerPost: 200, avgCommentsPerPost: 20, avgEngagementRate: 1.1 } };
 return { profile: { username: 'creator_tt', nickname: 'Creator', followerCount: 30000, biography: bio, videoCount: 1 }, videos: [{ description: 'description', comments: [{ text: 'tt comment' }] }], stats: { avgViewsPerVideo: 2000, avgLikesPerVideo: 100, avgCommentsPerVideo: 10, avgSharesPerVideo: 20, avgEngagementRate: 6.5 } };
}

test('LLM input uses exact saved IDs and Rate Radar field/sample structure', () => {
 const youtube = { ...fixture('youtube'), snapshotId: 'yt-new' };
 const instagram = { ...fixture('instagram'), snapshotId: 'ig-new' };
 const tiktok = { ...fixture('tiktok'), snapshotId: 'tt-new' };
 const input = buildRefreshInput('Creator', { youtube, instagram, tiktok }, 'PK');
 assert.equal(input.reportedCountry, 'United States');
 assert.equal(input.youtubeScrapeId, 'yt-new'); assert.equal(input.instagramScrapeId, 'ig-new'); assert.equal(input.tiktokScrapeId, 'tt-new');
 assert.deepEqual(input.youtube.recentTitles, ['Long', 'Short']);
 assert.deepEqual(input.youtube.topComments, ['yt comment']);
 assert.equal(input.youtube.avgViews, 10000);
 assert.equal(input.youtube.observedEr, 5.2);
 assert.deepEqual(input.instagram.topComments, ['ig comment']);
 assert.deepEqual(input.tiktok.topComments, ['tt comment']);
});

// Service tests simulate providers and a transactional database. No paid APIs or real creator writes.
function serviceFixture({ saveFailure = false, fresh = false, inactivePlatform } = {}) {
 const old = { id: 'old-snapshot', history: 'preserve me' };
 const snapshots = { youtube: [structuredClone(old)], instagram: [structuredClone(old)], tiktok: [structuredClone(old)] };
 const intelligence = [{ id: 'old-intel', raw: 'preserve me' }];
 const runs = []; const events = []; let sequence = 0; let lock = Promise.resolve();
 const cluster = { id: 'cluster', slug: 'creator', canonicalName: 'Creator', youtubeHandle: 'creator', instagramUsername: null, tiktokUsername: null };
 const baseline = { clusterId: 'cluster', slug: 'creator', brandName: 'Creator', canonicalName: 'Creator', countryCode: 'US', freshness: { oldestSourceAt: new Date(Date.now() - (fresh ? 1 : 8) * 86400000).toISOString(), sources: {} } };
 const jobs = {
  findUnique: async ({ where }) => runs.find(run => run.id === where.id) || null,
  findFirst: async () => runs.at(-1) || null,
  create: async ({ data }) => { const run = { id: `run-${++sequence}`, status: 'collecting', intelligenceId: null, completedAt: null, createdAt: new Date(), ...data }; runs.push(run); return structuredClone(run); },
  update: async ({ where, data }) => { const run = runs.find(run => run.id === where.id); Object.assign(run, data); return structuredClone(run); },
  updateMany: async ({ where, data }) => { for (const run of runs) if (where.status.in.includes(run.status) && run.expiresAt <= where.expiresAt.lte) Object.assign(run, data); return { count: 0 }; },
  count: async () => runs.length,
 };
 const db = { creatorProfileRefresh: jobs, $queryRaw: async () => [],
  creatorIdentityCluster: { findUnique: async () => cluster, findUniqueOrThrow: async () => cluster, findFirst: async () => null, update: async ({ data }) => Object.assign(cluster, data) },
  creatorIntelligence: { findFirst: async ({ where }) => [...intelligence].reverse().find(item => item.youtubeScrapeId === where.youtubeScrapeId && item.instagramScrapeId === where.instagramScrapeId && item.tiktokScrapeId === where.tiktokScrapeId) || null },
 };
 for (const [p, model] of [['youtube','youTubeScrape'],['instagram','instagramScrape'],['tiktok','tikTokScrape']]) db[model] = { findUniqueOrThrow: async ({ where }) => snapshots[p].find(row => row.id === where.id) };
 db.$transaction = fn => { const next = lock.then(() => fn(db)); lock = next.catch(() => {}); return next; };
 const provider = platform => ({
  [platform === 'youtube' ? 'scrapeYouTube' : platform === 'instagram' ? 'scrapeInstagram' : 'scrapeTikTok']: async () => { events.push(`scrape:${platform}`); if (inactivePlatform === platform) throw new Error('Bright Data API request failed (400 Bad Request): Customer is not active'); return fixture(platform, platform === 'youtube' ? 'https://instagram.com/creator_ig' : platform === 'instagram' ? 'https://tiktok.com/@creator_tt https://youtube.com/@creator' : 'https://instagram.com/creator_ig'); },
  [platform === 'youtube' ? 'insertNewYouTubeSnapshot' : platform === 'instagram' ? 'insertNewInstagramSnapshot' : 'insertNewTikTokSnapshot']: async value => { const id = `${platform}-new`; const row = { ...value, id, snapshotId: id }; snapshots[platform].push(row); return row; },
  [platform === 'youtube' ? 'formatDbRecordToScraperData' : platform === 'instagram' ? 'formatDbRecordToInstagramData' : 'formatDbRecordToTikTokData']: value => value,
 });
 const mocks = {
  '@/lib/prisma': { prisma: db },
  '@/lib/ai/gemini': { generateCompleteCreatorIntelligence: async (input, bypass) => { events.push('llm'); assert.equal(bypass, true); if (!saveFailure) intelligence.push({ id: 'new-intel', youtubeScrapeId: input.youtubeScrapeId || null, instagramScrapeId: input.instagramScrapeId || null, tiktokScrapeId: input.tiktokScrapeId || null, createdAt: new Date() }); return {}; } },
  './profile-resolver': { resolveFullCreatorProfile: async (_slug, options) => options ? { ...baseline, freshness: { sources: options.sources, oldestSourceAt: new Date().toISOString() } } : baseline },
  './refresh-records': { latestProfileRefresh: async () => runs.at(-1) || null },
  '@/lib/scrapers/youtube': provider('youtube'), '@/lib/scrapers/instagram': provider('instagram'), '@/lib/scrapers/tiktok': provider('tiktok'),
 };
 const originalLoad = Module._load;
 Module._load = function(spec, ...args) { return mocks[spec] || originalLoad.call(this, spec, ...args); };
 const filename = require.resolve('../src/lib/creators/refresh-service.ts'); delete require.cache[filename];
 let service;
 try { service = require(filename); } finally { Module._load = originalLoad; }
 return { service, runs, snapshots, intelligence, cluster, events, baseline };
}

test('service follows recursive discovery, preserves history, and publishes only after a saved LLM result', async () => {
 const env = serviceFixture();
 await runProfileRefresh(async body => {
  if (body.action === 'start') return { success: true, ...await env.service.startProfileRefresh('creator') };
  if (body.action === 'platform') return { success: true, ...await env.service.refreshPlatform('creator', body.id, body.token, body.platform) };
  if (body.action === 'complete') return env.service.completeProfileRefresh('creator', body.id, body.token);
  return env.service.failProfileRefresh('creator', body.id, body.token);
 }, () => {});
 assert.deepEqual(env.events, ['scrape:youtube', 'scrape:instagram', 'scrape:tiktok', 'llm']);
 assert.equal(env.runs[0].status, 'completed'); assert.equal(env.runs[0].intelligenceId, 'new-intel');
 for (const records of Object.values(env.snapshots)) assert.deepEqual(records[0], { id: 'old-snapshot', history: 'preserve me' });
 assert.deepEqual(env.intelligence[0], { id: 'old-intel', raw: 'preserve me' });
 assert.equal(env.cluster.instagramUsername, 'creator_ig'); assert.equal(env.cluster.tiktokUsername, 'creator_tt');
});

test('failed intelligence persistence cannot complete the refresh', async () => {
 const env = serviceFixture({ saveFailure: true });
 const run = await env.service.startProfileRefresh('creator');
 for (const p of policy.PLATFORMS) await env.service.refreshPlatform('creator', run.id, run.token, p);
 await assert.rejects(env.service.completeProfileRefresh('creator', run.id, run.token), /could not be saved/);
 await env.service.failProfileRefresh('creator', run.id, run.token);
 assert.equal(env.runs[0].status, 'failed'); assert.equal(env.runs[0].completedAt, null);
 assert.deepEqual(env.runs[0].baselineProfile, env.baseline);
 assert.equal(env.cluster.instagramUsername, null);
});

test('server rejects fresh profiles, duplicate starts, tampered tokens, and premature completion', async () => {
 await assert.rejects(serviceFixture({ fresh: true }).service.startProfileRefresh('creator'), /already up to date/);
 const env = serviceFixture();
 const results = await Promise.allSettled([env.service.startProfileRefresh('creator'), env.service.startProfileRefresh('creator')]);
 assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
 const run = results.find(result => result.status === 'fulfilled').value;
 await assert.rejects(env.service.refreshPlatform('creator', run.id, 'a'.repeat(64), 'youtube'), /not valid/);
 await assert.rejects(env.service.completeProfileRefresh('creator', run.id, run.token), /finish successfully/);
 assert.equal(env.events.length, 0);
});


function resolverFixture(refresh, latestIntel, allowLatest = false) {
 const old = new Date('2026-10-01T00:00:00Z');
 const cluster = { id: 'cluster', slug: 'creator', canonicalName: 'Creator', brandName: 'Creator', youtubeHandle: 'creator', instagramUsername: 'creator_ig', tiktokUsername: 'creator_tt', countryCode: 'US', primaryNicheId: 8, primaryPlatform: 'youtube', combinedFollowers: 100000n, isClaimed: true, verificationLevel: 'EMAIL_VERIFIED' };
 const records = {};
 for (const platform of policy.PLATFORMS) {
  const data = fixture(platform);
  const base = { id: platform + '-new', createdAt: old, lastScrapedAt: old, stats: data.stats };
  records[platform] = platform === 'youtube' ? { ...base, subscriberCount: 50000n, avgViewsPerVideo: 10000n, longVideos: data.longVideos, shortVideos: data.shortVideos } : platform === 'instagram' ? { ...base, followerCount: 20000n, avgEngagementRate: 1.1 } : { ...base, followerCount: 30000n, avgEngagementRate: 6.5 };
 }
 const intel = { id: 'new-intel', createdAt: old, primaryNicheId: 8, primaryNicheName: 'Lifestyle', countryCode: 'US', rawLlmResponse: {} };
 const calls = [];
 const db = {
  creatorIdentityCluster: { findFirst: async () => cluster },
  creatorIntelligence: { findFirst: async () => latestIntel || intel, findUnique: async ({ where }) => { calls.push(where.id); return intel; } },
 };
 for (const [platform, model] of [['youtube','youTubeScrape'],['instagram','instagramScrape'],['tiktok','tikTokScrape']]) db[model] = {
  findUnique: async ({ where }) => { calls.push(where.id); assert.equal(where.id, platform + '-new'); return records[platform]; },
  findFirst: async () => { if (allowLatest) return records[platform]; throw new Error('Must use published snapshot IDs, not the newest unrelated scrape'); },
 };
 const originalLoad = Module._load;
 Module._load = function(spec, ...args) {
  if (spec === '@/lib/prisma') return { prisma: db };
  if (spec === './refresh-records') return { latestProfileRefresh: async () => refresh };
  return originalLoad.call(this, spec, ...args);
 };
 const filename = require.resolve('../src/lib/creators/profile-resolver.ts'); delete require.cache[filename];
 let resolver; try { resolver = require(filename); } finally { Module._load = originalLoad; }
 return { resolver, calls, records, intel };
}

test('profile keeps its baseline during a partial/failed refresh and overlays current claim status', async () => {
 for (const status of ['collecting', 'analyzing', 'failed']) {
  const run = { status, expiresAt: new Date(Date.now() + 60000), baselineProfile: { marker: 'previous complete profile', isClaimed: false }, createdAt: new Date('2026-10-01'), intelligenceId: 'run-intel' };
  const { resolver, calls } = resolverFixture(run, { id: 'run-intel', createdAt: new Date('2026-10-02'), youtubeScrapeId: 'yt-new' });
  const result = await resolver.resolveFullCreatorProfile('creator');
  assert.equal(result.marker, 'previous complete profile'); assert.equal(result.isClaimed, true); assert.equal(calls.length, 0);
 }
});

test('completed profile is pinned to its saved source IDs; LF/SF rates match the original calculator function', async () => {
 const run = { status: 'completed', steps: Object.fromEntries(policy.PLATFORMS.map(p => [p, { status: 'done', snapshotId: p + '-new' }])), intelligenceId: 'new-intel', createdAt: new Date('2026-10-01'), completedAt: new Date('2026-10-02') };
 const { resolver, calls } = resolverFixture(run);
 const profile = await resolver.resolveFullCreatorProfile('creator');
 assert.deepEqual(calls.sort(), ['instagram-new', 'new-intel', 'tiktok-new', 'youtube-new']);
 const source = fs.readFileSync('src/components/calculator/InfluencerRadarDashboard.tsx', 'utf8').replace(/\r\n/g, '\n');
 const start = source.indexOf('  const computePlatformRateCards = useCallback(');
 const end = source.indexOf('\n  // Recalculates all active platform cards', start);
 const block = source.slice(start, end);
 const fn = block.slice(block.indexOf('    (\n'), block.lastIndexOf('    },') + 5).trim();
 const wrapper = `const {calculateInfluencerRate,roundCommercial}=require('../src/lib/calculator/engine.ts');const {REGIONAL_CONFIG}=require('../src/lib/calculator/constants.ts'); exports.compute = ${fn};`;
 const compiled = ts.transpileModule(wrapper, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
 const exports = {}; new Function('require', 'exports', compiled)(require, exports);
 const expectedYt = exports.compute('youtube', 50000, 500, 20, 10000, 0, 8, 'US', { avgShortLikes: 900, avgShortComments: 40, avgShortViews: 20000 }, undefined, undefined, 'Medium-High');
 const expectedIg = exports.compute('instagram', 20000, 200, 20, 0, 0, 8, 'US', undefined, undefined, undefined, 'Medium-High');
 const expectedTt = exports.compute('tiktok', 30000, 100, 10, 2000, 0, 8, 'US', undefined, undefined, undefined, 'Medium-High');
 for (const [platform, rates] of [['youtube',expectedYt], ['instagram',expectedIg], ['tiktok',expectedTt]]) {
  assert.deepEqual(profile.platforms[platform].rates.map(r => [r.format,r.recommendedAmount,r.lowAmount,r.highAmount]), rates.map(r => [r.format,r.amount,r.lowAmount,r.highAmount]));
 }
 assert.equal(profile.platforms.youtube.lfEr, 5.2);
 assert.equal(profile.platforms.youtube.sfEr, 4.7);
 assert.notEqual(profile.platforms.youtube.rates[0].recommendedAmount, profile.platforms.youtube.rates[2].recommendedAmount);
});


test('a completed refresh is rechecked under the start lock before another run can begin', async () => {
 const env = serviceFixture();
 env.runs.push({ id: 'just-completed', status: 'completed', createdAt: new Date(Date.now()-1000), completedAt: new Date(Date.now()-500), oldestSourceAt: new Date(), accounts: { youtube: 'creator' } });
 await assert.rejects(env.service.startProfileRefresh('creator'), /just refreshed/);
 assert.equal(env.runs.length, 1);
});


test('YouTube synthesis preserves LF fallback before considering SF, matching Rate Radar', () => {
 const youtube = fixture('youtube');
 youtube.stats.avgLongEngagementRate = 0;
 assert.equal(buildRefreshInput('Creator', { youtube }, 'US').youtube.observedEr, 5.2);
 youtube.longVideos = [];
 assert.equal(buildRefreshInput('Creator', { youtube }, 'US').youtube.observedEr, 4.7);
});


test('an abandoned expired refresh cannot freeze later normal calculator results', async () => {
 const run = { status: 'collecting', createdAt: new Date('2026-10-01'), expiresAt: new Date('2026-10-01'), intelligenceId: null, baselineProfile: { marker: 'old baseline' } };
 const ordinaryIntel = { id: 'normal-calculator-intel', createdAt: new Date('2026-10-03'), countryCode: 'US', primaryNicheId: 8, rawLlmResponse: {} };
 const { resolver } = resolverFixture(run, ordinaryIntel, true);
 const profile = await resolver.resolveFullCreatorProfile('creator');
 assert.equal(profile.marker, undefined);
 assert.equal(profile.freshness.sources.intelligence, 'normal-calculator-intel');
});


test('YouTube channel-ID URLs retain case while ordinary handles are normalized', () => {
 const channel = 'UC' + 'aB'.repeat(11);
 assert.equal(channel.length, 24);
 assert.equal(accountHandle('youtube', `https://youtube.com/channel/${channel}`), channel);
 assert.equal(discoverRefreshAccounts([`https://youtube.com/channel/${channel}`], {}).youtube, channel);
 assert.equal(accountHandle('youtube', '@Creator'), 'creator');
});


test('provider-inactive errors are clear without exposing provider details publicly', () => {
 const { inactiveScraperMessage } = require('../src/lib/creators/refresh-errors.ts');
 const failure = new Error('Bright Data API request failed (400 Bad Request): Customer is not active');
 assert.equal(inactiveScraperMessage(failure, 'instagram'), 'Instagram data refresh is temporarily unavailable. Please try again later.');
 assert.equal(inactiveScraperMessage(failure, 'tiktok'), 'TikTok data refresh is temporarily unavailable. Please try again later.');
 assert.equal(inactiveScraperMessage(new Error('another failure'), 'instagram'), null);
});

test('refresh errors contain the retained-profile reassurance exactly once', () => {
 const { refreshFailureMessage, PROFILE_RETAINED_MESSAGE } = require('../src/lib/creators/refresh-errors.ts');
 for (const message of ['Provider unavailable.', `Failed. ${PROFILE_RETAINED_MESSAGE} Try again.`, `${PROFILE_RETAINED_MESSAGE} ${PROFILE_RETAINED_MESSAGE}`]) {
  const formatted = refreshFailureMessage(message);
  assert.equal(formatted.split(PROFILE_RETAINED_MESSAGE).length - 1, 1);
 }
});

test('inactive Bright Data account retains the baseline and never reaches LLM', async () => {
 const env = serviceFixture({ inactivePlatform: 'instagram' });
 const run = await env.service.startProfileRefresh('creator');
 await env.service.refreshPlatform('creator', run.id, run.token, 'youtube');
 await assert.rejects(env.service.refreshPlatform('creator', run.id, run.token, 'instagram'), error => error.code === 'PROVIDER_INACTIVE' && error.status === 503 && error.message.startsWith('Instagram data refresh'));
 await env.service.failProfileRefresh('creator', run.id, run.token);
 assert.equal(env.runs[0].status, 'failed');
 assert.deepEqual(env.runs[0].baselineProfile, env.baseline);
 assert(!env.events.includes('llm'));
 assert.deepEqual(env.intelligence, [{ id: 'old-intel', raw: 'preserve me' }]);
});
