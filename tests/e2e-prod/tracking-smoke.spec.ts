import { expect, test, type Page } from '@playwright/test';

const META_PIXEL_ID = '1442389786809344';
const GA4_ID = 'G-WWR13DW58L';

async function starterCheckoutButton(page: Page) {
	const tracked = page.locator(
		'[data-track="checkout_click"][data-track-product="starter-guide-5"]',
	);
	if (await tracked.count()) {
		return tracked.first();
	}

	return page.locator('#book-offer a.lemonsqueezy-button[href*="lemonsqueezy.com/checkout"]').first();
}

test.describe('production tracking smoke', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem('strategicSlothTrackingDebug', 'true');
		});

		await page.addInitScript(() => {
			document.addEventListener(
				'click',
				(event) => {
					const target = event.target as Element | null;
					const checkout = target?.closest?.('.lemonsqueezy-button');
					if (checkout) {
						event.preventDefault();
					}
				},
				true,
			);
		});
	});

	test('live homepage tracking scripts, single PageView, and debug events', async ({ page }) => {
		const debugMessages: string[] = [];
		const pageViewRequests: string[] = [];

		page.on('console', (msg) => {
			if (msg.type() === 'debug') {
				debugMessages.push(msg.text());
			}
		});

		await page.route('**/*', (route) => {
			const url = route.request().url();
			if (url.includes('facebook.com/tr') && url.includes('PageView')) {
				pageViewRequests.push(url);
			}
			route.continue();
		});

		const response = await page.goto('/');
		expect(response?.ok()).toBeTruthy();

		await expect(page).toHaveTitle(/Strategic Sloth/i);

		const html = await page.content();
		expect(html).toContain(META_PIXEL_ID);
		expect(html).toContain('connect.facebook.net/en_US/fbevents.js');
		expect(html).toContain(GA4_ID);
		expect(html).toContain('googletagmanager.com/gtag/js');
		expect(html).toContain('assets.lemonsqueezy.com/lemon.js');
		expect(html.match(/fbq\('track', 'PageView'\)/g)?.length ?? 0).toBe(1);
		expect(html.match(/gtag\('config'/g)?.length ?? 0).toBe(1);
		await expect(page.locator('head script[src*="assets.lemonsqueezy.com/lemon.js"]')).toHaveCount(1);

		await expect
			.poll(() => pageViewRequests.length, { timeout: 15_000 })
			.toBe(1);

		await expect
			.poll(() => debugMessages.some((line) => line.includes('[tracking] initialized')), {
				timeout: 15_000,
			})
			.toBeTruthy();

		const heroCta = page
			.locator('[data-track="cta_click"][data-track-location="hero"]')
			.or(page.locator('a[href="#book-offer"]').filter({ hasText: /SHOW ME HOW TO EARN WHILE I NAP/i }))
			.first();
		await heroCta.scrollIntoViewIfNeeded();
		await heroCta.click();

		await expect
			.poll(() => debugMessages.some((line) => line.includes('[tracking] cta_click')))
			.toBeTruthy();

		const checkoutButton = await starterCheckoutButton(page);
		await checkoutButton.scrollIntoViewIfNeeded();
		await checkoutButton.click();

		await expect
			.poll(() => debugMessages.some((line) => line.includes('[tracking] checkout_click')))
			.toBeTruthy();
		await expect
			.poll(() => debugMessages.some((line) => line.includes('[tracking] checkout_context_saved')))
			.toBeTruthy();

		expect(pageViewRequests).toHaveLength(1);
	});

	test('live UTM passthrough on Lemon checkout links', async ({ page }) => {
		await page.goto('/?utm_source=prod-smoke&utm_campaign=prod-tracking-test&utm_medium=cpc');

		const checkoutButton = await starterCheckoutButton(page);
		await checkoutButton.scrollIntoViewIfNeeded();
		await checkoutButton.click();

		const href = await checkoutButton.getAttribute('href');
		expect(href).toContain('lemonsqueezy.com/checkout/');
		expect(href).toContain('utm_source=prod-smoke');
		expect(href).toContain('utm_campaign=prod-tracking-test');
		expect(href).toContain('utm_medium=cpc');
	});
});
