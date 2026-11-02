const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const resolve=Module._resolveFilename;Module._resolveFilename=function(spec,...args){return resolve.call(this,spec.startsWith('@/')?path.join(process.cwd(),'src',spec.slice(2)):spec,...args);};
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const {parseKnowledgeImages,embeddedKnowledgeImage,knowledgeImageUrl}=require('../src/lib/knowledge-images.ts');
const {knowledgeArticleMetadata}=require('../src/lib/knowledge-seo.ts');
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=';
const date='2026-11-02T07:23:17.298Z';
const block=(name,alt='Image description')=>`<p>&lt;${name}-image&gt;<img src="${png}" alt="Old alt">&lt;alt-text&gt;${alt}&lt;/alt-text&gt;&lt;/${name}-image&gt;</p>`;
test('all numbered types parse, first hero is extracted and body order remains unchanged',()=>{
 const parsed=parseKnowledgeImages(block('hero')+block('square1')+'<h2>Section</h2>'+block('article1')+block('diagram1')+block('article2'),'example',date);
 assert.equal(parsed.images.length,5);assert.equal(parsed.heroImage.id,'hero');assert.equal(parsed.contentHtml.includes('data-image-id="hero"'),false);assert(!parsed.contentHtml.includes('alt-text'));assert(!parsed.contentHtml.includes('base64'));
 assert.deepEqual([...parsed.contentHtml.matchAll(/data-image-id="([^"]+)"/g)].map(match=>match[1]),['square1','article1','diagram1','article2']);
 assert(!parsed.contentHtml.includes('<p><figure'));assert.equal((parsed.contentHtml.match(/loading="lazy"/g)||[]).length,4);
});
test('Google Docs paragraph-split blocks, future numbers and duplicates get valid unique IDs',()=>{
 const html=`<p>&lt;diagram12-image&gt;</p><p><img src="${png}"></p><p>&lt;alt-text&gt;Evidence &amp; records&lt;/alt-text&gt;</p><p>&lt;/diagram12-image&gt;</p>`;
 const parsed=parseKnowledgeImages(html+html+block('square10'),'example',date);assert.deepEqual(parsed.images.map(image=>image.id),['diagram12','diagram12-2','square10']);assert.equal(parsed.images[0].alt,'Evidence & records');assert(!parsed.contentHtml.includes('<p><figure'));
});
test('marker alt text is escaped safely, and intentionally empty alt text stays empty',()=>{
 const parsed=parseKnowledgeImages(block('article1','&lt;script&gt;alert(1)&lt;/script&gt; &amp; details')+block('article2',''),'example',date);assert(!parsed.contentHtml.includes('<script>'));assert(parsed.contentHtml.includes('alt="&lt;script&gt;'));assert.equal(parsed.images[1].alt,'');
});
test('currency entities in the Google Docs alt block become their readable characters',()=>{
 const parsed=parseKnowledgeImages(block('article1','A brand offers &pound;800 &amp; usage rights.'),'example',date);assert.equal(parsed.images[0].alt,'A brand offers £800 & usage rights.');assert(!parsed.contentHtml.includes('&amp;pound;'));
});
test('missing/unsupported images become readable placeholders without publishing executable data',()=>{
 const parsed=parseKnowledgeImages('<hero-image><img src="data:image/svg+xml;base64,PHN2Zz4="><alt-text>Illustration</alt-text></hero-image>','example',date);assert.equal(parsed.images.length,0);assert(!parsed.heroImage);assert(parsed.contentHtml.includes('Illustration'));assert(!parsed.contentHtml.includes('data:'));assert.equal(embeddedKnowledgeImage('https://example.com/x.png'),null);
});
test('raster headers supply dimensions; malformed and excessive dimensions are rejected',()=>{
 assert.equal(embeddedKnowledgeImage(png).width,1);assert.equal(embeddedKnowledgeImage(png).mime,'image/png');assert.equal(embeddedKnowledgeImage('data:image/png;base64,YmFk'),null);
 const large=Buffer.from(png.split(',')[1],'base64');large.writeUInt32BE(50000,16);assert.equal(embeddedKnowledgeImage('data:image/png;base64,'+large.toString('base64')),null);
 const jpg=Buffer.alloc(23);Buffer.from([255,216,255,192,0,17,8,0,2,0,3]).copy(jpg);assert.deepEqual(((data)=>({width:data.width,height:data.height}))(embeddedKnowledgeImage('data:image/jpeg;base64,'+jpg.toString('base64'))),{width:3,height:2});
});
test('hero URL and dimensions are used by both social previews',()=>{
 const article={title:'Example',excerpt:'Description',slug:'example',modifiedTime:date,heroImage:{id:'hero',alt:'Hero alt',width:1600,height:800}};const meta=knowledgeArticleMetadata(article,'https://www.signcollab.com');const url='https://www.signcollab.com'+knowledgeImageUrl('example','hero',date);assert.equal(meta.openGraph.images[0].url,url);assert.equal(meta.twitter.images[0].url,url);assert.equal(meta.openGraph.images[0].width,1600);
});
let article,calls=0;const load=Module._load;Module._load=function(spec,...args){if(spec==='@/lib/gdocs')return {getArticleBySlug:async()=>{calls++;return article;}};return load.call(this,spec,...args);};
const {GET}=require('../src/app/knowledge/[slug]/images/[imageId]/route.ts');
const request=(suffix='?v='+encodeURIComponent(date))=>{const req=new Request('https://www.signcollab.com/knowledge/example/images/hero'+suffix);req.nextUrl=new URL(req.url);return req;};
const params=(slug='example',imageId='hero')=>({params:Promise.resolve({slug,imageId})});
test('public endpoint serves raster bytes with caching and redirects stale revision URLs',async()=>{
 article={slug:'example',modifiedTime:date,images:parseKnowledgeImages(block('hero'),'example',date).images};let response=await GET(request(),params());assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/png');assert(response.headers.get('cache-control').includes('s-maxage=2592000'));assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 response=await GET(request('?v=old'),params());assert.equal(response.status,307);assert(response.headers.get('location').endsWith(encodeURIComponent(date)));assert.equal(response.headers.get('cache-control'),'no-store');
});
test('invalid paths and missing images never redirect to arbitrary sources',async()=>{
 calls=0;assert.equal((await GET(request(),params('../secrets'))).status,404);assert.equal(calls,0);assert.equal((await GET(request(),params('example','https://evil.com'))).status,404);article=null;assert.equal((await GET(request(),params())).status,404);
});
