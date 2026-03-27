# Strategic Sloth — Local marketing (not for repo)

This folder is for **local production use only**. Add `marketing/` to `.gitignore` if you do not want these files committed.

- **Full launch kit:** `STRATEGIC_SLOTH_REELS_LAUNCH.md` — all 8 reels, style guide, templates, asset checklist, designer handoff.
- **Reel 1 test preview:** `reel-01-preview.html` — open in Chrome/Edge (double-click or drag into browser). 9:16 stage, launch-kit timings. **Cover** = thumbnail-style first frame; **PNG** = 1080×1920 snapshot of the current stage (safe zones hidden). **Loop** / **Auto-play** (refresh after ticking Auto-play) / **Safe zones** / **Sound** (enable then **Play** so audio can unlock). Staggered line reveals; respects **prefers-reduced-motion** (reload page after changing OS setting). **Play** / **R** / Space. Screen-record the viewport for a video test.

- **Reel 1 video export (repo root):** `npm run export-reel1-video` — records `?export=video` at 1080×1920 into `marketing/output/` as **WebM + MP4** (MP4 via `ffmpeg-static` after `npm install`). First time: `npx playwright install chromium`. URL query is set in `marketing/export-reel1-video.mjs` (`cover`, `end` = hold ms).

- **Swipeable carousels (all 8 scripts):** `carousels-all.html` — **on-brand** with site colors (yellow / navy / cream), Inter + Bangers + Comic Neue, `slothlogo`, Z-decor, emojis; swipe or ← →. **PNG this slide** saves **1080×1350** (Instagram 4:5); uses a 🦥 placeholder if the logo would taint the canvas (`file://`). **Batch export (real logo):** `npm run export-carousel-slides` → `marketing/output/carousel-instagram/rXX-slug/slide-NN.png` (51 files). See `CAROUSEL_FORMAT.md`.

- **Carousel batch 2 (10 alternate themes):** `carousels-batch2.html` — same Strategic Sloth angles, **different layouts** (split / top-band / navy / mint / lilac sticker) and **native 1080×1350** stages so sloth art stays in reserved zones (no vertical center-crop). **Batch export:** `npm run export-carousel-batch2` → `marketing/output/carousel-instagram-batch2/r101–r110-…/slide-NN.png` (61 files).

- **Creator Guides (all 15 PDFs):** `carousels-creator-guides.html` — **same visual system as** `carousels-all.html` (yellow stage, cream card, Z-decor, logo header, Bangers steps). One carousel per guide (7 slides: hook, benefit, 4 “what’s inside” beats, CTA to `/books`). **Regenerate HTML from catalog copy:** `npm run build:carousel-creator-guides`. **Batch export:** `npm run export-carousel-creator-guides` → `marketing/output/carousel-instagram-guides/r201–r215-…/slide-NN.png` (105 files).

- **Freedom Library (11 books):** `carousels-freedom-library.html` — **native 1080×1350** so the **top bar** (logo + STRATEGIC SLOTH + **strategicsloth.com/reading-guide**), **footer URL**, and **big hammock sloth** (`heroslothhammock.webp`) all stay on-screen (batch-1’s center-crop would clip header/footer). **Regenerate:** `npm run build:carousel-freedom-library`. **Export:** `npm run export-carousel-freedom-library` → `marketing/output/carousel-instagram-freedom/r301–r311-…/` (77 PNGs).

Dimensions reference: **1080×1920** (9:16), safe zones: keep critical text inside central ~1040×1600; leave ~120px top/bottom for UI.
