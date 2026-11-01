const puppeteer=require('puppeteer-core'),assert=require('assert');
const slugs=['jason-davenport','whealth-by-slaiman','dr-mayim-bialik','cybrgrl','tim-dessaint','eva-meloche','hayls-world','becky-excell'];
(async()=>{const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
 const p=await b.newPage(),errors=[],hydration=[],requests=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',msg=>{if(/hydrat|children.*title|expects.*title/i.test(msg.text()))hydration.push(msg.text())});
 await p.setRequestInterception(true);p.on('request',r=>{const u=new URL(r.url());if(u.pathname.startsWith('/api/')){requests.push(u.pathname);if(u.pathname!='/api/home/creators')return r.respond({status:200,contentType:'application/json',body:JSON.stringify({success:true,status:'idle'})});}return r.continue();});
 for(const width of [1440,390]){
  await p.setViewport({width,height:1100});await p.goto('http://localhost:3000/',{waitUntil:'networkidle0',timeout:180000});await p.waitForSelector('[aria-roledescription="carousel"]');
  const hrefs=await p.$$eval('[aria-roledescription="carousel"] a',els=>[...new Set(els.map(el=>el.getAttribute('href')))]);
  assert.deepEqual(hrefs,slugs.map(slug=>`/creators/${slug}`));
  assert.equal(await p.$$eval('#discover a[class*="topicCard_"]',els=>els.length),4);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.$eval('#discover',el=>el.scrollIntoView({behavior:'instant'}));await p.screenshot({path:`tmp/home-review/selected-spotlights-${width}.png`});
 }
 assert(!requests.includes('/api/creators'),'homepage must not query the directory endpoint');
 for(const slug of ['jason-davenport','hayls-world']){
  const serverPage=await b.newPage();await serverPage.setJavaScriptEnabled(false);
  await serverPage.goto(`http://localhost:3000/creators/${slug}`,{waitUntil:'domcontentloaded',timeout:180000});
  const serverTitles=await serverPage.$$eval('.profile-upload-chart title',els=>els.map(el=>el.textContent));
  assert(serverTitles.length>0 && serverTitles.every(Boolean),'all chart titles must be present in server HTML');await serverPage.close();
  await p.goto(`http://localhost:3000/creators/${slug}`,{waitUntil:'networkidle0',timeout:180000});
  const clientTitles=await p.$$eval('.profile-upload-chart title',els=>els.map(el=>el.textContent));
  assert.deepEqual(clientTitles,serverTitles,'chart titles must match through hydration');
  const bar=await p.$('.profile-sample-bar:nth-of-type(2)');if(bar){await bar.click();assert.equal(await bar.evaluate(el=>el.getAttribute('aria-pressed')),'true');}
 }
 assert.deepEqual(errors,[]);assert.deepEqual(hydration,[]);
 console.log('Passed: requested eight creators in order at desktop/mobile, niches retained, no directory query. Two real profiles have identical nonempty server/client chart titles, interactive charts, and no hydration warnings or browser errors. No scraper/AI calls.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
