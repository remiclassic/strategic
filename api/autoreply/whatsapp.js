// GET  /api/autoreply/whatsapp   Meta webhook verification (WHATSAPP_VERIFY_TOKEN)
// POST /api/autoreply/whatsapp   Incoming messages for every connected number, signed with META_APP_SECRET.
// Always answers 200 quickly; the reply is worked out after the response with waitUntil.
import { waitUntil } from '@vercel/functions';
import { handleIncoming } from '../../server/autoreply/bot.js';
import { clientForPhoneNumberId, whatsappTokenFor } from '../../server/autoreply/clients.js';
import { env } from '../../server/autoreply/config.js';
import { claimOnce } from '../../server/autoreply/store.js';
import { WINDOW_MS, inboundMessages, sendWhatsAppText, validMetaSignature } from '../../server/autoreply/whatsapp.js';

export function GET(request) {
  const q = new URL(request.url).searchParams;
  const expected = env('WHATSAPP_VERIFY_TOKEN');
  if (expected && q.get('hub.mode') === 'subscribe' && q.get('hub.verify_token') === expected) {
    return new Response(q.get('hub.challenge') ?? '', { headers: { 'Content-Type': 'text/plain' } });
  }
  return new Response('forbidden', { status: 403 });
}

export async function processMessage(msg, deps = {}) {
  // Meta retries webhooks; each message id is handled once.
  if (!(await claimOnce(`wamsg:${msg.id}`, 7 * 24 * 3600))) return 'duplicate';
  // A message older than the customer service window cannot be answered with free-form text.
  if (Date.now() - msg.timestamp > WINDOW_MS) return 'outside_window';
  const client = await clientForPhoneNumberId(msg.phoneNumberId);
  if (!client) return 'no_client';
  const token = await whatsappTokenFor(client);
  const send = (text) => (deps.send ?? sendWhatsAppText)({ phoneNumberId: msg.phoneNumberId, token, to: msg.from, text });
  const text = msg.text || (msg.type !== 'text' ? `[${msg.type}]` : '');
  if (!msg.text && msg.type !== 'text') {
    // Photos, voice notes and stickers go straight to a person.
    await handleIncoming({ client, customer: customerOf(msg), text, send, model: async () => ({ reply: '', action: 'handoff' }) });
    return 'handoff_media';
  }
  await handleIncoming({ client, customer: customerOf(msg), text, send, model: deps.model });
  return 'handled';
}

const customerOf = (msg) => ({ id: `wa:${msg.from}`, label: `+${msg.from}${msg.name ? ` (${msg.name})` : ''}`, channel: 'whatsapp', replyTo: msg.from, phoneNumberId: msg.phoneNumberId });

export async function POST(request) {
  const raw = await request.text();
  if (!validMetaSignature(env('META_APP_SECRET'), raw, request.headers.get('x-hub-signature-256'))) {
    return new Response('bad signature', { status: 401 });
  }
  let payload;
  try { payload = JSON.parse(raw); } catch { return new Response('ok'); }
  const work = Promise.all(inboundMessages(payload).map((m) => processMessage(m).catch((e) => console.error('[autoreply] whatsapp', m.id, e))));
  waitUntil(work);
  return new Response('ok');
}
