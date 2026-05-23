import { expect, test } from '@playwright/test';

const LEMON_STUB = `
window.LemonSqueezy = {
  Setup: function (options) {
    window.__lemonEventHandler = options.eventHandler;
  }
};
document.addEventListener('click', function (event) {
  var target = event.target;
  if (!target || !target.closest) return;
  var button = target.closest('.lemonsqueezy-button');
  if (!button) return;
  event.preventDefault();
}, true);
`;

test.describe('tracking smoke', () => {
	test.beforeEach(async ({ page }) => {
		await page.route('https://assets.lemonsqueezy.com/lemon.js', (route) =>
			route.fulfill({
				status: 200,
				contentType: 'application/javascript',
				body: LEMON_STUB,
			}),
		);

		await page.addInitScript(() => {
			localStorage.setItem('strategicSlothTrackingDebug', 'true');
		});
	});

	test('loads homepage, emits debug tracking on CTA and checkout clicks, and avoids duplicate PageViews', async ({
		page,
	}) => {
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

		await page.goto('/');

		await expect.poll(() => debugMessages.some((line) => line.includes('[tracking] initialized'))).toBeTruthy();
		expect(pageViewRequests).toHaveLength(1);

		const heroCta = page.locator('[data-track="cta_click"][data-track-location="hero"]').first();
		await heroCta.click();

		await expect
			.poll(() => debugMessages.some((line) => line.includes('[tracking] cta_click')))
			.toBeTruthy();

		const checkoutButton = page
			.locator('[data-track="checkout_click"][data-track-product="starter-guide-5"]')
			.first();
		await checkoutButton.click();

		await expect
			.poll(() => debugMessages.some((line) => line.includes('[tracking] checkout_click')))
			.toBeTruthy();
		await expect
			.poll(() => debugMessages.some((line) => line.includes('[tracking] checkout_context_saved')))
			.toBeTruthy();

		const checkoutHref = await checkoutButton.getAttribute('href');
		expect(checkoutHref).toContain('lemonsqueezy.com/checkout/');

		expect(pageViewRequests).toHaveLength(1);
	});

	test('stores UTMs and appends them to Lemon checkout URLs', async ({ page }) => {
		await page.goto('/?utm_source=qa&utm_campaign=tracking-test&utm_medium=cpc');

		const checkoutButton = page
			.locator('[data-track="checkout_click"][data-track-product="starter-guide-5"]')
			.first();
		await checkoutButton.click();

		const href = await checkoutButton.getAttribute('href');
		expect(href).toContain('utm_source=qa');
		expect(href).toContain('utm_campaign=tracking-test');
		expect(href).toContain('utm_medium=cpc');
	});
});
