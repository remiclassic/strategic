/**
 * Scans marketing/output for carousel slide-01.png covers + reel videos,
 * writes marketing-assets-grid.html for local Instagram-style planning.
 * Run: node marketing/generate-marketing-assets-grid.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const marketingDir = __dirname;
const outRoot = path.join(marketingDir, "output");

const SECTION_META = {
  "carousel-instagram": { id: "launch", label: "Launch kit carousels (r01–r08)" },
  "carousel-instagram-batch2": { id: "batch2", label: "Batch 2 (r101–r110)" },
  "carousel-instagram-guides": { id: "guides", label: "Creator guides (r201–r215)" },
  "carousel-instagram-freedom": { id: "freedom", label: "Freedom Library (r301–r311)" },
};

function formatCarouselLabel(folderName) {
  const m = folderName.match(/^(r\d+)-(.+)$/i);
  if (!m) return folderName.replace(/-/g, " ");
  const rest = m[2].replace(/-/g, " ");
  return `${m[1]} · ${rest}`;
}

function listCarouselCovers() {
  const items = [];
  if (!fs.existsSync(outRoot)) return items;

  for (const name of fs.readdirSync(outRoot)) {
    const meta = SECTION_META[name];
    if (!meta) continue;
    const sectionPath = path.join(outRoot, name);
    if (!fs.statSync(sectionPath).isDirectory()) continue;

    const folders = fs
      .readdirSync(sectionPath)
      .filter((f) => fs.statSync(path.join(sectionPath, f)).isDirectory())
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    for (const folder of folders) {
      const slide = path.join(sectionPath, folder, "slide-01.png");
      if (!fs.existsSync(slide)) continue;
      const rel = path.join("output", name, folder, "slide-01.png").replace(/\\/g, "/");
      items.push({
        sectionId: meta.id,
        sectionLabel: meta.label,
        folder,
        label: formatCarouselLabel(folder),
        rel,
      });
    }
  }
  return items;
}

function listVideos() {
  const dir = outRoot;
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(webm|mp4)$/i.test(f))
    .sort()
    .map((f) => ({
      name: f,
      rel: path.join("output", f).replace(/\\/g, "/"),
    }));
}

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const carousels = listCarouselCovers();
const videos = listVideos();

const cardsHtml = carousels
  .map(
    (c) => `
      <article class="card" data-section="${esc(c.sectionId)}">
        <a class="thumb" href="${esc(c.rel)}" target="_blank" rel="noopener" title="Open cover PNG">
          <img src="${esc(c.rel)}" alt="" width="1080" height="1350" loading="lazy" />
        </a>
        <div class="card-meta">
          <span class="badge">${esc(c.sectionId)}</span>
          <p class="label">${esc(c.label)}</p>
          <p class="path"><code>${esc(c.rel)}</code></p>
        </div>
      </article>`
  )
  .join("");

const videosHtml =
  videos.length === 0
    ? "<p class=\"empty\">No .webm / .mp4 files in <code>marketing/output/</code> yet.</p>"
    : `<div class="video-strip">
        ${videos
          .map(
            (v) => `
          <figure class="video-card" data-section="video">
            <video controls muted playsinline preload="metadata" title="${esc(v.name)}">
              <source src="${esc(v.rel)}" />
            </video>
            <figcaption><code>${esc(v.name)}</code></figcaption>
          </figure>`
          )
          .join("")}
      </div>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Strategic Sloth — marketing assets (IG planner)</title>
  <style>
    :root {
      --bg: #0f0f10;
      --card: #18181b;
      --border: #2a2a2e;
      --text: #ececec;
      --muted: #8b8b90;
      --accent: #c9b458;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.45;
      font-size: 14px;
    }
    .wrap { max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
    h1 {
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0 0 0.35rem;
    }
    .sub {
      color: var(--muted);
      font-size: 0.9rem;
      max-width: 40rem;
      margin: 0 0 1rem;
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .toolbar button {
      background: var(--card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
    }
    .toolbar button:hover { border-color: var(--muted); }
    .toolbar button.on {
      border-color: var(--accent);
      color: var(--accent);
    }
    .hint {
      font-size: 0.75rem;
      color: var(--muted);
      width: 100%;
    }
    h2 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      margin: 2rem 0 0.75rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.35rem;
    }
    /* Instagram profile grid: 3 columns, square cells (4∶5 PNG cropped like feed) */
    #gridHost .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 3px;
      background: #000;
      border: 3px solid #000;
      border-radius: 4px;
      overflow: hidden;
      max-width: min(100%, 900px);
      margin: 0 auto;
    }
    @media (min-width: 640px) {
      #gridHost .grid { grid-template-columns: repeat(3, minmax(0, 280px)); justify-content: center; }
    }
    .card {
      display: flex;
      flex-direction: column;
      background: #111;
    }
    .card.hidden { display: none; }
    .thumb {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
      background: #111;
      display: block;
    }
    .card-meta {
      display: none;
    }
    /* Planner: full 4∶5 + labels under each tile */
    #gridHost.planner .grid {
      grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
      gap: 12px;
      background: transparent;
      border: none;
      border-radius: 0;
      max-width: none;
    }
    #gridHost.planner .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    #gridHost.planner .thumb {
      aspect-ratio: 4 / 5;
    }
    #gridHost.planner .card-meta {
      display: block;
      padding: 0.5rem 0.65rem 0.65rem;
    }
    #gridHost.planner .badge {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent);
    }
    #gridHost.planner .label {
      margin: 0.2rem 0 0;
      font-size: 0.78rem;
      font-weight: 600;
      line-height: 1.25;
    }
    #gridHost.planner .path {
      margin: 0.35rem 0 0;
      font-size: 0.65rem;
      color: var(--muted);
      word-break: break-all;
    }
    #gridHost.planner .path code { font-size: 0.62rem; }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
    }
    .video-strip {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    .video-card {
      margin: 0;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .video-card video {
      width: 100%;
      aspect-ratio: 9 / 16;
      background: #000;
      display: block;
    }
    .video-card figcaption {
      padding: 0.5rem;
      font-size: 0.68rem;
      color: var(--muted);
      word-break: break-all;
    }
    .empty { color: var(--muted); font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Marketing assets — Instagram planner</h1>
    <p class="sub">Each tile is <strong>slide-01.png</strong> (carousel cover) from <code>marketing/output/</code>. Toggle filters to plan feed order. Regenerate this page after new exports: <code>npm run marketing-assets-grid</code></p>
    <div class="toolbar">
      <button type="button" class="on" data-filter="all">All (${carousels.length})</button>
      <button type="button" data-filter="launch">Launch</button>
      <button type="button" data-filter="batch2">Batch 2</button>
      <button type="button" data-filter="guides">Guides</button>
      <button type="button" data-filter="freedom">Freedom</button>
      <span class="hint">Square 3-column grid = profile feed crop. Check <strong>Show titles &amp; paths</strong> for full 4∶5 covers + filenames.</span>
    </div>
    <label style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;font-size:0.85rem;color:var(--muted);">
      <input type="checkbox" id="plannerMode" /> Show titles &amp; paths (4∶5 preview)
    </label>

    <h2>Carousel covers (${carousels.length})</h2>
    <div id="gridHost">
      <div class="grid" id="assetGrid">
        ${cardsHtml}
      </div>
    </div>

    <h2>Exported video (${videos.length})</h2>
    ${videosHtml}
  </div>
  <script>
    (function () {
      var cards = [].slice.call(document.querySelectorAll(".card"));
      var buttons = [].slice.call(document.querySelectorAll(".toolbar button"));
      var host = document.getElementById("gridHost");
      var plannerToggle = document.getElementById("plannerMode");

      function setFilter(id) {
        buttons.forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-filter") === id); });
        cards.forEach(function (card) {
          var sec = card.getAttribute("data-section");
          var show = id === "all" || sec === id;
          card.classList.toggle("hidden", !show);
        });
      }

      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          setFilter(btn.getAttribute("data-filter"));
        });
      });

      plannerToggle.addEventListener("change", function () {
        host.classList.toggle("planner", plannerToggle.checked);
      });

      setFilter("all");
    })();
  </script>
</body>
</html>
`;

const outFile = path.join(marketingDir, "marketing-assets-grid.html");
fs.writeFileSync(outFile, html, "utf8");
console.log(`Wrote ${outFile} (${carousels.length} carousel covers, ${videos.length} videos)`);
