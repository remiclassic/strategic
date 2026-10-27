// A "client" is one business the assistant answers for: a paid order, or Strategic Sloth itself.
// Every client has the botExport shape plus id, mode, owner email and channel ids.
import { createRequire } from 'node:module';
import { env, offer, planNames } from './config.js';
import { botLanguageRules } from './language.js';
import { getJSON } from './store.js';

const require = createRequire(import.meta.url);
const slothConfig = require('../../src/data/strategic-sloth-bot.json');

export const SLOTH_ID = 'strategic-sloth';
const FIRST_WEEK = 7 * 24 * 3600 * 1000;

export const BOT_RULES = [
  'Answer only from the approved answers below. Never invent prices, times or availability.',
  'Never confirm a booking. Take the request, say staff will confirm, and alert the staff number.',
  'Hand the chat to a person for anything not covered, complaints, refunds, medical or legal questions.',
];

/** The JSON handed to the bot setup. The Meta token stays in the store under metatoken:<id>. */
export function botExport(order) {
  const o = order.onboarding ?? {};
  return {
    exportedAt: new Date().toISOString(),
    orderId: order.id,
    region: order.region,
    locale: order.locale,
    plan: order.plan,
    planName: order.planName,
    language: botLanguageRules(order.region, order.locale),
    business: o.business ?? {},
    channels: { whatsapp: { ...(o.whatsapp ?? {}), ...(order.meta ?? {}) }, sms: o.sms ?? null },
    answers: o.answers ?? {},
    booking: o.booking ?? null,
    approvedAt: o.review?.approvedAt ?? order.submittedAt ?? null,
    rules: BOT_RULES,
    contact: { email: order.email, phone: order.phone, name: order.contactName },
  };
}

/**
 * "approve": replies wait in the admin queue. "auto": replies go out at once.
 * New clients default to approve for their first week live, as the sales pages promise.
 */
export function botMode(order, now = Date.now()) {
  if (order.botMode === 'approve' || order.botMode === 'auto') return order.botMode;
  if (!order.liveAt) return 'approve';
  return now - Date.parse(order.liveAt) < FIRST_WEEK ? 'approve' : 'auto';
}

export function clientFromOrder(order) {
  return {
    ...botExport(order),
    id: order.id,
    mode: botMode(order),
    ownerEmail: order.email,
    staffWhatsapp: order.onboarding?.booking?.staffWhatsapp || order.onboarding?.business?.phone || null,
    phoneNumberId: order.meta?.phoneNumberId ?? null,
  };
}

const money = (n, cur) => (cur === 'MXN' ? `MXN ${n.toLocaleString('en-US')}` : cur === 'USD' ? `US$${n.toLocaleString('en-US')}` : `${n} $ CAD`);

/** Plan prices written out from autoreply.json, so the bot can never drift from the pricing page. */
export function autoreplyPricesText() {
  return Object.entries(offer.regions).map(([region, cfg]) => {
    const plans = cfg.plans.map((p) => `${planNames[region][p.id]}: ${money(p.setup, cfg.currency)} setup + ${money(p.monthly, cfg.currency)} per month`).join('; ');
    const pilot = cfg.pilot.spotsLeft > 0
      ? ` Founding offer while spots last: ${planNames[region][cfg.pilot.plan]} for ${money(cfg.pilot.setup, cfg.currency)} setup, first month free.`
      : '';
    const where = { mx: 'Mexico (prices in pesos)', ca: 'Canada (prices in Canadian dollars, plus applicable taxes)', us: 'United States (prices in US dollars, plus applicable taxes)' }[region];
    return `${where}: ${plans}.${pilot}`;
  }).join(' ');
}

export function slothClient() {
  const answers = { ...slothConfig.answers, autoreplyPrices: autoreplyPricesText() };
  return {
    ...slothConfig,
    answers,
    id: SLOTH_ID,
    region: 'any',
    mode: 'auto',
    rules: BOT_RULES,
    ownerEmail: env('NOTIFY_EMAIL'),
    staffWhatsapp: null,
    phoneNumberId: env('WHATSAPP_PHONE_NUMBER_ID') ?? null,
  };
}

/** Finds who owns a WhatsApp number. Only live orders answer. */
export async function clientForPhoneNumberId(phoneNumberId) {
  if (phoneNumberId && phoneNumberId === env('WHATSAPP_PHONE_NUMBER_ID')) return slothClient();
  const link = await getJSON(`wa:${phoneNumberId}`);
  const order = link && (await getJSON(`order:${link.orderId}`));
  return order && order.status === 'live' ? clientFromOrder(order) : null;
}

/** WhatsApp token: the client's own from Embedded Signup, or WHATSAPP_TOKEN for Strategic Sloth's number. */
export async function whatsappTokenFor(client) {
  if (client.id === SLOTH_ID) return env('WHATSAPP_TOKEN') ?? null;
  return (await getJSON(`metatoken:${client.id}`))?.token ?? null;
}
