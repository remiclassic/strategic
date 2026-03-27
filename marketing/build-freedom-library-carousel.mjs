/**
 * Writes carousels-freedom-library.html — native 1080×1350 so header, URL footer,
 * and big hammock sloth stay fully visible (batch-1 center-crop would clip them).
 *
 * Run: node marketing/build-freedom-library-carousel.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const Z_PATH = "M8 12H32L12 28H32";

/** 11 Freedom Library books (reading-guide.astro) */
const BOOKS = [
  {
    id: 301,
    slug: "dont-do-anything",
    tier: "starter",
    tierLab: "STARTER",
    tierEmoji: "🌱",
    emoji: "📕",
    title: "Don't Do Anything",
    subtitle: "The Strategic Sloth's Guide to Building Smart, Lazy Income Online",
    hooks: ["DON'T DO", "ANYTHING"],
    bullets: [
      "Your income engine: digital products that can sell on autopilot after setup.",
      "No course to record, no clients to chase.",
      "You don't need a huge audience on day one.",
      "Put the product in front of people already looking for the fix.",
    ],
  },
  {
    id: 302,
    slug: "design-your-exit",
    tier: "starter",
    tierLab: "STARTER",
    tierEmoji: "🌱",
    emoji: "📗",
    title: "Design Your Exit",
    subtitle: "Biohack Your Mind, Reclaim Your Time, and Build a Life That Doesn't Need Escaping",
    hooks: ["DESIGN", "YOUR EXIT"],
    bullets: [
      "The operating system upgrade for the person behind the business.",
      "Mental, physical, and structural changes that stick.",
      "So your income actually translates into freedom.",
      "Not another hustle plan. A life design frame.",
    ],
  },
  {
    id: 303,
    slug: "the-freedom-blueprint",
    tier: "builder",
    tierLab: "BUILDER",
    tierEmoji: "🏗️",
    emoji: "🗺️",
    title: "The Freedom Blueprint",
    subtitle: "Your Sovereignty Architecture",
    hooks: ["THE FREEDOM", "BLUEPRINT"],
    bullets: [
      "The strategic overview of how the pieces fit together.",
      "Five Flags Theory: residency, citizenship, banking, business, assets.",
      "How they work as one system, not random hacks.",
      "So you stop reacting and start structuring.",
    ],
  },
  {
    id: 304,
    slug: "strategic-privacy-tax",
    tier: "builder",
    tierLab: "BUILDER",
    tierEmoji: "🏗️",
    emoji: "🔒",
    title: "Strategic Privacy & Tax Positioning",
    subtitle: "Anonymity and Zero-Tax Strategy",
    hooks: ["PRIVACY &", "TAX POSITIONING"],
    bullets: [
      "Earning money is step one. Keeping it is step two.",
      "Legally minimize tax burden where it makes sense.",
      "Protect personal information from unnecessary exposure.",
      "Real frameworks, not forum myths.",
    ],
  },
  {
    id: 305,
    slug: "residency-without-relocation",
    tier: "builder",
    tierLab: "BUILDER",
    tierEmoji: "🏗️",
    emoji: "🏠",
    title: "Residency Without Relocation",
    subtitle: "Legal Residence with Minimal Stays",
    hooks: ["RESIDENCY", "WITHOUT RELOCATION"],
    bullets: [
      "You don't have to move full-time to use residency tools.",
      "Programs that grant legal residency with minimal physical presence.",
      "Compare paths that match your actual lifestyle.",
      "Structure first, packing list second.",
    ],
  },
  {
    id: 306,
    slug: "global-business-jurisdictions",
    tier: "builder",
    tierLab: "BUILDER",
    tierEmoji: "🏗️",
    emoji: "🌐",
    title: "Global Business Jurisdictions Guide",
    subtitle: "Setup and Scale Globally",
    hooks: ["GLOBAL BUSINESS", "JURISDICTIONS"],
    bullets: [
      "Where your business lives matters for tax, banking, and risk.",
      "Top jurisdictions for an international company.",
      "Real cost comparisons and setup realities.",
      "Pick a home base that matches how you actually earn.",
    ],
  },
  {
    id: 307,
    slug: "global-banking-systems",
    tier: "scale",
    tierLab: "SCALE",
    tierEmoji: "🚀",
    emoji: "🏦",
    title: "Global Banking Systems for Entrepreneurs",
    subtitle: "Strategic Banking Layers and Alternatives",
    hooks: ["GLOBAL BANKING", "FOR ENTREPRENEURS"],
    bullets: [
      "One domestic account is not a global stack.",
      "Offshore and fintech options from free platforms up.",
      "How to think in layers instead of a single bank.",
      "So you can actually move money where you operate.",
    ],
  },
  {
    id: 308,
    slug: "advanced-banking-strategies",
    tier: "scale",
    tierLab: "SCALE",
    tierEmoji: "🚀",
    emoji: "💳",
    title: "Advanced Banking Strategies",
    subtitle: "When Traditional Banks Say No",
    hooks: ["ADVANCED", "BANKING"],
    bullets: [
      "Crypto, e-commerce, and “risky” industries scare legacy banks.",
      "Payment processors, EMIs, and stablecoin rails.",
      "Ways to reduce friction when doors close.",
      "Practical, not theoretical.",
    ],
  },
  {
    id: 309,
    slug: "asset-protection-playbook",
    tier: "scale",
    tierLab: "SCALE",
    tierEmoji: "🚀",
    emoji: "🛡️",
    title: "Asset Protection Playbook",
    subtitle: "Protecting Wealth Across Jurisdictions",
    hooks: ["ASSET", "PROTECTION"],
    bullets: [
      "Building wealth is hard. Keeping it has its own playbook.",
      "Top jurisdictions and legal tools explained clearly.",
      "Multi-jurisdictional thinking without paranoia cosplay.",
      "So you're harder to shake down by default.",
    ],
  },
  {
    id: 310,
    slug: "ancestral-birthright-citizenship",
    tier: "scale",
    tierLab: "SCALE",
    tierEmoji: "🚀",
    emoji: "🌳",
    title: "Ancestral & Birthright Citizenship",
    subtitle: "Your Tree Might Already Owe You a Passport",
    hooks: ["ANCESTRAL &", "BIRTHRIGHT"],
    bullets: [
      "Before you drop six figures on an investment passport.",
      "Citizenship by descent and jus soli paths.",
      "Often the cheapest second passport you'll get.",
      "Check the tree before the wallet.",
    ],
  },
  {
    id: 311,
    slug: "investment-citizenship-handbook",
    tier: "scale",
    tierLab: "SCALE",
    tierEmoji: "🚀",
    emoji: "🛂",
    title: "Investment Citizenship Handbook",
    subtitle: "Buy a Passport, Gain a World",
    hooks: ["INVESTMENT", "CITIZENSHIP"],
    bullets: [
      "When ancestry doesn't get you there, capital can.",
      "Major CBI programs compared side by side.",
      "From Caribbean donations to European tiers.",
      "So you buy options, not a brochure fantasy.",
    ],
  },
];

function captionFor(b) {
  return [
    `${b.title} — Freedom Library (${b.tierLab})`,
    "",
    b.subtitle,
    "",
    ...b.bullets.map((x) => `• ${x}`),
    "",
    "11 books · 3 tiers → https://www.strategicsloth.com/reading-guide",
    "",
    "https://www.strategicsloth.com",
  ].join("\n");
}

function slideHook(b) {
  const [a, c] = b.hooks;
  return `<span class="fl-emoji-lead" aria-hidden="true">${b.emoji}</span><div class="fl-line fl-t36 fl-muted">FREEDOM LIBRARY · ${b.tierEmoji} ${b.tierLab}</div><div class="fl-line fl-t44 fl-mt6">${a}</div><div class="fl-line fl-t40 fl-mt6">${c}</div>`;
}

function slideSubtitle(b) {
  return `<span class="fl-emoji-lead fl-emoji-sm" aria-hidden="true">✨</span><div class="fl-step-body fl-step-tight">${esc(b.subtitle)}</div>`;
}

function slideStep(n, text) {
  const label = String(n).padStart(2, "0");
  return `<div class="fl-step-label">${label}</div><div class="fl-step-body">${esc(text)}</div>`;
}

function slideCta(b) {
  return `<div class="fl-cta-panel"><div class="fl-cta-main">📖 ${esc(b.title)} →</div><div class="fl-cta-url">strategicsloth.com/reading-guide</div><div class="fl-cta-sub">LINK IN BIO</div></div>`;
}

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSlidesForBook(b) {
  const inners = [
    slideHook(b),
    slideSubtitle(b),
    ...b.bullets.map((text, i) => slideStep(i + 1, text)),
    slideCta(b),
  ];
  return inners.map((inner) => `flStage(${JSON.stringify(inner)})`);
}

function buildReelsArrayJs() {
  const items = BOOKS.map((b) => {
    const slides = buildSlidesForBook(b).join(",\n          ");
    return `      {
        id: ${b.id},
        title: ${JSON.stringify(b.title)},
        caption: ${JSON.stringify(captionFor(b))},
        slides: [
          ${slides},
        ],
      }`;
  });
  return `    const REELS = [\n${items.join(",\n")}\n    ];`;
}

const HTML_HEAD = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <title>Strategic Sloth — Freedom Library carousels</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:ital,wght@0,400;0,700;1,400&family=Inter:ital,opsz,wght@0,14..32,400..900;1,14..32,400..900&display=swap" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <style>
    :root {
      --fl-navy: #1b1b3d;
      --fl-navy-cta: #2c2d5d;
      --fl-yellow: #ffd600;
      --fl-yellow-soft: #fff7e6;
      --fl-cream: #fffdf7;
      --fl-red: #ff4d4d;
      --fl-sky: #e3f2ff;
      --fl-black: #000;
      --fl-stage-w: 1080;
      --fl-stage-h: 1350;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100dvh;
      background: var(--fl-yellow-soft);
      color: var(--fl-navy);
      font-family: Inter, system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 12px 96px;
    }
    h1 {
      font-family: Bangers, cursive;
      font-size: 1.4rem;
      letter-spacing: 0.05em;
      text-align: center;
      margin-bottom: 4px;
    }
    .hint {
      font-family: "Comic Neue", cursive;
      font-weight: 700;
      font-size: 12px;
      text-align: center;
      margin-bottom: 10px;
      max-width: 440px;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-bottom: 10px;
    }
    .controls select, .controls button {
      font-family: Inter, sans-serif;
      font-weight: 800;
      font-size: 11px;
      padding: 8px 12px;
      border: 2px solid var(--fl-black);
      border-radius: 8px;
      background: var(--fl-yellow);
      cursor: pointer;
      box-shadow: 3px 3px 0 var(--fl-black);
    }
    .carousel-wrap {
      width: min(100vw - 24px, (100dvh - 200px) * (4 / 5));
      aspect-ratio: 4 / 5;
      max-height: calc(100dvh - 200px);
      border: 3px solid var(--fl-black);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.15);
    }
    .carousel-viewport { position: relative; width: 100%; height: 100%; overflow: hidden; background: #333; }
    .carousel-track {
      display: flex;
      height: 100%;
      transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .slide { flex: 0 0 100%; height: 100%; position: relative; }

    /* Native 1080×1350 — full frame visible on IG */
    .fl-stage {
      position: absolute;
      inset: 0;
      width: 1080px;
      height: 1350px;
      transform-origin: top left;
      overflow: hidden;
      background: linear-gradient(180deg, #ffe566 0%, var(--fl-yellow) 42%, #ffc400 100%);
      font-family: Inter, system-ui, sans-serif;
      display: flex;
      flex-direction: column;
    }
    .fl-zlayer {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .fl-z {
      position: absolute;
      opacity: 0.32;
    }
    .fl-z path {
      stroke: var(--fl-navy-cta);
      stroke-width: 4;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .fl-z.a { top: 6%; left: 5%; width: 88px; height: 88px; }
    .fl-z.b { top: 10%; right: 4%; width: 100px; height: 100px; }
    .fl-z.c { bottom: 14%; left: 4%; width: 76px; height: 76px; }
    .fl-z.d { bottom: 12%; right: 5%; width: 84px; height: 84px; }

    .fl-head {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 10px 18px 10px 16px;
      border-bottom: 2px solid var(--fl-black);
      background: var(--fl-yellow-soft);
      min-height: 96px;
    }
    .fl-logo-ring {
      flex-shrink: 0;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      border: 3px solid var(--fl-black);
      background: var(--fl-yellow);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 3px 3px 0 var(--fl-black);
    }
    .fl-logo-ring img { width: 58px; height: 58px; object-fit: contain; }
    .fl-brand-line {
      font-weight: 900;
      font-size: 30px;
      letter-spacing: -0.02em;
      color: var(--fl-black);
      line-height: 1.05;
    }
    .fl-brand-sub {
      font-family: "Comic Neue", cursive;
      font-weight: 700;
      font-size: 20px;
      line-height: 1.25;
      color: var(--fl-navy);
      margin-top: 2px;
      max-width: 900px;
    }
    .fl-brand-url {
      display: block;
      font-weight: 800;
      font-size: 22px;
      color: var(--fl-navy-cta);
      margin-top: 2px;
      letter-spacing: 0.01em;
    }

    .fl-main {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: row;
      align-items: stretch;
      gap: 12px;
      padding: 10px 14px 8px;
    }
    .fl-copy {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .fl-card {
      background: var(--fl-cream);
      border: 3px solid var(--fl-black);
      border-radius: 22px;
      box-shadow: 6px 6px 0 var(--fl-black);
      padding: 20px 18px;
      width: 100%;
      max-height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .fl-card-inner { width: 100%; max-height: 100%; overflow: hidden; }

    .fl-sloth {
      flex-shrink: 0;
      width: 400px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 4px;
      pointer-events: none;
    }
    .fl-sloth img {
      max-width: 100%;
      width: auto;
      height: auto;
      max-height: 1020px;
      object-fit: contain;
      object-position: bottom center;
      filter: drop-shadow(4px 8px 0 rgba(0, 0, 0, 0.12));
    }

    .fl-foot {
      flex-shrink: 0;
      height: 84px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 12px;
      border-top: 2px dashed rgba(27, 27, 61, 0.28);
      background: linear-gradient(0deg, rgba(255, 253, 247, 0.96), transparent);
    }
    .fl-foot-emoji { font-size: 36px; line-height: 1; }
    .fl-foot-url {
      font-weight: 900;
      font-size: 26px;
      color: var(--fl-navy-cta);
      letter-spacing: 0.02em;
      text-align: center;
      line-height: 1.15;
      padding: 0 8px;
    }

    .fl-line {
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      line-height: 1.08;
      color: var(--fl-navy);
      font-style: italic;
    }
    .fl-t44 { font-size: 44px; }
    .fl-t40 { font-size: 40px; }
    .fl-t36 { font-size: 34px; }
    .fl-muted { color: rgba(27, 27, 61, 0.55); font-style: italic; }
    .fl-mt6 { margin-top: 6px; }
    .fl-emoji-lead {
      font-size: 52px;
      line-height: 1.1;
      display: block;
      margin-bottom: 8px;
      font-style: normal;
    }
    .fl-emoji-sm { font-size: 40px; margin-bottom: 6px; }

    .fl-step-label {
      display: inline-block;
      font-family: Bangers, cursive;
      font-size: 36px;
      letter-spacing: 0.08em;
      color: var(--fl-navy);
      background: var(--fl-yellow);
      border: 2px solid var(--fl-black);
      border-radius: 10px;
      padding: 4px 14px;
      margin-bottom: 10px;
      box-shadow: 3px 3px 0 var(--fl-black);
    }
    .fl-step-body {
      font-family: "Comic Neue", cursive;
      font-weight: 700;
      font-size: 34px;
      line-height: 1.28;
      color: var(--fl-navy);
    }
    .fl-step-tight { font-size: 30px; line-height: 1.3; }

    .fl-cta-panel {
      background: var(--fl-navy-cta);
      color: #fff;
      border: 3px solid var(--fl-black);
      border-radius: 18px;
      padding: 22px 18px;
      box-shadow: 5px 5px 0 var(--fl-black);
      text-align: center;
    }
    .fl-cta-main {
      font-family: "Comic Neue", cursive;
      font-weight: 700;
      font-size: 36px;
      line-height: 1.2;
    }
    .fl-cta-url {
      margin-top: 14px;
      font-weight: 900;
      font-size: 30px;
      color: var(--fl-yellow);
      letter-spacing: 0.02em;
      word-break: break-word;
    }
    .fl-cta-sub {
      margin-top: 10px;
      font-family: "Comic Neue", cursive;
      font-weight: 700;
      font-size: 24px;
      color: var(--fl-sky);
      letter-spacing: 0.06em;
    }

    .dots { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 10px; max-width: 400px; }
    .dots button {
      width: 9px; height: 9px; border-radius: 50%; border: 2px solid var(--fl-black);
      background: #fff; cursor: pointer; padding: 0;
    }
    .dots button.on { background: var(--fl-red); transform: scale(1.12); }
    .nav-row { display: flex; gap: 8px; margin-top: 8px; }
    .nav-row button {
      padding: 8px 14px; font-weight: 800; border: 2px solid var(--fl-black); border-radius: 8px;
      background: var(--fl-cream); cursor: pointer; box-shadow: 3px 3px 0 var(--fl-black);
    }
    .caption-panel { margin-top: 14px; max-width: 480px; width: 100%; }
    .caption-panel summary { font-family: "Comic Neue", cursive; font-weight: 700; font-size: 12px; cursor: pointer; }
    .caption-panel pre {
      margin-top: 8px; font-size: 10px; line-height: 1.45; white-space: pre-wrap;
      background: #fff; padding: 10px; border: 2px solid var(--fl-black); border-radius: 8px;
    }

    #ig-export-root {
      display: none;
      width: 1080px;
      height: 1350px;
      margin: 0 auto;
      overflow: hidden;
      background: #222;
    }
    body.ss-export-mode { padding: 0; background: #111; }
    body.ss-export-mode > *:not(#ig-export-root) { display: none !important; }
    body.ss-export-mode #ig-export-root { display: block !important; }
    .ig-flat-wrap {
      width: 1080px;
      height: 1350px;
      overflow: hidden;
    }
    .ig-flat-wrap .fl-stage { position: relative; transform: none !important; }
  </style>
</head>
<body>
  <div id="ig-export-root" aria-hidden="true"></div>

  <h1 class="fl-ui">🦥 Freedom Library — carousels (11 books)</h1>
  <p class="hint fl-ui">1080×1350 native · header + URL + big lazy sloth on every slide</p>

  <div class="controls fl-ui">
    <label>
      Book
      <select id="reelSelect" aria-label="Choose book"></select>
    </label>
    <button type="button" id="btnPng">PNG (IG 4:5)</button>
  </div>

  <div class="carousel-wrap fl-ui" id="carouselWrap">
    <div class="carousel-viewport" id="viewport">
      <div class="carousel-track" id="track"></div>
    </div>
  </div>

  <div class="nav-row fl-ui">
    <button type="button" id="btnPrev">←</button>
    <button type="button" id="btnNext">→</button>
  </div>
  <div class="dots fl-ui" id="dots"></div>

  <div class="caption-panel fl-ui">
    <details open>
      <summary>IG caption</summary>
      <pre id="captionBox"></pre>
    </details>
  </div>

  <script>
`;

const HTML_TAIL = `
    const STAGE_W = 1080;
    const STAGE_H = 1350;
    const SLOTH_LOGO =
      location.protocol === "http:" || location.protocol === "https:"
        ? "/images/slothlogo.png"
        : new URL("../public/images/slothlogo.png", location.href).href;
    const SLOTH_HERO =
      location.protocol === "http:" || location.protocol === "https:"
        ? "/images/heroslothhammock.webp"
        : new URL("../public/images/heroslothhammock.webp", location.href).href;

    const zPath = ${JSON.stringify(Z_PATH)};
    function zSvg(cls) {
      return '<svg class="fl-z ' + cls + '" viewBox="0 0 40 40" aria-hidden="true"><path d="' + zPath + '" /></svg>';
    }

    function flStage(innerHtml) {
      return (
        '<div class="fl-stage">' +
        '<div class="fl-zlayer" aria-hidden="true">' +
        zSvg("a") + zSvg("b") + zSvg("c") + zSvg("d") +
        "</div>" +
        '<header class="fl-head">' +
        '<div class="fl-logo-ring"><img src="' +
        SLOTH_LOGO +
        '" width="58" height="58" alt="" decoding="async" /></div>' +
        "<div>" +
        '<p class="fl-brand-line">STRATEGIC SLOTH</p>' +
        '<p class="fl-brand-sub">📖 Freedom Library</p>' +
        '<span class="fl-brand-url">strategicsloth.com/reading-guide</span>' +
        "</div>" +
        "</header>" +
        '<div class="fl-main">' +
        '<div class="fl-copy"><div class="fl-card"><div class="fl-card-inner">' +
        innerHtml +
        "</div></div></div>" +
        '<div class="fl-sloth"><img src="' +
        SLOTH_HERO +
        '" alt="" width="520" height="640" decoding="async" /></div>' +
        "</div>" +
        '<footer class="fl-foot">' +
        '<span class="fl-foot-emoji" aria-hidden="true">🦥</span>' +
        '<span class="fl-foot-url">strategicsloth.com/reading-guide</span>' +
        "</footer>" +
        "</div>"
      );
    }

${buildReelsArrayJs()}

    function runExportMode() {
      const qs = new URLSearchParams(location.search);
      if (qs.get("export") !== "1") return false;
      const reelId = parseInt(qs.get("reelId"), 10);
      const slideIdx = parseInt(qs.get("slideIdx"), 10);
      const reel = REELS.find((r) => r.id === reelId);
      if (!reel || Number.isNaN(slideIdx) || slideIdx < 0 || slideIdx >= reel.slides.length) {
        const root = document.getElementById("ig-export-root");
        root.style.display = "block";
        root.textContent = "Invalid export: reelId 301–311, slideIdx 0–6";
        document.body.classList.add("ss-export-mode");
        return true;
      }
      document.getElementById("ig-export-root").innerHTML =
        '<div class="ig-flat-wrap">' + reel.slides[slideIdx] + "</div>";
      document.body.classList.add("ss-export-mode");
      document.title = "FL export R" + reelId + " S" + (slideIdx + 1);
      return true;
    }

    const isExportShot = runExportMode();

    const track = document.getElementById("track");
    const viewport = document.getElementById("viewport");
    const reelSelect = document.getElementById("reelSelect");
    const dotsEl = document.getElementById("dots");
    const captionBox = document.getElementById("captionBox");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");
    const btnPng = document.getElementById("btnPng");

    let reelIndex = 0;
    let slideIndex = 0;
    let touchStartX = null;

    function scaleStages() {
      const r = viewport.getBoundingClientRect();
      const s = Math.min(r.width / STAGE_W, r.height / STAGE_H);
      track.querySelectorAll(".fl-stage").forEach((el) => {
        el.style.transform = "scale(" + s + ")";
      });
    }

    function buildDots(n) {
      dotsEl.innerHTML = "";
      for (let i = 0; i < n; i++) {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Slide " + (i + 1));
        b.addEventListener("click", () => goToSlide(i));
        dotsEl.appendChild(b);
      }
    }

    function updateDots() {
      [...dotsEl.children].forEach((b, i) => b.classList.toggle("on", i === slideIndex));
    }

    function renderReel() {
      const reel = REELS[reelIndex];
      track.innerHTML = reel.slides.map((html) => '<div class="slide">' + html + "</div>").join("");
      slideIndex = 0;
      buildDots(reel.slides.length);
      captionBox.textContent = reel.caption;
      applyTransform();
      updateDots();
      requestAnimationFrame(() => scaleStages());
    }

    function applyTransform() {
      track.style.transform = "translateX(-" + slideIndex * 100 + "%)";
    }

    function goToSlide(i) {
      const n = REELS[reelIndex].slides.length;
      slideIndex = Math.max(0, Math.min(n - 1, i));
      applyTransform();
      updateDots();
    }

    function next() {
      const n = REELS[reelIndex].slides.length;
      if (slideIndex < n - 1) goToSlide(slideIndex + 1);
    }

    function prev() {
      if (slideIndex > 0) goToSlide(slideIndex - 1);
    }

    REELS.forEach((r) => {
      const o = document.createElement("option");
      o.value = String(r.id);
      o.textContent = r.id + ". " + r.title;
      reelSelect.appendChild(o);
    });

    reelSelect.addEventListener("change", () => {
      reelIndex = REELS.findIndex((x) => String(x.id) === reelSelect.value);
      renderReel();
    });

    btnNext.addEventListener("click", next);
    btnPrev.addEventListener("click", prev);

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });

    document.getElementById("carouselWrap").addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );
    document.getElementById("carouselWrap").addEventListener(
      "touchend",
      (e) => {
        if (touchStartX == null) return;
        const dx = e.changedTouches[0].screenX - touchStartX;
        touchStartX = null;
        if (dx < -48) next();
        if (dx > 48) prev();
      },
      { passive: true }
    );

    function replaceImgsWithSlothEmoji(root) {
      root.querySelectorAll("img").forEach((img) => {
        const w = img.width || img.getAttribute("width") || 72;
        const h = img.height || img.getAttribute("height") || 72;
        const sp = document.createElement("span");
        sp.setAttribute("aria-hidden", "true");
        sp.textContent = "🦥";
        sp.style.cssText =
          "display:inline-flex;align-items:center;justify-content:center;width:" +
          w +
          "px;height:" +
          h +
          "px;font-size:" +
          Math.min(Number(w), Number(h)) * 0.72 +
          "px;line-height:1;";
        img.replaceWith(sp);
      });
    }

    btnPng.addEventListener("click", async () => {
      if (typeof html2canvas !== "function") {
        alert("html2canvas failed to load.");
        return;
      }
      const slides = track.querySelectorAll(".slide .fl-stage");
      const stage = slides[slideIndex];
      if (!stage) return;
      btnPng.disabled = true;
      try {
        const clone = stage.cloneNode(true);
        clone.style.cssText =
          "position:fixed;left:0;top:0;width:1080px;height:1350px;transform:none!important;z-index:2147483646;opacity:0.01;pointer-events:none;";
        replaceImgsWithSlothEmoji(clone);
        document.body.appendChild(clone);
        await document.fonts.ready;
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        let canvas;
        try {
          canvas = await html2canvas(clone, {
            scale: 1,
            width: STAGE_W,
            height: STAGE_H,
            useCORS: false,
            allowTaint: false,
            backgroundColor: "#ffd600",
            logging: false,
            onclone(doc) {
              const root = doc.body.querySelector(".fl-stage") || doc.querySelector(".fl-stage");
              if (root) replaceImgsWithSlothEmoji(root);
            },
          });
        } finally {
          clone.remove();
        }
        await new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("toBlob null"));
                return;
              }
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download =
                "ss-ig-45-fl-r" + REELS[reelIndex].id + "-slide-" + String(slideIndex + 1).padStart(2, "0") + ".png";
              a.click();
              URL.revokeObjectURL(a.href);
              resolve();
            },
            "image/png",
            1
          );
        });
      } catch (err) {
        console.error(err);
        alert("PNG failed. Use npm run export-carousel-freedom-library or open via local HTTP.");
      } finally {
        btnPng.disabled = false;
      }
    });

    if (!isExportShot) {
      new ResizeObserver(() => scaleStages()).observe(viewport);
      reelIndex = 0;
      reelSelect.value = "301";
      renderReel();
    }
  </script>
</body>
</html>
`;

const outPath = path.join(__dirname, "carousels-freedom-library.html");
fs.writeFileSync(outPath, HTML_HEAD + HTML_TAIL.replace(/^\s*\n/, "\n"), "utf8");
console.log("Wrote " + outPath + " (" + BOOKS.length + " books × 7 slides)");
