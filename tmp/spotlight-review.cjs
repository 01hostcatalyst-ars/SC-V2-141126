const puppeteer=require('puppeteer-core'),fs=require('fs'),assert=require('assert');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const p=await b.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 const fixture=fs.readFileSync('tmp/home-review/slider-creators.json','utf8').replace(/^\uFEFF/,'');
 const spotlights=fs.readFileSync('tmp/home-review/slider-spotlights.json','utf8').replace(/^\uFEFF/,'');
 await p.setRequestInterception(true);p.on('request',r=>new URL(r.url()).pathname.startsWith('/api/')?r.respond({status:200,contentType:'application/json',body:r.url().includes('followers_desc')?spotlights:fixture}):r.continue());
 for(const width of [1440,390,320]){
  await p.setViewport({width,height:1100});
  await p.goto('http://localhost:3000/',{waitUntil:'networkidle0',timeout:180000});
  await p.$eval('#discover',el=>el.scrollIntoView({behavior:'instant'}));
  await p.waitForSelector('[aria-roledescription="carousel"]');
  await p.mouse.move(0,0);
  const region=await p.$('[aria-roledescription="carousel"]');
  assert.equal(await p.$$eval('#discover a[class*="creatorCard_"]',els=>els.length),0,'old profile grid removed');
  assert.equal(await p.$$eval('#discover a[class*="topicCard_"]',els=>els.length),4,'niche cards restored');
  assert.equal(await region.$$eval('[class*="viewport_"]',els=>els.length),width>800?1:2);
  assert.equal(await region.$$eval('[class*="slide_"]:not([inert])',els=>els.length),4);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const positions=()=>region.$$eval('[class*="track_"]',els=>els.map(el=>new DOMMatrix(getComputedStyle(el).transform).m41));
  const initial=await positions();
  await new Promise(r=>setTimeout(r,5200));
  const after=await positions();
  assert(after[0]<initial[0],'first row moves left');
  if(width<800)assert(after[1]>initial[1],'second row moves right');
  await region.$eval('button[aria-pressed]',el=>el.click());
  const paused=await positions();await new Promise(r=>setTimeout(r,4800));
  assert.deepEqual(await positions(),paused,'pause stops movement');
  await region.screenshot({path:`tmp/home-review/spotlight-${width}.png`});
 }
 assert.deepEqual(errors,[]);
 await p.setViewport({width:1440,height:1000});
 await p.reload({waitUntil:'networkidle0',timeout:180000});await p.$eval('#discover',el=>el.scrollIntoView({behavior:'instant'}));await p.waitForSelector('[aria-roledescription="carousel"]');
 const seen=new Set();
 for(let i=0;i<17;i++){
  const names=await p.$$eval('[aria-roledescription="carousel"] [class*="slide_"]:not([inert]) h3',els=>els.map(el=>el.textContent));
  assert.equal(names.length,4);names.forEach(name=>seen.add(name));
  await p.$eval('[aria-label="Next creators"]',el=>el.click());await new Promise(r=>setTimeout(r,60));
 }
 assert.equal(seen.size,8,'manual looping reaches all eight real creators');
 await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await p.reload({waitUntil:'networkidle0',timeout:180000});await p.$eval('#discover',el=>el.scrollIntoView({behavior:'instant'}));await p.waitForSelector('[aria-roledescription="carousel"]');
 assert(await p.$eval('[aria-roledescription="carousel"] button[aria-pressed]',el=>el.disabled));
 await p.$eval('[aria-label="Next creators"]',el=>el.click());
 await new Promise(r=>setTimeout(r,100));
 assert(await p.$eval('[aria-roledescription="carousel"] button[aria-pressed]',el=>el.getAttribute('aria-pressed')==='true'));
 console.log('Passed desktop/mobile: retained existing cards; four visible slider cards; opposing mobile movement; pause; no overflow/browser errors; reduced motion disables autoplay. Fixture is eight actual stored creator profiles.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
