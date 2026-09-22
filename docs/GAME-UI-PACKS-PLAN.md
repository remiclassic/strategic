# Strategic Sloth game UI packs

Planning draft · September 22, 2026. Product names, scope, prices, and timing below are proposals, not released products or commitments.

## Positioning

Original game UI systems by Strategic Sloth: cohesive art, reusable controls, documented interaction states, and practical screen flows. Sell the packs on Strategic Sloth; introduce SliceForge as the tool for creating and adapting interfaces. Treat Synty as a merchandising reference, not a source of artwork to redistribute.

Synty's interface collection separates themed menus, HUDs, and icons. Its displayed regular prices include $79.99 for Sci-Fi Menus, $99.99 for Modern Menus and several HUDs, and $19.99 for icons; promotions vary. Its Modern Menus gallery shows complete screens alongside variants. This supports organizing a catalog into recognizable families and demonstrating actual use, rather than selling an unexplained sprite count.

Sources reviewed: https://syntystore.com/collections/interface and https://syntystore.com/products/interface-modern-menus. Prices observed September 22, 2026; not evidence of sales volume or achievable revenue.

SliceForge currently describes editable screens, component states, Play previews, and asset/layout JSON export. Its public site says free editing and file exports are available, with paid AI generation and expanded storage. Engine integration remains the customer's work. Source: https://www.sliceforge.io/.

## First product: Modern Essentials

Begin with one polished, reusable menu system. Validate usability and packaging before producing many art styles. Proposed first-release scope:

- Six layouts: title, main menu, pause, settings, save/load, confirmation dialog.
- Approximately 20 core components: buttons, tabs, toggles, sliders, dropdowns, scroll rows, panels, tooltips, dialogs, and related controls. Final counts come from a release inventory.
- Default, hover, keyboard/controller focus, pressed, selected, and disabled states wherever appropriate; error and empty states for relevant controls.
- Type, color, spacing, and sizing rules; light/dark or alternate palette only if both can be thoroughly checked.
- Editable source, transparent image exports, documented scalable borders / 9-slice values, font sourcing, and an organized file manifest.
- UX notes: focus order, initial focus, back/cancel behavior, restoring focus when a dialog closes, and save/load errors. Demonstrate long text, small displays, and wide layouts.
- One short walkthrough, quick-start documentation, version history, and a clear distinction between supplied visual assets and implemented game behavior.

Package raw assets first. Select the first engine integration after feedback from likely buyers; Unreal is a plausible starting point given Focusrail, but it is not yet a commitment. Only advertise Unity, Unreal, Godot, or SliceForge project compatibility after testing the exact delivered package in that environment. Verify a fresh-account SliceForge import/edit/export round trip before promising editable native projects or an “Open in SliceForge” button.

## Proposed product ladder (USD)

| Offer | Proposed price | Purpose |
| --- | --- | --- |
| Modern sample | Free | One menu, a few controls and states, quick start; demonstrate actual quality |
| Modern Essentials asset pack | $29 introductory / $39 standard | Complete initial menu collection and editable source |
| Matching HUD or inventory expansion | $19–29 | Add a specific screen family after buyer feedback |
| Tested engine edition | $59–79 | Add implemented widgets and demo navigation only after development and QA |
| Theme bundle | $69–99 | Combine released complementary packs with transparent savings |

These are hypotheses to validate with buyers and support costs. Do not publish invented crossed-out prices, review counts, scarcity, or sales numbers. Avoid lifetime-access promises while the maintenance burden is unknown. Paid SliceForge plans should remain an optional separate purchase; do not imply that buying a pack requires a subscription.

## Build a catalog through depth, then breadth

1. Modern Essentials plus a free sample.
2. Matching HUD / inventory extension, based on the strongest requests.
3. Fantasy Adventurer: adapt proven components and UX flows into an original fantasy art direction.
4. Orbital Command: sci-fi missions, ship panels, and alerts.
5. Cozy collection or specialized strategy/mobile packs only after evidence of demand.

Reuse the internal component specification, file conventions, export pipeline, and QA checklist across themes. A palette swap alone should not be presented as a substantial new product. Expand into icon sets and themed bundles once the underlying family is useful on its own.

## Storefront

Prepared locally: a homepage section at `/#game-ui-packs`, after the tool catalog, with three original CSS direction studies, planned-content disclosures, a contact link, and a SliceForge referral link. No purchasable pack exists yet.

At first release, add `/game-ui/` as the collection and `/game-ui/modern-essentials/` as the product page. Add filters only when the catalog warrants them. Each product page needs:

- Real screenshots of delivered screens and a component/state sheet; short interaction video or usable demo.
- Exact contents, file types, engine/version support, dependencies, accessibility considerations, and limitations.
- Working sample download, price, license summary, support contact, version history, and download/update policy.
- Primary “Buy pack” action and secondary “Explore SliceForge” action. Before release, use “View planned contents” and genuine feedback collection instead.
- Actual digital checkout and reliable delivery configured through the existing commerce provider; verify purchase, receipt, download access, and update delivery before launch.

Define licensing and included rights before sale, including commercial game use, team scope, redistribution restrictions, third-party fonts, and source ownership. Obtain appropriate review of final terms rather than copying a competitor's license. Complete original artwork and asset provenance checks for each release.

## How packs lead to SliceForge

Journey: useful free sample → paid pack → customization walkthrough → SliceForge activation → optional paid features when needed.

Place a contextual SliceForge link on collection/product pages, in the downloaded README, and in a tutorial showing how an actual pack can be adapted. Use a referral such as `utm_source=strategicsloth&utm_medium=referral&utm_campaign=game_ui_packs`, with a distinct content tag per placement once analytics are implemented. After native project compatibility is confirmed, consider “Customize this pack in SliceForge.” Until then, link to the tool and describe its verified workflow without promising automatic loading.

Measure collection visits, sample downloads, product views, purchases, refunds/support volume, and outbound SliceForge clicks. Measure subsequent account activation and paid conversion on SliceForge only once consent-aware attribution is configured there; UTM links alone do not establish cross-site conversion tracking. Track pack revenue and tool conversions separately. Favor sample-to-purchase and activated users over raw traffic. Set success thresholds after an initial baseline rather than inventing demand forecasts.

## Suggested six-week sequence

Timing assumes focused production capacity and should be revised after the first component set.

| Stage | Work | Exit condition |
| --- | --- | --- |
| Week 1 | Talk to 5–10 game developers; test Modern direction and price expectations; choose initial engine priority | Written scope and concrete evidence of the main workflow problem |
| Weeks 2–3 | Produce source components, six layouts, state variants, and navigation documentation | Complete inventory and consistent export set |
| Week 4 | Package sample and paid files; test with 3–5 developers unfamiliar with the pack | Users can import and adapt the sample; major issues resolved |
| Week 5 | Create actual product screenshots/tutorial; verify commerce and delivery; finalize terms and support | Complete product page and verified delivered files |
| Week 6 | Release one pack and sample; publish walkthroughs; gather feedback | Usable release, measured funnel, prioritized fixes |

Start engine editions and extra themes after the first release stabilizes. The site section is preparation; the sellable packs, checkout products, editable project integration, and cross-site conversion tracking remain to be built.
