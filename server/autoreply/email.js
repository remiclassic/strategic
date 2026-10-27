// Transactional email through Resend (RESEND_API_KEY). Without a key, emails are logged and skipped.
// Quebec (French page) clients get French; English Canada clients get English, then French; US clients get English.
import { env, onboardingPath, siteUrl } from './config.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export async function sendEmail({ to, subject, html, text, replyTo }) {
  const key = env('RESEND_API_KEY');
  if (!key || !to) {
    console.info(`[autoreply] email skipped (${key ? 'no recipient' : 'no RESEND_API_KEY'}): ${subject} -> ${to}`);
    return { skipped: true };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env('RESEND_FROM', 'Strategic Sloth <hola@strategicsloth.com>'),
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      reply_to: replyTo ?? env('NOTIFY_EMAIL'),
    }),
  });
  if (!res.ok) console.error('[autoreply] Resend error', res.status, await res.text());
  return { ok: res.ok };
}

const onboardingUrl = (order) => `${siteUrl()}${onboardingPath(order.locale)}?session_id=${encodeURIComponent(order.id)}`;

const paidCopy = {
  es: (o) => ({
    subject: `Pago recibido: ${o.planName}. Siguiente paso: su formulario`,
    lines: [
      `Hola${o.contactName ? ` ${o.contactName}` : ''},`,
      `Recibimos su pago del plan ${o.planName}${o.pilot ? ' (lugar de fundador)' : ''}. Gracias.`,
      'El siguiente paso toma unos 15 minutos desde el celular: conecte su WhatsApp y apruebe sus respuestas.',
      { link: onboardingUrl(o), label: 'Abrir mi formulario' },
      'Si tiene dudas, responda a este correo. Le contesta Rémi en persona.',
    ],
  }),
  en: (o) => ({
    subject: `Payment received: ${o.planName}. Next step: your setup form`,
    lines: [
      `Hi${o.contactName ? ` ${o.contactName}` : ''},`,
      `We received your payment for ${o.planName}${o.pilot ? ' (founding spot)' : ''}. Thank you.`,
      'The next step takes about 15 minutes from your phone: connect WhatsApp and approve your answers.',
      { link: onboardingUrl(o), label: 'Open my setup form' },
      'Questions? Reply to this email. Rémi answers in person.',
    ],
  }),
  fr: (o) => ({
    subject: `Paiement reçu: ${o.planName}. Prochaine étape: votre formulaire`,
    lines: [
      `Bonjour${o.contactName ? ` ${o.contactName}` : ''},`,
      `Nous avons bien reçu votre paiement pour le forfait ${o.planName}${o.pilot ? ' (place fondatrice)' : ''}. Merci.`,
      'La prochaine étape prend environ 15 minutes sur votre cellulaire: branchez vos comptes et approuvez vos réponses.',
      { link: onboardingUrl(o), label: 'Ouvrir mon formulaire' },
      'Une question? Répondez à ce courriel. Rémi vous répond en personne.',
    ],
  }),
};

const submittedCopy = {
  es: (o) => ({
    subject: `Recibimos sus respuestas: ${o.businessName || o.planName}`,
    lines: ['¡Gracias! Estamos configurando su asistente.', 'Le escribimos en un día hábil o menos.', { link: onboardingUrl(o), label: 'Ver lo que envió' }],
  }),
  en: (o) => ({
    subject: `We got your answers: ${o.businessName || o.planName}`,
    lines: ['Thanks! We are setting up your assistant.', 'You will hear from us within 1 business day.', { link: onboardingUrl(o), label: 'See what you sent' }],
  }),
  fr: (o) => ({
    subject: `Nous avons reçu vos réponses: ${o.businessName || o.planName}`,
    lines: ['Merci! Nous configurons votre assistant.', 'Vous aurez de nos nouvelles d’ici 1 jour ouvrable.', { link: onboardingUrl(o), label: 'Voir ce que vous avez envoyé' }],
  }),
};

function render(blocks) {
  const html = blocks
    .map((l) => (typeof l === 'string'
      ? `<p style="margin:0 0 14px;font:15px/1.6 Arial,sans-serif;color:#1c241a">${esc(l)}</p>`
      : l.hr
        ? '<hr style="border:0;border-top:1px solid #d6dbcc;margin:24px 0">'
        : `<p style="margin:20px 0"><a href="${esc(l.link)}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#121814;color:#fff;font:600 15px Arial,sans-serif;text-decoration:none">${esc(l.label)}</a></p>`))
    .join('');
  const text = blocks.map((l) => (typeof l === 'string' ? l : l.hr ? '----' : `${l.label}: ${l.link}`)).join('\n\n');
  return { html: `<div style="max-width:560px;padding:24px">${html}<p style="font:12px Arial,sans-serif;color:#63705c">Strategic Sloth LLC · strategicsloth.com</p></div>`, text };
}

/** Builds the client email in the right language(s). Exported for tests. */
export function clientEmail(kind, order) {
  const copy = kind === 'paid' ? paidCopy : submittedCopy;
  if (order.locale === 'en-CA') {
    const fr = copy.fr(order);
    const en = copy.en(order);
    return { subject: `${en.subject} / ${fr.subject}`, ...render([...en.lines, { hr: true }, ...fr.lines]) };
  }
  const c = copy[order.locale === 'fr' ? 'fr' : order.locale === 'en' || order.locale === 'en-US' ? 'en' : 'es'](order);
  return { subject: c.subject, ...render(c.lines) };
}

export const emailClient = (kind, order) => sendEmail({ to: order.email, ...clientEmail(kind, order) });

/** Plain dump for Rémi. Every field, nothing hidden. */
export function emailOwner(subject, order) {
  const dump = JSON.stringify({ ...order, history: undefined }, null, 2);
  const admin = `${siteUrl()}/admin/autoreply/`;
  return sendEmail({
    to: env('NOTIFY_EMAIL'),
    replyTo: order.email || undefined,
    subject: `[Auto-reply] ${subject}: ${order.businessName || order.email} (${order.planName}, ${order.region.toUpperCase()})`,
    text: `${subject}\n\nAdmin: ${admin}\n\n${dump}`,
    html: `<p style="font:15px Arial,sans-serif">${esc(subject)}. <a href="${esc(admin)}">Open admin</a></p><pre style="font:12px/1.5 monospace;white-space:pre-wrap">${esc(dump)}</pre>`,
  });
}
