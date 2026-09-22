import { readFileSync, writeFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

// Read-only availability check. Never submits checkout or payment forms.
const { checkoutUrls } = JSON.parse(readFileSync('docs/commerce-baseline.json', 'utf8'));
const results = [];
let cursor = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < checkoutUrls.length) {
    const url = checkoutUrls[cursor++];
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
      const html = await response.text();
      const dom = new JSDOM(html);
      const title = dom.window.document.title.trim();
      const checkout = response.ok && new URL(response.url).pathname.startsWith('/checkout/cart/') && /Checkout/i.test(title);
      results.push({ url, status: response.status, title, checkout });
      dom.window.close();
      console.log(`${checkout ? 'PASS' : 'FAIL'} ${response.status} ${title}`);
    } catch (error) {
      results.push({ url, checkout: false, error: error.message });
      console.log(`FAIL ${url}: ${error.message}`);
    }
  }
}));
results.sort((a, b) => a.url.localeCompare(b.url));
writeFileSync('docs/live-checkout-verification.json', JSON.stringify({ checkedAt: new Date().toISOString(), scope: 'Checkout opens; no payment submitted or delivery tested.', results }, null, 2) + '\n');
const failures = results.filter(result => !result.checkout);
console.log(`${results.length - failures.length}/${results.length} original checkouts available.`);
if (failures.length) process.exitCode = 1;
