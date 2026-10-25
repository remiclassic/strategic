// GET  /api/autoreply/admin              all orders (Authorization: Bearer ADMIN_PASSWORD)
// GET  /api/autoreply/admin?export=ID    one order shaped for the bot
// GET  /api/autoreply/admin?drafts=1     replies waiting for approval
// POST /api/autoreply/admin  { id, action: 'status', status } | { id, action: 'twilio', number } | { id, action: 'start_care' }
//                            | { id, action: 'bot_mode', mode: 'approve'|'auto'|'default' }
//                            | { draftId, action: 'draft_approve', text? } | { draftId, action: 'draft_reject' }
import { recordApproved, loadConversation } from '../../server/autoreply/bot.js';
import { SLOTH_ID, botExport, botMode, clientFromOrder, slothClient, whatsappTokenFor } from '../../server/autoreply/clients.js';
import { STATUSES } from '../../server/autoreply/config.js';
import { checkAdmin, fail, httpError, json, preflight, readBody } from '../../server/autoreply/http.js';
import { getOrder, listOrders, saveOrder, setStatus, stripe } from '../../server/autoreply/orders.js';
import { del, getJSON, listDraftIds, setJSON, unindexDraft } from '../../server/autoreply/store.js';
import { insideWindow, sendWhatsAppText } from '../../server/autoreply/whatsapp.js';

export { botExport };

async function listDrafts() {
  const drafts = (await Promise.all((await listDraftIds()).map((id) => getJSON(`draft:${id}`)))).filter(Boolean);
  return Promise.all(drafts.map(async (d) => {
    const conv = await loadConversation(d.clientId, d.customer.id);
    return { ...d, windowOpen: d.customer.channel !== 'whatsapp' || insideWindow(conv.lastInboundAt) };
  }));
}

async function clientById(id) {
  if (id === SLOTH_ID) return slothClient();
  const order = await getOrder(id);
  return order && clientFromOrder(order);
}

async function approveDraft(draftId, editedText, deps = {}) {
  const draft = await getJSON(`draft:${draftId}`);
  if (!draft) throw httpError(404, 'draft_not_found');
  const text = String(editedText ?? draft.text).trim().slice(0, 4000);
  if (!text) throw httpError(400, 'empty_reply');
  if (draft.customer.channel === 'whatsapp') {
    const conv = await loadConversation(draft.clientId, draft.customer.id);
    // Free-form WhatsApp replies are only allowed within 24 hours of the customer's last message.
    if (!insideWindow(conv.lastInboundAt)) throw httpError(409, 'whatsapp_window_closed');
    const client = await clientById(draft.clientId);
    if (!client) throw httpError(404, 'client_not_found');
    await (deps.send ?? sendWhatsAppText)({ phoneNumberId: draft.customer.phoneNumberId, token: await whatsappTokenFor(client), to: draft.customer.replyTo, text });
  }
  await recordApproved(draft, text);
  await Promise.all([del(`draft:${draftId}`), unindexDraft(draftId)]);
}

export const OPTIONS = preflight;

export async function GET(request) {
  try {
    checkAdmin(request);
    const q = new URL(request.url).searchParams;
    if (q.get('drafts')) return json(request, { drafts: await listDrafts() });
    const exportId = q.get('export');
    if (exportId) {
      const order = await getOrder(exportId);
      if (!order) throw httpError(404, 'order_not_found');
      return json(request, botExport(order));
    }
    const orders = (await listOrders()).map((o) => ({ ...o, botModeEffective: botMode(o) }));
    return json(request, { orders });
  } catch (error) {
    return fail(request, error);
  }
}

export async function POST(request) {
  try {
    checkAdmin(request);
    const body = await readBody(request, 10_000);
    if (body.action === 'draft_approve') {
      await approveDraft(String(body.draftId ?? ''), body.text);
      return json(request, { ok: true });
    }
    if (body.action === 'draft_reject') {
      await Promise.all([del(`draft:${body.draftId}`), unindexDraft(String(body.draftId ?? ''))]);
      return json(request, { ok: true });
    }
    const order = await getOrder(String(body.id ?? ''));
    if (!order) throw httpError(404, 'order_not_found');
    if (body.action === 'status') {
      if (!STATUSES.includes(body.status)) throw httpError(400, 'invalid_status');
      setStatus(order, body.status, 'admin');
      if (body.status === 'live') order.liveAt = new Date().toISOString();
    } else if (body.action === 'bot_mode') {
      if (!['approve', 'auto', 'default'].includes(body.mode)) throw httpError(400, 'invalid_mode');
      order.botMode = body.mode === 'default' ? null : body.mode;
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
    const saved = await saveOrder(order);
    return json(request, { order: { ...saved, botModeEffective: botMode(saved) } });
  } catch (error) {
    return fail(request, error);
  }
}

export { approveDraft };
