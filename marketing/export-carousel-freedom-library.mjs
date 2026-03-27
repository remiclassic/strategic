/**
 * Exports carousels-freedom-library.html — 11 books, native 1080×1350 (no crop).
 * Output: marketing/output/carousel-instagram-freedom/rXXX-slug/slide-NN.png
 *
 * Regenerate: node marketing/build-freedom-library-carousel.mjs
 * Run: npm run export-carousel-freedom-library
 */

import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const outRoot = path.join(__dirname, "output", "carousel-instagram-freedom");

const REEL_EXPORT = [
  { id: 301, slug: "dont-do-anything", count: 7 },
  { id: 302, slug: "design-your-exit", count: 7 },
  { id: 303, slug: "the-freedom-blueprint", count: 7 },
  { id: 304, slug: "strategic-privacy-tax", count: 7 },
  { id: 305, slug: "residency-without-relocation", count: 7 },
  { id: 306, slug: "global-business-jurisdictions", count: 7 },
  { id: 307, slug: "global-banking-systems", count: 7 },
  { id: 308, slug: "advanced-banking-strategies", count: 7 },
  { id: 309, slug: "asset-protection-playbook", count: 7 },
  { id: 310, slug: "ancestral-birthright-citizenship", count: 7 },
  { id: 311, slug: "investment-citizenship-handbook", count: 7 },
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
  `Strategic Sloth — Freedom Library carousel PNGs

11 books (reelId 301–311), 7 slides each. Native 1080×1350: header, footer URL,
and hammock sloth are fully visible (not center-cropped like carousels-all).

Hub: https://www.strategicsloth.com/reading-guide

Regenerate HTML: npm run build:carousel-freedom-library
Export: npm run export-carousel-freedom-library
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
      const url = `${base}/marketing/carousels-freedom-library.html?export=1&reelId=${reel.id}&slideIdx=${s}`;
      await page.goto(url, { waitUntil: "load", timeout: 120000 });
      await page.waitForFunction(() => document.fonts.status === "loaded", { timeout: 30000 });
      await page.waitForSelector("#ig-export-root .fl-stage", { timeout: 15000 });
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
