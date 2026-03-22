/**
 * Single source of truth for the $5 “Don’t Do Anything” starter PDF.
 * Hero badge + BookOffer section must stay in sync with these numbers.
 */
export const starterGuidePricing = {
	currentPrice: 5,
	regularPrice: 15,
} as const;

export function starterGuideDiscountPercent(): number {
	const { regularPrice, currentPrice } = starterGuidePricing;
	if (regularPrice <= 0) return 0;
	return Math.round(((regularPrice - currentPrice) / regularPrice) * 100);
}
