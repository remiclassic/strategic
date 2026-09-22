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
            localStorage.setItem('strategicSlothPrivacyV1', JSON.stringify({analytics:true,marketing:true,updated:Date.now()}));
			(window as any).__pixelCalls = [];
			(window as any).fbq = (...args: unknown[]) => (window as any).__pixelCalls.push(args);
		});
	});

	test('loads the learning start page, emits debug tracking on CTA and checkout clicks, and avoids duplicate PageViews', async ({
		page,
	}) => {
		const debugMessages: string[] = [];


		page.on('console', (msg) => {
			if (msg.type() === 'debug') {
				debugMessages.push(msg.text());
			}
		});


		await page.goto('/start/');

		await expect.poll(() => debugMessages.some((line) => line.includes('[tracking] initialized'))).toBeTruthy();
		expect(await page.evaluate(() => (window as any).__pixelCalls.filter((args: string[]) => args[0] === 'track' && args[1] === 'PageView'))).toHaveLength(1);

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

		expect(await page.evaluate(() => (window as any).__pixelCalls.filter((args: string[]) => args[0] === 'track' && args[1] === 'PageView'))).toHaveLength(1);
	});

	test('stores UTMs and appends them to Lemon checkout URLs', async ({ page }) => {
		await page.goto('/start/?utm_source=qa&utm_campaign=tracking-test&utm_medium=cpc');

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
