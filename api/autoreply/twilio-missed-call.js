// POST /api/autoreply/twilio-missed-call  (Twilio voice status callback or <Dial action>)
// When a call to a client's Twilio number goes unanswered, text the caller back.
// Env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, optional TWILIO_WEBHOOK_URL (the exact public URL Twilio calls).
import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../../server/autoreply/config.js';
import { getOrder } from '../../server/autoreply/orders.js';
import { getJSON } from '../../server/autoreply/store.js';

const MISSED = new Set(['no-answer', 'busy', 'failed', 'canceled']);

const defaults = {
  ca: (name) => `Bonjour! Désolé d’avoir manqué votre appel${name ? ` chez ${name}` : ''}. Répondez à ce texto avec votre question et on vous revient rapidement. (English? Just reply in English.)`,
  mx: (name) => `¡Hola! Perdón por no contestar su llamada${name ? ` en ${name}` : ''}. Responda este mensaje con su pregunta y le contestamos pronto. (English? Just reply in English.)`,
};

/** Twilio request signature: HMAC-SHA1 over the URL plus sorted key/value pairs. */
export function validSignature(authToken, url, params, signature) {
  const payload = url + Object.keys(params).sort().map((k) => k + params[k]).join('');
  const expected = createHmac('sha1', authToken).update(payload).digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature ?? '');
  return a.length === b.length && timingSafeEqual(a, b);
}

export function missedCallText(order) {
  const custom = order.onboarding?.sms?.missedCallText?.trim();
  return custom || defaults[order.region === 'ca' ? 'ca' : 'mx'](order.businessName);
}

const twiml = () => new Response('<?xml version="1.0" encoding="UTF-8"?><Response/>', { headers: { 'Content-Type': 'text/xml' } });

export async function POST(request) {
  const sid = env('TWILIO_ACCOUNT_SID');
  const token = env('TWILIO_AUTH_TOKEN');
  if (!sid || !token) return new Response('twilio not configured', { status: 500 });
  const params = Object.fromEntries(new URLSearchParams(await request.text()));
  const url = env('TWILIO_WEBHOOK_URL', request.url);
  if (!validSignature(token, url, params, request.headers.get('x-twilio-signature'))) return new Response('bad signature', { status: 403 });

  const status = params.DialCallStatus ?? params.CallStatus;
  if (!MISSED.has(status) || !params.From || !params.To) return twiml();
  const link = await getJSON(`twilio:${params.To}`);
  const order = link && (await getOrder(link.orderId));
  if (!order || order.status !== 'live') return twiml();

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ From: params.To, To: params.From, Body: missedCallText(order) }),
  });
  if (!res.ok) console.error('[autoreply] Twilio send failed', res.status, await res.text());
  return twiml();
}
