/**
 * Exports carousels-batch2.html — 10 carousels, native 1080×1350 (sloth art uncropped).
 * Output: marketing/output/carousel-instagram-batch2/rXXX-slug/slide-NN.png
 *
 * Run: npm run export-carousel-batch2
 */

import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const outRoot = path.join(__dirname, "output", "carousel-instagram-batch2");

const REEL_EXPORT = [
  { id: 101, slug: "lazy-advantage", count: 6 },
  { id: 102, slug: "pdfs-beat-perfection", count: 6 },
  { id: 103, slug: "nine-to-five-is-r-and-d", count: 7 },
  { id: 104, slug: "one-offer-many-doors", count: 6 },
  { id: 105, slug: "energy-is-inventory", count: 6 },
  { id: 106, slug: "anti-hustle-stack", count: 7 },
  { id: 107, slug: "selling-while-offline", count: 6 },
  { id: 108, slug: "minimum-lovable-product", count: 6 },
  { id: 109, slug: "permission-to-be-boring", count: 6 },
  { id: 110, slug: "sloth-mode-on", count: 5 },
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
  `Strategic Sloth — carousel batch 2 (10 themes)

Native 1080×1350 (4:5). Sloth illustrations sit in reserved art zones — no center-crop.

Folders: r101–r110 + slug. Upload slide-01, slide-02, … in order per carousel.

npm run export-carousel-batch2
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
      const url = `${base}/marketing/carousels-batch2.html?export=1&reelId=${reel.id}&slideIdx=${s}`;
      await page.goto(url, { waitUntil: "load", timeout: 120000 });
      await page.waitForFunction(() => document.fonts.status === "loaded", { timeout: 30000 });
      await page.waitForSelector("#ig-export-root .b2-stage", { timeout: 15000 });
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
