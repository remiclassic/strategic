// Close-ups exported from Remi's own Figma files, page by page. Each shot is a real frame or
// canvas region at full resolution; `w`/`h` are the pixel size of the large image.
const D = '/media/services/figma/deep/';
type Shot = [id: string, w: number, h: number, title: string, note: string];
const shots = (list: Shot[]) => list.map(([id, w, h, title, note]) => ({ src: `${D}${id}.webp`, thumb: `${D}${id}-s.webp`, w, h, title, note }));

export const figmaDeep = [
  {
    id: 'nzm', name: 'NZM', client: 'Tencent', kind: 'Mobile shooter front end',
    summary: 'Lobby, loadout and backpack for a mobile shooter: from flow map and grey-box wireframes to a specified UI kit with art applied.',
    pages: ['Flow map + wires', 'UI kit', 'Screen descriptions', 'Wireframe prototype', 'UI art prototype'],
    shots: shots([
      ['nzm-spec-close', 1740, 1810, 'Backpack system, specified', 'Loadout in PVP and PVE and the attribute popup, each with the notes engineers build from.'],
      ['nzm-ui-kit-safe', 1310, 800, 'UI kit, per screen', 'Button states, icons, backgrounds and behaviour notes laid out beside the finished screen.'],
      ['nzm-flow-map', 3000, 2680, 'Flow map and wireframes', 'Every screen in the front end and how the player moves between them.'],
      ['nzm-wire-prototype', 3000, 1999, 'Wireframe prototype', 'The grey-box screens wired into a clickable prototype before any art.'],
      ['nzm-screen-specs', 3000, 2581, 'Screen descriptions', 'Lobby, character, weapons and store, documented screen by screen.'],
    ]),
  },
  {
    id: 'game-genius', name: 'Game Genius', client: 'Client project · 2023', kind: 'AI game-creation platform',
    summary: 'Product design for a platform that generates playable games: research, structure, marketing site and the first-run flow.',
    pages: ['Components', 'Sitemap', 'Website', 'Persona · journey map · IA', 'Editor and gameplay', 'Rendered flow'],
    shots: shots([
      ['game-genius-p9-f2', 2000, 1120, 'First-run welcome', 'The rendered opening screen of the creation flow.'],
      ['game-genius-p9-f3', 2000, 1120, 'Step 1: pick a game type', 'Adventure, puzzle or action: one decision per screen.'],
      ['gg-journey-close', 2945, 753, 'Journey map, close up', 'Tasks, mindsets, pain points and opportunities across discovery, research, design and development.'],
      ['gg-journey', 3000, 2936, 'Design brief and persona', 'Brief, goals, constraints and assumptions above the full journey map and information architecture.'],
      ['gg-sitemap', 2711, 2764, 'Sitemap', 'Every page of the marketing site with the sections each one needs.'],
      ['gg-website-wires', 3000, 2586, 'Website wireframes', 'Page-by-page wireframes built from the sitemap, desktop and mobile.'],
      ['gg-rendered-flow', 3000, 412, 'Rendered flow', 'The creation flow end to end, with art direction options above it.'],
    ]),
  },
  {
    id: 'kryss', name: 'Kryss', client: 'Client project', kind: 'Mobile word game',
    summary: 'A live crossword game’s new features: power-ups, shop, banners, popups and a settings reskin, with the client’s notes answered on the canvas.',
    pages: ['Existing-player slideshow', 'Power-ups and board', 'End game', 'Settings', 'Banners', 'Icon design', 'Gameboard', 'Buttons', 'Shop', 'Popups'],
    shots: shots([
      ['kryss-banners', 3000, 2221, 'Lobby banners', 'Reward-centred and social-centred banners, shown for guests and signed-in players.'],
      ['kryss-powerup-flow', 2511, 2845, 'Power-up activation flow', 'Reveal, Timer and Replace, step by step, with the animation notes for each state.'],
      ['kryss-shop-items', 3000, 1287, 'Shop items', 'Free offers, special offers, bundles, coins, game boards, premium and power-ups.'],
      ['kryss-scenarios', 3000, 1121, 'Gameboard scenarios', 'Five turn states and what the player sees in each.'],
      ['kryss-shop-layouts', 3000, 2429, 'Shop layout sets', 'Two full layout sets for every category, compared side by side.'],
      ['kryss-popups', 3000, 1847, 'Popup matrix', 'Every popup in four colour treatments, in one grid.'],
      ['kryss-reskin', 2997, 3000, 'Settings reskin', 'The shipped settings screens beside the reskinned versions.'],
      ['kryss-slideshow-flow', 3000, 486, 'Returning-player slideshow', 'Intro, coins, power-ups and redesign, with the skip path.'],
      ['kryss-icon-pipeline', 3000, 1862, 'Icon pipeline', 'From references to first pass, iterations and the approved set.'],
    ]),
  },
  {
    id: 'tnt', name: 'TNT', client: 'Client project', kind: 'Mobile card battler',
    summary: 'Four prototype versions of a card battler’s meta game: home, collection, hero details, events and leaderboard, then a visual pass.',
    pages: ['Cards notes', 'Presentation', 'Visual pass', 'Prototype v1–v4', 'Flow map', 'Working'],
    shots: shots([
      ['tnt-presentation', 3000, 1810, 'Visual pass', 'Leaderboard, home and hero card screens with final art direction.'],
      ['tnt-card-flows', 2011, 3000, 'Card flows', 'Card info, level up, rank up, upgrade and training, wireframe to skinned.'],
      ['tnt-proto-v4', 3000, 2264, 'Prototype v4', 'The fourth wireframe pass: home, collection and hero detail states.'],
      ['tnt-wire-flow', 2066, 3000, 'Wireframe flow', 'Home, battle, leaderboard and deck screens in order.'],
      ['tnt-flowmap', 3000, 458, 'Flow map', 'The whole meta game on one line.'],
    ]),
  },
  {
    id: 'bingo-story', name: 'Bingo Story', client: 'Web shop', kind: 'Responsive store and style guide',
    summary: 'A web shop skinned for a bingo game: style guide derived from the game’s art, then login, home and shop at five breakpoints.',
    pages: ['Ready', 'References', 'Style guide', 'Login', 'Components', 'Home', 'Shop'],
    shots: shots([
      ['bingo-story-shop-p4-f1', 2000, 1088, 'Login', 'The sign-in screen in the game’s own art.'],
      ['bingo-styleguide', 3000, 1631, 'Style guide', 'Colours, forms, buttons, switches, tabs and type, beside the original it replaces.'],
      ['bingo-responsive', 3000, 1500, 'Shop at five widths', '1920, 1440, 1280, tablet and mobile.'],
      ['bingo-home-responsive', 3000, 2770, 'Home at five widths', 'Two home variants, each taken down to mobile.'],
      ['bingo-story-shop-p5-f1', 1248, 1370, 'Login component', 'The form as a reusable component.'],
    ]),
  },
  {
    id: 'mobaverse', name: 'Mobaverse', client: 'Concept', kind: 'Mobile MOBA style exploration',
    summary: 'Three complete UI styles for the same lobby, plus HUD and screen studies. All art assets made by Remi.',
    pages: ['UI styles', 'Screen ref', 'Working'],
    shots: shots([
      ['mobaverse-p1-f1', 2000, 1125, 'Lobby, style 1', 'Rounded and bright.'],
      ['mobaverse-p1-f2', 2000, 1125, 'Lobby, style 2', 'Crafted wood and leather.'],
      ['mobaverse-p1-f3', 2000, 1125, 'Lobby, style 3', 'Hard-edged and painterly.'],
      ['mobaverse-p3-f2', 2000, 1125, 'Battle HUD', 'Minimap, abilities, kill feed and stick over the play field.'],
      ['mobaverse-p3-f3', 2000, 1125, 'Lobby, flat pass', 'The same layout in a flat, high-contrast treatment.'],
      ['moba-screens', 3000, 1364, 'Working canvas', 'Lobby, armoury and hero screens side by side.'],
    ]),
  },
  {
    id: 'flows', name: 'Flow maps and teardowns', client: 'Publisher UX reviews', kind: 'Live mobile games, mapped',
    summary: 'Whole games laid out screen by screen and wired together: the work that comes before any redesign.',
    pages: ['Crystal Blast', 'Bricks n Balls', 'Clockmaker', 'Fire and Glory', 'Spin a Spell'],
    shots: shots([
      ['crystal-flow', 3000, 1859, 'Crystal Blast: flow map', 'Launch, tutorial, core loop, shop and results, with every branch drawn.'],
      ['bricks-flow', 3000, 2319, 'Bricks n Balls: flow map', 'Menus, shop, events and gameplay states connected into one map.'],
      ['clock-early-game', 1420, 860, 'Clockmaker: early game', 'The first session after the tutorial, with each decision point linked.'],
      ['clock-tutorial', 1380, 800, 'Clockmaker: tutorial', 'Every tutorial step until the player gets a free choice.'],
      ['fire-flow-close', 2585, 3000, 'Fire and Glory: screen audit', 'A strategy game’s screens sorted by feature for review.'],
      ['spin-scrolls', 3000, 2501, 'Spin a Spell: visual pass', 'Settings, menu and leaderboard scrolls reworked after the audit.'],
      ['spin-a-spell-p1-f2', 2000, 1000, 'Spin a Spell: final popups', 'The three popups in their final treatment.'],
    ]),
  },
];
