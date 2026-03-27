/**
 * Exports carousels-books-offers-highconvert.html — 18 books/bundles, 10 slides each.
 * Native 1080×1350 (4:5) — no center-crop needed.
 * Output: marketing/output/carousel-instagram-books-offers/{id}/slide-NN.png
 *
 * Run: npm run export-carousel-books-offers
 */

import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const outRoot = path.join(__dirname, "output", "carousel-instagram-books-offers");

const copyPath = path.join(__dirname, "data", "books-offers-carousel-copy.json");
const copy = JSON.parse(readFileSync(copyPath, "utf8"));

const REEL_EXPORT = copy.map((entry, idx) => ({
  id: 401 + idx,
  slug: entry.id,
  count: 10,
}));

function sendFile(res, fp) {
  if (!existsSync(fp) || !statSync(fp).isFile()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const ext = path.extname(fp).toLowerCase();
  const ct =
    ext === ".html"  ? "text/html; charset=utf-8" :
    ext === ".json"  ? "application/json; charset=utf-8" :
    ext === ".png"   ? "image/png" :
    ext === ".webp"  ? "image/webp" :
    ext === ".svg"   ? "image/svg+xml" :
                       "application/octet-stream";
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
  `Strategic Sloth — Books & Offers high-converting carousel PNGs

18 offers (reelId 401–418), 10 slides each. Native 1080×1350 (4:5).
Slide 7 = existing AI-generated product poster.
Slide structure:
  01 — Hook        06 — System
  02 — Problem     07 — Poster (AI art)
  03 — Agitate     08 — Proof
  04 — Shift       09 — Soft CTA
  05 — Idea        10 — Hard CTA

Regenerate copy: edit marketing/data/books-offers-carousel-copy.json
Regenerate HTML: marketing/carousels-books-offers-highconvert.html
Re-export PNGs:  npm run export-carousel-books-offers

Hub: https://www.strategicsloth.com/books
`,
  "utf8"
);

const base = `http://127.0.0.1:${port}`;
let browser;
let ctx;
let page;

try {
  browser = await chromium.launch({ headless: true });
  ctx = await browser.newContext({
    viewport: { width: 1080, height: 1350 },
    deviceScaleFactor: 1,
  });
  page = await ctx.newPage();

  let total = 0;
  for (const reel of REEL_EXPORT) {
    const dir = path.join(outRoot, reel.slug);
    mkdirSync(dir, { recursive: true });

    for (let s = 0; s < reel.count; s++) {
      const url = `${base}/marketing/carousels-books-offers-highconvert.html?export=1&reelId=${reel.id}&slideIdx=${s}`;
      await page.goto(url, { waitUntil: "load", timeout: 120_000 });

      // Wait for the HTML init() to finish and mark the slide as ready
      await page.waitForFunction(() => window.ssExportReady === true, { timeout: 30_000 });

      // For poster slide (index 6) wait for the img to finish loading
      if (s === 6) {
        await page.waitForFunction(
          () => {
            const img = document.querySelector("#ig-export-root img");
            return !img || img.complete;
          },
          { timeout: 20_000 }
        );
      }

      // Give fonts a frame to paint
      await page.waitForFunction(() => document.fonts.status === "loaded", { timeout: 15_000 }).catch(() => {});

      await page.locator("#ig-export-root").screenshot({
        path: path.join(dir, `slide-${String(s + 1).padStart(2, "0")}.png`),
        type: "png",
      });

      total += 1;
      process.stdout.write(`\r  [${reel.slug}] slide ${s + 1}/10 · ${total} total`);
    }

    console.log(`\n  → ${dir}`);
  }

  console.log(`\nDone. ${total} PNGs written to ${outRoot}`);
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  server.close();
  if (ctx) await ctx.close().catch(() => {});
  if (browser) await browser.close().catch(() => {});
}
