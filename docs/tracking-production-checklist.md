# Strategic Sloth tracking — production checklist

Use this after deploying to GitHub Pages at [https://strategicsloth.com](https://strategicsloth.com).

## Deployment setup

| Item | Status |
|------|--------|
| Astro `site` | `https://strategicsloth.com` in `astro.config.mjs` |
| Astro `base` | `/` (correct for custom domain root) |
| GitHub Pages source | GitHub Actions → `Deploy to GitHub Pages` workflow |
| Publish artifact | `dist/` only (tests/config are not deployed) |
| Jekyll bypass | `.nojekyll` added in CI before upload |

## What ships in production

- Meta Pixel (`1442389786809344`) — once per page via `MetaPixel.astro`
- GA4 (`G-WWR13DW58L`) — once per page via `GoogleTag.astro`
- Lemon.js — once per page via layout `<head>`
- Tracking bundle — `dist/_assets/tracking.*.js`, imported by layout client script
- No secrets required (pixel/measurement IDs are public by design)

## Automated checks (local / CI)

```bash
npm ci
npm run test:all
```

`test:all` runs:

1. `npm run build`
2. `npm run verify:tracking` — asserts single PageView/config/lemon.js on sample pages
3. `npm test` — Vitest unit tests
4. `npm run test:e2e` — Playwright smoke tests against `astro preview`

CI workflows:

- **CI** (`.github/workflows/ci.yml`) — pull requests
- **Deploy to GitHub Pages** (`.github/workflows/deploy.yml`) — same checks, then deploy

First-time Playwright locally:

```bash
npx playwright install chromium
```

## After deployment — verify live production

Run this **after** GitHub Pages finishes deploying (not wired into deploy CI by default):

```bash
npm run test:prod-tracking
```

This hits [https://strategicsloth.com](https://strategicsloth.com) directly and checks:

- Homepage loads
- Meta Pixel + GA4 + Lemon.js present in HTML (layout Lemon.js once in `<head>`)
- One Meta `PageView` network request per load
- Debug `[tracking]` logs for CTA + checkout clicks (with `strategicSlothTrackingDebug`)
- UTM params appended to Lemon checkout URLs

**Requires the tracking deployment to be live.** If tracking code has not been pushed to `main` yet, debug/UTM assertions will fail until GitHub Pages redeploys.

It does **not** complete purchases or require secrets. Requires network access to the live site.

## Manual checks after deployment

1. Open homepage → Meta Pixel Helper shows **one** `PageView`.
2. GA4 Realtime shows **one** `page_view` per load.
3. Click a checkout button → `InitiateCheckout` (Meta) + `checkout_click` (GA4).
4. Complete a Lemon test purchase → `Purchase` / `purchase` (client-side only).
5. Land with `?utm_source=test` → click checkout → Lemon URL includes stored UTMs.

Optional debug on live site (browser console):

```js
localStorage.setItem('strategicSlothTrackingDebug', 'true');
location.reload();
```

Remove when finished:

```js
localStorage.removeItem('strategicSlothTrackingDebug');
```

## Known limits

- Client-side `Purchase` can be blocked by ad blockers; reliable revenue still needs Lemon webhooks + Meta CAPI if you optimize ads on purchase ROAS.
- `README.md` still mentions `remiclassic.github.io/strategic/` — production canonical domain is `strategicsloth.com` (matches Astro config).

## Rollback

Revert the commit on `main` and re-run **Deploy to GitHub Pages**, or redeploy a previous Actions artifact from GitHub.
