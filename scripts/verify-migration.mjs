import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { JSDOM } from 'jsdom';

const dist = resolve('dist');
const baseline = JSON.parse(readFileSync('docs/commerce-baseline.json', 'utf8'));
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
}
const pages = walk(dist).filter(file => file.endsWith('.html'));
const html = pages.map(file => readFileSync(file, 'utf8')).join('\n');
for (const url of baseline.checkoutUrls) assert.ok(html.includes(url), `Missing original checkout: ${url}`);
for (const slug of baseline.articleSlugs) assert.ok(existsSync(join(dist, 'blog', slug, 'index.html')), `Missing article: ${slug}`);
for (const route of baseline.originalRoutes) {
  const file = route === 'index' || route.endsWith('/index') ? join(dist, `${route}.html`) : join(dist, route, 'index.html');
  assert.ok(existsSync(file), `Missing original route: ${route}`);
}
const issues = [];
for (const file of pages) {
  const dom = new JSDOM(readFileSync(file, 'utf8'));
  const document = dom.window.document;
  if (document.querySelector('.reading-article')) {
    assert.ok((document.querySelector('.reading-prose')?.textContent || '').trim().length > 300, `${relative(dist,file)} must retain its article body`);
  }
  assert.equal(document.querySelectorAll('main').length, 1, `${relative(dist,file)} must have one main landmark`);
  assert.equal(document.querySelectorAll('h1').length, 1, `${relative(dist,file)} must have one h1`);
  for (const element of document.querySelectorAll('[href], [src]')) {
    const href = element.getAttribute('href') || element.getAttribute('src');
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const url = new URL(href, 'https://strategicsloth.com');
    const target = join(dist, decodeURIComponent(url.pathname));
    if (!(existsSync(target) && statSync(target).isFile()) && !existsSync(join(target, 'index.html'))) {
      issues.push(`${relative(dist,file)}: ${href}`);
    }
  }
  dom.window.close();
}
assert.deepEqual(issues, [], 'Broken local pages/assets');
assert.ok(!html.includes('your-store.lemonsqueezy.com'), 'Placeholder store link shipped');
const home = readFileSync(join(dist,'index.html'),'utf8');
assert.ok(home.includes('/learn/'), 'Learning section must be discoverable');
assert.ok(!/Flash Sale Ends|purchase-notification|5,000\+|Norman Ascension|Normandy/i.test(home), 'Home includes removed sales claims or unrevealed game details');
console.log(`Migration verified: ${pages.length} pages, ${baseline.articleSlugs.length} original articles, ${baseline.checkoutUrls.length} original checkout URLs, no missing local targets.`);
