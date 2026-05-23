import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const distDir = 'dist';
const samplePages = ['index.html', 'books/index.html', 'scale-to-freedom/index.html'];

const checks = [
	{ name: 'fbq PageView', pattern: /fbq\('track', 'PageView'\)/g, expected: 1 },
	{ name: 'gtag config', pattern: /gtag\('config'/g, expected: 1 },
	{ name: 'lemon.js script', pattern: /assets\.lemonsqueezy\.com\/lemon\.js/g, expected: 1 },
	{ name: 'Meta Pixel ID', pattern: /1442389786809344/g, expected: 2 },
	{ name: 'GA4 measurement ID', pattern: /G-WWR13DW58L/g, expected: 2 },
];

let failed = false;

for (const page of samplePages) {
	const filePath = join(distDir, page);
	if (!existsSync(filePath)) {
		console.error(`Missing built page: ${filePath}`);
		failed = true;
		continue;
	}

	const html = readFileSync(filePath, 'utf8');

	for (const check of checks) {
		const count = html.match(check.pattern)?.length ?? 0;
		if (count !== check.expected) {
			console.error(
				`${page}: ${check.name} expected ${check.expected}, got ${count}`,
			);
			failed = true;
		}
	}
}

const assetsDir = join(distDir, '_assets');
if (!existsSync(assetsDir)) {
	console.error('Missing dist/_assets directory');
	failed = true;
} else {
	const trackingBundle = readdirSync(assetsDir).find(
		(file) => file.startsWith('tracking.') && file.endsWith('.js'),
	);

	if (!trackingBundle) {
		console.error('Missing tracking bundle in dist/_assets');
		failed = true;
	} else {
		const bundleSource = readFileSync(join(assetsDir, trackingBundle), 'utf8');
		if (!bundleSource.includes('strategicSlothUtm')) {
			console.error(`Tracking bundle ${trackingBundle} looks incomplete`);
			failed = true;
		}
	}
}

for (const forbidden of ['tracking.test.ts', 'vitest.config.ts', 'playwright.config.ts']) {
	if (existsSync(join(distDir, forbidden))) {
		console.error(`Test artifact should not ship in dist: ${forbidden}`);
		failed = true;
	}
}

if (failed) {
	process.exit(1);
}

console.log('Production tracking build verification passed.');
