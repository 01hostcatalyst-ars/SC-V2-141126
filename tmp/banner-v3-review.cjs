const puppeteer=require('puppeteer-core'),fs=require('fs'),assert=require('assert');
(async()=>{const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.setRequestInterception(true);p.on('request',r=>new URL(r.url()).pathname.startsWith('/api/')?r.respond({status:200,contentType:'application/json',body:fs.readFileSync('tmp/home-review/selected-spotlights.json','utf8').replace(/^\uFEFF/,'')}):r.continue());
 for(const width of [1440,390,320]){
  await p.setViewport({width,height:1000});await p.goto('http://localhost:3000/',{waitUntil:'networkidle0',timeout:180000});await p.waitForSelector('[aria-roledescription="carousel"]');
  await p.$eval('img[src="/images/creator-community-banner-v3.webp"]',async el=>{el.scrollIntoView({behavior:'instant',block:'center'});await el.decode();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
  const layout=await p.$eval('img[src="/images/creator-community-banner-v3.webp"]',img=>{const frame=img.parentElement,figure=frame.parentElement,r=frame.getBoundingClientRect();return{ratio:r.width/r.height,naturalRatio:img.naturalWidth/img.naturalHeight,previous:figure.previousElementSibling.id,next:figure.nextElementSibling.id,caption:figure.querySelector('figcaption').textContent,captionTop:figure.querySelector('figcaption').getBoundingClientRect().top,bottom:r.bottom};});
  assert(Math.abs(layout.ratio-6)<.03);assert.equal(layout.naturalRatio,6);assert.equal(layout.previous,'discover');assert.equal(layout.next,'explore-niches');assert.equal(layout.caption,'Different passions. The right partnership.');assert(layout.captionTop>layout.bottom);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.screenshot({path:`tmp/home-review/banner-v3-${width}.png`});
 }
 assert.deepEqual(errors,[]);console.log('Passed: new four-scene 6:1 banner, caption below image, correct section placement, desktop and mobile widths, no overflow or browser errors.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
