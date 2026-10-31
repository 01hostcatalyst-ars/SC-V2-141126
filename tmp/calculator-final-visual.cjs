const fs=require('fs'),assert=require('assert'),puppeteer=require('puppeteer-core');
(async()=>{
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 fs.mkdirSync('tmp/calculator-review',{recursive:true});
 const fixture=require('../scratch/profile-data-baseline.json');
 for(const mobile of [false]){
 const page=await browser.newPage();await page.setViewport({width:mobile?390:1440,height:mobile?844:1050,deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));let mode='all',calls=[];
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
 await page.type('#calculator-profile','https://www.youtube.com/@twice');await page.click('button[type=submit]');
 await page.waitForFunction(()=>document.body.innerText.includes('Rates, performance & audience insights'),{timeout:30000});
 await new Promise(r=>setTimeout(r,1000));
 await page.evaluate(()=>Array.from(document.querySelectorAll('h3')).find(el=>el.textContent.includes('Campaign packages')).scrollIntoView({behavior:'instant'}));
 await new Promise(r=>setTimeout(r,500));
 await page.screenshot({path:'tmp/calculator-review/desktop-packages-final.png'});
 console.log('Final campaign-card visual captured; API responses mocked.');
 await page.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
