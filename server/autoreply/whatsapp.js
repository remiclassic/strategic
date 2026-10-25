// WhatsApp Cloud API helpers: webhook signature, inbound parsing, sending inside the 24-hour window.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from './config.js';

export const WINDOW_MS = 24 * 3600 * 1000;

/** Meta signs the raw body with the app secret: header X-Hub-Signature-256: sha256=<hex>. */
export function validMetaSignature(appSecret, rawBody, header) {
  if (!appSecret || !header?.startsWith('sha256=')) return false;
  const expected = Buffer.from(createHmac('sha256', appSecret).update(rawBody).digest('hex'));
  const given = Buffer.from(header.slice(7));
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Flattens a webhook payload into inbound messages. Status updates and echoes are ignored. */
export function inboundMessages(payload) {
  const out = [];
  for (const entry of payload?.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value ?? {};
      const names = Object.fromEntries((value.contacts ?? []).map((c) => [c.wa_id, c.profile?.name]));
      for (const m of value.messages ?? []) {
        out.push({
          id: m.id,
          from: m.from,
          name: names[m.from] ?? null,
          phoneNumberId: value.metadata?.phone_number_id,
          timestamp: Number(m.timestamp) * 1000 || Date.now(),
          type: m.type,
          text: m.type === 'text' ? m.text?.body ?? '' : m.type === 'button' ? m.button?.text ?? '' : m.type === 'interactive' ? (m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title ?? '') : '',
        });
      }
    }
  }
  return out;
}

export const insideWindow = (lastInboundAt, now = Date.now()) => Boolean(lastInboundAt) && now - Date.parse(lastInboundAt) < WINDOW_MS;

export async function sendWhatsAppText({ phoneNumberId, token, to, text }) {
  if (!token) throw new Error('no WhatsApp token for this number');
  const res = await fetch(`https://graph.facebook.com/${env('META_GRAPH_VERSION', 'v23.0')}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { preview_url: false, body: text } }),
  });
  if (!res.ok) throw new Error(`WhatsApp send ${res.status}: ${await res.text()}`);
  return res.json();
}
