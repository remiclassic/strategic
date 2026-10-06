import { chromium } from 'playwright';
import fs from 'node:fs';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
try {
  const page = await browser.newPage();
  const failures = [];
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith('http://127.0.0.1:4321')) failures.push(response.url()); });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:4321/work/');
    await page.locator('.work-closeup summary').click();
    if (!(await page.locator('.work-closeup').getAttribute('open') === '')) throw new Error('Closeup did not expand');
    await page.locator('main img').evaluateAll(imgs => imgs.forEach(img => img.loading = 'eager'));
    await page.waitForFunction(() => [...document.querySelectorAll('main img')].every(img => img.complete));
    await page.locator('#directions').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const images = await page.locator('main img').evaluateAll(imgs => imgs.map(img => ({ src: img.getAttribute('src'), exists: img.complete && img.naturalWidth > 0 })));
    if (images.some(img => !img.exists)) throw new Error(JSON.stringify(images));
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Overflow at ${width}`);
    await page.locator('video').evaluateAll(videos => videos.forEach(video => video.load()));
    await page.waitForFunction(() => [...document.querySelectorAll('video')].every(video => video.readyState >= 1));
    if (await page.locator('.evidence-card').count() !== 5) throw new Error('Five product showcases required');
    await page.evaluate(() => scrollTo(0, 0));
    fs.mkdirSync('design/work-showcase', { recursive: true });
    await page.screenshot({ path: `design/work-showcase/work-${width}.png`, fullPage: true });
  }
  for (const route of ['products','drivedeck','narriaflow','world-editor']) {
    await page.goto(`http://127.0.0.1:4321/${route}/`);
    await page.locator('.product-evidence').scrollIntoViewIfNeeded();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Overflow on ${route}`);
    for (const video of await page.locator('.product-evidence video').all()) {
      await video.evaluate(el => el.load());
      await video.evaluate(el => new Promise((resolve, reject) => {
        if (el.readyState >= 1) return resolve();
        el.onloadedmetadata = resolve;
        el.onerror = () => reject(new Error('Video load failed'));
      }));
    }
  }
  await page.goto('http://127.0.0.1:4321/');
  await page.locator('.work-preview').scrollIntoViewIfNeeded();
  if (await page.locator('.work-preview a[href="/work/"]').count() !== 1) throw new Error('Homepage showcase missing');
  if (failures.length) throw new Error(`Failed assets: ${failures.join(', ')}`);
  console.log('Desktop and mobile passed: images, overflow, closeup, video metadata, and homepage showcase.');
} finally { await browser.close(); }
