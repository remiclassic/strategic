// Content for /training. Edit here; the page reads everything from this file.
// Items marked TODO need Remi's real details before launch.

/** Calendly / Google Appointment link. Leave empty and every "Book" button falls back to email. */
export const CALENDAR_URL = ''; // TODO: e.g. 'https://calendly.com/strategicsloth/20min'

export const CONTACT_EMAIL = 'rcouture@gmail.com'; // TODO: swap for a studio address if preferred
export const PORTFOLIO_URL = 'https://remiclassic.github.io/remiresume/';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/remicouture/';

const UTM = 'utm_source=strategicsloth&utm_medium=site&utm_campaign=training';

export function bookHref(topic: string): string {
	if (CALENDAR_URL) {
		const sep = CALENDAR_URL.includes('?') ? '&' : '?';
		return `${CALENDAR_URL}${sep}${UTM}`;
	}
	const subject = encodeURIComponent(`[StrategicSloth] ${topic}`);
	const body = encodeURIComponent('Company:\nWhat we are building:\nWhat we want help with:\nTiming:\n');
	return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

export const isCalendar = () => Boolean(CALENDAR_URL);

export const proof = [
	{
		title: '8 training games',
		detail: 'Designed and built by us, each playable from briefing to debrief, with 209 passing tests.',
	},
	{
		title: 'Nearly 20 years of game UI', // TODO: confirm the figure
		detail: 'Game interface craft applied to onboarding, missions, and trainer views.',
	},
	{
		title: 'Design and build',
		detail: 'Web and React, or Unreal UMG and CommonUI. Nothing lost at handoff.',
	},
	{
		title: 'Built to embed',
		detail: 'Self-contained web modules with a simple contract for reporting score and completion to the host.',
	},
];

// Games we designed and built ourselves. Media lives in /public/training/my-games.
export const myGames = [
	{
		"id": "network-defense",
		"name": "Network Defense: Keep Finance Online",
		"genre": "Isometric strategy",
		"teaches": "How routes and dependencies keep a service up, how to read evidence, and how to write an access rule that stops the attacker without stopping the business.",
		"mistake": "“You connected Finance straight to the Gateway. Invoices reached Finance, but Finance couldn’t reach its database on the Core server, so each one failed. Services depend on other services — a path from the internet isn’t enough.”",
		"proof": "“Blanket blocking cannot earn the best result” and “backup routes preserve the access policy”, each checked on 8 seeds. 32 tests.",
		"fits": "Firewall and access rules, taught through consequences."
	},
	{
		"id": "phishing",
		"name": "Phishing Speed Drill: The Payroll Request",
		"genre": "Timed inbox drill",
		"teaches": "Reading the sender, the reply-to and the real link destination, backing a call with evidence, and knowing when only a phone check can settle it.",
		"mistake": "“This was a real payslip notice. External mail and a generic greeting are not evidence by themselves; the domain, link, and timing all matched. False alarms slow down real work.”",
		"proof": "Always-report, always-safe and always-verify each “stay out of the top two ratings”. “Slow but correct play still earns the top rating.” 53 tests.",
		"fits": "Awareness training for every employee, not only analysts."
	},
	{
		"id": "triage",
		"name": "Incident Triage Race: The Busy Morning",
		"genre": "Alert triage board",
		"teaches": "Setting priority from evidence and business impact, linking alerts that are one incident, and revising when new facts arrive.",
		"mistake": "“The severity tag says so.”",
		"proof": "“Never treats the severity tag as a valid justification.” “Rewards revising when evidence changes, not standing still.” 13 tests.",
		"fits": "A natural team game for workshops and live events."
	},
	{
		"id": "soc",
		"name": "SOC Dashboard Challenge: A Strange Login",
		"genre": "SOC investigation case",
		"teaches": "Separating evidence that discriminates between explanations from evidence that fits both, and responding in proportion while data is leaving.",
		"mistake": "“You had strong evidence that this was approved work and contained anyway. The business paid for an interruption the evidence did not support.”",
		"proof": "“No single blind opening wins in both variants.” “Investigating first is not always right: delay lets the incident progress.” 13 tests.",
		"fits": "A warm-up before a hands-on investigation lab."
	},
	{
		"id": "dispatch",
		"name": "Cyber Dispatch: First Shift",
		"genre": "Dispatcher desk",
		"teaches": "Asking the questions that matter, giving the safe next step before harm lands, and handing off only what the evidence confirms.",
		"mistake": "“Reply to the email and ask them to confirm the new details.” → “The sender ‘confirmed’ their own request, and Elena queued the payment.”",
		"proof": "“Escalating everything as high scores poorly.” “Asking every question before acting is not the best run.” 24 tests.",
		"fits": "First response and handoff, for help desks and non-specialists."
	},
	{
		"id": "queryhunt",
		"name": "Query Hunt: Unusual Access",
		"genre": "SQL investigation",
		"teaches": "Filtering, aggregating and joining real log tables, reading the result correctly, and telling a suspicious observation from a confirmed conclusion.",
		"mistake": "“Repeated failed logins alone do not establish compromise: they show attempts. Which evidence shows what happened after them?”",
		"proof": "“Accepts equivalent queries written differently.” “Never grants evidence for running a query.” Real SQLite runs in the tests. 31 tests.",
		"fits": "Log analysis practice with real SQL in the browser."
	},
	{
		"id": "cloud",
		"name": "Cloud Command: First Orbit",
		"genre": "Arcade flight",
		"teaches": "Finding the real capacity constraint through a dependency, balancing availability against cost, least privilege, and who is responsible for what on IaaS.",
		"mistake": "Checkout “has enough capacity, but each request calls” the Payments API, “which can serve only” 1,200 rps. More checkout instances “cannot help until” it has capacity.",
		"proof": "“Adding capacity helps only where capacity is the constraint.” “Does not let a high score hide a failed security objective.” 18 tests.",
		"fits": "Cloud fundamentals in a lighter, arcade style."
	},
	{
		"id": "privilege",
		"name": "Privilege Path Puzzle: Who Can Read Payroll",
		"genre": "Access graph puzzle",
		"teaches": "Tracing nested groups and inherited grants to find every route to a file, then making the smallest change that closes it without breaking business access.",
		"mistake": "“Signing in is authentication: it proves who Alex is. What Alex may open is authorization, and that came from a grant.”",
		"proof": "“Never treats connectivity as authorization.” Each puzzle “cannot be solved with fewer changes than par” and “fails when access is removed for everyone”. 25 tests.",
		"fits": "Identity and access reasoning as a visual puzzle."
	}
];

// Games grid. Client-built games are shown under neutral names: no client, platform,
// or product titles in copy, alt text, or filenames. Art lives in /public/training/games-art.
export const PLAYABLE_ANCHOR = '#minigame-example';

export const games = [
	{
		id: 'countermeasure-defense',
		name: 'Countermeasure Defense',
		genre: 'Arcade shooter',
		teaches: 'Matching attacker tactics to the right response',
		body: 'Threats fall toward the perimeter, each tagged with an ATT&CK tactic. Pick the response that defeats it (prevent, detect, contain, or recover) and fire before it breaches.',
		alt: 'A defense turret fires a beam at a shielded planet, with stations on either side.',
		why: 'You cannot fire well until you have read the tactic. The framework is the trigger.',
		problem: 'Analysts learn ATT&CK tactics and kill chain stages as a list of names. What the job needs is the next step: seeing a tactic and knowing at once whether the right move is to prevent, detect, contain, or recover.',
		idea: 'Turn each response type into a weapon. Threats arrive labelled with a tactic, and only the matching countermeasure stops them. In ninety seconds a learner makes dozens of tactic-to-response calls. A second mode runs the same loop on the seven kill chain stages.',
		ux: [
			'Four responses on keys 1 to 4, each with its own color, symbol, and label, so the choice never depends on color alone.',
			'Selecting a response rings every threat it defeats. The hint is built into the control, not buried in a help screen.',
			'A legend of every tactic and its response stays on screen, so a new learner can look it up mid-wave and a practiced one stops needing it.',
			'High-priority threats move faster and hurt more, and some change tactic mid-flight, which forces a re-read instead of muscle memory.',
		],
		learner: 'Fast, repeated practice at reading a tactic and choosing the response, with a combo and a live accuracy rating that reward staying right under pressure.',
	},
	{
		id: 'kill-chain-solitaire',
		name: 'Kill Chain Solitaire',
		genre: 'Card game',
		teaches: 'How an attack unfolds, phase by phase',
		body: 'Each card is a real attacker tool or technique. Build six complete attacks in order, from reconnaissance to action on objectives, before the score runs down.',
		alt: 'A red target at the center of a circuit of connected attack and defense icons.',
		why: 'Building each attack in order is the skill. The card table just makes it tactile.',
		problem: 'Analysts can recite the seven kill chain phases but struggle to connect them to real tools and to each other. That sequence is what lets a defender work out how far an intrusion has gone and what comes next.',
		idea: 'Borrow a game everyone already knows. Each card is an attacker tool tied to a phase, each pile is one attack, and a card only lands if it is the next phase in the chain. Closing a pile means the learner has rebuilt a full intrusion from first scan to final action.',
		ux: [
			'Familiar solitaire rules and a one-screen briefing, so the first card moves within seconds.',
			'The seven phases sit across the top as a tracker that lights up as each one is placed.',
			'Valid slots glow while a card is dragged. A wrong drop sends the card back with no score penalty, so trying is safe.',
			'Picking up a card shows what the tool does and where it sits in the chain, so the content is read in the moment it is used.',
		],
		learner: 'A working mental model of how an attack progresses, built by placing real tools into the sequence again and again.',
	},
	{
		id: 'cyber-quiz-show',
		name: 'Cyber Quiz Show',
		genre: 'Trivia board',
		teaches: 'Core knowledge, by work role',
		body: 'A game-show board where every category maps to a NICE work role. Pick a clue, place a wager, and finish on a final round.',
		alt: 'A glowing gold game-show board of clue tiles on a studio stage.',
		why: 'A wager makes people judge how sure they are, and that is the habit worth building.',
		problem: 'Broad knowledge checks are the dullest part of any course. Learners click through, forget it, and the result says little about which areas are actually weak.',
		idea: 'Keep the breadth and add stakes. Six categories each map to a work role, tiles rise in value with difficulty, and wager rounds ask the learner to bet on their own confidence before they see the question.',
		ux: [
			'A widescreen board the learner reads at a glance: six categories across, value and difficulty down.',
			'Every category header names the work role it belongs to, so the learner sees which job a gap affects.',
			'A 30-second timer ring that shifts from cyan to gold to red, and a streak counter that makes momentum visible.',
			'Right or wrong, the correct answer lights up on the spot, so a miss still teaches. Keys 1 to 4 answer without the mouse.',
		],
		learner: 'A quick, honest read on what they know across six domains, with a grade and a balance that give them a reason to play the board again.',
	},
	{
		id: 'regex-defense',
		name: 'Regex Defense',
		genre: 'Wave defense',
		teaches: 'Regular expressions under pressure',
		body: 'Waves of hostile strings advance on the base. Type a pattern that matches them and they are gone. Every keystroke counts.',
		alt: 'A green cluster of bracket and pattern symbols in a stream of code.',
		why: 'There is no multiple choice. The learner has to write the pattern.',
		problem: 'Regular expressions show up in log search, detection rules, and data filters, and almost everyone learns them by copying from a cheat sheet. Reading regex is one thing. Writing it cold is another.',
		idea: 'Make typing the pattern the only way to act. Hostile strings advance in waves, and a regex that matches a whole string takes it out. The first level drills quantifiers, the next moves to character classes and anchors, and later waves add characters that have to be escaped.',
		ux: [
			'A command console at the center of the screen: the keyboard is the controller.',
			'Live preview. Strings the pattern would match turn green while the learner types, before they commit to the shot.',
			'One pattern that clears several targets builds the combo, so writing a general pattern beats picking them off one by one.',
			'A briefing names the concept before each level, and a regex reference stays on screen during play, so looking it up is part of the loop.',
		],
		learner: 'The jump from recognizing regex to producing it, practiced on short strings before it matters in a real query.',
	},
	{
		id: 'port-connect',
		name: 'Port Connect',
		genre: 'Path puzzle',
		teaches: 'Ports and protocols',
		body: 'Draw paths that never cross to link each port number to its protocol. Every connection explains what the service does.',
		alt: 'An isometric network board linking labelled nodes such as HTTP 80 and DNS 53 to a central core.',
		why: 'Each path is a recalled fact, and the board will not complete on guesses.',
		problem: 'Port numbers are pure memorization, and flash cards are how most people try and fail to learn them. The facts do not stick because nothing is done with them.',
		idea: 'Wrap the recall in a spatial puzzle. The learner links each port to its protocol by drawing a path, paths cannot cross, and the grid must be filled. The puzzle gives a reason to care about the pairing, and each link explains what the service is for.',
		ux: [
			'Three guided boards with color hints, then free play where every tile is the same grey, so the pairing has to be recalled.',
			'Draw with mouse, touch, or pen. A wrong link simply will not connect, and nothing is deducted for trying again.',
			'Connecting a port opens its reference card: what it is for, how it gets attacked, and how to protect it.',
			'Boards are generated and checked by a solver, so replaying means a new layout, not a memorized one.',
		],
		learner: 'Port and protocol pairs they can recall without a lookup, learned through a puzzle they would play anyway.',
	},
	{
		id: 'attack-path-mapper',
		name: 'Attack Path Mapper',
		genre: 'Strategy',
		teaches: 'Threat modeling and detection coverage',
		body: 'Map how an adversary could move through a network, then see where detection holds and where it has gaps.',
		alt: 'A network map with one route highlighted in red from an entry point to a server.',
		why: 'Learners build the attack themselves, then watch the defenses answer it.',
		problem: 'Threat modeling is usually taught as a diagram to read. Learners see the finished attack path and never practice the reasoning that produces one, or the question that matters most: would we have caught it?',
		idea: 'Hand the learner the adversary role. They pick a target organization, chain techniques into a route toward an objective, and run it. The simulation checks every step against the controls in place and shows where detection held and where it had gaps.',
		ux: [
			'A mission dossier sets the target, its objectives, and the security controls already in place.',
			'Techniques come from a searchable ATT&CK catalog and connect on a node graph, so the path is visible as it grows.',
			'Running the simulation traces the route step by step, then names the control that caught each step.',
			'No route scores 100. Every path trades reaching the objective against being seen, and Retry reopens the same board to refine it.',
		],
		learner: 'Practice thinking like an attacker in order to defend: tracing a route, then judging which controls would stop or spot it.',
	},
];

// The gate every game concept has to pass before it gets built.
export const designRules = [
	{ title: 'Start from the job, not the game', body: 'Before any mechanic or art: which role is this for, which skill does it drill, and what should someone do better after ten sessions? If we cannot answer in a sentence, it is entertainment, not training.' },
	{ title: 'One skill per game', body: 'A game that teaches ports, protocols, and firewall rules at once teaches none of them. Each game isolates a single skill so the score means something.' },
	{ title: 'The knowledge is the controller', body: 'You cannot win by reflexes or by clicking fast. The only way to act in the game is to use the skill, so the mechanic falls apart for anyone who does not know the material.' },
	{ title: 'Recall beats recognition', body: 'Picking from four options is recognition. Typing the pattern, placing the card, or drawing the route is recall, and recall is what holds up on the job.' },
	{ title: 'Feedback teaches while you play', body: 'A wrong move explains itself on the spot, in the game, in under a second. Nobody waits for an end screen to find out what they got wrong.' },
	{ title: 'Harder means deeper, not faster', body: 'Later rounds add ambiguity, exceptions, and trade-offs. Speeding up the clock only tests typing.' },
	{ title: 'Score accuracy first', body: 'Speed is a capped bonus. Missing a real threat costs more than a false alarm, the same way it does in a SOC.' },
	{ title: 'Five minutes, worth replaying', body: 'Short enough for a coffee break, with content that reshuffles every run so a learner cannot memorize the answers.' },
];

export const learnerOutcomes = [
	{ title: 'They start', body: 'A five-minute game with one clear goal is easier to open than a forty-minute module. The first action happens in seconds, not after three screens of reading.' },
	{ title: 'They practice, not just read', body: 'Every round is retrieval practice: the learner has to produce the answer and act on it. That is the part passive content skips.' },
	{ title: 'They find out why', body: 'Feedback lands on the decision that caused it, so a mistake turns into the next correct move instead of a red mark at the end.' },
	{ title: 'They come back', body: 'Fresh content each run and a score to beat give people a reason to replay, and repetition spread over days is what makes a skill stick.' },
	{ title: 'You can see it', body: 'The games are built to report score and completion to the host platform, so an instructor sees who has the skill and who needs help.' },
];

export const whyUs = [
	{ title: 'A game designer who knows your product', body: 'Nearly 20 years of game UI and UX, plus hands-on work inside a commercial cyber range: onboarding, learning paths, mission flow, and its games hub.' },
	{ title: 'Design and code from the same hands', body: 'The person who designs the game also builds it, in React and web or in Unreal UMG and CommonUI. What you approve in the prototype is what ships.' },
	{ title: 'Learning first, polish second', body: 'Every concept has to pass the same eight-rule gate before we draw anything. You get the reasoning in writing, not just a pretty mockup.' },
	{ title: 'Built to drop into your platform', body: 'Self-contained web modules with a simple ready, score, complete contract, sized to embed in a course, an LMS, or a range.' },
	{ title: 'Small, fixed, low risk', body: 'Start with a two-week sprint at a fixed fee. You own what you pay for, and there is no lock-in if you stop.' },
];

export const services = [
	{
		title: 'Educational minigames',
		body: 'Give us one skill your learners keep failing. We return a concept, the art, and a playable build: five minutes long, scored, and ready to embed in your platform.',
	},
	{
		title: 'UI, UX, and product design',
		body: 'Onboarding, learning paths, mission briefings, HUDs, and trainer dashboards. Designed as full flows and delivered as click-through prototypes your team can test with learners.',
	},
	{
		title: 'Front-end build',
		body: 'We build what we design, in React and web or in Unreal UMG and CommonUI, with component states and handoff notes for your engineers.',
	},
];

export const offers = [
	{
		id: 'sprint',
		title: 'UX sprint',
		length: '2 weeks',
		price: 'Fixed fee, pilot pricing', // TODO: e.g. 'From $8,000'
		outcome: 'You leave with one flow your team can build this quarter.',
		includes: [
			'UX audit of your current trainee and trainer flows',
			'Prioritized list of fixes, ranked by impact on completion',
			'One shippable flow or HUD, fully specified',
			'Component states and handoff notes for UMG, CommonUI, or web',
			'A walkthrough call with your product and engineering leads',
		],
		cta: 'Book a sprint',
	},
	{
		id: 'retainer',
		title: 'Retainer',
		length: 'Monthly',
		price: 'Monthly rate, scoped to hours', // TODO: e.g. 'From $6,000 / mo'
		outcome: 'A senior training UX lead without a full-time hire.',
		includes: [
			'Ongoing UX and UI for missions, dashboards, and assessments',
			'CommonUI and UMG architecture, focus, and input routing',
			'Design system upkeep as content and modes grow',
			'Weekly review with your team, async in between',
		],
		cta: 'Book a call',
	},
	{
		id: 'pilot',
		title: 'Platform pilot',
		length: 'Custom',
		price: 'Scoped per use case',
		outcome: 'See our range or minigames working with your learners.',
		includes: [
			'Access to our range or minigame pack for a set cohort',
			'Content mapped to your training goals',
			'Your branding on the learner-facing screens',
			'Completion and engagement data at the end of the pilot',
			'A clear path to license, white-label, or extend',
		],
		cta: 'Request a pilot',
	},
];

export const showcase = [
	{
		id: 'range',
		tab: 'Cyber range',
		name: 'Our cyber range', // TODO: product name
		status: 'Demo available',
		body: 'Guided missions in a live environment, with a trainer view that shows who is stuck and where. Built so a new trainee knows the next step and an instructor can run a session without a manual.', // TODO: confirm features
		shots: [] as { src: string; alt: string }[], // TODO: 2–3 screenshots in /public/training/, 16:9
	},
	{
		id: 'minigames',
		tab: 'Minigames',
		name: 'Keep Finance Online',
		status: 'Playable example',
		body: 'A short strategy exercise for beginner cybersecurity learners. Inspect traffic, configure access rules, and maintain service availability, then review your decisions in a replay and debrief.',
		shots: [] as { src: string; alt: string }[],
	},
	{
		id: 'tools',
		tab: 'Unreal tools',
		name: 'Focusrail',
		status: 'Available on Fab',
		body: 'Our UMG plugin for predictable keyboard and controller focus. The same problem shows up in dense training desktops: focus lost behind a popup, a panel that scrolls the wrong widget out of view.',
		link: 'https://www.fab.com/listings/47a56c00-ab32-4c20-8aba-04935b4a2578',
		shots: [] as { src: string; alt: string }[],
	},
];

export const steps = [
	{ title: 'A short call', body: 'Twenty minutes on fit, goals, and what is already built.' },
	{ title: 'Scope in writing', body: 'A sprint or pilot with deliverables, dates, and a fixed price.' },
	{ title: 'Build and demo', body: 'Work in your stack or ours, with a demo your team can try.' },
	{ title: 'Expand or stop', body: 'Move to a retainer or license, or keep what you have. No lock-in.' },
];

export const forList = [
	'Cyber ranges and gamified security training',
	'Serious games and simulation for defense or milsim',
	'Security vendors who need workshop or demo UX',
	'Unreal studios that need CommonUI or UMG depth',
];

export const notForList = [
	'Generic consumer app redesigns',
	'Federal RFPs where we would bid as prime',
];

export const capabilities = [
	{ title: 'Trainer dashboards', body: 'Cohort progress at a glance, with the stuck trainee surfaced before they give up.' },
	{ title: 'Mission flow', body: 'Briefing, objectives, hints, and debrief that keep momentum through a long exercise.' },
	{ title: 'Assessment and skill panels', body: 'Scores that map to a framework your buyers recognize, shown without overwhelming the learner.' },
	{ title: 'Dense desktop UX', body: 'Keyboard-first layouts for analysts who live in terminals, consoles, and logs.' },
	{ title: 'CommonUI at scale', body: 'Input routing, focus, and layering that survive dozens of screens and modes.' },
];

// TODO: confirm timing and IP terms match how you actually contract.
export const faqs = [
	{
		q: 'Can you show past client work?',
		a: 'Some of it. The work on this page is shown with client names and branding removed, using sample content. Anything confidential stays that way, but we can walk through the process and decisions behind it.',
	},
	{
		q: 'Do we need Azure or a marketplace listing?',
		a: 'No. A pilot runs on our hosting or yours. Marketplace listings can come later if you license the platform.',
	},
	{
		q: 'Unreal only, or web too?',
		a: 'Both. Most of our training work is in Unreal with UMG and CommonUI, and our range and minigames run in the browser.',
	},
	{
		q: 'How fast can a sprint start?',
		a: 'Usually within two weeks of the first call. A sprint runs two weeks from kickoff to handoff.',
	},
	{
		q: 'Who owns the IP?',
		a: 'Sprint and retainer work is yours on payment. For pilots, our range and minigames stay ours and are licensed to you, with any custom content you fund belonging to you.',
	},
	{
		q: 'Do you work remotely?',
		a: 'Yes. We work with teams across time zones and keep a few hours of overlap for reviews.',
	},
];

// Selected work: first-time experience exploration for a cyber range.
// Screens are shown with client names and branding removed.
export const workFacts = [
	{ title: 'Seven design directions', body: 'From a live globe and a world map to a direct-path SOC view, for military, enterprise, and friendlier audiences.' },
	{ title: 'Six-step onboarding', body: 'Welcome, agreement, security, identity, training path, ready. One decision per screen.' },
	{ title: 'Path to first activity', body: 'Choose a program or path, read the briefing, start the first module. No dead ends.' },
];

export const workLead = {
	src: '/training/work/globe-04-map.webp',
	alt: 'Globe view of the training world with the first module pinned on the map and a next-up panel showing The threat landscape.',
	caption: 'Globe direction: the learning path lives on the map, with the next module always one click away.',
};

export const workShots = [
	{ src: '/training/work/worldmap-02-paths.webp', alt: 'Mission control screen listing individual learning paths with a path intelligence panel for Cybersecurity Basics.', caption: 'World-map direction: browsing learning paths.' },
	{ src: '/training/work/range-01-path-picker.webp', alt: 'Learning path picker with three paths, each showing module count and time.', caption: 'Direct-path SOC view: three paths, commitment up front.' },
	{ src: '/training/work/range-02-path-detail.webp', alt: 'Selected learning path with five modules listed and the first module, The threat landscape, open beside it.', caption: 'Path detail with module order, prerequisites, and credit.' },
	{ src: '/training/work/range-05-onboarding-welcome.webp', alt: 'Onboarding welcome screen with a six-step progress bar and an orbital station illustration.', caption: 'Onboarding, step 1 of 6.' },
	{ src: '/training/work/range-06-onboarding-path.webp', alt: 'Onboarding step asking the trainee to choose a starting area: networking, zero trust, or vulnerability analysis.', caption: 'Choosing a field of operation during onboarding.' },
	{ src: '/training/work/range-03-briefing-sidebar.webp', alt: 'Module briefing with overview, what the module covers, and an activity details panel.', caption: 'Briefing before the first activity.' },
];

// Click-through prototypes, built by scripts/build-training-prototypes.py into /public/training/proto.
export const prototypes = [
	{ id: 'globe', tab: 'Globe', src: '/training/live-globe/demo.html', poster: '/training/work/proto-globe.webp', title: 'Live globe: orbit, select a module, zoom into its location', note: 'Animated Cesium globe with camera flights, location views, and mission briefings. Internet connection required for imagery.' },
	{ id: 'worldmap', tab: 'World map', src: '/training/proto/ftue-world-map/01-choose.html', poster: '/training/work/proto-worldmap.webp', title: 'World map: mission control and a live campaign map', note: 'Browse paths in mission control, read the briefing, and see progress across the map.' },
	{ id: 'soc', tab: 'SOC direct', src: '/training/proto/soc-direct/01-paths.html', poster: '/training/work/proto-soc.webp', title: 'SOC direct: from path choice to first activity in two screens', note: 'The shortest route: pick a path, see every module, begin.' },
	{ id: 'onboarding', tab: 'Onboarding', src: '/training/proto/ftue-v2/01-welcome.html', poster: '/training/work/proto-onboarding.webp', title: 'Onboarding: six steps from welcome to ready', note: 'Account setup, security, identity, and a starting path, one decision per screen.' },
];


