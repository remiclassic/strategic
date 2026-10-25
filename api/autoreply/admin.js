// GET  /api/autoreply/admin            all orders (Authorization: Bearer ADMIN_PASSWORD)
// POST /api/autoreply/admin  { id, action: 'status', status } | { id, action: 'twilio', number }
// GET  /api/autoreply/admin?export=ID  one order shaped for the bot platform
import { STATUSES } from '../../server/autoreply/config.js';
import { checkAdmin, fail, httpError, json, preflight, readBody } from '../../server/autoreply/http.js';
import { botLanguageRules } from '../../server/autoreply/language.js';
import { getOrder, listOrders, saveOrder, setStatus, stripe } from '../../server/autoreply/orders.js';
import { setJSON } from '../../server/autoreply/store.js';

/** The JSON handed to the bot setup. The Meta token stays in the store under metatoken:<id>. */
export function botExport(order) {
  const o = order.onboarding ?? {};
  return {
    exportedAt: new Date().toISOString(),
    orderId: order.id,
    region: order.region,
    plan: order.plan,
    planName: order.planName,
    language: botLanguageRules(order.region),
    business: o.business ?? {},
    channels: { whatsapp: { ...(o.whatsapp ?? {}), ...(order.meta ?? {}) }, sms: o.sms ?? null },
    answers: o.answers ?? {},
    booking: o.booking ?? null,
    approvedAt: o.review?.approvedAt ?? order.submittedAt ?? null,
    rules: [
      'Answer only from the approved answers below. Never invent prices, times or availability.',
      'Never confirm a booking. Take the request, say staff will confirm, and alert the staff number.',
      'Hand the chat to a person for anything not covered, complaints, refunds, medical or legal questions.',
    ],
    contact: { email: order.email, phone: order.phone, name: order.contactName },
  };
}

export const OPTIONS = preflight;

export async function GET(request) {
  try {
    checkAdmin(request);
    const exportId = new URL(request.url).searchParams.get('export');
    if (exportId) {
      const order = await getOrder(exportId);
      if (!order) throw httpError(404, 'order_not_found');
      return json(request, botExport(order));
    }
    return json(request, { orders: await listOrders() });
  } catch (error) {
    return fail(request, error);
  }
}

export async function POST(request) {
  try {
    checkAdmin(request);
    const body = await readBody(request, 5_000);
    const order = await getOrder(String(body.id ?? ''));
    if (!order) throw httpError(404, 'order_not_found');
    if (body.action === 'status') {
      if (!STATUSES.includes(body.status)) throw httpError(400, 'invalid_status');
      setStatus(order, body.status, 'admin');
      if (body.status === 'live') order.liveAt = new Date().toISOString();
    } else if (body.action === 'twilio') {
      const number = String(body.number ?? '').replace(/[^\d+]/g, '');
      if (!/^\+\d{8,15}$/.test(number)) throw httpError(400, 'invalid_number');
      order.twilioNumber = number;
      await setJSON(`twilio:${number}`, { orderId: order.id });
    } else if (body.action === 'start_care') {
      // OXXO orders paid only the setup. Start monthly care as an emailed invoice (OXXO or card can pay it).
      if (order.stripeSubscriptionId) throw httpError(409, 'already_subscribed');
      if (!order.stripeCustomerId || !order.monthlyPrice) throw httpError(400, 'missing_customer_or_price');
      const sub = await stripe().subscriptions.create({
        customer: order.stripeCustomerId,
        items: [{ price: order.monthlyPrice }],
        collection_method: 'send_invoice',
        days_until_due: 7,
        metadata: { offer: 'autoreply', order: order.id },
      });
      order.stripeSubscriptionId = sub.id;
    } else {
      throw httpError(400, 'invalid_action');
    }
    return json(request, { order: await saveOrder(order) });
  } catch (error) {
    return fail(request, error);
  }
}
