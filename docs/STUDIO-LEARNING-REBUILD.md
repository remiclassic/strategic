# Studio and learning library rebuild

The repository was cloned from https://github.com/remiclassic/strategic. This rebuild is local, on `codex/studio-learning-rebuild`; it does not deploy or change the live site.

## Design decision

Strategic Sloth's front door now presents the independent tools and game studio. Learn is a clearly named educational section, with its own secondary navigation, free reading, creator tools, and two paid book catalogs. The studio retains the sloth identity, founder portrait, product demonstrations, restrained motion, and accurate release labels from the local design prototype.

The old homepage mixed book sales, income claims, lifestyle imagery, repeated testimonials, sales notifications, and recurring countdowns. Those components are no longer rendered. Existing source history and original assets remain recoverable in Git; the underlying store products are not changed.

## Preserved routes and commerce

| Address | Purpose after rebuild |
| --- | --- |
| `/` | Tools and game studio |
| `/learn/` | Learning hub and reading paths |
| `/books/` | Original 15 Creator Guides and three bundles |
| `/reading-guide/` | Original 11-book Freedom Library and three packages |
| `/start/` | Free beginner exercises and original $5 guide |
| `/tools/` | Existing interactive creator tools |
| `/blog/` and all article slugs | Searchable library and readable article pages |
| `/scale-to-freedom/` | Existing campaign package and its distinct checkout |
| `/promo/`, `/upsell/`, `/buy-buttons/` | Helpful catalog/access pages replacing demo or placeholder offers |
| `/free-tools/` | 16 external SliceForge game development utilities |

All 24 real checkout destinations remain in rendered pages. The original catalog data, starter pricing, bundle contents, book titles, checkout IDs. Article routes are retained; 17 international-planning articles received the subsequent editorial update described below. Article offers with different checkout IDs retain their original destinations. There was no test purchase or change inside Lemon Squeezy.

Old homepage fragments for book offers, pricing, getting started, and FAQs forward visitors into Learn, preserving query parameters. Existing `/reading-guide/` tier anchors are retained. Demo/campaign utility pages remain available but are excluded from the sitemap and marked noindex.

## Editorial boundaries

The new landing pages describe subjects and deliverables without promising income or presenting fabricated demand. Free resources and paid books are distinguished. The September 21 follow-up reviewed 17 international-planning articles against official sources. It replaced outdated prices, unsupported rankings, blanket tax claims, and promises of untouchable assets with focused comparisons and practical worksheets. Original publication dates and URLs remain; revised pages display a separate editorial-update date. This is a focused editorial review, not professional certification or an audit of the paid books.

Two genuine sample chapters now come from the original PDFs: Don’t Do Anything (physical pages 29–34 of 98) and Sell Without an Audience (pages 5–7 of 36). The sample pages include text transcripts and the matching real checkout. Full PDFs are not published free. These are the two source editions located for this pass; no samples or update claims were invented for the other books.

## Local development and verification

Run `npm ci`, then `npm run dev -- --host 127.0.0.1 --port 4321` from this directory. If Astro's telemetry startup delays the command, set `ASTRO_TELEMETRY_DISABLED=1` for that process.

Run `npm run build`, `npm test`, `npm run verify:tracking`, `npm run verify:migration`, and `npm run test:e2e`.

Migration checks verify the original article routes and checkout URL inventory, local links/assets, page landmarks, and removal of placeholder store links. Tracking tests cover checkout context, CTA events, UTM propagation, and one explicit application PageView. The browser smoke test stubs the vendor pixel and Lemon checkout; it does not purchase a product or validate provider-side automatic analytics behavior.

Manual review covers desktop/mobile layouts, menu operation, book filters, article search, the original idea generator, and the separation between the studio and Learn. The site generates 63 pages.
