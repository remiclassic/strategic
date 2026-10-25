// Orders are keyed by Stripe Checkout Session ID. Stripe stays the source of truth for money;
// this record holds status, the business details and the onboarding answers.
import Stripe from 'stripe';
import { env, offer, planNames, regionOf, LOCALES } from './config.js';
import { getJSON, setJSON, indexOrder, listOrderIds, incr, getNumber } from './store.js';
import { httpError } from './http.js';

let stripeClient;
export function stripe() {
  const key = env('STRIPE_SECRET_KEY');
  if (!key) throw httpError(500, 'stripe_not_configured');
  return (stripeClient ??= new Stripe(key));
}

export const getOrder = (id) => getJSON(`order:${id}`);

export async function saveOrder(order) {
  order.updatedAt = new Date().toISOString();
  await setJSON(`order:${order.id}`, order);
  return order;
}

export async function listOrders() {
  const ids = await listOrderIds();
  const orders = await Promise.all(ids.map((id) => getOrder(id)));
  return orders.filter(Boolean);
}

const fieldValue = (session, key) => session.custom_fields?.find((f) => f.key === key)?.text?.value ?? '';

/** Creates or refreshes the order from a Checkout Session. Safe to call from the webhook and the onboarding page. */
export async function upsertFromSession(session) {
  const meta = session.metadata ?? {};
  const locale = LOCALES.includes(meta.locale) ? meta.locale : 'es';
  const region = regionOf(locale);
  const paid = session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
  const existing = await getOrder(session.id);
  const now = new Date().toISOString();
  const order = existing ?? {
    id: session.id,
    createdAt: now,
    status: 'awaiting_payment',
    locale,
    region,
    plan: meta.plan,
    planName: planNames[region][meta.plan] ?? meta.plan,
    pilot: meta.pilot === '1',
    method: meta.method ?? 'card',
    currency: (session.currency ?? '').toUpperCase(),
    monthlyPrice: meta.monthly_price ?? null,
    onboarding: {},
    history: [],
    flags: {},
  };
  order.businessName = fieldValue(session, 'business_name') || order.businessName || '';
  order.email = session.customer_details?.email ?? order.email ?? '';
  order.contactName = session.customer_details?.name ?? order.contactName ?? '';
  order.phone = session.customer_details?.phone ?? order.phone ?? '';
  order.stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? order.stripeCustomerId ?? null;
  order.stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? order.stripeSubscriptionId ?? null;
  order.amountTotal = session.amount_total ?? order.amountTotal ?? null;
  if (paid && order.status === 'awaiting_payment') setStatus(order, 'paid');
  if (!existing) await indexOrder(order.id, order.createdAt);
  if (paid && order.pilot && !order.flags.pilotCounted) {
    order.flags.pilotCounted = true;
    await incr(`pilot:${region}`);
  }
  return saveOrder(order);
}

export function setStatus(order, status, by = 'system') {
  if (order.status === status) return order;
  order.history.push({ at: new Date().toISOString(), from: order.status, to: status, by });
  order.status = status;
  return order;
}

/** Looks up an order, falling back to Stripe when the webhook has not landed yet. */
export async function orderForSession(sessionId) {
  const existing = await getOrder(sessionId);
  if (existing) return existing;
  const session = await stripe().checkout.sessions.retrieve(sessionId).catch(() => null);
  if (!session || session.status !== 'complete' || session.metadata?.offer !== 'autoreply') throw httpError(404, 'order_not_found');
  return upsertFromSession(session);
}

/** What the client sees on the onboarding page. No Stripe IDs, no history. */
export const publicOrder = (order) => ({
  status: order.status,
  locale: order.locale,
  region: order.region,
  plan: order.plan,
  planName: order.planName,
  pilot: order.pilot,
  businessName: order.businessName,
  email: order.email,
  onboarding: order.onboarding ?? {},
  meta: order.meta ? { connected: true, phoneNumberId: order.meta.phoneNumberId, wabaId: order.meta.wabaId } : null,
  submittedAt: order.submittedAt ?? null,
});

export const pilotSpotsLeft = async (region) => {
  const pilot = offer.regions[region].pilot;
  const taken = await getNumber(`pilot:${region}`);
  return Math.max(0, Math.min(pilot.spotsLeft, pilot.spotsTotal - taken));
};
