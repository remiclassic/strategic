declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"anti-hustle-manifesto.md": {
	id: "anti-hustle-manifesto.md";
  slug: "anti-hustle-manifesto";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"asset-protection-101.md": {
	id: "asset-protection-101.md";
  slug: "asset-protection-101";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"best-countries-incorporate-online-business.md": {
	id: "best-countries-incorporate-online-business.md";
  slug: "best-countries-incorporate-online-business";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"build-digital-products-without-coding.md": {
	id: "build-digital-products-without-coding.md";
  slug: "build-digital-products-without-coding";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"caribbean-citizenship-by-investment.md": {
	id: "caribbean-citizenship-by-investment.md";
  slug: "caribbean-citizenship-by-investment";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"content-that-actually-converts.md": {
	id: "content-that-actually-converts.md";
  slug: "content-that-actually-converts";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"digital-nomad-tax-mistakes.md": {
	id: "digital-nomad-tax-mistakes.md";
  slug: "digital-nomad-tax-mistakes";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"digital-products-you-can-create-this-weekend.md": {
	id: "digital-products-you-can-create-this-weekend.md";
  slug: "digital-products-you-can-create-this-weekend";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"email-list-for-creators.md": {
	id: "email-list-for-creators.md";
  slug: "email-list-for-creators";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"estonia-e-residency-review.md": {
	id: "estonia-e-residency-review.md";
  slug: "estonia-e-residency-review";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"five-flags-theory-explained.md": {
	id: "five-flags-theory-explained.md";
  slug: "five-flags-theory-explained";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"focus-like-a-sloth.md": {
	id: "focus-like-a-sloth.md";
  slug: "focus-like-a-sloth";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"how-to-become-tax-non-resident.md": {
	id: "how-to-become-tax-non-resident.md";
  slug: "how-to-become-tax-non-resident";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"how-to-make-money-selling-digital-products.md": {
	id: "how-to-make-money-selling-digital-products.md";
  slug: "how-to-make-money-selling-digital-products";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"how-to-price-digital-products.md": {
	id: "how-to-price-digital-products.md";
  slug: "how-to-price-digital-products";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"how-to-quit-your-9-to-5.md": {
	id: "how-to-quit-your-9-to-5.md";
  slug: "how-to-quit-your-9-to-5";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"idea-to-pdf-in-24-hours.md": {
	id: "idea-to-pdf-in-24-hours.md";
  slug: "idea-to-pdf-in-24-hours";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"lazy-launch-method.md": {
	id: "lazy-launch-method.md";
  slug: "lazy-launch-method";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"legal-residency-abroad-without-moving.md": {
	id: "legal-residency-abroad-without-moving.md";
  slug: "legal-residency-abroad-without-moving";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"nevis-llc-vs-cook-islands-trust.md": {
	id: "nevis-llc-vs-cook-islands-trust.md";
  slug: "nevis-llc-vs-cook-islands-trust";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"offshore-banking-for-beginners.md": {
	id: "offshore-banking-for-beginners.md";
  slug: "offshore-banking-for-beginners";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"passive-income-selling-pdfs.md": {
	id: "passive-income-selling-pdfs.md";
  slug: "passive-income-selling-pdfs";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"pricing-your-digital-products.md": {
	id: "pricing-your-digital-products.md";
  slug: "pricing-your-digital-products";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"second-passport-cost-comparison.md": {
	id: "second-passport-cost-comparison.md";
  slug: "second-passport-cost-comparison";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"second-passport-through-ancestry.md": {
	id: "second-passport-through-ancestry.md";
  slug: "second-passport-through-ancestry";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"sell-without-an-audience.md": {
	id: "sell-without-an-audience.md";
  slug: "sell-without-an-audience";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"simple-landing-pages-that-convert.md": {
	id: "simple-landing-pages-that-convert.md";
  slug: "simple-landing-pages-that-convert";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"stop-overthinking-start-shipping.md": {
	id: "stop-overthinking-start-shipping.md";
  slug: "stop-overthinking-start-shipping";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"swiss-bank-account-non-resident.md": {
	id: "swiss-bank-account-non-resident.md";
  slug: "swiss-bank-account-non-resident";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"the-anti-hustle-playbook.md": {
	id: "the-anti-hustle-playbook.md";
  slug: "the-anti-hustle-playbook";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"the-offer-that-sells-itself.md": {
	id: "the-offer-that-sells-itself.md";
  slug: "the-offer-that-sells-itself";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"the-one-page-sales-funnel.md": {
	id: "the-one-page-sales-funnel.md";
  slug: "the-one-page-sales-funnel";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"uae-freezone-company-setup.md": {
	id: "uae-freezone-company-setup.md";
  slug: "uae-freezone-company-setup";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"where-to-sell-digital-products-2026.md": {
	id: "where-to-sell-digital-products-2026.md";
  slug: "where-to-sell-digital-products-2026";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"why-youre-not-making-money-online-yet.md": {
	id: "why-youre-not-making-money-online-yet.md";
  slug: "why-youre-not-making-money-online-yet";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"wise-vs-revolut-vs-payoneer.md": {
	id: "wise-vs-revolut-vs-payoneer.md";
  slug: "wise-vs-revolut-vs-payoneer";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"wyoming-llc-vs-uk-llp-vs-estonia.md": {
	id: "wyoming-llc-vs-uk-llp-vs-estonia.md";
  slug: "wyoming-llc-vs-uk-llp-vs-estonia";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"your-first-100-online.md": {
	id: "your-first-100-online.md";
  slug: "your-first-100-online";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zero-tax-countries-digital-nomads.md": {
	id: "zero-tax-countries-digital-nomads.md";
  slug: "zero-tax-countries-digital-nomads";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zero-to-1k-per-month.md": {
	id: "zero-to-1k-per-month.md";
  slug: "zero-to-1k-per-month";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("./../../src/content/config.js");
}
