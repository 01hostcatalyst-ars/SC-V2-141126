const puppeteer = require('puppeteer-core');
const assert = require('assert');
(async () => {
 const browser = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setRequestInterception(true);
  page.on('request', r => new URL(r.url()).pathname.startsWith('/api/') ? r.respond({status:200,contentType:'application/json',body:JSON.stringify({success:true,creators:[]})}) : r.continue());
  for (const width of [1440,390,320]) {
   await page.setViewport({width,height:1000});
   await page.goto('http://localhost:3000/',{waitUntil:'networkidle0',timeout:180000});
   const section = await page.$('[aria-labelledby="faq-title"]');
   await section.evaluate(el => el.scrollIntoView({behavior:'instant'}));
   assert.equal(await section.$$eval('details[open]', els => els.length),0);
   const ratio = await section.$eval('[role="img"]',el => el.clientWidth/el.clientHeight);
   assert(Math.abs(ratio-2)<0.02);
   if (width>800) {
    const offset=await section.evaluate(el=>{const a=el.children[0].getBoundingClientRect(),b=el.children[1].getBoundingClientRect();return Math.abs((a.top+a.bottom-b.top-b.bottom)/2)});
    assert(offset<2,'FAQ columns should share a vertical center');
   }
   assert(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth));
   await section.screenshot({path:`tmp/home-review/faq-centered-${width}.png`});
   const summary = await section.$('summary');
   await summary.click();
   assert.equal(await section.$$eval('details[open]',els=>els.length),1);
  }
  assert.deepEqual(errors,[]);
  console.log('Passed desktop, 390px and 320px: all FAQs closed initially, questions toggle, image is 2:1, no horizontal overflow or browser errors.');
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
