const UTM_STORAGE_KEY = 'strategicSlothUtm';

const DEBUG_KEY = 'strategicSlothTrackingDebug';

const LAST_CHECKOUT_CONTEXT_KEY = 'strategicSlothLastCheckout';

const SCROLL_THRESHOLDS = [25, 50, 75, 90] as const;

const CHECKOUT_CONTEXT_MAX_AGE_MS = 30 * 60 * 1000;



const UTM_PARAMS = [

	'utm_source',

	'utm_medium',

	'utm_campaign',

	'utm_content',

	'utm_term',

	'fbclid',

	'gclid',

] as const;



type UtmKey = (typeof UTM_PARAMS)[number];

type UtmRecord = Partial<Record<UtmKey, string>>;



interface CheckoutContext {

	product?: string;

	price?: string | number;

	button_text?: string;

	location?: string;

	href?: string;

	timestamp: number;

}



interface LemonOrderAttributes {

	identifier?: string;

	order_number?: number;

	currency?: string;

	total?: number;

	total_formatted?: string;

	first_order_item?: {

		product_id?: number;

		variant_id?: number;

		product_name?: string;

		variant_name?: string;

		price?: number;

	};

}



interface LemonCheckoutEvent {

	event: string;

	data?: unknown;

}



declare global {

	interface Window {

		fbq?: (...args: unknown[]) => void;

		gtag?: (...args: unknown[]) => void;

		LemonSqueezy?: {

			Setup: (options: { eventHandler: (event: LemonCheckoutEvent) => void }) => void;

		};

		__strategicSlothTrackingCleanup?: () => void;

	}

}



function isDebugEnabled(): boolean {

	try {

		return localStorage.getItem(DEBUG_KEY) === 'true';

	} catch {

		return false;

	}

}



function debugLog(...args: unknown[]): void {

	if (isDebugEnabled()) {

		console.debug('[tracking]', ...args);

	}

}



function loadStoredUtms(): UtmRecord {

	try {

		const raw = localStorage.getItem(UTM_STORAGE_KEY);

		return raw ? (JSON.parse(raw) as UtmRecord) : {};

	} catch {

		return {};

	}

}



function captureUtmsFromUrl(): void {

	try {

		const params = new URLSearchParams(window.location.search);

		const incoming: UtmRecord = {};

		let hasAny = false;



		for (const key of UTM_PARAMS) {

			const value = params.get(key);

			if (value) {

				incoming[key] = value;

				hasAny = true;

			}

		}



		if (!hasAny) return;



		const stored = loadStoredUtms();

		localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify({ ...stored, ...incoming }));

	} catch {

		// localStorage unavailable

	}

}



function getStoredUtms(): UtmRecord {

	return loadStoredUtms();

}



export function appendUtmsToUrl(href: string, utms: UtmRecord = getStoredUtms()): string {

	try {

		const url = new URL(href, window.location.origin);



		for (const key of UTM_PARAMS) {

			const value = utms[key];

			if (value && !url.searchParams.has(key)) {

				url.searchParams.set(key, value);

			}

		}



		return url.toString();

	} catch {

		return href;

	}

}



function isLemonCheckoutUrl(href: string): boolean {

	try {

		const url = new URL(href, window.location.origin);

		return url.hostname.includes('lemonsqueezy.com') && url.pathname.includes('/checkout/');

	} catch {

		return false;

	}

}



function applyUtmPassthroughToAnchor(anchor: HTMLAnchorElement): void {

	const rawHref = anchor.getAttribute('href');

	if (!rawHref || !isLemonCheckoutUrl(rawHref)) return;



	const withUtms = appendUtmsToUrl(rawHref);

	if (withUtms !== rawHref) {

		anchor.setAttribute('href', withUtms);

		debugLog('utm_passthrough_applied', withUtms);

	}

}



function initLemonUtmPassthrough(): void {

	if (Object.keys(getStoredUtms()).length === 0) return;



	document.querySelectorAll('a.lemonsqueezy-button[href]').forEach((el) => {

		if (el instanceof HTMLAnchorElement) {

			applyUtmPassthroughToAnchor(el);

		}

	});

}



function saveLastCheckoutContext(el: Element, anchor: HTMLAnchorElement): void {

	const params = buildClickParams(el);

	const context: CheckoutContext = {

		product: params.product as string | undefined,

		price: params.price as string | number | undefined,

		button_text: params.button_text as string | undefined,

		location: params.location as string | undefined,

		href: anchor.href,

		timestamp: Date.now(),

	};



	try {

		sessionStorage.setItem(LAST_CHECKOUT_CONTEXT_KEY, JSON.stringify(context));

		debugLog('checkout_context_saved', context);

	} catch {

		// sessionStorage unavailable

	}

}



function loadLastCheckoutContext(): CheckoutContext | null {

	try {

		const raw = sessionStorage.getItem(LAST_CHECKOUT_CONTEXT_KEY);

		if (!raw) return null;



		const context = JSON.parse(raw) as CheckoutContext;

		if (Date.now() - context.timestamp > CHECKOUT_CONTEXT_MAX_AGE_MS) {

			return null;

		}



		return context;

	} catch {

		return null;

	}

}



function extractOrderAttributes(data: unknown): LemonOrderAttributes | null {

	if (!data || typeof data !== 'object') return null;



	const obj = data as Record<string, unknown>;



	if (obj.attributes && typeof obj.attributes === 'object') {

		return obj.attributes as LemonOrderAttributes;

	}



	if (obj.order && typeof obj.order === 'object') {

		const order = obj.order as Record<string, unknown>;

		if (order.data && typeof order.data === 'object') {

			const orderData = order.data as Record<string, unknown>;

			if (orderData.attributes && typeof orderData.attributes === 'object') {

				return orderData.attributes as LemonOrderAttributes;

			}

		}

	}



	if ('identifier' in obj || 'total' in obj || 'currency' in obj) {

		return obj as LemonOrderAttributes;

	}



	return null;

}



function centsToMajor(value: number): number {

	return Math.round((value / 100) * 100) / 100;

}



function parseNumericPrice(value: string | number | undefined): number | undefined {

	if (value === undefined) return undefined;

	const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));

	return Number.isFinite(parsed) ? parsed : undefined;

}



function purchaseDedupeKey(transactionId: string): string {

	return `strategicSlothPurchase:${transactionId}`;

}



function hasPurchaseBeenTracked(transactionId: string): boolean {

	try {

		return sessionStorage.getItem(purchaseDedupeKey(transactionId)) === '1';

	} catch {

		return false;

	}

}



function markPurchaseTracked(transactionId: string): void {

	try {

		sessionStorage.setItem(purchaseDedupeKey(transactionId), '1');

	} catch {

		// sessionStorage unavailable

	}

}



function resolveMetaEvent(eventName: string, metaOverride?: string): string | null {

	switch (eventName) {

		case 'cta_click':

			return metaOverride === 'ViewContent' ? 'ViewContent' : 'Lead';

		case 'pricing_click':

			return 'ViewContent';

		case 'checkout_click':

			return 'InitiateCheckout';

		case 'email_signup_click':

			return 'Lead';

		default:

			return null;

	}

}



function sendPurchaseToMeta(params: Record<string, unknown>): void {

	try {

		if (typeof window.fbq !== 'function') return;



		const metaParams: Record<string, unknown> = {};

		if (params.value != null) metaParams.value = params.value;

		if (params.currency) metaParams.currency = params.currency;

		if (params.product) metaParams.content_name = params.product;



		window.fbq('track', 'Purchase', metaParams);

	} catch {

		// fbq blocked or unavailable

	}

}



function sendPurchaseToGa4(params: Record<string, unknown>): void {

	try {

		if (typeof window.gtag !== 'function') return;



		const gaParams: Record<string, unknown> = {

			transaction_id: params.transaction_id,

			value: params.value,

			currency: params.currency,

		};



		if (params.product) {

			gaParams.items = [

				{

					item_id: params.product_id ?? params.product,

					item_name: params.product,

					price: params.value,

					quantity: 1,

				},

			];

		}



		window.gtag('event', 'purchase', gaParams);

	} catch {

		// gtag blocked or unavailable

	}

}



function sendToMeta(eventName: string, params: Record<string, unknown>, metaOverride?: string): void {

	try {

		if (typeof window.fbq !== 'function') return;



		if (eventName === 'scroll_depth') {

			window.fbq('trackCustom', 'scroll_depth', params);

			return;

		}



		const metaEvent = resolveMetaEvent(eventName, metaOverride);

		if (!metaEvent) return;



		window.fbq('track', metaEvent, params);

	} catch {

		// fbq blocked or unavailable

	}

}



function sendToGa4(eventName: string, params: Record<string, unknown>): void {

	try {

		if (typeof window.gtag !== 'function') return;

		window.gtag('event', eventName, params);

	} catch {

		// gtag blocked or unavailable

	}

}



export function trackEvent(

	eventName: string,

	params: Record<string, unknown> = {},

	metaOverride?: string,

): void {

	const payload = {

		...getStoredUtms(),

		page_path: window.location.pathname,

		...params,

	};



	debugLog(eventName, payload);



	if (eventName === 'purchase') {

		sendPurchaseToMeta(payload);

		sendPurchaseToGa4(payload);

		return;

	}



	sendToMeta(eventName, payload, metaOverride);

	sendToGa4(eventName, payload);

}



function handleCheckoutSuccess(event: LemonCheckoutEvent): void {

	const attrs = extractOrderAttributes(event.data);

	const lastContext = loadLastCheckoutContext();



	const orderId =

		(typeof event.data === 'object' &&

			event.data !== null &&

			'id' in event.data &&

			(event.data as { id?: string }).id) ||

		undefined;



	const transactionId =

		attrs?.identifier ??

		(orderId ? `ls-order-${orderId}` : undefined) ??

		`ls-${Date.now()}`;



	if (hasPurchaseBeenTracked(transactionId)) {

		debugLog('purchase_skipped_duplicate', transactionId);

		return;

	}



	let value: number | undefined;

	let valueSource = 'unknown';



	if (typeof attrs?.total === 'number') {

		value = centsToMajor(attrs.total);

		valueSource = 'lemon_total_cents';

	} else if (typeof attrs?.first_order_item?.price === 'number') {

		value = centsToMajor(attrs.first_order_item.price);

		valueSource = 'lemon_first_order_item_price_cents';

	} else {

		const fallbackPrice = parseNumericPrice(lastContext?.price);

		if (fallbackPrice !== undefined) {

			value = fallbackPrice;

			valueSource = 'data_track_price_fallback';

		}

	}



	const currency = attrs?.currency ?? 'USD';

	const currencySource = attrs?.currency ? 'lemon_payload' : 'default_usd_fallback';



	const product =

		attrs?.first_order_item?.product_name ??

		lastContext?.product ??

		attrs?.first_order_item?.variant_name;



	const productSource = attrs?.first_order_item?.product_name

		? 'lemon_first_order_item'

		: lastContext?.product

			? 'data_track_product_fallback'

			: attrs?.first_order_item?.variant_name

				? 'lemon_variant_name_fallback'

				: 'unknown';



	const productId =

		attrs?.first_order_item?.product_id ??

		attrs?.first_order_item?.variant_id ??

		lastContext?.product;



	markPurchaseTracked(transactionId);



	trackEvent('purchase', {

		value,

		currency,

		transaction_id: transactionId,

		product,

		product_id: productId,

		order_number: attrs?.order_number,

		value_source: valueSource,

		currency_source: currencySource,

		product_source: productSource,

		checkout_location: lastContext?.location,

		checkout_button_text: lastContext?.button_text,

	});



	debugLog('purchase_tracked', {

		transactionId,

		value,

		valueSource,

		currency,

		currencySource,

		product,

		productSource,

		lemonPayload: attrs,

		fallbackContext: lastContext,

	});

}



let lemonListenerInitialized = false;



function initLemonSuccessListener(): void {

	if (lemonListenerInitialized) return;



	let attempts = 0;

	const maxAttempts = 50;



	const trySetup = (): void => {

		if (window.LemonSqueezy?.Setup) {

			lemonListenerInitialized = true;

			window.LemonSqueezy.Setup({

				eventHandler: (event) => {

					debugLog('lemon_event', event.event, event.data);



					if (event.event === 'Checkout.Success') {

						handleCheckoutSuccess(event);

					}

				},

			});

			debugLog('lemon_listener_ready');

			return;

		}



		attempts += 1;

		if (attempts < maxAttempts) {

			window.setTimeout(trySetup, 100);

		} else {

			debugLog('lemon_listener_unavailable');

		}

	};



	trySetup();

}



function getButtonText(el: Element): string {

	const text = (el as HTMLElement).innerText?.trim().replace(/\s+/g, ' ') ?? '';

	return text.slice(0, 200);

}



function getHref(el: Element): string | undefined {

	if (el instanceof HTMLAnchorElement) {

		return el.href || el.getAttribute('href') || undefined;

	}



	const anchor = el.closest('a');

	if (anchor) {

		return anchor.href || anchor.getAttribute('href') || undefined;

	}



	return undefined;

}



function getSectionLocation(el: Element): string | undefined {

	const explicit = (el as HTMLElement).dataset.trackLocation;

	if (explicit) return explicit;



	const section = el.closest('section[id], [id]');

	return section?.id || undefined;

}



function buildClickParams(el: Element): Record<string, unknown> {

	const dataset = (el as HTMLElement).dataset;

	const location = getSectionLocation(el);



	const params: Record<string, unknown> = {

		button_text: getButtonText(el),

		href: getHref(el),

		location,

		section: location,

	};



	if (dataset.trackProduct) params.product = dataset.trackProduct;

	if (dataset.trackPrice) params.price = dataset.trackPrice;



	return params;

}



function isExternalCheckoutWithoutOverlay(href: string): boolean {

	try {

		const url = new URL(href, window.location.origin);

		if (url.origin === window.location.origin) return false;

		if (url.hostname.includes('lemonsqueezy.com') && url.searchParams.has('embed')) {

			return false;

		}



		const checkoutHosts = [

			'gumroad.com',

			'stripe.com',

			'buy.stripe.com',

			'payhip.com',

			'lemonsqueezy.com',

		];



		return checkoutHosts.some((host) => url.hostname.includes(host));

	} catch {

		return false;

	}

}



function handleTrackedClick(el: Element, eventName: string, metaOverride?: string): void {

	trackEvent(eventName, buildClickParams(el), metaOverride);

}



let trackingInitialized = false;

const firedScrollDepths = new Set<number>();

let clickListener: ((event: Event) => void) | null = null;

let scrollListener: (() => void) | null = null;



function initScrollDepth(): void {

	let ticking = false;



	function checkScroll(): void {

		const doc = document.documentElement;

		const scrollHeight = doc.scrollHeight - window.innerHeight;

		if (scrollHeight <= 0) {

			ticking = false;

			return;

		}



		const percent = Math.round((window.scrollY / scrollHeight) * 100);



		for (const threshold of SCROLL_THRESHOLDS) {

			if (percent >= threshold && !firedScrollDepths.has(threshold)) {

				firedScrollDepths.add(threshold);

				trackEvent('scroll_depth', { depth: threshold });

			}

		}



		ticking = false;

	}



	if (scrollListener) {

		window.removeEventListener('scroll', scrollListener);

	}



	scrollListener = () => {

		if (!ticking) {

			requestAnimationFrame(checkScroll);

			ticking = true;

		}

	};



	window.addEventListener('scroll', scrollListener, { passive: true });



	checkScroll();

}



function initClickDelegation(): void {

	if (clickListener) {

		document.removeEventListener('click', clickListener, true);

	}



	clickListener = (e) => {

			const target = e.target as Element | null;

			if (!target) return;



			let trackedEl = target.closest('[data-track]') as HTMLElement | null;

			let eventName: string | undefined;

			let metaOverride: string | undefined;



			if (trackedEl) {

				eventName = trackedEl.dataset.track;

				metaOverride = trackedEl.dataset.trackMeta;

			} else {

				trackedEl = target.closest('.lemonsqueezy-button:not([data-track])') as HTMLElement | null;

				if (trackedEl) {

					eventName = 'checkout_click';

				}

			}



			if (!trackedEl || !eventName) return;



			const anchor =

				trackedEl instanceof HTMLAnchorElement ? trackedEl : trackedEl.closest('a');



			if (anchor instanceof HTMLAnchorElement) {

				applyUtmPassthroughToAnchor(anchor);



				if (eventName === 'checkout_click') {

					saveLastCheckoutContext(trackedEl, anchor);

				}

			}



			handleTrackedClick(trackedEl, eventName, metaOverride);



			if (

				anchor?.href &&

				isExternalCheckoutWithoutOverlay(anchor.href) &&

				anchor.target !== '_blank'

			) {

				e.preventDefault();

				const href = anchor.href;

				window.setTimeout(() => {

					window.location.href = href;

				}, 150);

			}

	};



	document.addEventListener('click', clickListener, true);

}



export function initTracking(): void {

	if (trackingInitialized || typeof window === 'undefined') return;



	window.__strategicSlothTrackingCleanup?.();

	window.__strategicSlothTrackingCleanup = () => {

		if (clickListener) {

			document.removeEventListener('click', clickListener, true);

			clickListener = null;

		}



		if (scrollListener) {

			window.removeEventListener('scroll', scrollListener);

			scrollListener = null;

		}



		firedScrollDepths.clear();

		trackingInitialized = false;

		lemonListenerInitialized = false;

	};



	trackingInitialized = true;



	captureUtmsFromUrl();

	initLemonUtmPassthrough();

	initClickDelegation();

	initScrollDepth();

	initLemonSuccessListener();



	if (isDebugEnabled()) {

		debugLog('initialized', {

			fbq: typeof window.fbq === 'function',

			gtag: typeof window.gtag === 'function',

			lemon: typeof window.LemonSqueezy !== 'undefined',

			utm: getStoredUtms(),

		});

	}

}


