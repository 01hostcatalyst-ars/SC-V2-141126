const puppeteer=require('puppeteer-core'),fs=require('fs'),assert=require('assert');
(async()=>{const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.setRequestInterception(true);p.on('request',r=>new URL(r.url()).pathname.startsWith('/api/')?r.respond({status:200,contentType:'application/json',body:fs.readFileSync('tmp/home-review/selected-spotlights.json','utf8').replace(/^\uFEFF/,'')}):r.continue());for(const width of [1440,768,390,320]){
 await p.setViewport({width,height:1100});await p.goto('http://localhost:3000/',{waitUntil:'networkidle0',timeout:180000});await p.waitForSelector('[aria-roledescription="carousel"]');await p.$eval('#explore-niches',el=>el.scrollIntoView({behavior:'instant'}));
 assert.equal(await p.$$eval('#explore-niches article',els=>els.length),8);
 assert(await p.$eval('#discover',el=>!el.querySelector('#explore-niches')),'sections should be separate');
 assert(await p.$$eval('#explore-niches article',els=>els.every(el=>el.querySelectorAll('li').length>=3&&el.querySelectorAll('li').length<=5&&el.querySelectorAll('a').length===1&&!el.querySelector('li a'))));
 assert.equal(await p.$$eval('#explore-niches article > div > svg',els=>new Set(els.map(el=>el.innerHTML)).size),8);
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await (await p.$('#explore-niches')).screenshot({path:`tmp/home-review/niches-redesigned-${width}.png`});
 await p.$eval('#explore-niches button',el=>el.click());assert.equal(await p.$$eval('#explore-niches article',els=>els.length),22);assert.equal(await p.$eval('#explore-niches button',el=>el.getAttribute('aria-expanded')),'true');
 const ids=await p.$$eval('#explore-niches article a',els=>els.map(el=>Number(new URL(el.href).searchParams.get('nicheId'))));assert.deepEqual([...ids].sort((a,b)=>a-b),Array.from({length:22},(_,i)=>i+1));
 assert.equal(await p.$$eval('#explore-niches article > div > svg',els=>new Set(els.map(el=>el.innerHTML)).size),22);
 await p.$eval('#explore-niches button',el=>el.click());assert.equal(await p.$$eval('#explore-niches article',els=>els.length),8);
 }
 assert.deepEqual(errors,[]);console.log('Passed desktop/tablet/mobile: separate section; eight cards expanding/collapsing to all 22; distinct icons; 3–5 plain-text subniches; correct category filter links; creator slider retained; no overflow or browser errors.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
