// POST /api/autoreply/checkout  (form or JSON: locale, plan, pilot?, method?)
// Card: one Checkout Session in subscription mode with the setup fee as a one-time line item.
// OXXO (Mexico only): OXXO cannot pay subscriptions, so the session takes the setup fee alone
// and the monthly plan is started later from the admin page as an invoiced subscription.
import { LOCALES, findPlan, offer, onboardingPath, pagePath, priceId, regionOf, siteUrl, termsPath } from '../../server/autoreply/config.js';
import { fail, httpError, json, preflight, readBody } from '../../server/autoreply/http.js';
import { pilotSpotsLeft, stripe } from '../../server/autoreply/orders.js';

const checkoutLocale = { es: 'es-419', en: 'en', fr: 'fr-CA', 'en-CA': 'en', 'en-US': 'en' };
const businessLabel = { es: 'Nombre del negocio', en: 'Business name', fr: 'Nom de l’entreprise', 'en-CA': 'Business name / Nom de l’entreprise', 'en-US': 'Business name' };
const termsText = {
  es: 'Al pagar acepta los términos del servicio',
  en: 'By paying you accept the terms of service',
  fr: 'En payant, vous acceptez les conditions du service',
  'en-CA': 'By paying you accept the terms of service (for Quebec clients, the French version prevails)',
  'en-US': 'By paying you accept the terms of service',
};

export async function buildSessionParams({ locale, plan: planId, pilot, method }) {
  if (!LOCALES.includes(locale)) throw httpError(400, 'invalid_locale');
  const region = regionOf(locale);
  const cfg = offer.regions[region];
  const plan = findPlan(region, planId);
  if (!plan) throw httpError(400, 'invalid_plan');
  const isPilot = pilot === '1' || pilot === true;
  const oxxo = method === 'oxxo';
  if (isPilot && (plan.id !== cfg.pilot.plan || oxxo)) throw httpError(400, 'invalid_pilot');
  if (isPilot && (await pilotSpotsLeft(region)) <= 0) throw httpError(409, 'pilot_full');
  if (oxxo && !cfg.oxxo) throw httpError(400, 'oxxo_unavailable');

  const currency = cfg.currency;
  const setupPrice = priceId(currency, isPilot ? 'pilot' : plan.id, 'setup');
  const monthlyPrice = priceId(currency, plan.id, 'monthly');
  const site = siteUrl();
  const metadata = { offer: 'autoreply', locale, region, plan: plan.id, pilot: isPilot ? '1' : '0', method: oxxo ? 'oxxo' : 'card', monthly_price: monthlyPrice };

  const params = {
    locale: checkoutLocale[locale],
    success_url: `${site}${onboardingPath(locale)}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}${pagePath(locale)}#plans`,
    custom_fields: [{ key: 'business_name', label: { type: 'custom', custom: businessLabel[locale].slice(0, 50) }, type: 'text' }],
    phone_number_collection: { enabled: true },
    custom_text: { submit: { message: `${termsText[locale]}: ${site}${termsPath(locale)}` } },
    metadata,
  };

  if (oxxo) {
    return {
      ...params,
      mode: 'payment',
      payment_method_types: ['oxxo'],
      payment_method_options: { oxxo: { expires_after_days: 3 } },
      customer_creation: 'always',
      line_items: [{ price: setupPrice, quantity: 1 }],
      payment_intent_data: { metadata },
    };
  }
  return {
    ...params,
    mode: 'subscription',
    line_items: [
      { price: setupPrice, quantity: 1 },
      { price: monthlyPrice, quantity: 1 },
    ],
    subscription_data: {
      metadata,
      ...(isPilot && cfg.pilot.freeMonths > 0 ? { trial_period_days: 30 * cfg.pilot.freeMonths } : {}),
    },
  };
}

export const OPTIONS = preflight;

export async function POST(request) {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  try {
    const body = await readBody(request, 5_000);
    const session = await stripe().checkout.sessions.create(await buildSessionParams(body));
    return wantsJson ? json(request, { url: session.url }) : Response.redirect(session.url, 303);
  } catch (error) {
    return fail(request, error);
  }
}
