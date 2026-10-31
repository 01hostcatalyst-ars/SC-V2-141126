const fs=require('fs'),assert=require('assert'),puppeteer=require('puppeteer-core');
(async()=>{
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 fs.mkdirSync('tmp/calculator-review',{recursive:true});
 const fixture=require('../scratch/profile-data-baseline.json');
 for(const mobile of [false,true]){
 const page=await browser.newPage();await page.setViewport({width:mobile?390:1440,height:mobile?844:1050,deviceScaleFactor:1});
 let pdfPayload;const errors=[];page.on('pageerror',e=>errors.push(e.message));let mode='all',calls=[];
 await page.setRequestInterception(true);
 page.on('request',async req=>{
 const u=new URL(req.url());
 if(u.pathname.startsWith('/api/')){
 calls.push(u.pathname);if(u.pathname==='/api/calculator/export-pdf'){pdfPayload=JSON.parse(req.postData());return req.respond({status:200,contentType:'application/pdf',body:'%PDF-1.4\n%%EOF'});}let body={success:true};
 if(u.pathname.includes('resolve-identity'))body=['partial','all'].includes(mode)?{success:true,resolved:true,cluster:{canonicalName:'TWICE',accounts:{instagram:'twicetagram',tiktok:'twice_tiktok_official',...(mode==='all'?{youtube:'twice'}:{})}}}:{success:true,resolved:false};
 if(u.pathname.includes('/scrapers/')){await new Promise(r=>setTimeout(r,3000));body=(mode==='failure'||(mode==='partial'&&u.pathname.endsWith('/tiktok')))?{success:false,error:'Test: platform unavailable'}:{success:true,data:{scrapedAt:'2026-10-31T10:00:00Z',profile:{username:'twicetagram',fullName:'TWICE',followerCount:29900000,biography:''},stats:{avgLikesPerPost:250000,avgCommentsPerPost:4200,avgEngagementRate:1.48},posts:fixture.recentMedia.instagramPosts}};}
 if(mode==='all'&&u.pathname.endsWith('/youtube'))body={success:true,data:{scrapedAt:'2026-10-31T10:00:00Z',channel:{handle:'twice',title:'TWICE',subscriberCount:19500000,country:'US'},stats:{avgLongVideoViews:5000000,avgShortVideoViews:6000000,avgLongEngagementRate:4.32,avgShortEngagementRate:7.59},longVideos:fixture.recentMedia.youtubeVideos.filter(v=>!v.isShort),shortVideos:fixture.recentMedia.youtubeVideos.filter(v=>v.isShort)}};
 if(mode==='all'&&u.pathname.endsWith('/tiktok'))body={success:true,data:{scrapedAt:'2026-10-31T10:00:00Z',profile:{username:'twice_tiktok_official',nickname:'TWICE',followerCount:31100000},stats:{avgViewsPerVideo:10000000,avgLikesPerVideo:1500000,avgCommentsPerVideo:20000,avgSharesPerVideo:10000,avgEngagementRate:28.94},videos:fixture.recentMedia.tiktokVideos}};
 if(u.pathname.includes('/synthesize')){await new Promise(r=>setTimeout(r,1500));body=mode==='fallback'?{success:false}:{success:true,intelligence:fixture.completeIntelligence};}
 return req.respond({status:200,contentType:'application/json',body:JSON.stringify(body)});
 }
 if(!['localhost','127.0.0.1'].includes(u.hostname)&&!req.url().startsWith('data:'))return req.abort();
 req.continue();
 });
 await page.evaluateOnNewDocument(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copied=text;}}});const original=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.download){window.__downloadName=this.download;return;}return original.call(this);};});
 await page.goto('http://localhost:3012/influencer-rate-calculator',{waitUntil:'networkidle0',timeout:180000});
 await page.type('#calculator-profile','https://www.youtube.com/@twice');await page.click('button[type=submit]');
 await page.waitForSelector('.calculator-profile-results',{timeout:45000}).catch(async e=>{console.error(JSON.stringify({mobile,mode,url:page.url(),errors,calls,body:(await page.evaluate(()=>document.body.innerText)).slice(0,2600)}));throw e;});await new Promise(r=>setTimeout(r,1000));
 assert.equal(await page.$$eval('.profile-rate-panel',els=>els.length),3);
 assert.equal(await page.$$eval('.profile-platform-overview',els=>els.length),3);
 assert.equal(await page.$$eval('.profile-package',els=>els.length),5);
 assert.equal(await page.$$eval('.profile-package[open]',els=>els.length),0);
 assert(!(await page.evaluate(()=>document.body.innerText.includes('No YouTube linked'))));
 assert(!(await page.evaluate(()=>document.body.innerText.includes('Claim this profile'))));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'horizontal overflow');
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:`tmp/calculator-review/${mobile?'mobile':'desktop'}-profile-results.png`});
 const samplePanel=await page.$('.profile-rate-panel');await samplePanel.screenshot({path:`tmp/calculator-review/${mobile?'mobile':'desktop'}-profile-rates.png`});
 await page.click('.profile-rate-panel .profile-sample-tabs button:last-child');
 assert.equal(await page.$eval('.profile-rate-panel .profile-sample-tabs button:last-child',el=>el.getAttribute('aria-pressed')),'true');
 await page.click('.profile-rate-panel .profile-sample-bar:nth-last-child(1)');
 await page.click('.profile-package summary');
 assert.equal(await page.$eval('.profile-package',el=>el.open),true);
 await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(el=>el.textContent==='Copy campaign proposal').click());
 assert(await page.evaluate(()=>window.__copied.includes('TWICE')));
 const original=await page.$eval('.profile-rate-panel [data-typical]',el=>Number(el.dataset.typical));
 const audience=await page.$eval('#audience .profile-country',el=>el.textContent);
 await page.select('select[aria-label="Pricing market"]','GB');
 await page.waitForFunction(old=>Number(document.querySelector('.profile-rate-panel [data-typical]').dataset.typical)!==old,{},original);
 assert.equal(await page.$eval('#audience .profile-country',el=>el.textContent),audience,'market must not change primary audience');
 assert.equal(await page.$$eval('.profile-package[open]',els=>els.length),1,'controls must not reset open packages');
 await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(el=>el.textContent==='Download rate card').click());
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('button')).some(el=>el.textContent==='Download rate card'));
 await new Promise(r=>setTimeout(r,300));
 assert.equal(pdfPayload.selectedRegion,'GB');
 assert.equal(pdfPayload.profile.platforms.youtube.rates[0].recommendedAmount,await page.$eval('.profile-rate-panel [data-typical]',el=>Number(el.dataset.typical)));
 assert.equal(pdfPayload.profile.recentMedia.collectedAt.youtube,'2026-10-31T10:00:00Z');
 if(!mobile){
 await page.evaluate(()=>window.scrollTo({top:900,behavior:'instant'}));await new Promise(r=>setTimeout(r,300));
 assert(await page.$eval('.profile-page-rail',el=>getComputedStyle(el).position==='sticky'));
 assert(await page.$eval('.profile-identity-panel',el=>el.getBoundingClientRect().top>=0&&el.getBoundingClientRect().top<180),'sidebar stays visible while scrolling');
 }
 await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(el=>el.textContent.startsWith('New search')).click());
 mode='single';await page.waitForSelector('#calculator-profile');await page.type('#calculator-profile','https://www.instagram.com/twicetagram/');await page.click('button[type=submit]');
 await page.waitForSelector('.calculator-profile-results',{timeout:45000}).catch(async e=>{console.error(JSON.stringify({mobile,mode,url:page.url(),errors,calls,body:(await page.evaluate(()=>document.body.innerText)).slice(0,2600)}));throw e;});
 assert.equal(await page.$$eval('.profile-rate-panel',els=>els.length),1);
 assert.equal(await page.$$eval('.profile-platform-overview',els=>els.length),1);
 assert.equal(await page.$$eval('.profile-sample-card',els=>els.length),4);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'single-platform overflow');
 assert.deepEqual(errors,[]);
 console.log(`${mobile?'Mobile':'Desktop'} shared profile UI passed: all/one platform, charts, format tabs, collapsible packages, copy, market recalculation, PDF current values and audience consistency. All API calls mocked.`);
 await page.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
