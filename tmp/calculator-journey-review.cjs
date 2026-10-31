const fs=require('fs'),assert=require('assert'),puppeteer=require('puppeteer-core');
(async()=>{
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 fs.mkdirSync('tmp/calculator-review',{recursive:true});
 const fixture=require('../scratch/profile-data-baseline.json');
 for(const mobile of [false,true]){
 const page=await browser.newPage();await page.setViewport({width:mobile?390:1440,height:mobile?844:1050,deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));let mode='success',calls=[];
 await page.setRequestInterception(true);
 page.on('request',async req=>{
 const u=new URL(req.url());
 if(u.pathname.startsWith('/api/')){
 calls.push(u.pathname);let body={success:true};
 if(u.pathname.includes('resolve-identity'))body=['partial','all'].includes(mode)?{success:true,resolved:true,cluster:{canonicalName:'TWICE',accounts:{instagram:'twicetagram',tiktok:'twice_tiktok_official',...(mode==='all'?{youtube:'twice'}:{})}}}:{success:true,resolved:false};
 if(u.pathname.includes('/scrapers/')){await new Promise(r=>setTimeout(r,3000));body=(mode==='failure'||(mode==='partial'&&u.pathname.endsWith('/tiktok')))?{success:false,error:'Test: platform unavailable'}:{success:true,data:{profile:{username:'twicetagram',fullName:'TWICE',followerCount:29900000,biography:''},stats:{avgLikesPerPost:250000,avgCommentsPerPost:4200,avgEngagementRate:1.48},posts:fixture.recentMedia.instagramPosts}};}
 if(mode==='all'&&u.pathname.endsWith('/youtube'))body={success:true,data:{channel:{handle:'twice',title:'TWICE',subscriberCount:19500000,country:'US'},stats:{avgLongVideoViews:5000000,avgShortVideoViews:6000000,avgLongEngagementRate:4.32,avgShortEngagementRate:7.59},longVideos:fixture.recentMedia.youtubeVideos.filter(v=>!v.isShort),shortVideos:fixture.recentMedia.youtubeVideos.filter(v=>v.isShort)}};
 if(mode==='all'&&u.pathname.endsWith('/tiktok'))body={success:true,data:{profile:{username:'twice_tiktok_official',nickname:'TWICE',followerCount:31100000},stats:{avgViewsPerVideo:10000000,avgLikesPerVideo:1500000,avgCommentsPerVideo:20000,avgSharesPerVideo:10000,avgEngagementRate:28.94},videos:fixture.recentMedia.tiktokVideos}};
 if(u.pathname.includes('/synthesize')){await new Promise(r=>setTimeout(r,1500));body=mode==='fallback'?{success:false}:{success:true,intelligence:fixture.completeIntelligence};}
 return req.respond({status:200,contentType:'application/json',body:JSON.stringify(body)});
 }
 if(!['localhost','127.0.0.1'].includes(u.hostname)&&!req.url().startsWith('data:'))return req.abort();
 req.continue();
 });
 await page.goto('http://localhost:3012/influencer-rate-calculator',{waitUntil:'networkidle0',timeout:180000});
 await page.waitForSelector('#calculator-profile');await page.type('#calculator-profile','@twicetagram');
 assert(await page.$('button[aria-pressed="true"]'));
 await page.screenshot({path:`tmp/calculator-review/${mobile?'mobile':'desktop'}-search.png`,fullPage:false});
 await page.click('button[type=submit]');
 await page.waitForFunction(()=>document.body.innerText.includes('A clearer picture is taking shape.'));
 await new Promise(r=>setTimeout(r,450));await page.screenshot({path:`tmp/calculator-review/${mobile?'mobile':'desktop'}-analysis.png`,fullPage:mobile});
 await page.waitForFunction(()=>document.body.innerText.includes('Rates, performance & audience insights'),{timeout:30000});
 assert(!(await page.evaluate(()=>document.body.innerText.includes('A clearer picture is taking shape.'))));
 await page.evaluate(()=>window.scrollTo(0,0));await new Promise(r=>setTimeout(r,450));await page.screenshot({path:`tmp/calculator-review/${mobile?'mobile':'desktop'}-results.png`,fullPage:false});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'horizontal overflow');
 // Repeat the same search with a failed platform and check recovery controls.
 await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('New search')).click());
 mode='failure';await page.type('#calculator-profile','@twicetagram');await page.click('button[type=submit]');
 await page.waitForFunction(()=>document.body.innerText.includes('We couldn’t collect this profile'),{timeout:30000});
 assert(await page.evaluate(()=>document.body.innerText.includes('Try again')));
 mode='fallback';await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Try again')).click());
 await page.waitForFunction(()=>document.body.innerText.includes('Audience insights are unavailable for this report.'),{timeout:30000});
 assert(calls.filter(x=>x.includes('/synthesize')).length>=2,'repeat search should synthesize again');
 const synthCount=calls.filter(x=>x.includes('/synthesize')).length;
 await new Promise(r=>setTimeout(r,2000));assert.equal(calls.filter(x=>x.includes('/synthesize')).length,synthCount,'fallback must not loop synthesis');
 await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('New search')).click());
 mode='partial';await page.type('#calculator-profile','@twicetagram');await page.click('button[type=submit]');
 await page.waitForFunction(()=>document.body.innerText.includes('Some platforms could not be collected.'),{timeout:30000});
 assert(await page.evaluate(()=>document.querySelector('#calculator-rates-title').compareDocumentPosition(document.querySelector('#calculator-insights-title'))&Node.DOCUMENT_POSITION_FOLLOWING),'rates before insights');
 await page.evaluate(()=>Array.from(document.querySelectorAll('h3')).find(el=>el.textContent.includes('Campaign packages'))?.scrollIntoView());
 await page.screenshot({path:`tmp/calculator-review/${mobile?'mobile':'desktop'}-packages.png`,fullPage:false});
 const previousScrapes=calls.filter(x=>x==='/api/scrapers/tiktok').length;
 await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Retry').click());
 await page.waitForFunction(()=>document.body.innerText.includes('A clearer picture is taking shape.'));
 await page.waitForFunction(()=>document.body.innerText.includes('Some platforms could not be collected.'),{timeout:30000});
 assert.equal(calls.filter(x=>x==='/api/scrapers/tiktok').length,previousScrapes+1,'retry must retain the failed handle');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'partial report horizontal overflow');
 await page.evaluate(()=>Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('New search')).click());
 mode='all';await page.type('#calculator-profile','https://www.youtube.com/@twice');
 assert.equal(await page.$('button[aria-pressed]'),null,'URL should not require a platform picker');
 await page.click('button[type=submit]');
 await page.waitForFunction(()=>document.body.innerText.includes('Rates, performance & audience insights'),{timeout:30000});
 await new Promise(r=>setTimeout(r,1000));
 await page.evaluate(()=>Array.from(document.querySelectorAll('h3')).find(el=>el.textContent.includes('Campaign packages')).scrollIntoView({behavior:'instant'}));
 await new Promise(r=>setTimeout(r,500));
 await page.screenshot({path:`tmp/calculator-review/${mobile?'mobile':'desktop'}-packages.png`,fullPage:false});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'all-platform report horizontal overflow');
 assert.deepEqual(errors,[]);
 console.log(`${mobile?'Mobile':'Desktop'}: search, analysis, results, failed collection, retry and insight fallback passed. All API requests mocked.`);
 await page.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
