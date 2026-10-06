// Remi's career credits and recommendations, as published on his résumé
// (remiclassic.github.io/remiresume), ArtStation and LinkedIn. These are his credits from
// studio roles and agency client work, not a list of Strategic Sloth clients.
export const RESUME_URL = 'https://remiclassic.github.io/remiresume/';
export const ARTSTATION_URL = 'https://www.artstation.com/remicouture';
export const RECOMMENDATIONS_URL = 'https://www.linkedin.com/in/remicouture/details/recommendations/';

export const studios = ['Piranha Games', 'Offworld', 'Phoenix Labs', 'Sprung Studios', 'AppLovin', 'Frima Studio', 'Hothead Games', 'DeNA', 'UX Magicians', 'Gogii Games', 'Cupcake Digital', 'Disney · Club Penguin'];
export const brands = ['Riot Games', 'Sony', 'Tencent', 'Disney', 'Universal Studios', 'Hasbro', 'Twitch', 'DreamWorks', 'Nickelodeon', 'BBC Kids', 'Glu Mobile', 'Big Fish Games'];

// Every figure here can be checked: `source` says where it comes from. Update `followers` by hand.
export const stats = [
  { n: new Date().getFullYear() - 2006, suffix: ' years', label: 'in game UI, UX and product design', source: 'Since Club Penguin, 2006' },
  { n: 40, suffix: '+', label: 'shipped games and apps', source: '27 at Gogii Games, 13 at Cupcake Digital, and more since' },
  { n: 12, suffix: ' studios', label: 'worked inside, from indie to co-dev', source: 'Listed in the timeline below' },
  { n: 9, suffix: ' studios', label: 'directed at once as UX Director', source: 'AppLovin central gaming team, 2021–22' },
  { n: 11, suffix: '', label: 'recommendations from managers, clients and teammates', source: 'Quoted on this page, from LinkedIn' },
  { n: 3990, suffix: '', label: 'followers on LinkedIn', source: 'As of October 2026' },
  { n: 3, suffix: ' products', label: 'of our own: two live, one on the way', source: 'SliceForge, Focusrail on Fab, Storefront Builder' },
  { n: 5, suffix: ' runtimes', label: 'Unreal, Unity, Godot, PlayCanvas and web', source: 'Code for each on this page' },
];

export const credits = [
  { years: '2022–25', studio: 'Offworld', work: 'Squad', role: 'Senior UX/UI Designer', note: 'Player flows through Unreal Engine implementation', tag: 'PC · Unreal' },
  { years: '2021–22', studio: 'AppLovin Central Creative', work: 'Nine mobile game studios', role: 'UX Director', note: 'PeopleFun, Geewa, Clipwire, Belka and five more', tag: 'Mobile · Unity & Unreal' },
  { years: '2020–21', studio: 'UX Magicians', work: 'Valorant · NBA × Verizon 5G · Twitch · Stardust Canvas', role: 'Senior UX/UI Product Designer', note: 'Client work for Riot, Tencent, Sony, Universal Studios and Hasbro', tag: 'AAA & mobile' },
  { years: '2019–20', studio: 'Frima Studio', work: 'Connected toys, VR and AR · Pokémon and Star Wars projects', role: 'Lead UX/UI Designer', note: 'UX flows, interface, motion graphics and engine implementation', tag: 'Unity & Unreal' },
  { years: '2018', studio: 'Sprung Studios', work: 'Client UI projects, including Plants vs. Zombies', role: 'UX/UI & VR Art Director', note: 'Daily client reviews and design leadership', tag: 'Co-dev' },
  { years: '2018', studio: 'Phoenix Labs', work: 'Dauntless', role: 'UX/UI Designer', note: 'Quest system UX, crafting, HUD and a new UX workflow', tag: 'PC & console · Unreal' },
  { years: '2016–18', studio: 'Piranha Games', work: 'MechWarrior Online · MechWarrior 5: Mercenaries', role: 'UX/UI Designer', note: 'UX style guide, 2D and 3D UI, in-engine with UI engineers', tag: 'PC · Unreal' },
  { years: '2015–16', studio: 'Hothead Games', work: 'Boom Boom Football · GunKings', role: 'Senior UX/UI Designer', note: 'Wireframes, assets, animation and Unity implementation', tag: 'Mobile · Unity' },
  { years: '2014–15', studio: 'DeNA', work: 'TRANSFORMERS: Battle Tactics · Super Battle Tactics · Go Go Ghost · Military Masters', role: 'UX/UI Designer', note: 'Shipped mobile game UI', tag: 'Mobile · Unity' },
  { years: '2013–14', studio: 'Cupcake Digital', work: 'Rio · The Nut Job · Fraggle Rock · Strawberry Shortcake · Yo Gabba Gabba!', role: 'UX/UI Designer', note: '13+ kids apps for DreamWorks, BBC Kids and Nickelodeon properties', tag: 'iOS & Android' },
  { years: '2009–13', studio: 'Gogii Games', work: 'Escape the Museum 2 · Haunted Past · Nanny Mania 2 · Zoometry', role: 'UX/UI Designer & Illustrator', note: '27 shipped games', tag: 'PC & mobile' },
  { years: '2006–08', studio: 'Disney', work: 'Club Penguin', role: 'Illustrator', note: 'Illustration and 3D assets', tag: 'Web' },
];

export const quotes = [
  { text: 'UI, UX, illustration and implementation Remi was a one stop shop to get stuff done. Strong recommend, would hire again.', name: 'Keith Kawahata', relation: 'Hired and managed Remi · AppLovin', date: 'July 2022', url: 'https://www.linkedin.com/in/keithkawahata/', lead: true },
  { text: 'Remi created an entire UX workflow and pipeline neither of which previously existed in any form at the studio. … not only up to the task of making the game more playable, but to also create entire workflows, that are still in use today.', name: 'Andrew Gearhart', relation: 'Teammate · Phoenix Labs, on Dauntless', date: 'February 2020', url: 'https://www.linkedin.com/in/ajgearhart/' },
  { text: 'Remi had a huge influence on Boom Boom Football. He applied his formidable understanding of UX to make some excellent changes to the game’s flow and followed that up with solid artistic implementation. When we lost a key screen building artist, Remi proactively learned new areas of Unity to fill that gap.', name: 'Dylan Scott', relation: 'Art Director, managed Remi · Hothead Games', date: 'January 2016', url: 'https://www.linkedin.com/in/dylan-scott-94427516/' },
  { text: 'It was an absolute pleasure to work with Rémi on Super Battle Tactics and his efforts brought in massive improvements to the User Experience. … He regularly shared his knowledge with the rest of the team to educate everyone in thinking about User Experiences earlier in the design pipelines.', name: 'Eric Hine', relation: 'Lead Designer and Producer · DeNA', date: 'April 2015', url: RECOMMENDATIONS_URL },
  { text: 'Remi has a fantastic understanding of UX/UI needs in gaming. Working with him on my project was not only exactly what we needed, but was informative and a great learning opportunity for my team.', name: 'Dana Dispenza', relation: 'Client', date: 'July 2022', url: 'https://www.linkedin.com/in/danadispenza/' },
  { text: 'One of the best UI/UX expert I have ever work with. … His talent on UI/UX and solid painting skill helped the team went through tough time and delivered great result!', name: 'William Liu', relation: 'Art Director, managed Remi · DeNA', date: 'April 2015', url: RECOMMENDATIONS_URL },
  { text: 'His understanding on UI/UX makes the UI/UX development process quite faster and much more efficient. He’s also a good team-worker, who works very closely with engineers and game designers.', name: 'Satoshi Bessho', relation: 'Managed Remi · DeNA Studios Canada', date: 'April 2015', url: RECOMMENDATIONS_URL },
  { text: 'He organized several informative UI/UX workshops while at the company and provided valuable feedback to our team that improved our game at every milestone.', name: 'Lan Roed', relation: 'Teammate · DeNA', date: 'April 2015', url: RECOMMENDATIONS_URL },
  { text: 'Remi has a great understanding and experience with game UI/UX. … If there is a need for fresh UI/UX design, Remi is that guy!', name: 'Jerry Tzeng', relation: 'Teammate · AppLovin', date: 'July 2022', url: 'https://www.linkedin.com/in/jerry-tzeng-7669322b/' },
  { text: 'Rémi is a talented UI/UX artist and director. … He’s always eager to help and share his knowledge. I would be thrilled to work with him again.', name: 'Victor Malcervelli', relation: 'Teammate · AppLovin Central Creative', date: 'July 2022', url: 'https://www.linkedin.com/in/victor-malcervelli/' },
  { text: 'A real knack for taking feedback from way too many sources at once, and coming up with something awesome that leaves everyone feeling listened-to and involved.', name: 'James Daniell', relation: 'Managed Remi directly', date: 'August 2016', url: 'https://www.linkedin.com/in/jdaniell/' },
];

// Art from titles Remi worked on, with his own notes from ArtStation. `count` is the number
// of full-size images saved under /media/services/credits/full/<id>-<n>.webp.
// Eras, newest first. `end` is the last year of the role, used to say how long ago the work was made.
export const eras = [
  { key: 'Strategic Sloth', years: '2025–now', end: 2026, line: 'Founder · tools, plugins and a game', text: 'SliceForge and Focusrail are live. Storefront Builder for Unreal Engine is coming to Fab, and Norman Ascension is in development for Steam.' },
  { key: 'Offworld', years: '2022–25', end: 2025, line: 'PC · Unreal Engine', text: 'Senior UX designer for three years, from player flows to Unreal Engine implementation.' },
  { key: 'AppLovin', years: '2021–22', end: 2022, line: 'Mobile · nine studios', text: 'UX Director on the central gaming team: individual contributor, advisor and director across the company’s studios worldwide. The work belongs to those studios, so there are no screens here.' },
  { key: 'UX Magicians', years: '2020–21', end: 2021, line: 'Client work · AAA & mobile', text: 'Senior UX product designer on client projects across Unreal and Unity pipelines.' },
  { key: 'Frima', years: '2019–20', end: 2020, line: 'Connected toys · VR · AR', text: 'Lead UX/UI designer on connected-toy, virtual reality and augmented reality projects for licensed properties including Pokémon and Star Wars.' },
  { key: 'Sprung Studios', years: '2018', end: 2018, line: 'Co-development · contract', text: 'UX/UI and VR art director: daily client meetings, deliverable documentation and mentoring junior designers, on projects including Plants vs. Zombies.' },
  { key: 'Phoenix Labs', years: '2018', end: 2018, line: 'PC · Unreal Engine', text: 'UX/UI designer on Dauntless. Built the quest system UX and a UX workflow the studio kept using.' },
  { key: 'Piranha Games', years: '2016–18', end: 2018, line: 'PC · Unreal Engine 4', text: 'Front end for MechWarrior 5: Mercenaries, the UX style guide, and implementation with UI engineers.' },
  { key: 'Hothead Games', years: '2015–16', end: 2016, line: 'Mobile · Unity', text: 'Senior UX/UI designer: wireframes, assets, animation and Unity implementation.' },
  { key: 'DeNA', years: '2014–15', end: 2015, line: 'Mobile · Unity', text: 'One base structure for three games: Super Battle Tactics, TRANSFORMERS: Battle Tactics and Military Masters.' },
  { key: 'Cupcake Digital', years: '2013–14', end: 2014, line: 'Kids apps · iOS & Android' },
  { key: 'Gogii Games', years: '2009–13', end: 2013, line: 'PC & mobile · 27 shipped games' },
  { key: 'Disney', years: '2006–08', end: 2008, line: 'Club Penguin · web' },
];
const eraOf = (studio: string) => eras.findIndex(era => studio.startsWith(era.key));
const pf = (...names: string[]) => names.map(name => `/media/services/portfolio/${name}.webp`);
const OW = 'Offworld · 2022–25', UM = 'UX Magicians · 2020–21', FR = 'Frima · 2019–20', PL = 'Phoenix Labs · 2018';
const P = 'Piranha Games · 2016–18', DN = 'DeNA · 2014–15', H = 'Hothead Games · 2015–16', G = 'Gogii Games · 2009–13', C = 'Cupcake Digital · 2013–14';
export const titles = [
  ['squad', 'Squad', OW, 'Senior UX Designer', pf('squad-faction', 'squad-weapon', 'squad-vehicle', 'squad-confirm'), 'Customisation concepts built around faction identity, equipment previews and ownership states, with a confirm step before anything is applied.'],
  ['valorant', 'Valorant', UM, 'Senior UX Product Designer', pf('tac-lobby', 'tac-agents', 'tac-modes', 'tac-match', 'tac-ability', 'tac-wire-agent', 'tac-wire-lobby', 'tac-wire-modes', 'tac-wire-map', 'tac-wire-weapon', 'tac-wire-shop', 'tac-wire-collection'), 'A front-end exploration that follows the PC flow: agent select, party lobby, queue, match found, game modes, missions, friends, shop and collection, from wireframes to a colour pass.'],
  ['nba-verizon', 'NBA × Verizon 5G', UM, 'Senior UX Product Designer', pf('sports-court', 'sports-schedule', 'sports-login', 'sports-card', 'sports-card-detail', 'sports-card-2'), 'Second-screen basketball products from the Phoenix Suns and Verizon 5G project: a live court overlay, schedule and news, sign-in, and a collectible player-card concept.'],
  ['twitch', 'Twitch', UM, 'Senior UX Product Designer', pf('twitch-leaderboards'), 'Leaderboard explorations for mobile portrait and web.'],
  ['stardust-canvas', 'Stardust Canvas', UM, 'Senior UX Product Designer', pf('stardust-flow', 'stardust-sitemap', 'stardust-components', 'stardust-fonts'), 'User flow, sitemap, component sheet and typography for a mobile product.'],
  ['pokemon-vr', 'Pokémon VR concept', FR, 'Lead UX/UI Designer', pf('mobile-pokemon-vr'), 'A virtual reality creature-catching concept from Frima’s VR and AR work.'],
  ['dauntless', 'Dauntless', PL, 'UX/UI Designer', pf('hunt-crafting', 'hunt-journal', 'hunt-armour', 'hunt-season', 'hunt-found', 'hunt-found-2'), 'Crafting at the armoursmith, hunt matchmaking, the season journal and item comparison. A teammate wrote that the quest system UX and the workflow behind it were “still in use today”.'],
  ['mechwarrior-5', 'MechWarrior 5: Mercenaries', P, 'UX/UI Designer', 12, 'An early mockup of the contract selection screen. UX through to UI, with glitch animations.'],
  ['boom-boom-football', 'Boom Boom Football', H, 'Senior UX/UI Designer', 12, 'A card-collecting football game for mobile. Interface, button construction and user flows.'],
  ['gunkings', 'GunKings', H, 'Senior UX/UI Designer', 1, 'Head-to-head sniper shootouts for mobile, taken to soft launch.'],
  ['transformers-battle-tactics', 'TRANSFORMERS: Battle Tactics', DN, 'UX/UI Designer', 8, 'A multiplayer battle game for mobile published by DeNA, with more than 75 characters to collect.'],
  ['super-battle-tactics', 'Super Battle Tactics', DN, 'UX/UI Designer', 10, 'Brought on to establish the user flow that the next title, TRANSFORMERS: Battle Tactics, would use. Also worked on the interface. DeNA’s lead designer and producer wrote that the work “brought in massive improvements to the User Experience”.'],
  ['go-go-ghost', 'Go Go Ghost', DN, 'UX/UI Designer', 12, 'Joined late in development to guide the UX: reworked the flow, simplified screens and updated the UI art. Background by Dimitri Sirenko; game pitched and art created by Lyle Moore.'],
  ['rio', 'Rio', C, 'UX/UI Designer', 2, 'A story app for the film. Cover and HUD.'],
  ['the-nut-job', 'The Nut Job', C, 'UX/UI Designer', 5, 'An activity app for the film with four mini-games.'],
  ['fraggle-rock', 'Fraggle Rock', C, 'UX/UI Designer', 6, 'An enhanced story app with tap-and-play animation and games.'],
  ['strawberry-shortcake', 'Strawberry Shortcake', C, 'UX/UI Designer', 6, 'Several Strawberry Shortcake apps.'],
  ['yo-gabba-gabba', 'Yo Gabba Gabba!', C, 'UX/UI Designer', 1, 'A children’s app made in partnership with DHX Media.'],
  ['discovery-kids', 'Discovery Kids: Dinosaur Puzzle & Play', C, 'UX/UI Designer', 4, 'A dinosaur puzzle and play app.'],
  ['babar', 'Babar', C, 'UX/UI Designer', 2, 'Early work on the app. The final product changed a lot after Remi left the studio.'],
  ['the-hunger-games', 'The Hunger Games', G, 'Pitch mockup', 1, 'A quick mockup made for a pitch, for the chance to work on The Hunger Games. Not a shipped title.'],
  ['escape-the-museum-2', 'Escape the Museum 2', G, 'UX/UI Designer', 3, 'An adventure puzzle and hidden-object game. Menus and interface.'],
  ['haunted-past', 'Haunted Past: Realm of Ghosts', G, 'UX/UI Designer', 4, 'A hidden-object adventure. Menus, HUD and journal.'],
  ['trapped-the-abduction', 'Trapped: The Abduction', G, 'UX/UI Designer & Illustrator', 3, 'A 2009 game built for 800 × 600. UI and UX, plus the painted character.'],
  ['draco-nocte', 'Draco Nocte', G, 'UX/UI Designer', 2, 'One of many hidden-object games from the early years: fast-paced work that built the craft.'],
  ['fairy-tale-mysteries', 'Fairy Tale Mysteries: The Beanstalk', G, 'UX/UI Designer & Illustrator', 1, 'Interface and painted characters, used across the first and second games.'],
  ['nanny-mania-2', 'Nanny Mania 2', G, 'UX/UI Designer', 1, 'A time-management game. Menus and settings.'],
  ['zoometry', 'Zoometry', G, 'UI Designer & Art Direction', 4, 'UI made with another designer. Remi set the art direction for the project.'],
  ['hide-n-find', 'Hide N Find', G, 'UX/UI Designer', 9, 'A Facebook-era game. Wireframes and mockups, playable as a prototype.'],
  ['jill-and-the-beanstalk', 'Jill & The Beanstalk', G, 'UX/UI Designer', 3, 'Themed hidden-object UI for every screen, made in 2D and 3D.'],
  ['club-penguin', 'Club Penguin', 'Disney · 2006–08', 'Illustrator & Animator', 2, 'Flash illustrations, animations and 3D assets for in-game items, marketing and the website.'],
].map(([id, title, studio, role, count, note]) => ({ id, title, studio, role, note, era: eraOf(studio as string), src: `/media/services/credits/${id}.webp`, images: Array.isArray(count) ? count : Array.from({ length: count as number }, (_, n) => `/media/services/credits/full/${id}-${n + 1}.webp`) }));
