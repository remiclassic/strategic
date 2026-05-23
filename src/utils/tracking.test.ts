import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type StorageMock = {
	getItem: (key: string) => string | null;
	setItem: (key: string, value: string) => void;
	removeItem: (key: string) => void;
	clear: () => void;
};

function createStorage(): StorageMock {
	const store = new Map<string, string>();
	return {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => {
			store.set(key, value);
		},
		removeItem: (key: string) => {
			store.delete(key);
		},
		clear: () => {
			store.clear();
		},
	};
}

function setPath(path: string): void {
	window.history.pushState({}, '', path);
}

async function loadTrackingModule() {
	vi.resetModules();
	return import('./tracking');
}

function mockScrollMetrics(options: {
	scrollHeight: number;
	innerHeight: number;
	scrollY: number;
}): void {
	Object.defineProperty(document.documentElement, 'scrollHeight', {
		configurable: true,
		value: options.scrollHeight,
	});
	Object.defineProperty(window, 'innerHeight', {
		configurable: true,
		value: options.innerHeight,
	});
	Object.defineProperty(window, 'scrollY', {
		configurable: true,
		writable: true,
		value: options.scrollY,
	});
}

async function flushScrollDepth(): Promise<void> {
	window.dispatchEvent(new Event('scroll'));
	await new Promise<void>((resolve) => {
		requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
	});
}

describe('tracking', () => {
	let fbq: ReturnType<typeof vi.fn>;
	let gtag: ReturnType<typeof vi.fn>;
	let localStorageMock: StorageMock;
	let sessionStorageMock: StorageMock;

	beforeEach(() => {
		window.__strategicSlothTrackingCleanup?.();

		localStorageMock = createStorage();
		sessionStorageMock = createStorage();

		vi.stubGlobal('localStorage', localStorageMock);
		vi.stubGlobal('sessionStorage', sessionStorageMock);

		fbq = vi.fn();
		gtag = vi.fn();
		window.fbq = fbq;
		window.gtag = gtag;

		setPath('/');
		mockScrollMetrics({ scrollHeight: 1000, innerHeight: 1000, scrollY: 0 });

		vi.spyOn(console, 'debug').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
		document.body.innerHTML = '';
	});

	it('maps cta_click to Meta Lead and GA4 cta_click', async () => {
		const { trackEvent } = await loadTrackingModule();
		trackEvent('cta_click', { button_text: 'Get started' });

		expect(fbq).toHaveBeenCalledWith(
			'track',
			'Lead',
			expect.objectContaining({ button_text: 'Get started', page_path: '/' }),
		);
		expect(gtag).toHaveBeenCalledWith(
			'event',
			'cta_click',
			expect.objectContaining({ button_text: 'Get started', page_path: '/' }),
		);
		expect(fbq).not.toHaveBeenCalledWith('track', 'PageView', expect.anything());
	});

	it('maps pricing_click to Meta ViewContent', async () => {
		const { trackEvent } = await loadTrackingModule();
		trackEvent('pricing_click', { location: 'hero' });

		expect(fbq).toHaveBeenCalledWith(
			'track',
			'ViewContent',
			expect.objectContaining({ location: 'hero' }),
		);
		expect(gtag).toHaveBeenCalledWith('event', 'pricing_click', expect.any(Object));
	});

	it('maps checkout_click to Meta InitiateCheckout', async () => {
		const { trackEvent } = await loadTrackingModule();
		trackEvent('checkout_click', { product: 'starter-guide-5', price: '5' });

		expect(fbq).toHaveBeenCalledWith(
			'track',
			'InitiateCheckout',
			expect.objectContaining({ product: 'starter-guide-5', price: '5' }),
		);
		expect(gtag).toHaveBeenCalledWith('event', 'checkout_click', expect.any(Object));
	});

	it('maps purchase to Meta Purchase and GA4 purchase', async () => {
		const { trackEvent } = await loadTrackingModule();
		trackEvent('purchase', {
			value: 5,
			currency: 'USD',
			transaction_id: 'tx-abc',
			product: 'Starter Guide',
			product_id: 'starter-guide-5',
		});

		expect(fbq).toHaveBeenCalledWith(
			'track',
			'Purchase',
			expect.objectContaining({ value: 5, currency: 'USD', content_name: 'Starter Guide' }),
		);
		expect(gtag).toHaveBeenCalledWith(
			'event',
			'purchase',
			expect.objectContaining({
				transaction_id: 'tx-abc',
				value: 5,
				currency: 'USD',
				items: [
					expect.objectContaining({
						item_id: 'starter-guide-5',
						item_name: 'Starter Guide',
						price: 5,
						quantity: 1,
					}),
				],
			}),
		);
	});

	it('stores UTM params from URL and includes them in later events', async () => {
		setPath('/?utm_source=facebook&utm_campaign=spring&fbclid=abc123');

		const { initTracking, trackEvent } = await loadTrackingModule();
		initTracking();
		trackEvent('cta_click', { button_text: 'Hero CTA' });

		expect(gtag).toHaveBeenCalledWith(
			'event',
			'cta_click',
			expect.objectContaining({
				utm_source: 'facebook',
				utm_campaign: 'spring',
				fbclid: 'abc123',
			}),
		);
	});

	it('appends stored UTMs to Lemon checkout URLs without duplicating params', async () => {
		localStorageMock.setItem(
			'strategicSlothUtm',
			JSON.stringify({ utm_source: 'meta', utm_medium: 'paid', gclid: 'g-1' }),
		);

		const { appendUtmsToUrl } = await loadTrackingModule();
		const base =
			'https://strategicsloth.lemonsqueezy.com/checkout/buy/5c2ebe0c-f79e-433f-9583-627a417c05fd?embed=1';
		const withUtms = appendUtmsToUrl(base);

		expect(withUtms).toContain('utm_source=meta');
		expect(withUtms).toContain('utm_medium=paid');
		expect(withUtms).toContain('gclid=g-1');
		expect(withUtms).toContain('embed=1');

		const existingSource =
			'https://strategicsloth.lemonsqueezy.com/checkout/buy/abc?embed=1&utm_source=existing';
		const merged = appendUtmsToUrl(existingSource, {
			utm_source: 'new-source',
			utm_medium: 'email',
		});

		expect(merged).toContain('utm_source=existing');
		expect(merged).toContain('utm_medium=email');
		expect(merged).not.toContain('utm_source=new-source');
	});

	it('applies UTM passthrough to Lemon checkout anchors on init', async () => {
		localStorageMock.setItem('strategicSlothUtm', JSON.stringify({ utm_campaign: 'books' }));

		document.body.innerHTML =
			'<a class="lemonsqueezy-button" href="https://strategicsloth.lemonsqueezy.com/checkout/buy/test-id?embed=1">Buy</a>';

		const { initTracking } = await loadTrackingModule();
		initTracking();

		const anchor = document.querySelector('a.lemonsqueezy-button') as HTMLAnchorElement;
		expect(anchor.getAttribute('href')).toContain('utm_campaign=books');
	});

	it('fires scroll_depth once per threshold at 25, 50, 75, and 90', async () => {
		mockScrollMetrics({ scrollHeight: 2000, innerHeight: 1000, scrollY: 0 });

		const { initTracking } = await loadTrackingModule();
		initTracking();

		gtag.mockClear();
		fbq.mockClear();

		const thresholds = [
			{ scrollY: 250, depth: 25 },
			{ scrollY: 500, depth: 50 },
			{ scrollY: 750, depth: 75 },
			{ scrollY: 900, depth: 90 },
		];

		for (const step of thresholds) {
			Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: step.scrollY });
			await flushScrollDepth();
		}

		const depthEvents = gtag.mock.calls
			.filter((call) => call[0] === 'event' && call[1] === 'scroll_depth')
			.map((call) => (call[2] as { depth: number }).depth);

		expect(depthEvents).toEqual([25, 50, 75, 90]);

		Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 950 });
		await flushScrollDepth();

		const repeatedDepthEvents = gtag.mock.calls.filter(
			(call) => call[0] === 'event' && call[1] === 'scroll_depth',
		);
		expect(repeatedDepthEvents).toHaveLength(4);
	});

	it('dedupes duplicate Checkout.Success events by transaction_id', async () => {
		let lemonHandler: ((event: { event: string; data: unknown }) => void) | undefined;

		window.LemonSqueezy = {
			Setup: ({ eventHandler }) => {
				lemonHandler = eventHandler;
			},
		};

		const { initTracking } = await loadTrackingModule();
		initTracking();

		expect(lemonHandler).toBeTypeOf('function');

		const successEvent = {
			event: 'Checkout.Success',
			data: {
				type: 'orders',
				id: '99',
				attributes: {
					identifier: 'tx-dedupe-123',
					total: 500,
					currency: 'USD',
					first_order_item: { product_name: 'Starter Guide', product_id: 1 },
				},
			},
		};

		lemonHandler!(successEvent);
		lemonHandler!(successEvent);

		const purchaseCalls = fbq.mock.calls.filter((call) => call[1] === 'Purchase');
		expect(purchaseCalls).toHaveLength(1);
	});

	it('fires checkout_click on Lemon button click before navigation is delayed', async () => {
		localStorageMock.setItem('strategicSlothTrackingDebug', 'true');

		document.body.innerHTML =
			'<a class="lemonsqueezy-button" data-track="checkout_click" data-track-price="5" data-track-product="starter-guide-5" href="https://strategicsloth.lemonsqueezy.com/checkout/buy/test?embed=1">Buy guide</a>';

		const { initTracking } = await loadTrackingModule();
		initTracking();

		const anchor = document.querySelector('a.lemonsqueezy-button') as HTMLAnchorElement;
		const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
		const defaultPrevented: boolean[] = [];

		anchor.addEventListener(
			'click',
			(event) => {
				defaultPrevented.push(event.defaultPrevented);
				expect(fbq).toHaveBeenCalledWith(
					'track',
					'InitiateCheckout',
					expect.objectContaining({ product: 'starter-guide-5', price: '5' }),
				);
			},
			false,
		);

		anchor.dispatchEvent(clickEvent);

		expect(defaultPrevented[0]).toBe(false);
		expect(sessionStorageMock.getItem('strategicSlothLastCheckout')).toContain('starter-guide-5');
	});

	it('does not throw when fbq, gtag, localStorage, sessionStorage, or LemonSqueezy are missing', async () => {
		const { trackEvent, initTracking, appendUtmsToUrl } = await loadTrackingModule();

		delete window.fbq;
		delete window.gtag;
		delete window.LemonSqueezy;

		vi.stubGlobal('localStorage', {
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('blocked');
			},
			removeItem: () => {
				throw new Error('blocked');
			},
			clear: () => {
				throw new Error('blocked');
			},
		});
		vi.stubGlobal('sessionStorage', {
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('blocked');
			},
			removeItem: () => {
				throw new Error('blocked');
			},
			clear: () => {
				throw new Error('blocked');
			},
		});

		expect(() => trackEvent('cta_click')).not.toThrow();
		expect(() =>
			trackEvent('purchase', { value: 5, currency: 'USD', transaction_id: 'tx-safe' }),
		).not.toThrow();
		expect(() => appendUtmsToUrl('https://strategicsloth.lemonsqueezy.com/checkout/buy/x?embed=1')).not.toThrow();
		expect(() => initTracking()).not.toThrow();
	});

	it('never sends PageView or page_view from trackEvent', async () => {
		const { trackEvent } = await loadTrackingModule();

		const eventNames = ['cta_click', 'pricing_click', 'checkout_click', 'email_signup_click', 'scroll_depth', 'purchase'];

		for (const eventName of eventNames) {
			trackEvent(eventName, { transaction_id: 'tx-1', value: 5, currency: 'USD', depth: 25 });
		}

		expect(fbq).not.toHaveBeenCalledWith('track', 'PageView', expect.anything());
		expect(gtag).not.toHaveBeenCalledWith('event', 'page_view', expect.anything());
	});
});
