// POST /api/autoreply/chat  { session, message, locale }
// The chat bubble on strategicsloth.com. Same engine as WhatsApp, answering for Strategic Sloth itself,
// so every visitor can try the product. No login; rate-limited per IP and per chat session.
import { createHash } from 'node:crypto';
import { handleIncoming, loadConversation } from '../../server/autoreply/bot.js';
import { slothClient } from '../../server/autoreply/clients.js';
import { env } from '../../server/autoreply/config.js';
import { fail, httpError, json, preflight, readBody } from '../../server/autoreply/http.js';
import { hit } from '../../server/autoreply/store.js';

const LANGS = ['es', 'en', 'fr'];

export const OPTIONS = preflight;

const ipOf = (request) => (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';

export async function POST(request, deps = {}) {
  try {
    const body = await readBody(request, 4_000);
    const session = String(body.session ?? '');
    if (!/^[a-z0-9]{12,40}$/i.test(session)) throw httpError(400, 'invalid_session');
    const message = String(body.message ?? '').trim().slice(0, 800);
    if (!message) throw httpError(400, 'empty_message');
    const locale = LANGS.includes(body.locale) ? body.locale : 'en';

    // Hashed so raw IPs are never stored.
    const ip = createHash('sha256').update(ipOf(request)).digest('hex').slice(0, 24);
    const perHour = Number(env('CHAT_LIMIT_PER_HOUR', '30'));
    if ((await hit(`rl:chat:ip:${ip}`, 3600)) > perHour) throw httpError(429, 'rate_limited');
    if ((await hit(`rl:chat:s:${session}`, 24 * 3600)) > 60) throw httpError(429, 'rate_limited');

    let reply = '';
    const result = await handleIncoming({
      client: slothClient(),
      customer: { id: `web:${session}`, label: `site chat ${session.slice(0, 8)}`, channel: 'web' },
      text: message,
      defaultLanguage: (await loadConversation('strategic-sloth', `web:${session}`)).language ?? locale,
      send: async (text) => { reply = text; },
      model: deps.model,
    });
    return json(request, { reply, action: result.action, language: result.language });
  } catch (error) {
    return fail(request, error);
  }
}
