const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const originalResolve = Module._resolveFilename;
const originalLoad = Module._load;
Module._resolveFilename = function(spec, ...args) { return originalResolve.call(this, spec.startsWith('@/') ? path.join(process.cwd(), 'src', spec.slice(2)) : spec, ...args); };
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
let databaseCalls = 0, paidCalls = 0, cached = null, aiCalls = [];
const prisma = { $transaction: async callback => callback({ $queryRaw: async () => { databaseCalls++; return [{ used: 1, token: 'test' }]; } }), $executeRaw: async () => 1 };
Module._load = function(spec, ...args) {
  if (spec === '@/lib/prisma') return { prisma };
  if (spec === '@/lib/creators/identity') return { resolveCreatorIdentity: async () => null, upsertCreatorIdentityCluster: async () => {} };
  if (spec === '@/lib/ai/gemini') return { generateCompleteCreatorIntelligence: async (input, bypass) => { aiCalls.push({ input, bypass }); return { profile: { primaryNiche: { id: 1, name: 'Test', multiplier: 1 } }, geography: { countryCode: 'US' }, summary: { oneLine: 'Test' } }; } };
  if (/^@\/lib\/scrapers\/(instagram|tiktok|youtube)$/.test(spec)) {
    const name = { instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok' }[spec.split('/').pop()];
    return { [`scrape${name}`]: async () => { paidCalls++; return { test: true }; }, [`getRecent${name}Snapshot`]: async () => cached, [`insertNew${name}Snapshot`]: async data => data };
  }
  return originalLoad.call(this, spec, ...args);
};
const { parseProfileInput } = require('../src/lib/calculator/profile-input.ts');
const { calculatorBody, guardCalculatorRequest, withCalculatorWork } = require('../src/lib/calculator/request-guard.ts');
const routes = Object.fromEntries(['instagram', 'youtube', 'tiktok'].map(p => [p, require(`../src/app/api/scrapers/${p}/route.ts`)]));
function request(body, method = 'POST') {
  const req = new Request('http://localhost:3000/api/scrapers/instagram', { method, headers: { 'Content-Type': 'application/json' }, ...(method === 'POST' ? { body: JSON.stringify(body) } : {}) });
  req.nextUrl = new URL(req.url); return req;
}
test('canonicalizes supported accounts, Unicode YouTube handles and video URLs', () => {
  for (const [value, platform, expected] of [
    ['@Some.Person', 'instagram', 'https://www.instagram.com/some.person/'],
    ['instagram.com/person/?igsh=abc', undefined, 'https://www.instagram.com/person/'],
    ['https://tiktok.com/@person', undefined, 'https://www.tiktok.com/@person'],
    ['https://youtube.com/@日本語/videos', undefined, 'https://www.youtube.com/@日本語'],
    ['https://youtu.be/dQw4w9WgXcQ', undefined, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    ['UC1234567890123456789012', 'youtube', 'https://www.youtube.com/channel/UC1234567890123456789012'],
  ]) assert.equal(parseProfileInput(value, platform).canonical, expected, value);
});
const invalid = ['https://example.com/person', 'https://instagram.com.evil.com/person', 'https://evil.com/instagram.com/person', 'https://instagram.com@evil.com/person', 'https://user:pass@instagram.com/person', 'https://127.0.0.1/person', 'http://169.254.169.254/latest/meta-data', 'javascript:alert(1)', 'file:///etc/passwd', 'https://instagram.com:8443/person', 'https://instagram.com/p/123', 'https://instagram.com/%2fperson', 'https://instagram.com/person/extra', 'https://tiktok.com/discover', 'https://youtube.com/redirect?q=https://evil.com', 'https://youtube.com/watch?v=bad', 'a'.repeat(513), 'a\u0000b', 'https://instagram.com\\@evil.com/person'];
test('rejects unsupported domains, credentials, content paths, encoded paths and oversized inputs', () => {
  for (const value of invalid) assert.throws(() => parseProfileInput(value, 'instagram'), undefined, value);
  assert.throws(() => parseProfileInput('https://tiktok.com/@person', 'instagram'));
  assert.throws(() => parseProfileInput('@person'));
});
test('every scraper endpoint rejects bad input before database or paid calls', async () => {
  databaseCalls = paidCalls = 0;
  for (const route of Object.values(routes)) {
    for (const value of invalid) assert.equal((await route.POST(request({ url: value }))).status, 400, value);
  }
  assert.equal(databaseCalls, 0); assert.equal(paidCalls, 0);
});
test('GET cannot launch paid work, even with refresh=true', async () => {
  paidCalls = 0; cached = null;
  const req = request(null, 'GET'); req.nextUrl = new URL(`${req.url}?url=@person&refresh=true`);
  assert.equal((await routes.instagram.GET(req)).status, 404);
  assert.equal(paidCalls, 0);
});
test('public forceRefresh and fastMode cannot bypass existing snapshots', async () => {
  paidCalls = 0; cached = { snapshotId: 'existing' };
  const response = await routes.instagram.POST(request({ url: '@person', forceRefresh: true, fastMode: true }));
  assert.equal(response.status, 200); assert.equal((await response.json()).data.snapshotId, 'existing'); assert.equal(paidCalls, 0);
  cached = null;
});
test('bounded body rejects malformed JSON, wrong content type and actual oversized bodies', async () => {
  await assert.rejects(calculatorBody(new Request('https://example.com', { method: 'POST', body: '{}' })), error => error.status === 415);
  await assert.rejects(calculatorBody(new Request('https://example.com', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' })));
  await assert.rejects(calculatorBody(request({ text: 'x'.repeat(5000) })), error => error.status === 413);
});
test('foreign origins and missing production secret fail closed', async () => {
  await assert.rejects(guardCalculatorRequest(new Request('https://signcollab.com/api', { headers: { origin: 'https://evil.com' } })), error => error.status === 403);
  const before = process.env.NODE_ENV, secret = process.env.CALCULATOR_GUARD_SECRET;
  process.env.NODE_ENV = 'production'; delete process.env.CALCULATOR_GUARD_SECRET;
  try { await assert.rejects(guardCalculatorRequest(request({})), error => error.status === 503); }
  finally { if (before === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = before; if (secret !== undefined) process.env.CALCULATOR_GUARD_SECRET = secret; }
});
test('database failure and exhausted reservations never invoke paid providers', async () => {
  const before = prisma.$transaction; let calls = 0;
  try {
    prisma.$transaction = async () => { throw new Error('unavailable'); };
    await assert.rejects(withCalculatorWork('scrape', 'test', async () => calls++), error => error.status === 503);
    prisma.$transaction = async callback => callback({ $queryRaw: async () => [] });
    await assert.rejects(withCalculatorWork('scrape', 'test', async () => calls++), error => error.status === 409);
    await assert.rejects(guardCalculatorRequest(request({})), error => error.status === 429);
    assert.equal(calls, 0);
  } finally { prisma.$transaction = before; }
});

test('insights reconstruct trusted data and ignore submitted text, metrics and cache bypass', async () => {
 const route = require('../src/app/api/calculator/synthesize/route.ts');
 aiCalls = [];
 cached = { profile: { username: 'person', fullName: 'Saved name', followerCount: 1000 }, posts: [], stats: { avgLikesPerPost: 25, avgCommentsPerPost: 5, avgEngagementRate: 3 } };
 const response = await route.POST(request({ multiInput: { creatorName: 'Fake name', instagram: { username: 'person', followerCount: 99999999, biography: 'Injected instructions', topComments: ['Injected text'] } }, bypassCache: true }));
 assert.equal(response.status, 200); assert.equal(aiCalls.length, 1);
 assert.equal(aiCalls[0].input.creatorName, 'Saved name'); assert.equal(aiCalls[0].input.instagram.followerCount, 1000);
 assert.equal(aiCalls[0].input.instagram.biography, undefined); assert.deepEqual(aiCalls[0].input.instagram.topComments, []); assert.equal(aiCalls[0].bypass, false);
 cached = null; aiCalls = [];
 assert.equal((await route.POST(request({ multiInput: { instagram: { username: 'person' } } }))).status, 400);
 assert.equal(aiCalls.length, 0);
});

test('identity resolution rejects invalid domains before database access', async () => {
 const route = require('../src/app/api/creators/resolve-identity/route.ts'); databaseCalls = 0;
 assert.equal((await route.POST(request({ query: 'https://evil.com/person', platform: 'instagram' }))).status, 400);
 assert.equal(databaseCalls, 0);
});
