/**
 * Exports carousels-creator-guides.html — 15 Creator Guides, 7 slides each (1080×1350, 4:5 crop).
 * Output: marketing/output/carousel-instagram-guides/rXXX-slug/slide-NN.png
 *
 * Regenerate HTML after catalog changes: node marketing/splice-creator-guides-carousel.mjs
 * Run: npm run export-carousel-creator-guides
 */

import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const outRoot = path.join(__dirname, "output", "carousel-instagram-guides");

/** Must match carousels-creator-guides.html (7 slides per guide) */
const REEL_EXPORT = [
  { id: 201, slug: "your-first-100-online", count: 7 },
  { id: 202, slug: "zero-to-1k-per-month", count: 7 },
  { id: 203, slug: "pricing-your-digital-products", count: 7 },
  { id: 204, slug: "why-youre-not-making-money-online-yet", count: 7 },
  { id: 205, slug: "idea-to-pdf-in-24-hours", count: 7 },
  { id: 206, slug: "build-digital-products-without-coding", count: 7 },
  { id: 207, slug: "simple-landing-pages-that-convert", count: 7 },
  { id: 208, slug: "the-offer-that-sells-itself", count: 7 },
  { id: 209, slug: "sell-without-an-audience", count: 7 },
  { id: 210, slug: "the-one-page-sales-funnel", count: 7 },
  { id: 211, slug: "email-list-for-creators", count: 7 },
  { id: 212, slug: "content-that-actually-converts", count: 7 },
  { id: 213, slug: "the-anti-hustle-playbook", count: 7 },
  { id: 214, slug: "stop-overthinking-start-shipping", count: 7 },
  { id: 215, slug: "focus-like-a-sloth", count: 7 },
];

function sendFile(res, fp) {
  if (!existsSync(fp) || !statSync(fp).isFile()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const ext = path.extname(fp).toLowerCase();
  const ct =
    ext === ".html"
      ? "text/html; charset=utf-8"
      : ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : ext === ".svg"
            ? "image/svg+xml"
            : "application/octet-stream";
  res.writeHead(200, { "Content-Type": ct, "Cache-Control": "no-store" });
  res.end(readFileSync(fp));
}

const server = createServer((req, res) => {
  const u = new URL(req.url ?? "/", "http://127.0.0.1");
  const pathname = decodeURIComponent(u.pathname);
  if (pathname.startsWith("/images/")) {
    return sendFile(res, path.join(repoRoot, "public", "images", pathname.slice(8)));
  }
  if (pathname.startsWith("/marketing/")) {
    return sendFile(res, path.join(repoRoot, "marketing", pathname.slice(11)));
  }
  res.writeHead(404);
  res.end();
});

const port = await new Promise((resolve, reject) => {
  server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  server.on("error", reject);
});

mkdirSync(outRoot, { recursive: true });
writeFileSync(
  path.join(outRoot, "README.txt"),
  `Strategic Sloth — Creator Guides carousel PNGs

15 guides (reelId 201–215), 7 slides each (hook, benefit, 4 bullets, CTA).
Same on-brand style as carousels-all.html; 1080×1350 (4:5 center-crop).

Hub: https://www.strategicsloth.com/books

Regenerate HTML from catalog: node marketing/splice-creator-guides-carousel.mjs
Export: npm run export-carousel-creator-guides
`,
  "utf8"
);

const base = `http://127.0.0.1:${port}`;
let browser;
let ctx;
let page;

try {
  browser = await chromium.launch({ headless: true });
  ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  page = await ctx.newPage();

  let total = 0;
  for (const reel of REEL_EXPORT) {
    const dir = path.join(outRoot, `r${reel.id}-${reel.slug}`);
    mkdirSync(dir, { recursive: true });
    for (let s = 0; s < reel.count; s++) {
      const url = `${base}/marketing/carousels-creator-guides.html?export=1&reelId=${reel.id}&slideIdx=${s}`;
      await page.goto(url, { waitUntil: "load", timeout: 120000 });
      await page.waitForFunction(() => document.fonts.status === "loaded", { timeout: 30000 });
      await page.waitForSelector("#ig-export-root .stage", { timeout: 15000 });
      await page.locator("#ig-export-root").screenshot({
        path: path.join(dir, `slide-${String(s + 1).padStart(2, "0")}.png`),
        type: "png",
      });
      total += 1;
      process.stdout.write(`\rWrote ${total} slides…`);
    }
    console.log(`\n${dir}`);
  }
  console.log(`\nDone. ${total} PNGs → ${outRoot}`);
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  server.close();
  if (ctx) await ctx.close().catch(() => {});
  if (browser) await browser.close().catch(() => {});
}
