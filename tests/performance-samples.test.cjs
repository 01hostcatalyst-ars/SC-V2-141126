const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
const { buildPerformanceSamples } = require('../src/lib/creators/performance-samples.ts');
const media = {
 youtubeVideos: [
  { id: 'new-outlier', isShort: false, isErSample: false, publishedAt: '2026-10-27', viewCount: 999999 },
  { id: 'lf', isShort: false, isErSample: true, viewCount: 100 },
  { id: 'sf', isShort: true, isErSample: true, viewCount: 200 },
 ],
 instagramPosts: [
  { id: 'ig', isEnrichedSample: true, likes: 20, commentsCount: 3, imageUrl: 'image' },
  { id: 'ig-outlier', isEnrichedSample: false, likes: 999 },
  { id: 'ig-pinned', isEnrichedSample: true, isPinned: true, likes: 999 },
 ],
 tiktokVideos: [{ id: 'tt', isEnrichedSample: true, playCount: 300, coverImage: 'cover' }],
};
test('all linked platforms expose only actual core samples with the appropriate chart metric', () => {
 const groups = buildPerformanceSamples(media, { youtube: {}, instagram: {}, tiktok: {} });
 assert.deepEqual(groups.map(g => g.id), ['youtube-long', 'youtube-short', 'instagram', 'tiktok']);
 assert.deepEqual(groups.map(g => g.items.map(i => i.id)), [['lf'], ['sf'], ['ig'], ['tt']]);
 assert.deepEqual(groups.map(g => g.items[0].metric), [100, 200, 23, 300]);
 assert.equal(groups[2].metricLabel, 'Likes + comments');
});
test('one or two linked platforms hide unrelated stored content', () => {
 assert.deepEqual(buildPerformanceSamples(media, { instagram: {} }).map(g => g.id), ['instagram']);
 assert.deepEqual(buildPerformanceSamples(media, { youtube: {}, instagram: {} }).map(g => g.id), ['youtube-long', 'youtube-short', 'instagram']);
});
test('empty formats and legacy records without sample flags are not misrepresented as core samples', () => {
 assert.deepEqual(buildPerformanceSamples({ youtubeVideos: [{ isShort: true }], instagramPosts: [], tiktokVideos: [] }, { youtube: {} }), []);
});
test('sample counts are not padded or truncated and missing metrics remain missing', () => {
 const posts = Array.from({ length: 4 }, (_, i) => ({ id: String(i), isEnrichedSample: true }));
 const group = buildPerformanceSamples({ ...media, instagramPosts: posts }, { instagram: {} })[0];
 assert.equal(group.items.length, 4);
 assert.equal(group.items[0].metric, undefined);
 assert.equal(posts[0].metric, undefined);
});

test('sample detail metrics use platform denominators and omit unavailable metrics', () => {
 const detailed = { youtubeVideos: [{ isErSample: true, isShort: false, viewCount: 1000, likeCount: 40, commentCount: 10 }], instagramPosts: [{ isEnrichedSample: true, likes: 20, commentsCount: 5 }], tiktokVideos: [{ isEnrichedSample: true, playCount: 1000, diggCount: 70, commentCount: 10, shareCount: 20 }] };
 const groups = buildPerformanceSamples(detailed, { youtube: {}, instagram: { followerCount: 1000 }, tiktok: {} });
 assert.equal(groups[0].items[0].engagementRate, 5);
 assert.equal(groups[1].items[0].engagementRate, 2.5);
 assert.equal(groups[2].items[0].engagementRate, 10);
 assert.equal(groups[0].items[0].shares, undefined);
 assert.equal(groups[1].items[0].views, undefined);
 assert.equal(groups[1].items[0].shares, undefined);
 assert.equal(groups[2].items[0].shares, 20);
});
