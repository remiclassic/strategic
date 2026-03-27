/**
 * Generates carousels-creator-guides.html from carousels-all.html (same CSS + stage shell).
 * Run: node marketing/splice-creator-guides-carousel.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CG = [
  {
    id: 201,
    slug: "your-first-100-online",
    cat: "make-money",
    title: "Your First $100 Online",
    benefit: "Make your first online income quickly.",
    hooks: ["YOUR FIRST", "$100 ONLINE"],
    bullets: [
      "How to pick an idea people will pay for.",
      "Where to sell it without a website or audience.",
      "The exact steps from zero to first payment.",
      "What to do after your first sale to keep it going.",
    ],
    price: 9,
  },
  {
    id: 202,
    slug: "zero-to-1k-per-month",
    cat: "make-money",
    title: "$0 to $1K Per Month (Simple Plan)",
    benefit: "Clear roadmap from zero to consistent income.",
    hooks: ["$0 TO $1K", "PER MONTH"],
    bullets: [
      "A stage-by-stage plan from zero to repeatable income.",
      "What decisions actually matter at each level.",
      "Common bottlenecks and how to move past them.",
      "How to build momentum without burning out.",
    ],
    price: 19,
  },
  {
    id: 203,
    slug: "pricing-your-digital-products",
    cat: "make-money",
    title: "Pricing Your Digital Products",
    benefit: "Stop guessing your prices.",
    hooks: ["PRICING YOUR", "DIGITAL PRODUCTS"],
    bullets: [
      "Why most creators underprice and how to fix it.",
      "Anchoring and tier strategies that work.",
      "How to present price so it feels fair, not cheap.",
      "Adjusting price over time as you grow.",
    ],
    price: 9,
  },
  {
    id: 204,
    slug: "why-youre-not-making-money-online-yet",
    cat: "make-money",
    title: "Why You're Not Making Money Online (Yet)",
    benefit: "Fix what is actually holding you back.",
    hooks: ["NOT MAKING MONEY", "ONLINE (YET)"],
    bullets: [
      "The most common reasons income stalls.",
      "A simple self-audit to find your specific gap.",
      "Targeted fixes for each type of problem.",
      "How to move forward without starting over.",
    ],
    price: 9,
  },
  {
    id: 205,
    slug: "idea-to-pdf-in-24-hours",
    cat: "build",
    title: "Idea to PDF in 24 Hours",
    benefit: "Turn an idea into a product fast.",
    hooks: ["IDEA TO PDF", "IN 24 HOURS"],
    bullets: [
      "How to go from rough idea to finished PDF in one session.",
      "Format and structure decisions that feel professional.",
      "What to include and what to cut.",
      "Steps to take after you ship so it actually sells.",
    ],
    price: 9,
  },
  {
    id: 206,
    slug: "build-digital-products-without-coding",
    cat: "build",
    title: "Build Digital Products Without Coding",
    benefit: "Create products without tech skills.",
    hooks: ["BUILD PRODUCTS", "WITHOUT CODE"],
    bullets: [
      "Which tools to use for each type of digital product.",
      "Step-by-step setup without touching code.",
      "How to go from idea to live product on your own.",
      "Where to host and deliver your product simply.",
    ],
    price: 19,
  },
  {
    id: 207,
    slug: "simple-landing-pages-that-convert",
    cat: "build",
    title: "Simple Landing Pages That Convert",
    benefit: "Build pages that actually sell.",
    hooks: ["LANDING PAGES", "THAT CONVERT"],
    bullets: [
      "The exact page structure that moves visitors to buyers.",
      "Copy patterns you can adapt for your own product.",
      "The most common mistakes that quietly kill conversions.",
      "How to test and improve without overthinking.",
    ],
    price: 19,
  },
  {
    id: 208,
    slug: "the-offer-that-sells-itself",
    cat: "build",
    title: "The Offer That Sells Itself",
    benefit: "Make your product easy to buy.",
    hooks: ["THE OFFER THAT", "SELLS ITSELF"],
    bullets: [
      "What makes an offer feel like an obvious yes.",
      "How to position your product so it needs less selling.",
      "Framing and context changes that reduce friction.",
      "Simple fixes when traffic shows up but sales don't.",
    ],
    price: 19,
  },
  {
    id: 209,
    slug: "sell-without-an-audience",
    cat: "sell",
    title: "Sell Without an Audience",
    benefit: "Make sales without followers.",
    hooks: ["SELL WITHOUT", "A BIG AUDIENCE"],
    bullets: [
      "Where to find buyers when you have zero following.",
      "Tactics that create early sales momentum.",
      "How to use communities and platforms without spamming.",
      "Building your first small audience alongside your product.",
    ],
    price: 9,
  },
  {
    id: 210,
    slug: "the-one-page-sales-funnel",
    cat: "sell",
    title: "The One-Page Sales Funnel",
    benefit: "Simple system that converts.",
    hooks: ["ONE-PAGE", "SALES FUNNEL"],
    bullets: [
      "A one-page funnel structure you can set up in a day.",
      "What to write at each stage to keep readers moving.",
      "A simple post-purchase sequence that builds trust.",
      "How to avoid over-engineering it into something you never ship.",
    ],
    price: 19,
  },
  {
    id: 211,
    slug: "email-list-for-creators",
    cat: "sell",
    title: "Email List for Creators (Simple Setup)",
    benefit: "Build and use your email list.",
    hooks: ["EMAIL LIST", "FOR CREATORS"],
    bullets: [
      "Which email platform to pick and why.",
      "How to grow your list from the first subscriber.",
      "What to send so people stay subscribed and buy.",
      "A simple email rhythm that sells without feeling pushy.",
    ],
    price: 9,
  },
  {
    id: 212,
    slug: "content-that-actually-converts",
    cat: "sell",
    title: "Content That Actually Converts",
    benefit: "Create content that leads to sales.",
    hooks: ["CONTENT THAT", "ACTUALLY CONVERTS"],
    bullets: [
      "What content formats lead to actual product sales.",
      "How to structure posts and videos that build buying intent.",
      "A posting rhythm you can actually maintain.",
      "Audience-building vs. content that earns.",
    ],
    price: 9,
  },
  {
    id: 213,
    slug: "the-anti-hustle-playbook",
    cat: "mindset",
    title: "The Anti-Hustle Playbook",
    benefit: "Build without burnout.",
    hooks: ["ANTI-HUSTLE", "PLAYBOOK"],
    bullets: [
      "How to design your work so it compounds instead of drains.",
      "Decisions that reduce busywork without hurting growth.",
      "What to say no to and when.",
      "A pace you can keep for years, not just weeks.",
    ],
    price: 9,
  },
  {
    id: 214,
    slug: "stop-overthinking-start-shipping",
    cat: "mindset",
    title: "Stop Overthinking, Start Shipping",
    benefit: "Take action and finish projects.",
    hooks: ["STOP OVERTHINKING", "START SHIPPING"],
    bullets: [
      "Why overthinking happens and what breaks the loop.",
      "A simple decision filter for when you are stuck.",
      "How to ship something imperfect and improve from there.",
      "Practical prompts to get moving today.",
    ],
    price: 9,
  },
  {
    id: 215,
    slug: "focus-like-a-sloth",
    cat: "mindset",
    title: "Focus Like a Sloth",
    benefit: "Stay consistent and focused.",
    hooks: ["FOCUS LIKE", "A SLOTH"],
    bullets: [
      "How to pick one thing and stick with it long enough to see results.",
      "Systems for consistency that do not rely on motivation.",
      "How to protect your focus from distraction and shiny objects.",
      "The compounding effect of slow, steady progress.",
    ],
    price: 9,
  },
];

const CAT_EMOJI = { "make-money": "💰", build: "🧰", sell: "📈", mindset: "🧠" };
const CAT_LABEL = { "make-money": "MAKE MONEY", build: "BUILD", sell: "SELL", mindset: "MINDSET" };

function captionFor(g) {
  const lines = [
    `${g.title} — ${g.benefit}`,
    "",
    "What's inside:",
    ...g.bullets.map((b) => `• ${b}`),
    "",
    `Creator Guide ($${g.price}) → https://www.strategicsloth.com/books`,
    "",
    "https://www.strategicsloth.com",
  ];
  return lines.join("\n");
}

function slideHook(g) {
  const em = CAT_EMOJI[g.cat];
  const lab = CAT_LABEL[g.cat];
  const [h1, h2] = g.hooks;
  return `<span class="emoji-lead" aria-hidden="true">${em}</span><div class="line t40 muted">CREATOR GUIDE · ${lab}</div><div class="line t52 mt8">${h1}</div><div class="line t48 mt8">${h2}</div>`;
}

function slideBenefit(g) {
  return `<span class="emoji-lead" aria-hidden="true">✨</span><div class="step-body">${g.benefit}</div>`;
}

function slideStep(n, text) {
  const label = String(n).padStart(2, "0");
  return `<div class="step-label">${label}</div><div class="step-body">${text}</div>`;
}

function slideCta(g) {
  return `<div class="ss-cta-panel"><div class="cta-main">📚 ${g.title} →</div><div class="cta-url">strategicsloth.com/books</div><div class="cta-sub">$${g.price} · LINK IN BIO</div></div>`;
}

function buildReelObject(g) {
  const slides = [
    slideHook(g),
    slideBenefit(g),
    ...g.bullets.map((b, i) => slideStep(i + 1, b)),
    slideCta(g),
  ].map((html) => `stageShell(${JSON.stringify(html)})`);

  return `      {
        id: ${g.id},
        title: ${JSON.stringify(g.title)},
        caption: ${JSON.stringify(captionFor(g))},
        slides: [
          ${slides.join(",\n          ")},
        ],
      }`;
}

const base = fs.readFileSync(path.join(__dirname, "carousels-all.html"), "utf8");

const out = base
  .replace("<title>Strategic Sloth — Carousels (on-brand)</title>", "<title>Strategic Sloth — Creator Guides carousels</title>")
  .replace(
    '<h1 class="ss-ui">🦥 Strategic Sloth — carousel slides</h1>',
    '<h1 class="ss-ui">🦥 Creator Guides — carousel slides (15)</h1>'
  )
  .replace(
    '<p class="hint ss-ui">Swipe ↔️ · arrow keys · matches strategicsloth.com colors &amp; fonts</p>',
    '<p class="hint ss-ui">Swipe ↔️ · same on-brand style as main carousels · /books</p>'
  )
  .replace("<summary>Caption for this script (copy for IG)</summary>", "<summary>IG caption for this guide</summary>")
  .replace(
    `    <label>
      Script
      <select id="reelSelect" aria-label="Choose script"></select>
    </label>`,
    `    <label>
      Guide
      <select id="reelSelect" aria-label="Choose guide"></select>
    </label>`
  )
  .replace(
    'root.textContent = "Invalid export params: use reelId=1–8 and slideIdx=0…n-1";',
    'root.textContent = "Invalid export params: use reelId=201–215 and slideIdx=0…n-1";'
  )
  .replace("document.title = `SS export R${reelId} S${slideIdx + 1}`;", "document.title = `CG export R${reelId} S${slideIdx + 1}`;")
  .replace('reelSelect.value = "1";', 'reelSelect.value = "201";')
  .replace(
    'a.download = `ss-ig-45-r${REELS[reelIndex].id}-slide-${String(slideIndex + 1).padStart(2, "0")}.png`;',
    'a.download = `ss-ig-45-cg-r${REELS[reelIndex].id}-slide-${String(slideIndex + 1).padStart(2, "0")}.png`;'
  );

const outNl = out.replace(/\r\n/g, "\n");
const startMarker = "    /** @type {{ id: number; title: string; caption: string; slides: string[] }[]} */\n    const REELS = [";
const startIdx = outNl.indexOf(startMarker);
const fnIdx = outNl.indexOf("\n    function runExportMode()", startIdx);
if (startIdx < 0 || fnIdx < 0) {
  console.error("Could not find REELS block in carousels-all.html");
  process.exit(1);
}

const newReelsBlock =
  "    /** @type {{ id: number; title: string; caption: string; slides: string[] }[]} */\n    const REELS = [\n" +
  CG.map(buildReelObject).join(",\n") +
  "\n    ];";

const finalHtml = outNl.slice(0, startIdx) + newReelsBlock + outNl.slice(fnIdx);

fs.writeFileSync(path.join(__dirname, "carousels-creator-guides.html"), finalHtml, "utf8");
console.log("Wrote marketing/carousels-creator-guides.html (" + CG.length + " guides × 7 slides)");
