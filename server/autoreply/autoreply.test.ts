// @vitest-environment node
import { createHmac } from 'node:crypto';
import { rmSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { replyLanguage } from './language.js';
import { clientEmail } from './email.js';
import { cleanOnboarding } from '../../api/autoreply/order.js';
import { validSignature, missedCallText } from '../../api/autoreply/twilio-missed-call.js';
import { buildSessionParams } from '../../api/autoreply/checkout.js';

const store = `.data/test-${process.pid}.json`;
beforeAll(() => {
  process.env.AUTOREPLY_DEV_STORE = store;
  for (const cur of ['MXN', 'CAD', 'USD']) for (const plan of ['BASIC', 'BOOKINGS', 'COMPLETE', 'PILOT']) {
    process.env[`STRIPE_PRICE_${cur}_${plan}_SETUP`] = `price_${cur}_${plan}_setup`;
    process.env[`STRIPE_PRICE_${cur}_${plan}_MONTHLY`] = `price_${cur}_${plan}_monthly`;
  }
});
afterAll(() => rmSync(store, { force: true }));

describe('reply language', () => {
  it('Quebec defaults to French and switches only on clear English', () => {
    expect(replyLanguage('ca', 'Bonjour, avez-vous de la place demain?')).toBe('fr');
    expect(replyLanguage('ca', 'ok')).toBe('fr');
    expect(replyLanguage('ca', 'Hi, what are your hours tomorrow?')).toBe('en');
    expect(replyLanguage('mx', 'Hola, ¿cuál es el precio?')).toBe('es');
    expect(replyLanguage('mx', 'Hello, how much is the tour?')).toBe('en');
  });
  it('English Canada defaults to English and the US to English with Spanish on request', () => {
    expect(replyLanguage('ca', 'Hi, are you open tomorrow?', 'en-CA')).toBe('en');
    expect(replyLanguage('ca', 'ok', 'en-CA')).toBe('en');
    expect(replyLanguage('ca', 'Bonjour, êtes-vous ouverts demain?', 'en-CA')).toBe('fr');
    expect(replyLanguage('ca', 'ok', 'fr')).toBe('fr');
    expect(replyLanguage('us', 'Hi, what are your hours?')).toBe('en');
    expect(replyLanguage('us', 'Hola, ¿cuánto cuesta el corte?')).toBe('es');
    expect(replyLanguage('us', 'gracias')).toBe('en');
  });
});

describe('checkout session params', () => {
  it('card checkout is a subscription with the setup as a one-time line', async () => {
    const p: any = await buildSessionParams({ locale: 'es', plan: 'bookings' });
    expect(p.mode).toBe('subscription');
    expect(p.line_items.map((l: any) => l.price)).toEqual(['price_MXN_BOOKINGS_setup', 'price_MXN_BOOKINGS_monthly']);
    expect(p.success_url).toContain('/es/whatsapp-autoreply/onboarding/?session_id={CHECKOUT_SESSION_ID}');
    expect(p.locale).toBe('es-419');
  });

  it('pilot uses the pilot setup price and a free first month', async () => {
    const p: any = await buildSessionParams({ locale: 'fr', plan: 'bookings', pilot: '1' });
    expect(p.line_items[0].price).toBe('price_CAD_PILOT_setup');
    expect(p.subscription_data.trial_period_days).toBe(30);
    expect(p.locale).toBe('fr-CA');
    await expect(buildSessionParams({ locale: 'fr', plan: 'basic', pilot: '1' })).rejects.toMatchObject({ code: 'invalid_pilot' });
  });

  it('OXXO is Mexico only and charges the setup alone', async () => {
    const p: any = await buildSessionParams({ locale: 'en', plan: 'basic', method: 'oxxo' });
    expect(p.mode).toBe('payment');
    expect(p.payment_method_types).toEqual(['oxxo']);
    expect(p.line_items).toHaveLength(1);
    await expect(buildSessionParams({ locale: 'fr', plan: 'basic', method: 'oxxo' })).rejects.toMatchObject({ code: 'oxxo_unavailable' });
  });

  it('the US version charges in USD with its own price IDs and no OXXO', async () => {
    const p: any = await buildSessionParams({ locale: 'en-US', plan: 'bookings' });
    expect(p.line_items.map((l: any) => l.price)).toEqual(['price_USD_BOOKINGS_setup', 'price_USD_BOOKINGS_monthly']);
    expect(p.success_url).toContain('/us/whatsapp-autoreply/onboarding/');
    const pilot: any = await buildSessionParams({ locale: 'en-US', plan: 'bookings', pilot: '1' });
    expect(pilot.line_items[0].price).toBe('price_USD_PILOT_setup');
    await expect(buildSessionParams({ locale: 'en-US', plan: 'basic', method: 'oxxo' })).rejects.toMatchObject({ code: 'oxxo_unavailable' });
  });

  it('rejects unknown plans and locales', async () => {
    await expect(buildSessionParams({ locale: 'de', plan: 'basic' })).rejects.toMatchObject({ status: 400 });
    await expect(buildSessionParams({ locale: 'es', plan: 'gold' })).rejects.toMatchObject({ code: 'invalid_plan' });
  });
});

describe('emails', () => {
  const order = { id: 'cs_test_x', locale: 'en-CA', planName: 'Réservations', pilot: false, contactName: '', businessName: 'Test' };
  it('English Canada clients get English first, then French', () => {
    const e = clientEmail('paid', order);
    expect(e.subject.indexOf('Payment')).toBeLessThan(e.subject.indexOf('Paiement'));
    expect(e.text.indexOf('Hi')).toBeLessThan(e.text.indexOf('Bonjour'));
  });
  it('US clients get English only', () => {
    const e = clientEmail('paid', { ...order, locale: 'en-US' });
    expect(e.text).toMatch(/^Hi/);
    expect(e.text).not.toMatch(/Bonjour/);
  });
  it('Spanish clients get Spanish', () => {
    expect(clientEmail('submitted', { ...order, locale: 'es' }).text).toMatch(/Gracias/);
  });
});

describe('onboarding data', () => {
  it('keeps only known sections and trims long strings', () => {
    const out = cleanOnboarding({ business: { name: 'x'.repeat(5000) }, evil: { a: 1 } });
    expect(Object.keys(out)).toEqual(['business']);
    expect(out.business.name).toHaveLength(4000);
  });
});

describe('twilio', () => {
  it('validates request signatures', () => {
    const params: Record<string, string> = { CallStatus: 'no-answer', From: '+15145550000', To: '+15145551111' };
    const url = 'https://example.com/api/autoreply/twilio-missed-call';
    const payload = url + Object.keys(params).sort().map(k => k + params[k]).join('');
    const sig = createHmac('sha1', 'secret').update(payload).digest('base64');
    expect(validSignature('secret', url, params, sig)).toBe(true);
    expect(validSignature('secret', url, params, 'nope')).toBe(false);
  });
  it('missed-call text follows the page: French for Quebec, English for Canada and the US', () => {
    expect(missedCallText({ region: 'ca', locale: 'fr', businessName: 'Garage', onboarding: {} })).toMatch(/^Bonjour/);
    expect(missedCallText({ region: 'ca', locale: 'en-CA', businessName: 'Garage', onboarding: {} })).toMatch(/^Hi/);
    expect(missedCallText({ region: 'us', locale: 'en-US', businessName: 'Garage', onboarding: {} })).toMatch(/^Hi/);
    expect(missedCallText({ region: 'mx', locale: 'es', businessName: 'Tours', onboarding: {} })).toMatch(/^¡Hola/);
  });
});
