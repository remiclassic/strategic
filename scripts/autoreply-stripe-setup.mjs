// Creates the Stripe products and prices for the auto-reply offer from src/data/autoreply.json,
// then prints the STRIPE_PRICE_* env lines to paste into Vercel.
// Run once per Stripe mode:  STRIPE_SECRET_KEY=sk_test_... npm run autoreply:stripe-setup
// Safe to re-run: prices are found by lookup_key. Changing an amount in the JSON creates a new price
// and moves the lookup_key to it; the old price stays in Stripe for existing subscriptions.
import { existsSync } from 'node:fs';
import Stripe from 'stripe';
import { offer, planNames } from '../server/autoreply/config.js';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');
if (!process.env.STRIPE_SECRET_KEY) { console.error('Set STRIPE_SECRET_KEY first.'); process.exit(1); }
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const lines = [];

async function product(key, name) {
  const found = await stripe.products.search({ query: `metadata['autoreply_key']:'${key}'` });
  return found.data[0] ?? stripe.products.create({ name, metadata: { autoreply_key: key, offer: 'autoreply' } });
}

async function price(productId, currency, amount, lookupKey, recurring) {
  const existing = (await stripe.prices.list({ lookup_keys: [lookupKey], active: true })).data[0];
  if (existing && existing.unit_amount === amount * 100 && existing.currency === currency.toLowerCase()) return existing;
  return stripe.prices.create({
    product: productId,
    currency: currency.toLowerCase(),
    unit_amount: amount * 100,
    lookup_key: lookupKey,
    transfer_lookup_key: true,
    tax_behavior: 'exclusive',
    ...(recurring ? { recurring: { interval: 'month' } } : {}),
    metadata: { offer: 'autoreply' },
  });
}

for (const [region, cfg] of Object.entries(offer.regions)) {
  const cur = cfg.currency;
  for (const plan of cfg.plans) {
    const name = planNames[region][plan.id];
    const setup = await product(`${region}-${plan.id}-setup`, `${name} · ${region === 'ca' ? 'mise en place / setup' : 'configuración / setup'} (${cur})`);
    const care = await product(`${region}-${plan.id}-care`, `${name} · ${region === 'ca' ? 'entretien mensuel / monthly care' : 'cuidado mensual / monthly care'} (${cur})`);
    const s = await price(setup.id, cur, plan.setup, `autoreply_${region}_${plan.id}_setup`, false);
    const m = await price(care.id, cur, plan.monthly, `autoreply_${region}_${plan.id}_monthly`, true);
    lines.push(`STRIPE_PRICE_${cur}_${plan.id.toUpperCase()}_SETUP=${s.id}`, `STRIPE_PRICE_${cur}_${plan.id.toUpperCase()}_MONTHLY=${m.id}`);
  }
  const pilotProduct = await product(`${region}-pilot-setup`, `${planNames[region][cfg.pilot.plan]} · pilot setup (${cur})`);
  const p = await price(pilotProduct.id, cur, cfg.pilot.setup, `autoreply_${region}_pilot_setup`, false);
  lines.push(`STRIPE_PRICE_${cur}_PILOT_SETUP=${p.id}`);
}

console.log(lines.join('\n'));
