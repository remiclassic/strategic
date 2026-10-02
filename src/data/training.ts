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
		title: 'Commercial cyber range UX',
		detail: 'Onboarding, learning paths, and mission flow for a gamified cyber training platform.',
	},
	{
		title: 'Our own cyber range', // TODO: product name once public
		detail: 'A browser range for guided, hands-on security exercises.',
	},
	{
		title: 'Security minigames', // TODO: add the count, e.g. "6 security minigames"
		detail: 'Short playable lessons for awareness and skills practice.',
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
		name: 'Security minigames', // TODO: named titles
		status: 'Demo available',
		body: 'Short, replayable games for phishing, password hygiene, and incident triage. Each one fits a ten-minute slot in a workshop or LMS module and reports a score you can track.', // TODO: confirm features
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
	{ id: 'globe', tab: 'Globe', src: '/training/proto/globe/01-choose.html', poster: '/training/work/proto-globe.webp', title: 'Globe: choose training, pick a path, launch from the map', note: 'Start with a certification plan or a single path, then follow the module onto the globe.' },
	{ id: 'worldmap', tab: 'World map', src: '/training/proto/ftue-world-map/01-choose.html', poster: '/training/work/proto-worldmap.webp', title: 'World map: mission control and a live campaign map', note: 'Browse paths in mission control, read the briefing, and see progress across the map.' },
	{ id: 'soc', tab: 'SOC direct', src: '/training/proto/soc-direct/01-paths.html', poster: '/training/work/proto-soc.webp', title: 'SOC direct: from path choice to first activity in two screens', note: 'The shortest route: pick a path, see every module, begin.' },
	{ id: 'onboarding', tab: 'Onboarding', src: '/training/proto/ftue-v2/01-welcome.html', poster: '/training/work/proto-onboarding.webp', title: 'Onboarding: six steps from welcome to ready', note: 'Account setup, security, identity, and a starting path, one decision per screen.' },
];
