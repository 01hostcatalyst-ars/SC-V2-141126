const assert=require('assert'),fs=require('fs'),vm=require('vm'),ts=require('typescript'),puppeteer=require('puppeteer-core');
const slugs=['jason-davenport','whealth-by-slaiman','dr-mayim-bialik','cybrgrl','tim-dessaint','eva-meloche','hayls-world','becky-excell'];
const configSource=ts.transpileModule(fs.readFileSync('next.config.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function config(env){const exports={};vm.runInNewContext(configSource,{exports,require,process:{env}});return exports.default;}
const versionA=config({VERCEL_DEPLOYMENT_ID:'deployment-a'}).env.HOME_CACHE_VERSION;
const versionB=config({VERCEL_DEPLOYMENT_ID:'deployment-b'}).env.HOME_CACHE_VERSION;
assert.notEqual(versionA,versionB);assert.equal(versionA,config({VERCEL_DEPLOYMENT_ID:'deployment-a'}).env.HOME_CACHE_VERSION);
assert.notEqual(config({}).env.HOME_CACHE_VERSION,config({}).env.HOME_CACHE_VERSION,'non-Vercel builds get a fresh version');
const manifest=JSON.parse(fs.readFileSync('scratch/home-cache-production/prerender-manifest.json','utf8'));
assert.equal(manifest.routes['/'].initialRevalidateSeconds,259200,'production homepage must use three-day ISR');
(async()=>{for(let i=0;i<2;i++){const response=await fetch('http://localhost:3013/');assert(response.ok);assert.equal(response.headers.get('x-nextjs-cache'),'HIT');assert(response.headers.get('cache-control').includes('s-maxage=259200'));await response.arrayBuffer();}
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
 const p=await b.newPage(),apiRequests=[],errors=[],hydration=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',msg=>{if(/hydration|server rendered HTML didn't match/i.test(msg.text()))hydration.push(msg.text())});
 await p.setRequestInterception(true);p.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/')){apiRequests.push(new URL(r.url()).pathname);return r.abort();}return r.continue();});
 await p.setJavaScriptEnabled(false);await p.goto('http://localhost:3013/',{waitUntil:'networkidle0',timeout:120000});
 assert(await p.$eval('main',el=>el.textContent.includes('Sydnee Zora')));
 assert.deepEqual(await p.$$eval('#discover article a:last-child',els=>els.map(el=>el.getAttribute('href'))),slugs.map(slug=>`/creators/${slug}`),'all eight profiles must exist in HTML before JavaScript');
 await p.setJavaScriptEnabled(true);await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 for(const width of [1440,390]){await p.setViewport({width,height:1000});await p.goto('http://localhost:3013/',{waitUntil:'networkidle0',timeout:120000});assert.equal(await p.$$eval('#discover article',els=>els.length),8);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.$eval('[aria-label="Next creators"]',el=>el.click());await p.waitForFunction(()=>document.querySelector('[aria-label="Browse creator profiles"]').scrollLeft>5);await p.$eval('[aria-labelledby="faq-title"] summary',el=>el.click());assert.equal(await p.$$eval('[aria-labelledby="faq-title"] details[open]',els=>els.length),1);}
 assert.deepEqual(apiRequests,[],'homepage must load without browser API requests');assert.deepEqual(errors,[]);assert.deepEqual(hydration,[]);
 console.log('Passed: production manifest and responses confirm 259200-second ISR and cache HITs; all nine creator previews are in initial HTML; no browser API request; desktop/mobile controls work without hydration errors; deployment cache versions rotate correctly.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
