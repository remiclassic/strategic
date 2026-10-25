// POST /api/autoreply/meta-signup  { session_id, code?, waba_id, phone_number_id, business_id? }
// Called by the onboarding page when Meta's WhatsApp Embedded Signup finishes.
// With META_APP_SECRET set, the short-lived code is exchanged for a business token, stored apart from the order.
import { env } from '../../server/autoreply/config.js';
import { fail, httpError, json, preflight, readBody, sessionIdFrom } from '../../server/autoreply/http.js';
import { orderForSession, publicOrder, saveOrder, setStatus } from '../../server/autoreply/orders.js';
import { setJSON } from '../../server/autoreply/store.js';

const ID = /^\d{5,30}$/;

async function exchangeCode(code) {
  const appId = env('META_APP_ID');
  const secret = env('META_APP_SECRET');
  if (!code || !appId || !secret) return null;
  const url = new URL(`https://graph.facebook.com/${env('META_GRAPH_VERSION', 'v23.0')}/oauth/access_token`);
  url.search = new URLSearchParams({ client_id: appId, client_secret: secret, code }).toString();
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) {
    console.error('[autoreply] Meta code exchange failed', res.status, body.error?.message);
    return null;
  }
  return body.access_token;
}

export const OPTIONS = preflight;

export async function POST(request) {
  try {
    const body = await readBody(request, 5_000);
    const order = await orderForSession(sessionIdFrom(body.session_id));
    if (!ID.test(body.waba_id ?? '') || !ID.test(body.phone_number_id ?? '')) throw httpError(400, 'invalid_meta_ids');
    const token = await exchangeCode(String(body.code ?? ''));
    if (token) await setJSON(`metatoken:${order.id}`, { token, at: new Date().toISOString() });
    order.meta = {
      wabaId: body.waba_id,
      phoneNumberId: body.phone_number_id,
      businessId: ID.test(body.business_id ?? '') ? body.business_id : null,
      tokenStored: Boolean(token),
      connectedAt: new Date().toISOString(),
    };
    if (order.status === 'paid') setStatus(order, 'onboarding', 'client');
    await saveOrder(order);
    return json(request, publicOrder(order));
  } catch (error) {
    return fail(request, error);
  }
}
