# Strategic Sloth — Swipeable image carousels (vs. Reels)

## On-brand design (matches strategicsloth.com)

`carousels-all.html` is aligned with the **live site** (see `src/components/Hero.astro`, `Navbar.astro`, `FunnelLayout.astro`):

| Element | Source of truth |
|--------|-------------------|
| **Yellow hero field** | `#FFD600` gradient (warm yellow → deeper gold) |
| **Navy copy** | `#1B1B3D` (headlines, body on cards) |
| **Cream cards** | `#FFFDF7` with **3px black** border + **hard shadow** `8px 8px 0 #000` |
| **CTA / emphasis navy** | `#2C2D5D` panels (same family as homepage primary button) |
| **Accent red** | `#FF4D4D` (highlights, “NOT ME”, viral line, dots) |
| **Sky chips** | `#E3F2FF` vibe via panels / Comic accents (hero speech bubble family) |
| **Top bar** | `#FFF7E6`-style strip + **sloth logo** (`public/images/slothlogo.png`) in yellow circle + black border — like the navbar badge |
| **Fonts** | **Inter** (900 italic headlines — hero H1 energy), **Bangers** (step numbers / comic beats), **Comic Neue** (friendly body on steps & CTA lines) |
| **Decor** | Floating **Z** marks (stroke `#2C2D5D`) like the hero; **🦥 🌴 ✅** and contextual emojis on slides |
| **Footer** | 🦥 + `strategicsloth.com` on every slide for brand lockup |

**Open the file from disk** so the logo loads:  
`…/strategic/marketing/carousels-all.html` (path `../public/images/slothlogo.png` must resolve). If you only serve `/marketing/` over HTTP, copy `slothlogo.png` into `marketing/` or serve from repo root.

## What changes vs video Reels

Each beat is a **static full-frame image**. People **swipe** slide to slide (Instagram **carousel** in the feed, or the local preview).

**Pros:** Faster in Canva/Figma, no audio, easy A/B one slide, strong saves on “poster” slides.  
**Cons:** No motion in-feed unless you pair with a short Reel; carousel swipe is **horizontal**.

## Instagram limits

- Up to **10 images** per carousel. Scripts are ≤9 slides except #8 (8 slides + CTAs OK).
- **One aspect ratio** per post. Preview is **9:16**; **4:5 (1080×1350)** is often better for feed — rebuild frames in design tools if you switch.

## Instagram slide size (feed carousel)

- **1080 × 1350 px (4:5)** — what Meta recommends for vertical feed carousels.  
- **`carousels-all.html`:** stage is **1080×1920**; batch export **center-crops** the middle **1350px** of height.  
- **`carousels-batch2.html`:** stage is **1080×1350** natively — art is laid out in safe bands so mascots are not cropped; use **`npm run export-carousel-batch2`** for PNGs under `marketing/output/carousel-instagram-batch2/`.
- **`carousels-freedom-library.html`:** also **1080×1350** native — header, on-image URL, footer, and hero sloth are composed to fit the full frame (see **`npm run export-carousel-freedom-library`**).

## Production workflow

1. **Recommended — export batch 1:** from repo root run **`npm run export-carousel-slides`** (needs Playwright Chromium). Outputs:
   - `marketing/output/carousel-instagram/README.txt`
   - One folder per script: `r01-18-years-their-wealth/`, … `r08-pick-one-let-it-run/`
   - `slide-01.png` … in posting order (real **slothlogo** via local HTTP).
2. **Batch 2 (10 alternate carousels):** **`npm run export-carousel-batch2`** → `marketing/output/carousel-instagram-batch2/README.txt` and folders `r101-lazy-advantage/` … `r110-sloth-mode-on/` (61 PNGs).
3. **Creator Guides (15 products):** Regenerate **`npm run build:carousel-creator-guides`** when copy in `splice-creator-guides-carousel.mjs` should match `src/data/catalog-data.ts`. Export **`npm run export-carousel-creator-guides`** → `marketing/output/carousel-instagram-guides/` (reelId **201–215**, 7 slides each, same 4:5 crop as `carousels-all.html`).
4. **Freedom Library (11 books):** **`npm run build:carousel-freedom-library`** (source: `build-freedom-library-carousel.mjs`, sync with `reading-guide.astro`). **`npm run export-carousel-freedom-library`** → `marketing/output/carousel-instagram-freedom/` (reelId **301–311**, **native** 1080×1350, header + footer URL + sloth art always visible).
5. Or open **`carousels-all.html`**, **`carousels-creator-guides.html`**, or **`carousels-freedom-library.html`** and use **PNG this slide** for a one-off (logo may swap to 🦥 on `file://` to avoid canvas taint).
6. Upload each folder’s PNGs as **one carousel**; caption from the HTML panel or `STRATEGIC_SLOTH_REELS_LAUNCH.md`.
7. Optional: rebuild in **Figma/Canva** using the same tokens if you want tweaks.

## Optional: Reels + carousel

Post the **carousel** in-feed and a **short Reel** that teases slide 1 → “Swipe for the system → link in bio.”
