// Work drawn from Remi's portfolio (remiclassic.github.io/remiresume/portfolio.html).
// `origin` repeats the provenance stated there: studio work, a concept, or an AI-assisted study.
const dir = '/media/services/portfolio/';
export const PORTFOLIO_URL = 'https://remiclassic.github.io/remiresume/portfolio.html';

export const cases = [
  {
    id: 'mechwarrior', title: 'MechWarrior 5: Mercenaries', origin: 'Piranha Games · UX / UI · 2016–2018', tags: ['Unreal Engine', 'Systems UI', 'Information hierarchy'],
    body: 'A connected set of interfaces for choosing a destination, evaluating a contract, and preparing a mech for the next mission.',
    shots: [['mw5-starmap', 'Star map with planets, travel routes and a news panel'], ['mw5-mission', 'Mission briefing with terrain map, objectives and contract terms'], ['mw5-mechbay', 'Mech bay with a mech, loadout slots and repair status'], ['mw5-contracts', 'Planet view with contract list and local resources'], ['mw5-modes', 'Front end with mode cards for campaign, instant action and co-op'], ['mw5-unit', 'Mercenary unit overview with faction standings'], ['mw5-mission-type', 'Mission type selection with a planet and biome details'], ['mw5-salvage', 'Salvage and market list with mech components'], ['mw5-settings', 'Graphics settings screen'], ['mw5-route', 'Jump route between star systems'], ['mw5-states', 'Button state sheet for the main, secondary and top bar buttons'], ['mw5-frame', 'Empty console frame used as the screen container']],
  },
  {
    id: 'squad', title: 'SQUAD customisation concepts', origin: 'Design concepts · 2022–2025', tags: ['Faction navigation', 'Customisation UX', 'Ownership states'],
    body: 'A military customisation concept built around faction identity, equipment previews and ownership states, with a confirm step before anything is applied.',
    shots: [['squad-faction', 'Faction selection screen with a soldier, flag and equipment categories'], ['squad-weapon', 'Weapon skin browser with a rifle preview and skin list'], ['squad-vehicle', 'Vehicle finish preview with a tank in a hangar'], ['squad-confirm', 'Confirmation dialog before applying a weapon skin']],
  },
  {
    id: 'cards', title: 'Fantasy card systems', origin: 'Gogii Games · Game UI · 2009–2013', tags: ['Collection UX', 'Deck building', 'Information density'],
    body: 'Collection, deck-building and card-detail interfaces that bring artwork, comparison and composition into the same visual language.',
    shots: [['cards-deckbuilder', 'Deck builder with a card grid and the current deck list'], ['cards-detail', 'Card detail overlay with stats, lore and craft actions'], ['cards-collection', 'Card collection with three hero cards']],
  },
  {
    id: 'vanguard', title: 'Vanguard', href: '/services/case/vanguard/', origin: 'Concept revisited · AI-assisted visual exploration · 2026', tags: ['Loadout UX', 'Interaction states', 'Medieval'],
    body: 'An atmospheric class-selection concept rebuilt as a full preparation journey: understand the role, compare the loadout, deploy with confidence.',
    shots: [['vanguard-class', 'Class selection with a knight, role stats and current loadout'], ['vanguard-loadout', 'Loadout comparison between three polearms with stat changes'], ['vanguard-deploy', 'Deployment confirmation screen']],
  },
  {
    id: 'sports', title: 'FACE/OFF & TOUCHLINE', origin: 'Independent AI-assisted concepts · 2026 · fictional clubs, not commissioned', tags: ['Sports UI art', 'Controller-first', 'Error recovery'],
    body: 'Two sports, four screens. Cinematic presentation with the decisions of team preparation kept clear, from a hockey line swap to a lineup one player short.',
    shots: [['hockey-hub', 'Hockey club hub with next game and a player in action'], ['soccer-squad', 'Soccer squad screen with a formation and an empty striker slot'], ['hockey-lineup', 'Hockey line editing screen'], ['soccer-hub', 'Soccer club hub']],
  },
  {
    id: 'product', title: 'Current & Signal', origin: 'Independent product concepts · 2026 · fictional products and sample data', tags: ['Fintech', 'Learning platform', 'Evidence-led feedback'],
    body: 'The same thinking outside games: a wallet that makes the commitment clear before purchase, and a security course that shows the reasoning behind each answer.',
    shots: [['fintech-wallet', 'Three phone screens of a wallet: balance, buy flow and purchase review'], ['signal-lab', 'Phishing practice lab with evidence notebook and feedback'], ['fintech-exchange', 'Exchange and recovery screens'], ['signal-academy', 'Learning dashboard with progression']],
  },
  {
    id: 'tactical', title: 'Valorant front-end exploration', origin: 'UX Magicians · Senior UX Product Designer · 2020–2021', tags: ['Agent select', 'Lobby & matchmaking', 'Wireframe to colour'],
    body: 'A front end that follows the PC flow, taken from grey-box wireframes to a coloured pass: agent select, party lobby, queue, mode choice, match found, missions, friends, store and collection.',
    shots: [['tac-lobby', 'Party lobby in colour with a featured agent and squad slots'], ['tac-agents', 'Agent selection in colour'], ['tac-modes', 'Mode selection cards in colour'], ['tac-match', 'Match found countdown in colour'], ['tac-ability', 'Ability detail overlay in colour'], ['tac-wire-agent', 'Wireframe of agent select with skins and abilities'], ['tac-wire-lobby', 'Wireframe of the party lobby'], ['tac-wire-modes', 'Wireframe of the game mode grid'], ['tac-wire-map', 'Wireframe of the map and team rosters'], ['tac-wire-weapon', 'Wireframe of a weapon skin page with upgrade levels'], ['tac-wire-shop', 'Wireframe of the shop'], ['tac-wire-collection', 'Wireframe of a collection page']],
  },
  {
    id: 'hunt', title: 'Dauntless', origin: 'Phoenix Labs · UX/UI Designer · 2018 · Unreal Engine', tags: ['Crafting UX', 'HUD & menus', 'Controller-first'],
    body: 'Crafting at the armoursmith, hunt matchmaking, the season journal and item comparison cards for the co-op action RPG, plus the quest system UX a teammate says the studio was still using years later.',
    shots: [['hunt-crafting', 'Armour crafting screen at the armoursmith with a helmet preview'], ['hunt-journal', 'Season journal with tracks and weekly goals'], ['hunt-armour', 'Armour comparison cards with resistances and cell slots'], ['hunt-season', 'Season reward track with an item preview'], ['hunt-found', 'Hunt found dialog with rewards and possible behemoths'], ['hunt-found-2', 'Hunt found dialog, alternate layout with ready and decline']],
  },
  {
    id: 'hero', title: 'Hero collection client', origin: 'Design study · collectible hero game', tags: ['Deck building', 'Hero profiles', 'Results & rewards'],
    body: 'A client for a collectible hero game: home, hero selection, lore profile, roster, a deck curve chart, card frames and the victory and defeat banners.',
    shots: [['hero-home', 'Home screen with featured art and collection, loot, guild and store tabs'], ['hero-select', 'Hero selection inside a new deck flow'], ['hero-profile', 'Hero lore profile with ability icons'], ['hero-roster', 'Roster grid of hero cards with a deck list'], ['hero-curve', 'Deck curve chart'], ['hero-cards', 'Ten hero cards with attack and health values'], ['hero-banners', 'Defeat and victory banners']],
  },
  {
    id: 'agency', title: 'Agency', origin: 'Card game UI · title, deck builder and board', tags: ['Sci-fi UI', 'Deck builder', 'Game board'],
    body: 'A science-fiction card game from title screen to table: deck list, deck builder, card detail and a full two-player board.',
    shots: [['agency-board', 'Two-player card game board with mission lanes'], ['agency-builder', 'Deck builder with a card grid and deck list'], ['agency-title', 'Agency title screen over a planet'], ['agency-decks', 'Deck selection list'], ['agency-card', 'Card detail with abilities']],
  },
  {
    id: 'dark', title: 'Spellcrafting & dark fantasy', origin: 'Concept work · systems UI', tags: ['Spellcrafting', 'Inventory', 'Diegetic UI'],
    body: 'A spell-building interface where time magic is assembled along a track, with a character inventory and rune controls in the same dark-fantasy language.',
    shots: [['dark-spellcraft', 'Spellcrafting screen with a spell track, level markers and a spell description on parchment'], ['dark-inventory', 'Dark fantasy hero inventory with a hooded character'], ['dark-banner', 'Armoured knight banner frame'], ['dark-runes', 'Three rune buttons over a graveyard scene']],
  },
  {
    id: 'mobile', title: 'Mobile, AR & VR', origin: 'Mobile studies and client concepts · 2019–2021', tags: ['Mobile UI', 'Style exploration', 'AR & VR'],
    body: 'Portrait-first game UI: main menus, card reveals, combat reports and pause screens tested in several styles, plus a web launch page and a Pokémon VR concept from Frima.',
    shots: [['mobile-pause', 'Three styles of the same pause menu side by side'], ['mobile-main', 'Mobile game main menu with a cannon and play button'], ['mobile-combat', 'Combat report screen with a victory result'], ['mobile-cards', 'Card reveal over the main menu'], ['mobile-screens', 'A sheet of mobile strategy game screens'], ['mobile-misfits', 'Space Misfits web launch page'], ['mobile-misfits-set', 'Set of purple mobile and web screens'], ['mobile-pokemon-vr', 'VR concept with a creature inside a holographic frame']],
  },
  {
    id: 'sports', title: 'NBA × Verizon 5G', origin: 'UX Magicians · Senior UX Product Designer · 2020–2021', tags: ['Sports', 'Second screen', 'Collectible cards'],
    body: 'Second-screen basketball from the Phoenix Suns and Verizon 5G project: a live court overlay with player ratings, schedule and news, sign-in, and a collectible player-card concept with the wallet kept in view so players spend deliberately.',
    shots: [['sports-court', 'Live basketball court with player rating markers overlaid'], ['sports-schedule', 'Team schedule and news app on a tablet'], ['sports-login', 'League-branded log in screen'], ['sports-card', 'Collectible player card with stats and an upgrade button'], ['sports-card-detail', 'Player card detail with skills and abilities'], ['sports-card-2', 'Player card variant']],
  },
  {
    id: 'stardust', title: 'Stardust Canvas', origin: 'UX Magicians · Mobile product UX · 2020–2021', tags: ['User journeys', 'Information architecture', 'Components'],
    body: 'A mobile experience connecting discovery, play, creative expression and sharing. The UX maps and component work show how the screens fit together.',
    shots: [['stardust-flow', 'Flowchart connecting mobile screens from splash through play, rewards and sharing'], ['stardust-sitemap', 'Sitemap of the app with screens grouped by section'], ['stardust-components', 'Sheet of cards, icons and toolbar components'], ['stardust-fonts', 'Typography sheet with two typefaces']],
  },
  {
    id: 'norman', title: 'Norman Ascension', href: '/norman-ascension/', cta: 'See the game', origin: 'Strategic Sloth · our own game · in development for Steam', tags: ['Custom WebGL engine', 'World & rendering', 'Game design'],
    body: 'Our online medieval dynasty RPG. Unretouched in-engine captures from the browser-based engine we wrote: battle formations, day and night, weather and the four seasons.',
    shots: [['/media/norman-ascension/battle-shield-wall.webp', 'Norman soldiers holding a shield wall on the battlefield'], ['/media/norman-ascension/battle-archers.webp', 'Archers in formation on the battlefield'], ['/media/norman-ascension/battle-helmets.webp', 'Helmeted soldiers standing in close ranks'], ['na-mont-saint-michel', 'A traveller walking across the tidal flats toward Mont-Saint-Michel at dawn'], ['na-torchlight-forest', 'A traveller carrying a torch through a forest at night'], ['na-wheat-sunset', 'Ripe wheat under a low evening sun with mist along the hedgerows'], ['na-etretat-sunset', 'The chalk cliffs and sea arch at Étretat lit by the setting sun'], ['na-forest-ride', 'A rider on a forest road in morning haze'], ['na-winter-lane', 'A country lane under snow beside a bare oak']],
  },
  {
    id: 'mission-control', title: 'Mission Control', href: '/training/', cta: 'Open the case study', origin: 'Strategic Sloth · training simulation · designed and built', tags: ['Training UX', 'Onboarding', 'Progression'],
    body: 'A mission hub with a live globe: guided tutorial, mission selection, learning paths, progression and a debrief with XP and rank. Sixteen screens from the running build.',
    shots: [['/training/mission-control/01-mission-control-default.webp', 'Mission control with a mission list beside a world map of numbered markers'], ['/training/mission-control/02-tutorial-step1-welcome.webp', 'Tutorial welcome step over the mission map'], ['/training/mission-control/03-tutorial-step2-mission-list-spotlight.webp', 'Tutorial spotlight on the mission list'], ['/training/mission-control/04-tutorial-step3-load-mission-spotlight.webp', 'Tutorial spotlight on the load mission button'], ['/training/mission-control/05-mission-selected-marker-tooltip.webp', 'A selected mission marker with its tooltip'], ['/training/mission-control/06-load-mission-loading-state.webp', 'Loading state after choosing a mission'], ['/training/mission-control/07-mission-console.webp', 'Mission console'], ['/training/mission-control/08-learning-path-selector.webp', 'Learning path selector'], ['/training/mission-control/09-learning-path-confirm-switch.webp', 'Confirmation before switching learning path'], ['/training/mission-control/10-learning-path-overview.webp', 'Learning path overview'], ['/training/mission-control/11-player-progression-panel.webp', 'Player progression panel'], ['/training/mission-control/13-global-event-popup.webp', 'Global event popup'], ['/training/mission-control/14-global-operation-briefing.webp', 'Global operation briefing'], ['/training/mission-control/15-live-ticker-expanded.webp', 'Expanded live ticker'], ['/training/mission-control/17-code-matrix-minigame.webp', 'Code matrix minigame'], ['/training/mission-control/18-mission-results-xp-rankup-levelup.webp', 'Mission results with XP, rank up and level up']],
  },
].map(item => ({ ...item, shots: item.shots.map(([file, alt]) => ({ src: file.startsWith('/') ? file : `${dir}${file}.webp`, alt })) }));

export const motionClips = [
  ['fpsscifi', 'Sci-fi FPS inventory', 'Equipment data over a moving character scene.'],
  ['fpsvictoryscrn', 'FPS victory screen', 'Recognition first, then the scoreboard.'],
  ['progressionfps', 'Progression console', 'Ranks, missions and rewards filling in.'],
  ['diagnostic', 'Starship diagnostic console', 'Damage, warnings and repair state.'],
  ['loading', 'Fantasy RPG loading screen', 'A briefing to read while the bar fills.'],
  ['potion', 'Magical arsenal', 'Inventory and shop in one space.'],
  ['hiphopvid', 'Rap battle main menu', 'The menu is also the opening scene.'],
  ['gameresume', 'A résumé as a game menu', 'Profile, inventory, map and quests, used to present a career.'],
].map(([id, title, note]) => ({ id, title, note, video: `/media/services/motion/${id}.mp4`, poster: `/media/services/motion/${id}.jpg` })).concat([{ id: 'training-film', title: 'Training interface film', note: 'Sixty seconds of onboarding, mission and progression screens.', video: '/training/video/training-film-60s.mp4', poster: '/training/video/training-film-poster.jpg' }]);

export const boards = [
  { src: `${dir}figma-canvas.webp`, title: 'Figma working file', origin: 'Mobile word game · components, tiers and animation outcomes', alt: 'Figma canvas with a layers panel, word game screens, star tier components and a results screen', wide: true },
  { src: `${dir}stardust-flow.webp`, title: 'User flow', origin: 'Stardust Canvas · UX Magicians · 2020–2021', alt: 'Flowchart connecting mobile screens from splash through play, rewards and sharing' },
  { src: `${dir}stardust-sitemap.webp`, title: 'Sitemap', origin: 'Stardust Canvas · UX Magicians · 2020–2021', alt: 'Sitemap of a mobile app with screens grouped by section' },
  { src: `${dir}stardust-components.webp`, title: 'Component sheet', origin: 'Stardust Canvas · UX Magicians · 2020–2021', alt: 'Sheet of cards, icons and toolbar components' },
  { src: `${dir}style-tests.webp`, title: 'Five styles, tested side by side', origin: 'Mobile UI iteration · 2020–2021', alt: 'Five visual styles of the same mobile game screens laid out for comparison' },
  { src: `${dir}attack-flow.webp`, title: 'Feature flow', origin: 'Mobile strategy study · 2020–2021', alt: 'Four mobile screens showing an incoming attack flow from alert to result' },
];

export const editorShots = [
  { src: `${dir}ue-widget-editor.webp`, title: 'Unreal Engine · UMG widget editor', note: 'A widget blueprint with the Focusrail overlay drawing the navigation order on the canvas.', alt: 'Unreal Engine widget blueprint editor with palette, hierarchy and a numbered focus rail drawn over four menu buttons' },
  { src: '/media/services/unreal-focus-doctor.webp', title: 'Unreal Engine · Focus Doctor', note: 'Validation that finds a duplicate navigation order and offers the fix.', alt: 'Unreal Engine designer with a validation panel reporting one warning about duplicate navigation order' },
  { src: `${dir}ue-runtime-settings.webp`, title: 'Unreal Engine · running build', note: 'Settings screen in play, text scaled to 120%, with device-aware prompts and live focus diagnostics.', alt: 'A running Unreal settings menu with a text scale slider, keyboard, Xbox and DualSense prompts and a focus overlay' },
  { src: '/studio-images/sf-compose.webp', title: 'SliceForge · Compose', note: 'Our own editor for building game screens from components.', alt: 'SliceForge Compose editor with a fantasy alchemy interface on the canvas' },
  { src: '/studio-images/sf-workspace.webp', title: 'SliceForge · workspace', note: 'A science-fiction interface laid out with reusable parts.', alt: 'SliceForge workspace showing a science-fiction game interface' },
  { src: '/media/work/world-editor-poster.webp', title: 'SliceForge World Editor', note: 'Painted grid on the left, generated 3D world on the right.', alt: 'World Editor with a cell grid beside generated terrain' },
];

// Screen recordings of SliceForge, our own game UI editor.
export const editorClips = [
  ['edit-preview-export', 'Edit, preview, export', 'An interface edited in Compose, played in preview, then sent to export.'],
  ['layered-frame', 'A frame built in layers', 'Border, corners and fill kept separate so the frame can stretch.'],
  ['build-button', 'A button from a rectangle', 'Shape first, then states, built on the canvas.'],
  ['export', 'Export for Unreal', 'Choosing the target and running the export preflight.'],
].map(([id, title, note]) => ({ title, note, video: `/media/services/editor/sf-${id}.mp4`, poster: `/media/services/editor/sf-${id}.jpg` }));

// Game UI components from SliceForge React UI, our own component library (React + TypeScript).
export const components = [
  ['radial-menu', 'Radial menu', 'Ability wheel with charges'], ['skill-tree', 'Skill tree', 'Nodes, links and point spend'], ['inventory-grid', 'Inventory grid', 'Drag to rearrange, stack counts'], ['settings-panel', 'Settings panel', 'Tabs, sliders and key hints'],
  ['boss-bar', 'Boss bar', 'Phases and heavy-hit feedback'], ['party-frames', 'Party frames', 'Health, buffs and downed state'], ['minimap', 'Minimap', 'Heading, markers and region'], ['quest-tracker', 'Quest tracker', 'Objectives that check off'],
  ['hotbar', 'Hotbar', 'Slots, keybinds and counts'], ['item-tooltip', 'Item tooltip', 'Stats compared with equipped'], ['shop-card', 'Shop card', 'Rarity, price and discount'], ['dialogue-box', 'Dialogue box', 'Speaker portrait and typed text'],
  ['health-bar', 'Health bar', 'Damage, crit, heal and shield'], ['cooldown-ring', 'Cooldown ring', 'Ready state and key prompt'], ['loot-reveal', 'Loot reveal', 'Open, burst and rarity'], ['stat-radar', 'Stat radar', 'Class comparison'],
  ['kill-feed', 'Kill feed', 'Team colours and weapon icons'], ['damage-numbers', 'Damage numbers', 'Floating hits and crits'], ['xp-bar', 'XP bar', 'Level and gain steps'], ['sniper-scope', 'Sniper scope', 'Zoom, range and breath'],
].map(([id, title, note]) => ({ id, title, note, src: `/media/services/components/${id}.webp` }));

// Whole-canvas overviews of real Figma and FigJam files from Remi's drafts, 2021–2025.
// `kind` is what the file is; `file` is its name in Figma.
export const figmaFiles = [
  ['playliner-teardown-figjam', 'Bricks Ball Crusher', 'UX teardown', 'FigJam', 'Jun 2022', 'Every screen of a live game laid out for review.'],
  ['bricks-n-balls', 'Bricks n Balls', 'Flow map', 'Figma', 'Jun 2022', 'The game’s screens connected into a single branching flow.'],
  ['word-star-ux', 'Word Star', 'UX flow', 'FigJam', 'Jun 2022', 'A word game mapped screen by screen.'],
  ['crystal-blast', 'Crystal Blast', 'Flow map', 'Figma', 'Jun 2022', 'Screens connected into branching paths.'],
  ['spin-a-spell-figjam', 'Spin a Spell', 'Screen audit', 'FigJam', 'Jun 2022', 'Captures of the live game sorted into rows.'],
  ['spin-a-spell-visual', 'Spin a Spell', 'Visual pass', 'Figma', 'Jun 2022', 'Popups, shop and reward screens in a new visual treatment.'],
  ['fire-and-glory-ux', 'Fire and Glory: Blood War', 'UX flow', 'Figma', 'Jun 2022', 'A strategy game’s screens arranged in columns by flow.'],
  ['top-war-figjam', 'Top War: Battle Game', 'UX teardown', 'FigJam', 'Jun 2022', 'A published game’s interface laid out section by section.'],
  ['beast-arena-figjam', 'Beast Arena', 'UX teardown', 'FigJam', 'Jun 2022', 'Card, battle and store screens grouped for review.'],
  ['geewa-smashing-four', 'Smashing Four', 'Screen set', 'Figma', 'Jun 2022', 'Screens from Geewa’s PvP game, organised by feature.'],
  ['smashing-four-figjam', 'Smashing Four', 'UX teardown', 'FigJam', 'Jun 2022', 'A review board of the game’s screens.'],
  ['cash-bingo-clipwire', 'Cash Bingo', 'Style test', 'Figma', 'Jun 2022', 'Five visual styles of the same screens for Clipwire Games.'],
  ['wordscapes-cash', 'Wordscapes Cash', 'Logo & screen studies', 'Figma', 'Jun 2022', 'Wordmark options beside the screens they sit on.'],
  ['star-rush-wordscapes', 'Star Rush', 'Screen set', 'Figma', 'Jun 2022', 'Puzzle, results and tier screens in three rows.'],
  ['bio-strike-ui', 'Bio Strike', 'HUD studies', 'Figma', 'Jun 2022', 'HUD layouts over top-down combat captures.'],
  ['squad-main-menu', 'Squad', 'Main menu', 'Figma', 'Jun 2023', 'Two main-menu layouts over in-game backdrops.'],
  ['fireteam', 'FIRETEAM', 'Reference & screens', 'Figma', 'Mar 2025', 'Reference boards leading into screen layouts.'],
  ['storyboard-game', 'Storyboard game', 'Concept frames', 'Figma', 'Jun 2022', 'Scene frames arranged as a storyboard.'],
  ['hyperhub', 'HyperHub', 'App flow', 'Figma', 'Oct 2021', 'A mobile product’s screens and their order.'],
  ['unreal', 'Viking ship scene', 'Unreal Engine captures', 'Figma', 'Nov 2022', 'Editor and viewport captures of a ship scene.'],
  ['javy-journey', 'Customer journey breakdown', 'Journey map', 'Figma', 'May 2024', 'A consumer brand’s purchase journey, step by step.'],
].map(([id, name, kind, app, date, note]) => ({ name, kind, app, date, note, src: `/media/services/figma/${id}.webp` }));
