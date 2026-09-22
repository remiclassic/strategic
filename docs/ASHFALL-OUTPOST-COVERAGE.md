# Ashfall Outpost coverage

Seventh collection: apocalypse / survival wasteland in a chunky low-poly 3D style. The 24 presentation boards comprise a collection cover, 20 screen studies, and three component references. These are collection concepts; sliced production assets and working engine interfaces are not included yet.

## Requested systems

- Rusted olive steel plates, exposed rivets, duct tape, and hazard markings throughout.
- Grid inventory, weight capacity and overload feedback, item inspection, equipment condition, and durability bars.
- Hunger, thirst, stamina, radiation, and temperature in radial and bar formats.
- Crafting station, recipe progression, build queues, and owned/required material checklists.

## Extended coverage

Main menu; world setup; gameplay HUD; loot transfer; repairs and salvage; base placement; camp utilities and storage; cooking, water and fuel; maps and routes; weather and status effects; journal; barter; death and recovery; pause, saves and accessibility; loading, empty states and confirmations; component states; supplies and status icons; quickbars, radial selectors and input prompts.

## Production handoff

Rebuild text and controls as editable components. Extract and validate transparent sprites, nine-slice boundaries, icon sizes and interaction states. Normalize all illustrative costs, material counts, weights, durability values, gauge fills, queue refunds and warning thresholds against a shared data model. In particular, ensure placement is disabled whenever owned materials fall below requirements, and distinguish body temperature from ambient temperature and radiation exposure from reserve gauges. Validate keyboard, controller and touch mappings, localization, contrast, scaling and target-engine behavior before offering an implementation-ready pack.

The website presents the collection as in planning, includes the SliceForge workflow link, and uses a full-page thumbnail grid without an internal scrollbar.

## Files

- Originals: `../design/ashfall-outpost/`
- Web assets: `../public/images/game-ui/ashfall-outpost/`
- Prompts and original source paths: `ash-mockup-prompts.json`
- Tool mode: built-in imagegen, cover generation followed by cover-referenced screen studies.
