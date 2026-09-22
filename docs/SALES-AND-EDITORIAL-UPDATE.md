# Sales and editorial update — September 21, 2026

The learning section now gives readers a visible reason to buy: a $5 entry guide, actual sample chapters, specific contents, relevant article-to-book offers, and bundle savings based on the current individual book prices. The original checkout URLs and prices are unchanged. The studio homepage remains focused on tools and games, with Learn as its own section.

## Evidence used for offers

- Don’t Do Anything: original 98-page PDF, chapter five, physical pages 29–34.
- Sell Without an Audience: original 36-page PDF, chapter one, physical pages 5–7.
- `scripts/extract-book-samples.py` reproduces those pages and their text transcripts. Run from the repository root with PyMuPDF installed.
- Preview routes show the source edition and page range. The complete books remain paid products. Source-edition example claims are not represented as measured customer outcomes.
- Existing catalog contents, prices, checkout URLs, bundle bonus, and the 30-day guarantee were retained. Bundle discounts are calculated from included books, not historical comparison-price fields.

## Measuring whether the changes work

This local work does not establish an increase in sales. After publishing, compare equivalent traffic sources, device types, offers, and time periods with the existing site. Record a baseline before changing ads at the same time.

1. Measure visits to `/learn/`, `/start/`, catalog pages, and sample pages.
2. Use `cta_click` and `checkout_click` with product/location context to distinguish entry offers, article offers, and sample-page purchases. Existing UTM propagation remains in place.
3. Compare confirmed orders and net revenue per visitor, not just button clicks. Reconcile against Lemon Squeezy orders/refunds because browser analytics can be blocked or incomplete.
4. Monitor sample-to-checkout progression and mobile versus desktop abandonment. A checkout click is not an order.
5. Existing `Checkout.Success` handling emits purchase events with transaction deduplication. Automated tests stub the provider; no live transaction was performed.

Allow enough relevant traffic before claiming an improvement. Do not invent a target conversion rate, bestseller status, buyer count, testimonial, or revenue result.

## Editorial review scope

Seventeen existing international-planning article routes were revised. Their original publication dates remain, with a separate editorial-update date and links to sources. The updates replace unsupported absolute outcomes with concrete comparison tasks and questions. Original versions remain in Git history.

| Article group | Main corrections |
| --- | --- |
| Estonia, incorporation comparison, LLC/LLP/OÜ comparison | Distributed-profit rate 22/78 from 2025; foreign-owner and cross-border duties; no automatic banking approval |
| UAE freezone setup | Qualifying-income conditions; natural-person business threshold; no blanket freezone exemption |
| Remote-work destinations, tax departure, nomad mistakes, residency, Five Flags | Separate immigration from tax residence; no universal day-count or foreign-client exemption; no automatic benefits from extra entities |
| Ancestry, citizenship costs, Caribbean investment | Italian 2025 changes; Dominica $200,000 single-applicant EDF minimum before fees; Malta investor-scheme judgment; no guaranteed timeline or approval |
| Banking basics, Swiss banking, provider comparison | Actual eligibility and fee quotes; deposit versus custody/safeguarding; no unsupported provider ranking |
| Asset protection, LLC versus trust | No lawsuit-proof claims; legitimate planning and transfer limitations; no unsupported jurisdiction ranking |

Official sources are linked beside their relevant statements in the articles: Estonian Tax and Customs Board, UAE FTA, IRS, GOV.UK, Italian Ministry of Foreign Affairs, Dominica CBIU, EUR-Lex, FINMA, FDIC, US Courts, and the payment providers' own pricing pages.

The paid international books were not available as complete verified source editions in this pass and were not certified current. Their prices, names, and checkout routes remain intact. The two genuine samples come from creator books, not financial books. This editorial pass does not replace jurisdiction-specific professional review.

## Validation

Run `npm run test:all`. It builds 63 pages, verifies all 40 original article routes and 24 checkout URLs, checks local page/asset targets, and runs unit and browser tests. Added browser coverage checks actual bundle-price arithmetic, mobile sample transcripts, related book navigation, and editorial dates/sources. Desktop/mobile visual review includes original sample-page renders.
