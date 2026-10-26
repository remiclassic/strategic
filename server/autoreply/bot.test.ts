// @vitest-environment node
import { createHmac } from 'node:crypto';
import { rmSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { CANNED, handleIncoming, hasContactDetails, inventedNumbers, loadConversation, runBot, soundsConfirmed } from './bot.js';
import { botMode, slothClient } from './clients.js';
import { detectLanguage } from './language.js';
import { inboundMessages, insideWindow, validMetaSignature } from './whatsapp.js';
import { processMessage, GET as verify } from '../../api/autoreply/whatsapp.js';
import { POST as chat } from '../../api/autoreply/chat.js';
import { approveDraft } from '../../api/autoreply/admin.js';
import { listDraftIds } from './store.js';

const store = `.data/bot-test-${process.pid}.json`;
beforeAll(() => {
  process.env.AUTOREPLY_DEV_STORE = store;
  process.env.WHATSAPP_PHONE_NUMBER_ID = '1234567890';
  process.env.WHATSAPP_VERIFY_TOKEN = 'verify-me';
  delete process.env.RESEND_API_KEY;
});
afterAll(() => rmSync(store, { force: true }));

const tour = {
  id: 'order_1', region: 'mx', mode: 'auto', ownerEmail: 'owner@example.com', rules: [],
  business: { name: 'Cenotes Demo', hours: 'Lunes a sábado, 8:00 a 18:00' },
  answers: { prices: 'Snorkel: MXN 900 por persona.', howToBook: 'Mande fecha y número de personas.' },
  booking: { confirms: 'Ana', capacity: '12 personas' },
};
const says = (reply: string, action = 'answer') => async () => ({ reply, action });

describe('engine rules', () => {
  it('passes approved prices through', async () => {
    const r = await runBot({ client: tour, message: '¿Cuánto cuesta el snorkel?', model: says('Cuesta MXN 900 por persona.') });
    expect(r).toMatchObject({ action: 'answer', language: 'es', reply: 'Cuesta MXN 900 por persona.' });
  });

  it('never lets an invented price or time out', async () => {
    const r = await runBot({ client: tour, message: '¿Cuánto cuesta?', model: says('Cuesta MXN 750 por persona.') });
    expect(r.action).toBe('handoff');
    expect(r.reason).toBe('unapproved_number');
    expect(inventedNumbers('Abrimos a las 9:30', tour)).toEqual(['930']);
    expect(inventedNumbers('Abrimos a las 8:00, 24/7 por chat', tour)).toEqual([]);
  });

  it('allows numbers the customer wrote', async () => {
    const r = await runBot({ client: tour, message: 'Somos 4 personas, ¿cómo reservo?', model: says('Para 4 personas, mande la fecha. Ana se lo confirma.', 'booking') });
    expect(r.action).toBe('booking');
  });

  it('never confirms a booking', async () => {
    expect(soundsConfirmed('Your booking is confirmed for tomorrow.')).toBe(true);
    expect(soundsConfirmed('Su reserva está confirmada.')).toBe(true);
    expect(soundsConfirmed('Votre réservation est confirmée.')).toBe(true);
    expect(soundsConfirmed('It is not confirmed yet: Ana will confirm it.')).toBe(false);
    expect(soundsConfirmed('Todavía no está confirmada.')).toBe(false);
    const r = await runBot({ client: tour, message: 'Quiero reservar mañana', model: says('¡Listo! Su lugar está confirmado.', 'booking') });
    expect(r).toMatchObject({ action: 'booking', reply: CANNED.bookingNote.es });
  });

  it('adds the staff-confirms note to booking replies', async () => {
    const r = await runBot({ client: tour, message: 'Quiero reservar', model: says('Con gusto, ¿qué fecha y cuántas personas?', 'booking') });
    expect(r.reply).toContain(CANNED.bookingNote.es);
  });

  it('hands complaints, refunds, medical and legal questions to a person without calling the model', async () => {
    let called = false;
    const model = async () => { called = true; return { reply: 'x', action: 'answer' }; };
    for (const msg of ['I want a refund', 'Tengo una queja', 'Je vais appeler mon avocat', 'Is it safe if I am pregnant?', 'Quiero hablar con una persona']) {
      const r = await runBot({ client: tour, message: msg, model });
      expect(r.action, msg).toBe('handoff');
    }
    expect(called).toBe(false);
  });

  it('hands off when the model says so, fails or is unsure', async () => {
    expect((await runBot({ client: tour, message: '¿Tienen wifi?', model: says('', 'handoff') })).action).toBe('handoff');
    expect((await runBot({ client: tour, message: '¿Tienen wifi?', model: async () => { throw new Error('down'); } })).reason).toBe('model_error');
  });
});

describe('language', () => {
  it('Mexico answers in Spanish unless the customer writes English', async () => {
    expect((await runBot({ client: tour, message: 'Hello, what time do you open tomorrow?', model: says('We open at 8:00.') })).language).toBe('en');
    expect((await runBot({ client: tour, message: 'ok', model: says('Con gusto.') })).language).toBe('es');
  });
  it('Quebec answers in French unless the customer writes English', async () => {
    const qc = { ...tour, region: 'ca' };
    expect((await runBot({ client: qc, message: 'Bonjour, êtes-vous ouverts demain?', model: says('Oui.') })).language).toBe('fr');
    expect((await runBot({ client: qc, message: 'merci', model: says('Bienvenue.') })).language).toBe('fr');
    expect((await runBot({ client: qc, message: 'Hi, are you open tomorrow?', model: says('Yes.') })).language).toBe('en');
  });
  it('Strategic Sloth follows the customer across all three', () => {
    expect(detectLanguage('How much?', 'es')).toBe('en');
    expect(detectLanguage('Je veux un remboursement', 'es')).toBe('fr');
    expect(detectLanguage('¿Cuánto cuesta?', 'en')).toBe('es');
    expect(detectLanguage('ok', 'fr')).toBe('fr');
  });
});

describe('modes', () => {
  it('new clients approve replies for their first week, then send automatically', () => {
    const now = Date.parse('2026-11-10T00:00:00Z');
    expect(botMode({ liveAt: '2026-11-08T00:00:00Z' }, now)).toBe('approve');
    expect(botMode({ liveAt: '2026-11-01T00:00:00Z' }, now)).toBe('auto');
    expect(botMode({}, now)).toBe('approve');
    expect(botMode({ botMode: 'auto', liveAt: '2026-11-09T00:00:00Z' }, now)).toBe('auto');
  });

  it('approve mode queues the reply instead of sending it, and approval delivers it', async () => {
    const sent: string[] = [];
    const client = { ...slothClient(), mode: 'approve' };
    const customer = { id: 'wa:5219840000000', label: '+5219840000000', channel: 'whatsapp', replyTo: '5219840000000', phoneNumberId: '1234567890' };
    const r = await handleIncoming({ client, customer, text: '¿Cómo empiezo?', send: async (t: string) => { sent.push(t); }, model: says('Elija un plan en la página de la oferta.') });
    expect(sent).toEqual([]);
    expect(r.draft?.text).toBe('Elija un plan en la página de la oferta.');
    expect(await listDraftIds()).toContain(r.draft!.id);
    // The owner edits the draft and approves it; it is delivered and recorded, and leaves the queue.
    await approveDraft(r.draft!.id, 'Elija un plan aquí: strategicsloth.com/es/whatsapp-autoreply/', { send: async ({ text, to }: any) => { sent.push(`${to}: ${text}`); } });
    expect(sent).toEqual(['5219840000000: Elija un plan aquí: strategicsloth.com/es/whatsapp-autoreply/']);
    expect(await listDraftIds()).not.toContain(r.draft!.id);
    expect((await loadConversation(client.id, customer.id)).turns.at(-1).role).toBe('assistant');
  });

  it('auto mode sends and keeps the history', async () => {
    const sent: string[] = [];
    const customer = { id: 'wa:1', label: '+1', channel: 'whatsapp', replyTo: '1' };
    await handleIncoming({ client: tour, customer, text: '¿Cuánto cuesta?', send: async (t: string) => { sent.push(t); }, model: says('Cuesta MXN 900 por persona.') });
    expect(sent).toEqual(['Cuesta MXN 900 por persona.']);
    const conv = await loadConversation(tour.id, 'wa:1');
    expect(conv.turns.map((t: any) => t.role)).toEqual(['customer', 'assistant']);
  });
});

describe('Strategic Sloth config', () => {
  it('uses the live plan prices and hides the TODO list from the bot', () => {
    const c = slothClient();
    expect(c.answers.autoreplyPrices).toContain('MXN 8,500');
    expect(c.answers.autoreplyPrices).toContain('850 $ CAD');
    expect(JSON.stringify(c.answers)).not.toMatch(/TODO/i);
    expect(c.mode).toBe('auto');
    expect(JSON.stringify(c)).not.toMatch(/[–—]/);
  });
});

describe('WhatsApp webhook', () => {
  it('checks the Meta signature on the raw body', () => {
    const body = '{"entry":[]}';
    const sig = 'sha256=' + createHmac('sha256', 'app-secret').update(body).digest('hex');
    expect(validMetaSignature('app-secret', body, sig)).toBe(true);
    expect(validMetaSignature('app-secret', body + ' ', sig)).toBe(false);
    expect(validMetaSignature('app-secret', body, 'sha256=00')).toBe(false);
    expect(validMetaSignature('', body, sig)).toBe(false);
  });

  it('answers the verification challenge only with the right token', async () => {
    const ok = await verify(new Request('https://x/api/autoreply/whatsapp?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=42'));
    expect(await ok.text()).toBe('42');
    expect((await verify(new Request('https://x/api/autoreply/whatsapp?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=42'))).status).toBe(403);
  });

  it('parses messages, dedupes retries and respects the 24-hour window', async () => {
    process.env.WHATSAPP_PHONE_NUMBER_ID = '1234567890';
    const payload = { entry: [{ changes: [{ value: { metadata: { phone_number_id: '1234567890' }, contacts: [{ wa_id: '5215550001', profile: { name: 'Ana' } }],
      messages: [{ id: 'wamid.A', from: '5215550001', timestamp: String(Math.floor(Date.now() / 1000)), type: 'text', text: { body: 'Hola, ¿cómo empiezo?' } }] } }] }] };
    const [msg] = inboundMessages(payload);
    expect(msg).toMatchObject({ from: '5215550001', name: 'Ana', text: 'Hola, ¿cómo empiezo?', phoneNumberId: '1234567890' });
    const sent: string[] = [];
    const deps = { send: async ({ text }: any) => { sent.push(text); }, model: says('Elija un plan en la página de la oferta.') };
    expect(await processMessage(msg, deps)).toBe('handled');
    expect(await processMessage(msg, deps)).toBe('duplicate');
    expect(sent).toHaveLength(1);
    expect(await processMessage({ ...msg, id: 'wamid.old', timestamp: Date.now() - 25 * 3600 * 1000 }, deps)).toBe('outside_window');
    expect(insideWindow(new Date(Date.now() - 23 * 3600 * 1000).toISOString())).toBe(true);
    expect(insideWindow(new Date(Date.now() - 25 * 3600 * 1000).toISOString())).toBe(false);
  });

  it('ignores numbers that belong to no live client', async () => {
    const [msg] = inboundMessages({ entry: [{ changes: [{ value: { metadata: { phone_number_id: '999' }, messages: [{ id: 'wamid.B', from: '1', timestamp: String(Math.floor(Date.now() / 1000)), type: 'text', text: { body: 'hi' } }] } }] }] });
    expect(await processMessage(msg, { send: async () => {} })).toBe('no_client');
  });
});

describe('site chat endpoint', () => {
  const post = (body: object, ip = '1.2.3.4') => new Request('https://x/api/autoreply/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify(body) });

  it('answers with the Strategic Sloth config', async () => {
    const res = await chat(post({ session: 'abcdef123456', message: 'How do I start?', locale: 'en' }), { model: says('Pick a plan on the offer page.') });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ reply: 'Pick a plan on the offer page.', action: 'answer', language: 'en' });
  });

  it('a handoff on the site asks for a way to reach the visitor, since nobody can reply in the chat later', async () => {
    const res = await chat(post({ session: 'handoffweb0001', message: 'I want a refund', locale: 'en' }, '5.5.5.5'));
    const body = await res.json();
    expect(body.action).toBe('handoff');
    expect(body.reply).toMatch(/Leave your email or WhatsApp number/);
    expect(body.reply).not.toMatch(/reply here/);
  });

  it('a visitor who leaves contact details becomes a lead without calling the model', async () => {
    let called = false;
    const res = await chat(post({ session: 'leadweb0000001', message: 'Mi correo es ana@example.com', locale: 'es' }, '6.6.6.6'), { model: async () => { called = true; return { reply: 'x', action: 'answer' }; } });
    expect(await res.json()).toMatchObject({ action: 'lead', language: 'es', reply: CANNED.web.thanks.es });
    expect(called).toBe(false);
  });

  it('spots emails and phone numbers, but not prices or short numbers', () => {
    expect(hasContactDetails('ana@example.com')).toBe(true);
    expect(hasContactDetails('my WhatsApp is +52 984 123 4567')).toBe(true);
    expect(hasContactDetails('(514) 555-0199')).toBe(true);
    expect(hasContactDetails('how much is the 8,500 plan for 4 people?')).toBe(false);
    expect(hasContactDetails('open 9:00 to 18:00')).toBe(false);
  });

  it('booking requests on the site always ask for contact details', async () => {
    const r = await runBot({ client: tour, channel: 'web', message: 'Quiero reservar', model: says('Con gusto. Se la confirmamos pronto.', 'booking') });
    expect(r.reply).toContain(CANNED.web.bookingNote.es);
  });

  it('rejects bad sessions and rate-limits by IP', async () => {
    expect((await chat(post({ session: 'x', message: 'hi' }))).status).toBe(400);
    process.env.CHAT_LIMIT_PER_HOUR = '2';
    const go = () => chat(post({ session: 'ratelimit00000', message: 'hi', locale: 'en' }, '9.9.9.9'), { model: says('Hello.') });
    expect((await go()).status).toBe(200);
    expect((await go()).status).toBe(200);
    expect((await go()).status).toBe(429);
    delete process.env.CHAT_LIMIT_PER_HOUR;
  });
});
