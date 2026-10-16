// One source for the studio site: service lines, priced packages and case studies.
// Prices are in USD and were approved by Remi on 2026-10-16. Change them here and every page follows.

const pf = '/media/services/portfolio/';
const st = '/media/studio/';

export const DAY_RATE = { price: '$850', unit: 'per day', label: 'Senior day rate', note: 'For work outside a package: Remi or a senior specialist, billed by the day.' };
export const RESPONSE_TIME = 'within one business day';

export type Package = {
  id: string; name: string; price: string; unit?: string; from?: boolean; time: string; lines: string[];
  summary: string; includes: string[]; bestFor: string; engagement: string; featured?: boolean;
};

export const packages: Package[] = [
  { id: 'review', name: 'Screen review', price: '$490', time: '48 hours', lines: ['game-ui', 'apps', 'web-training'], engagement: 'review',
    summary: 'One screen or one flow, reviewed by a senior designer on video.',
    includes: ['15–20 minute recorded walkthrough', 'Annotated frames for every issue', 'Top five fixes, ranked'],
    bestFor: 'A quick, low-risk second opinion before you commit to more.' },
  { id: 'audit', name: 'UI & UX audit', price: '$2,900', time: 'About 1 week', lines: ['game-ui', 'apps', 'web-training'], engagement: 'review', featured: true,
    summary: 'A hands-on review of your build or designs: hierarchy, navigation, feedback, readability, input and accessibility.',
    includes: ['Annotated screens and recordings', 'Fix list ranked by impact and cost', '60-minute findings call', 'A recommended next scope'],
    bestFor: 'Teams with a live build or a redesign who need to know what to fix first.' },
  { id: 'slice', name: 'Game UI vertical slice', price: '$9,800', from: true, time: '2–4 weeks', lines: ['game-ui'], engagement: 'prototype', featured: true,
    summary: 'One journey designed, animated and running in your engine, so the team can judge the real thing.',
    includes: ['Final-quality screens for one flow', 'Motion, controller and keyboard input', 'Implemented in Unreal, Unity, Godot or web', 'Component foundations and handover'],
    bestFor: 'Pre-production, a pitch build, or proving a new UI direction.' },
  { id: 'system', name: 'Game UI system', price: '$24,000', from: true, time: '6–10 weeks', lines: ['game-ui'], engagement: 'partner',
    summary: 'The whole visual language: style frames, a component library with every state, and the key screens.',
    includes: ['Look development on real screens', 'Component library with all states', 'Front end, HUD, store and settings', 'Specs, assets and implementation support'],
    bestFor: 'A new game, or a redesign that has to hold up at screen two hundred.' },
  { id: 'partner', name: 'Embedded UI partner', price: '$6,500', unit: '/ month', time: 'Monthly', lines: ['game-ui', 'apps', 'games'], engagement: 'partner',
    summary: 'A senior UI lead in your team: design, motion and implementation, in your tools and your sprints. Half-time $6,500 / month, full-time $12,500 / month.',
    includes: ['Half-time $6,500 or full-time $12,500 per month', 'Works in your repository and sprints', 'Weekly demos', 'Source, docs and handover included'],
    bestFor: 'Production teams without a dedicated UI designer or UI engineer.' },
  { id: 'website', name: 'Website', price: '$7,500', from: true, time: '3–4 weeks', lines: ['web-training'], engagement: 'website',
    summary: 'A marketing or product site, designed and built as components, with performance and accessibility checked.',
    includes: ['Design and build', 'Responsive on every screen size', 'Performance and accessibility pass', 'Launch support'],
    bestFor: 'Studios, products and games that need a site that shows the work properly.' },
  { id: 'app-mvp', name: 'App MVP', price: '$24,000', from: true, time: '6–10 weeks', lines: ['apps'], engagement: 'app',
    summary: 'A first release of your web or mobile app: product design, front end and back end, from one team.',
    includes: ['Product design and prototype', 'Front end and back end', 'One platform: web or mobile', 'Weekly demos, source code and handover'],
    bestFor: 'Founders and teams turning a validated idea into working software.' },
  { id: 'game-proto', name: 'Mobile game prototype', price: '$15,000', from: true, time: '4–6 weeks', lines: ['games'], engagement: 'game',
    summary: 'Your core loop, playable on a phone, with the UI and game feel that make it worth testing.',
    includes: ['Playable core loop on device', 'Game UI and feedback', 'Playtest build', 'A plan for the next stage'],
    bestFor: 'Testing a game idea with real players before committing to production.' },
  { id: 'game-launch', name: 'Game: prototype to store launch', price: '$45,000', from: true, time: 'Scoped per game', lines: ['games'], engagement: 'game',
    summary: 'A complete mobile game designed, built and released, the way we shipped Tropic Tumble.',
    includes: ['Game design, UI, art direction and build', 'Ads and in-app purchases', 'Store listing, screenshots and trailer', 'Release on Google Play or the App Store'],
    bestFor: 'Publishers and founders who want a finished game, not just a prototype.' },
  { id: 'training', name: 'Training & simulation pilot', price: '$8,000', from: true, time: 'Scoped per pilot', lines: ['web-training'], engagement: 'training',
    summary: 'One learning journey where the interaction does the teaching: practice, feedback and a debrief.',
    includes: ['One learning journey, designed and built', 'Interaction and feedback design', 'Progress, results and debrief screens', 'Pilot build for your learners'],
    bestFor: 'Training teams whose courses get started but not finished.' },
];

export const pkg = (id: string) => packages.find(p => p.id === id)!;

export type Line = {
  id: string; slug: string; name: string; short: string; tagline: string; summary: string; accent: string;
  deliverables: [string, string][]; packages: string[]; work: string[]; media: { video?: string; poster: string };
};

export const lines: Line[] = [
  { id: 'game-ui', slug: '/services/game-ui/', name: 'Game UI & UX', short: 'Game UI & UX', accent: '#6b4fd8',
    tagline: 'Menus, HUDs and systems UI, designed and built in your engine.',
    summary: 'Twenty years of game interfaces: MechWarrior 5, Dauntless, nine studios as UX Director at AppLovin. We design the flow, the look and the motion, then implement it in Unreal, Unity, Godot or the web.',
    deliverables: [['UX flows & wireframes', 'Every path, including the way back'], ['UI art & design systems', 'Style frames, components, every state'], ['Motion & feedback', 'Timing and easing the build can match'], ['Engine implementation', 'UMG, CommonUI, Unity UI, web'], ['Controller navigation', 'Focus that works on a gamepad'], ['UX audits', 'What to fix first in a live build']],
    packages: ['audit', 'slice', 'system', 'partner'], work: ['mechwarrior-5', 'dauntless', 'valorant', 'focusrail'],
    media: { video: '/media/disciplines/ui-trailer.mp4', poster: '/media/disciplines/ui-trailer-poster.jpg' } },
  { id: 'apps', slug: '/services/apps/', name: 'App development', short: 'Apps', accent: '#1f6f8b',
    tagline: 'Web, desktop and mobile apps with dense, task-heavy interfaces.',
    summary: 'Editors, dashboards, writing tools and 3D product apps, designed and built by the same team. We ship our own software, so we know what it takes to go from a prototype to something people use every day.',
    deliverables: [['Product design', 'Flows, prototypes and the interface'], ['Front end', 'React and TypeScript'], ['Back end', 'APIs, data and accounts'], ['3D and canvas', 'Three.js and editor surfaces'], ['Desktop apps', 'Tools that live on the desktop'], ['Handover', 'Source, docs and a walkthrough']],
    packages: ['app-mvp', 'audit', 'partner'], work: ['sliceforge', 'narriaflow', 'real-estate', 'world-editor'],
    media: { video: '/media/services/editor/sf-edit-preview-export.mp4', poster: '/studio-images/sf-compose.webp' } },
  { id: 'games', slug: '/services/games/', name: 'Game development', short: 'Games', accent: '#c2413a',
    tagline: 'Mobile games and prototypes, from first playable to store launch.',
    summary: 'We design, build and publish our own games: Tropic Tumble is live on Google Play, Runefjord is in testing and Norman Ascension is in development for Steam. We bring the same practice to yours.',
    deliverables: [['Game design', 'Core loop, economy and progression'], ['Prototypes', 'Playable on device in weeks'], ['Full production', 'UI, art direction and code'], ['Monetisation', 'Ads, in-app purchases, season pass'], ['Reskins', 'A new world on a proven game'], ['Store launch', 'Listing, screenshots and trailer']],
    packages: ['game-proto', 'game-launch', 'partner'], work: ['tropic-tumble', 'runefjord', 'sloth-jam', 'norman-ascension'],
    media: { video: st + 'tropic-tumble.mp4', poster: st + 'tropic-tumble.jpg' } },
  { id: 'web-training', slug: '/services/websites-training/', name: 'Websites & training', short: 'Web & training', accent: '#4f7a3a',
    tagline: 'Studio and product websites, and training people actually finish.',
    summary: 'Marketing sites built as components, and learning products where the interaction does the teaching: training games, simulations and guided practice with a debrief.',
    deliverables: [['Websites', 'Studio, product and game sites'], ['Landing pages', 'One offer, one clear action'], ['Training games', 'Short, replayable practice'], ['Simulations', 'Mission hubs, consoles, debriefs'], ['Learning UX', 'Onboarding to first activity'], ['Accessibility', 'Contrast, input, text size']],
    packages: ['website', 'training', 'review'], work: ['mission-control', 'cyber-training'],
    media: { video: '/training/video/training-film-60s.mp4', poster: '/training/mission-control/mission-control.jpg' } },
];

export const line = (id: string) => lines.find(l => l.id === id)!;

export type Case = {
  slug: string; title: string; client: string; kind: 'Client work' | 'Our product' | 'Our game' | 'Concept'; line: string; years: string; role: string;
  summary: string; challenge: string; approach: string; result: string; tags: string[];
  video?: string; poster: string; portrait?: boolean; gallery: [string, string][]; links?: [string, string][];
};

// `kind` is honest provenance: client work is from Remi's career before or alongside the studio, not a claim that
// these companies hired Strategic Sloth.
export const cases: Case[] = [
  { slug: 'mechwarrior-5', title: 'MechWarrior 5: Mercenaries', client: 'Piranha Games', kind: 'Client work', line: 'game-ui', years: '2016–2018', role: 'UX / UI design · Unreal Engine',
    summary: 'A connected set of interfaces for choosing a destination, evaluating a contract and preparing a mech for the next mission.',
    challenge: 'A deep mercenary sim has a lot to say: star systems, factions, contracts, salvage and a hangar full of mechs. Players need to make one decision at a time without losing the bigger picture.',
    approach: 'One console frame and one visual language across the star map, mission briefing and mech bay, with a strict information hierarchy so the next action is always the clearest thing on screen.',
    result: 'Shipped with MechWarrior 5: Mercenaries on PC. The screens below are from the work.',
    tags: ['Unreal Engine', 'Systems UI', 'Information hierarchy'], poster: st + 'mw5-mechbay.webp',
    gallery: [[st + 'mw5-starmap.webp', 'Star map with planets, travel routes and news'], [st + 'mw5-mission.webp', 'Mission briefing with terrain, objectives and contract terms'], [st + 'mw5-mechbay.webp', 'Mech bay with loadout slots and repair status'], [pf + 'mw5-contracts.webp', 'Planet view with contract list'], [pf + 'mw5-modes.webp', 'Front end with mode cards'], [pf + 'mw5-salvage.webp', 'Salvage and market list'], [st + 'mw5-pause.webp', 'Pause menu'], [pf + 'mw5-states.webp', 'Button state sheet']] },
  { slug: 'dauntless', title: 'Dauntless', client: 'Phoenix Labs', kind: 'Client work', line: 'game-ui', years: '2018', role: 'UX / UI design · Unreal Engine',
    summary: 'Crafting, hunt matchmaking, the season journal and item comparison for a co-op action RPG.',
    challenge: 'Crafting and gear comparison sit at the centre of the loop, and they had to work with a controller as well as a mouse.',
    approach: 'Controller-first layouts with comparison kept in view at the armoursmith, plus the quest system UX and the workflow around it.',
    result: 'A teammate wrote that the UX workflow and pipeline Remi created were still in use at the studio years later.',
    tags: ['Crafting UX', 'HUD & menus', 'Controller-first'], poster: pf + 'hunt-crafting.webp',
    gallery: [[pf + 'hunt-crafting.webp', 'Crafting at the armoursmith'], [pf + 'hunt-armour.webp', 'Armour comparison'], [pf + 'hunt-journal.webp', 'Hunt journal'], [pf + 'hunt-season.webp', 'Season journey'], [pf + 'hunt-found.webp', 'Hunt matchmaking'], [pf + 'hunt-found-2.webp', 'Hunt found']] },
  { slug: 'valorant', title: 'Valorant front-end exploration', client: 'UX Magicians', kind: 'Client work', line: 'game-ui', years: '2020–2021', role: 'Senior UX product designer',
    summary: 'A front end that follows the PC flow, from grey-box wireframes to a coloured pass.',
    challenge: 'Agent select, party lobby, queue, mode choice and match found all compete for attention before a match.',
    approach: 'Wireframe the whole flow first, then bring colour, art and motion to the screens that carry it.',
    result: 'A complete front-end exploration in two passes, wireframe and colour, covering agent select through collection.',
    tags: ['Agent select', 'Lobby & matchmaking', 'Wireframe to colour'], poster: st + 'valorant-party-lobby.webp',
    gallery: [[st + 'valorant-party-lobby.webp', 'Party lobby'], [st + 'valorant-character-selection.webp', 'Agent select'], [st + 'valorant-mode-selection.webp', 'Mode selection'], [st + 'valorant-match-found.webp', 'Match found'], [st + 'valorant-ability-detail.webp', 'Ability detail'], [pf + 'tac-wire-lobby.webp', 'Lobby wireframe'], [pf + 'tac-wire-agent.webp', 'Agent select wireframe'], [pf + 'tac-wire-shop.webp', 'Store wireframe']] },
  { slug: 'nba-verizon', title: 'NBA × Verizon 5G', client: 'UX Magicians', kind: 'Client work', line: 'apps', years: '2020–2021', role: 'Senior UX product designer',
    summary: 'Second-screen basketball: a live court overlay, schedule and news, and a collectible player-card concept.',
    challenge: 'Fans watching a live game need information at a glance, without the app competing with the court.',
    approach: 'A court overlay with player ratings, and a card collection with the wallet always in view so fans spend deliberately.',
    result: 'Court overlay, schedule, sign-in and collectible card designs for the Phoenix Suns and Verizon 5G project.',
    tags: ['Second screen', 'Sports', 'Collectibles'], poster: pf + 'sports-court.webp',
    gallery: [[pf + 'sports-court.webp', 'Live court overlay'], [pf + 'sports-schedule.webp', 'Schedule and news'], [st + 'nba-lakers-card.webp', 'Collectible player card'], [pf + 'sports-card-detail.webp', 'Card detail']] },
  { slug: 'sliceforge', title: 'SliceForge', client: 'Strategic Sloth', kind: 'Our product', line: 'apps', years: '2025–2026', role: 'Product design and development',
    summary: 'Game interfaces you can actually build: from a visual reference to editable screens, reusable components and exportable UI kits.',
    challenge: 'Game UI usually lives as flat mockups that engineers rebuild by hand. Every state, slice and size gets lost along the way.',
    approach: 'An editor where layouts, components and states are real objects, with preview and export in the same workspace.',
    result: 'Live at sliceforge.io and free to start. The recording below is the running product.',
    tags: ['React & TypeScript', 'Editor UX', 'Game UI production'], video: '/media/services/editor/sf-edit-preview-export.mp4', poster: '/studio-images/sf-compose.webp',
    gallery: [['/studio-images/sf-compose.webp', 'SliceForge Compose with a fantasy game interface'], ['/studio-images/sf-workspace.webp', 'The SliceForge workspace']], links: [['Visit sliceforge.io', 'https://www.sliceforge.io/']] },
  { slug: 'focusrail', title: 'Focusrail', client: 'Strategic Sloth', kind: 'Our product', line: 'game-ui', years: '2026', role: 'Design and C++ development',
    summary: 'Controller and keyboard navigation for Unreal Engine: build, debug and validate UI focus.',
    challenge: 'Controller focus is one of the most common reasons a game UI feels broken, and it is hard to see what is wrong.',
    approach: 'A focus rail you author in the widget editor, plus a Focus Doctor that shows every route and flags dead ends.',
    result: 'Released on Fab for Unreal Engine 5.',
    tags: ['Unreal Engine 5', 'C++', 'Controller navigation'], poster: '/media/services/unreal-focus-doctor.webp',
    gallery: [['/media/services/unreal-focus-doctor.webp', 'Focus Doctor validating a menu'], [pf + 'ue-widget-editor.webp', 'Focus rail in the widget editor'], ['/media/work/focusrail-runtime.webp', 'Focus diagnostics in a running menu'], [pf + 'ue-runtime-settings.webp', 'Runtime settings']], links: [['View on Fab', 'https://www.fab.com/listings/47a56c00-ab32-4c20-8aba-04935b4a2578']] },
  { slug: 'tropic-tumble', title: 'Tropic Tumble', client: 'Strategic Sloth', kind: 'Our game', line: 'games', years: '2026', role: 'Game design, UI, art direction and development',
    summary: 'A free-to-play sticker merge puzzle: 40 levels across eight islands, 76 stickers, events, stories and a season pass.',
    challenge: 'A casual merge game lives or dies on feel: every drag, merge and reward has to read instantly on a small screen.',
    approach: 'One hand-written codebase with no engine, wrapped for Android with ads and in-app purchases, tuned through playtests.',
    result: 'Released on Google Play in 2026.',
    tags: ['Mobile game', 'Monetisation', 'Live features'], video: st + 'tropic-tumble.mp4', poster: st + 'tropic-tumble.jpg', portrait: true,
    gallery: [1, 2, 3, 4, 5, 6, 7, 8].map(i => [st + `tropic-tumble-shot-${i}.webp`, `Tropic Tumble screenshot ${i}`]) as [string, string][], links: [['Play the game', '/tropic-tumble/'], ['Google Play', 'https://play.google.com/store/apps/details?id=com.strategicsloth.tropictumble']] },
  { slug: 'runefjord', title: 'Runefjord', client: 'Strategic Sloth', kind: 'Our game', line: 'games', years: '2026', role: 'Reskin: art direction, UI and release',
    summary: 'Tropic Tumble rebuilt as a Viking game: new stickers, scenes, map, menus, music and store identity on the same rules.',
    challenge: 'A reskin has to feel like a new game while keeping a proven economy and 40 levels intact.',
    approach: 'Keep the game playable the whole time and replace stand-in art one picture at a time.',
    result: 'Four days from a copy to a signed build on a Google Play test track.',
    tags: ['Reskin', 'Mobile game', 'Release'], video: st + 'runefjord.mp4', poster: st + 'runefjord.jpg', portrait: true,
    gallery: [1, 2, 3, 4, 5, 6, 7, 8].map(i => [st + `runefjord-shot-${i}.webp`, `Runefjord screenshot ${i}`]) as [string, string][], links: [['See the game', '/runefjord/']] },
  { slug: 'sloth-jam', title: 'Sloth Jam', client: 'Strategic Sloth', kind: 'Our game', line: 'games', years: '2026', role: 'Game design and development',
    summary: 'A cozy 3D party game for families: 27 one-minute games on a sloth island, playable in the browser.',
    challenge: 'Kids aged six and up and their parents need to play together with one stick, one button and no reading.',
    approach: 'Pictures and numbers only, computer players at three levels, and a cozy island between rounds. Written in TypeScript on three.js.',
    result: 'A playable browser demo, in development.',
    tags: ['3D party game', 'three.js', 'Family'], video: st + 'sloth-jam.mp4', poster: st + 'sloth-jam.jpg',
    gallery: [], links: [['Play the demo', 'https://remiclassic.github.io/sloth-jam/play/']] },
  { slug: 'norman-ascension', title: 'Norman Ascension', client: 'Strategic Sloth', kind: 'Our game', line: 'games', years: 'In development', role: 'Game design, engine and development',
    summary: 'An online medieval life and dynasty RPG, in a browser-based engine we wrote.',
    challenge: 'A persistent world of towns, seasons, armies and families has to run in a browser and still look like a place.',
    approach: 'A custom WebGL engine for terrain, weather, day and night and battle formations, with the dynasty systems built on top.',
    result: 'In development for Steam. The footage is unretouched in-engine capture.',
    tags: ['Custom WebGL engine', 'RPG systems', 'World rendering'], video: '/media/norman-ascension/battle.mp4', poster: st + 'norman-battle.jpg',
    gallery: [[pf + 'na-mont-saint-michel.webp', 'Mont-Saint-Michel at dawn'], ['/media/norman-ascension/battle-shield-wall.webp', 'Shield wall'], [pf + 'na-wheat-sunset.webp', 'Harvest evening'], [pf + 'na-winter-lane.webp', 'Winter lane']], links: [['See the game', '/norman-ascension/']] },
  { slug: 'mission-control', title: 'Mission Control', client: 'Strategic Sloth', kind: 'Our product', line: 'web-training', years: '2025–2026', role: 'Training UX, design and build',
    summary: 'A cyber-training mission hub with a live globe: guided tutorial, learning paths, progression and a debrief.',
    challenge: 'Most cyber training never gets finished. Learners need a reason to come back and a clear first step.',
    approach: 'A mission hub that turns lessons into operations, with progression, rank and a debrief after every mission.',
    result: 'Sixteen screens from the running build, plus fourteen playable training games.',
    tags: ['Training UX', 'Simulation', 'Progression'], video: '/training/video/training-film-60s.mp4', poster: '/training/mission-control/mission-control.jpg',
    gallery: [['/training/mission-control/01-mission-control-default.webp', 'Mission hub'], ['/training/mission-control/02-tutorial-step1-welcome.webp', 'Guided tutorial'], ['/training/mission-control/08-learning-path-selector.webp', 'Learning paths'], ['/training/mission-control/18-mission-results-xp-rankup-levelup.webp', 'Mission results and rank up']], links: [['Open the training case study', '/training/']] },
  { slug: 'narriaflow', title: 'NarriaFlow', client: 'Strategic Sloth', kind: 'Our product', line: 'apps', years: '2025', role: 'Product design and development',
    summary: 'A writing workspace with a story canvas, an outline and character detail in one place.',
    challenge: 'Authors need both the sequence of a story and the connections within it; one view cannot serve both.',
    approach: 'A canvas for relationships, an outline for order and detail views for the material behind each scene.',
    result: 'Complete and awaiting launch. The recording is the real product with sample story content.',
    tags: ['Canvas UX', 'Desktop app', 'Writing tools'], video: '/media/work/narriaflow-demo.mp4', poster: '/media/work/narriaflow-poster.webp',
    gallery: [['/media/work/narriaflow-poster.webp', 'Story canvas'], ['/media/work/narriaflow-outline.webp', 'Outline'], ['/media/work/narriaflow-character.webp', 'Character detail']], links: [['Full case study', '/work/narriaflow/']] },
  { slug: 'real-estate', title: 'Real Estate 3D Home', client: 'Strategic Sloth', kind: 'Our product', line: 'apps', years: '2025', role: 'Product UX and 3D development',
    summary: 'A floor plan becomes a place: plan editing, furnished walkthroughs and presentation views in one app.',
    challenge: 'A plan describes dimensions, but it takes another kind of view to understand how a space feels.',
    approach: 'Connect the plan and its 3D presentation, and keep geometry review separate from the final walkthrough.',
    result: 'A working local application, shown with a synthetic demonstration property.',
    tags: ['3D web app', 'Three.js', 'Product UX'], video: '/media/work/real-estate-demo.mp4', poster: '/media/work/real-estate-poster.webp',
    gallery: [['/media/work/real-estate-plan.webp', 'Floor plan'], ['/media/work/real-estate-room.webp', 'Room view'], ['/media/work/real-estate-exterior.webp', 'Exterior']], links: [['Full case study', '/work/real-estate/']] },
  { slug: 'world-editor', title: 'SliceForge World Editor', client: 'Strategic Sloth', kind: 'Our product', line: 'apps', years: 'In development', role: 'Tool UX and development',
    summary: 'Paint cells on a grid and see the generated 3D world beside it.',
    challenge: 'An authoring tool has to connect a small edit with its effect on a much larger world.',
    approach: 'Keep the painted grid as the source and put the 3D preview beside it, with tools around the same working area.',
    result: 'Prototype footage from the development build.',
    tags: ['Tool UX', 'Procedural worlds', '3D preview'], video: '/media/work/world-editor-demo.mp4', poster: '/media/work/world-editor-poster.webp',
    gallery: [], links: [['Full case study', '/work/world-editor/']] },
];

export const caseBy = (slug: string) => cases.find(c => c.slug === slug);

// Projects shown on the home page, in order.
export const featured = ['tropic-tumble', 'mechwarrior-5', 'sliceforge', 'norman-ascension', 'dauntless', 'mission-control'];

export const priceDrivers: [string, string][] = [
  ['Screens and states', 'How many screens, and how many states each one has: empty, loading, error, owned, locked.'],
  ['Platforms and input', 'PC, console, mobile or VR, and whether it must work with a controller, touch or keyboard.'],
  ['Engine and access', 'Whether we implement in your Unreal, Unity, Godot or web project, and how we get access.'],
  ['Art direction', 'Working inside an existing style is faster than creating a new visual language.'],
  ['Timeline', 'A fixed launch date with little room adds a rush premium; flexible dates do not.'],
  ['Localisation', 'Several languages, right-to-left text and long German words all need room in the layout.'],
];

export const pricingFaq: [string, string][] = [
  ['What does “from” mean?', 'It is the price of the smallest typical scope. After a short call we send a written scope with a fixed price, so you know the total before anything starts.'],
  ['How do payments work?', 'Packages are billed in milestones agreed in the written scope. Monthly partnerships are billed monthly.'],
  ['Who does the work?', 'Remi Couture leads every project personally. Trusted engineers, artists and producers join under the same lead when the scope needs them.'],
  ['Do you only work on games?', 'No. Games are the deepest part of the practice, and the same team designs and builds apps, websites and training products.'],
  ['Will you sign an NDA?', 'Yes. Send yours with your first message, or ask for ours.'],
  ['Where are you, and when do you work?', 'In the Montreal area, on Eastern Time, working with teams worldwide.'],
  ['Can we start with something small?', 'Yes. The $490 screen review and the $2,900 audit are designed as first steps, and their findings carry into a bigger scope.'],
];

export const stats: [string, string][] = [['20 years', 'in game UI, UX and product design'], ['40+', 'shipped games and apps'], ['12 studios', 'worked inside, from indie to co-dev'], ['3', 'own games and tools released']];
export const brands = ['Disney', 'Sony', 'Riot Games', 'Tencent', 'AppLovin', 'Piranha Games', 'Phoenix Labs', 'Offworld'];
