// Renders the auto-reply explainer video for each locale: npm run export-autoreply-videos [-- es,fr]
// Steps explainer.html frame by frame (deterministic, so text stays sharp), then encodes H.264 with ffmpeg-static.
// Output: public/media/autoreply/explainer-<locale>.mp4 and a .webp poster.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { createServer } from 'vite';
import { CANNED } from '../../server/autoreply/bot.js';

const require = createRequire(import.meta.url);
const ffmpeg = require('ffmpeg-static');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const outDir = path.join(root, 'public/media/autoreply');
const FPS = 30;
const POSTER_AT = 9.5;

// The copy lives in TypeScript modules that import JSON; Vite (installed with Astro) loads them as the site build does.
const vite = await createServer({ root, logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' });
const { siteCopy } = await vite.ssrLoadModule('/src/data/whatsapp-autoreply-site.ts');
const { autoCopy } = await vite.ssrLoadModule('/src/data/whatsapp-autoreply.ts');
const { onboardingCopy } = await vite.ssrLoadModule('/src/data/whatsapp-autoreply-onboarding.ts');
await vite.close();

function copyFor(loc) {
  const s = siteCopy[loc], t = autoCopy[loc], v = s.video;
  const lang = loc.startsWith('en') ? 'en' : loc;
  const customer = s.demo.lines.filter((l) => l.from === 'customer');
  return {
    product: s.product, by: s.by, clock: v.clock, unread: v.unread,
    in0: customer[0].text, in1: onboardingCopy[loc].samples.price[0], in2: onboardingCopy[loc].samples.where[0],
    initial: s.demo.business.slice(0, 1), business: s.demo.business, status: s.demo.status, channel: s.demo.channel,
    line0: s.demo.lines[0].text, time0: s.demo.lines[0].time, line1: s.demo.lines[1].text, time1: s.demo.lines[1].time,
    approvedTitle: t.facts[3][1], ap0: v.approved[0], ap1: v.approved[1], ap2: v.approved[2], ap3: v.approved[3],
    handoff0: v.handoff[0], handoffReply: CANNED.handoff[lang], handoff1: v.handoff[1], alertBody: s.alertBody,
    st0: v.steps[0], st1: v.steps[1], st2: v.steps[2], st3: v.steps[3],
    cap5: v.captions[5], endPrice: v.endPrice, endUrl: v.endUrl, captions: v.captions,
  };
}

const locales = (process.argv[2] ?? 'es,en,fr,en-CA').split(',');
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
for (const loc of locales) {
  const key = loc.toLowerCase();
  const frames = path.join(root, 'marketing/output/autoreply-frames', key);
  rmSync(frames, { recursive: true, force: true });
  mkdirSync(frames, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.addInitScript((c) => { window.COPY = c; }, copyFor(loc));
  await page.goto(pathToFileURL(path.join(here, 'explainer.html')).href);
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.DURATION);
  const total = Math.round(duration * FPS);
  for (let i = 0; i < total; i++) {
    await page.evaluate((t) => window.render(t), i / FPS);
    await page.screenshot({ path: path.join(frames, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  await page.evaluate((t) => window.render(t), POSTER_AT);
  const poster = await page.screenshot({ type: 'png' });
  await sharp(poster).webp({ quality: 82 }).toFile(path.join(outDir, `explainer-${key}.webp`));
  await page.close();
  const mp4 = path.join(outDir, `explainer-${key}.mp4`);
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, 'f%05d.jpg'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
  rmSync(frames, { recursive: true, force: true });
  console.log(`${loc}: ${mp4}`);
}
await browser.close();
