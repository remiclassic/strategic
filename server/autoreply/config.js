// Shared server config for the 24/7 auto-reply offer. Plain ESM so it runs on Vercel and in `npm run dev:api` as is.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
/** @type {{ regions: Record<'mx'|'ca', any> }} */
export const offer = require('../../src/data/autoreply.json');

export const LOCALES = ['es', 'en', 'fr', 'en-CA'];
export const STATUSES = ['awaiting_payment', 'paid', 'onboarding', 'ready_for_review', 'live', 'payment_failed', 'cancelled'];

export const regionOf = (locale) => (locale === 'fr' || locale === 'en-CA' ? 'ca' : 'mx');

const base = { es: '/es/whatsapp-autoreply/', en: '/whatsapp-autoreply/', fr: '/fr/whatsapp-autoreply/', 'en-CA': '/ca/whatsapp-autoreply/' };
export const pagePath = (locale) => base[locale] ?? base.en;
export const onboardingPath = (locale) => `${pagePath(locale)}onboarding/`;
export const termsPath = (locale) => `${pagePath(locale)}${locale === 'es' ? 'terminos' : locale === 'fr' ? 'conditions' : 'terms'}/`;

export const planNames = {
  mx: { basic: 'Básico', bookings: 'Reservas', complete: 'Completo' },
  ca: { basic: 'Essentiel', bookings: 'Réservations', complete: 'Complet' },
};

export const env = (name, fallback) => {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
};

export const siteUrl = () => env('SITE_URL', 'https://strategicsloth.com').replace(/\/$/, '');

/** Stripe price ID from env, e.g. STRIPE_PRICE_MXN_BOOKINGS_SETUP or STRIPE_PRICE_CAD_PILOT_SETUP. */
export function priceId(currency, plan, kind) {
  const name = `STRIPE_PRICE_${currency.toUpperCase()}_${plan.toUpperCase()}_${kind.toUpperCase()}`;
  const id = env(name);
  if (!id) throw Object.assign(new Error(`Missing env var ${name}`), { status: 500, code: 'price_not_configured' });
  return id;
}

export function findPlan(region, planId) {
  return offer.regions[region]?.plans.find((p) => p.id === planId);
}
