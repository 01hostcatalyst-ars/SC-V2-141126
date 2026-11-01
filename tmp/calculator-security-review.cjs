const puppeteer = require('puppeteer-core'), assert = require('node:assert/strict'), fs = require('node:fs');
(async () => {
 const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
 try {
  const page = await browser.newPage(); const api = [], errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', request => {
   const path = new URL(request.url()).pathname;
   if (!path.startsWith('/api/')) return request.continue();
   api.push(path);
   return request.respond({ status: path.includes('resolve-identity') ? 200 : 429, contentType: 'application/json', body: JSON.stringify(path.includes('resolve-identity') ? { success: true, resolved: false } : { success: false, error: 'The calculator usage limit has been reached. Please try again later.' }) });
  });
  for (const width of [1440, 390]) {
   await page.setViewport({ width, height: 950 });
   await page.goto('http://localhost:3000/influencer-rate-calculator', { waitUntil: 'networkidle0', timeout: 180000 });
   await page.waitForSelector('#calculator-profile'); api.length = 0;
   await page.type('#calculator-profile', 'https://instagram.com.evil.com/person');
   await page.click('button[type="submit"]');
   await page.waitForSelector('#calculator-input-hint[role="alert"]');
   assert.equal(api.length, 0); assert.equal(await page.$eval('#calculator-profile', el => el.getAttribute('aria-invalid')), 'true');
   assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
   await page.screenshot({ path: `tmp/calculator-invalid-${width}.png` });
  }
  await page.$eval('#calculator-profile', el => { const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(el, 'https://instagram.com/person/'); el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => document.body.innerText.includes('The calculator usage limit has been reached.'), { timeout: 30000 });
  assert(api.includes('/api/scrapers/instagram')); assert(!api.includes('/api/calculator/synthesize'));
  assert.deepEqual(errors, []);
  console.log('PASS: desktop/mobile inline rejection makes no API requests; supported input starts normal workflow; usage-limit message appears; no page errors or overflow. All APIs intercepted, no paid calls.');
 } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
