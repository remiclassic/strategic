/**
 * Records marketing/reel-brand-portrait.html (?export=video) to WebM via Playwright.
 * Serves ../public for slothlogo.png. Optional MP4 via ffmpeg-static.
 *
 * Prereq: npx playwright install chromium
 * Usage: npm run export-reel-brand-video
 */

import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);

function resolveFfmpegBin() {
  try {
    const p = require("ffmpeg-static");
    if (typeof p === "string" && existsSync(p)) return p;
  } catch {
    /* optional */
  }
  return "ffmpeg";
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const marketingDir = __dirname;
const repoRoot = path.join(marketingDir, "..");
const publicDir = path.join(repoRoot, "public");
const outDir = path.join(marketingDir, "output");
mkdirSync(outDir, { recursive: true });

const htmlFile = "reel-brand-portrait.html";
const query = "export=video&cover=900&end=1400";

function mime(p) {
  const ext = path.extname(p).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".ico") return "image/x-icon";
  return "application/octet-stream";
}

function serveFile(res, fp) {
  if (!existsSync(fp) || !statSync(fp).isFile()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": mime(fp), "Cache-Control": "no-store" });
  res.end(readFileSync(fp));
}

const server = createServer((req, res) => {
  const u = new URL(req.url ?? "/", "http://127.0.0.1");
  let pathname = decodeURIComponent(u.pathname);
  if (pathname === "/") pathname = `/${htmlFile}`;

  if (pathname.startsWith("/public/")) {
    const rel = pathname.replace(/^\/+/, "");
    const fp = path.join(repoRoot, rel);
    if (!fp.startsWith(publicDir)) {
      res.writeHead(403);
      res.end();
      return;
    }
    serveFile(res, fp);
    return;
  }

  const rel = pathname.replace(/^\/+/, "");
  const fp = path.join(marketingDir, rel);
  if (!fp.startsWith(marketingDir)) {
    res.writeHead(403);
    res.end();
    return;
  }
  serveFile(res, fp);
});

const port = await new Promise((resolve, reject) => {
  server.listen(0, "127.0.0.1", () => {
    const addr = server.address();
    resolve(typeof addr === "object" && addr ? addr.port : 0);
  });
  server.on("error", reject);
});

const pageUrl = `http://127.0.0.1:${port}/${htmlFile}?${query}`;
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const webmPath = path.join(outDir, `reel-brand-portrait-${stamp}.webm`);
const mp4Path = webmPath.replace(/\.webm$/i, ".mp4");

let browser;
let context;
let page;
try {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: outDir,
      size: { width: 1080, height: 1920 },
    },
  });
  page = await context.newPage();

  await page.goto(pageUrl, { waitUntil: "load", timeout: 120000 });

  await page.waitForFunction(() => document.fonts.status === "loaded", { timeout: 30000 });

  await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      const ms = 180000;
      const t = setTimeout(() => reject(new Error("Timed out waiting for ss-reel-complete")), ms);
      window.addEventListener(
        "ss-reel-complete",
        () => {
          clearTimeout(t);
          resolve();
        },
        { once: true }
      );
    });
  });

  const video = page.video();
  await context.close();
  context = null;
  if (video) {
    await video.saveAs(webmPath);
  } else {
    throw new Error("Playwright did not attach a video recording.");
  }

  await browser.close();
  browser = null;

  console.log("Wrote:", webmPath);

  const ff = resolveFfmpegBin();
  try {
    execFileSync(ff, ["-y", "-i", webmPath, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4Path], {
      stdio: "inherit",
    });
    console.log("Wrote:", mp4Path);
  } catch {
    console.log("MP4 conversion failed — WebM is valid; check ffmpeg / ffmpeg-static.");
  }
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  server.close();
  if (context) await context.close().catch(() => {});
  if (browser) await browser.close().catch(() => {});
}
