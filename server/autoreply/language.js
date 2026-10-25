// Which language the assistant answers in.
// Quebec: French by default, English only when the customer writes in English (Charter of the French Language).
// Mexico: Spanish by default, English when the customer writes in English.

const EN = /\b(the|and|you|your|is|are|do|does|can|what|when|where|how|price|book|booking|open|hours|hello|hi|thanks|please|available|tomorrow|today)\b/gi;
const FR = /\b(le|la|les|et|vous|votre|est|sont|quand|où|comment|prix|réserver|réservation|ouvert|heures|bonjour|salut|merci|svp|disponible|demain|aujourd'hui|je|tu|une|des)\b/gi;
const ES = /\b(el|la|los|las|y|usted|su|es|son|cuándo|dónde|cómo|precio|reservar|reservación|abierto|horario|hola|gracias|por favor|disponible|mañana|hoy|yo|una|unos)\b/gi;

const score = (text, re) => (text.match(re) ?? []).length;

/** @returns {'fr'|'en'|'es'} */
export function replyLanguage(region, text = '') {
  const fallback = region === 'ca' ? 'fr' : 'es';
  const en = score(text, EN);
  const other = score(text, region === 'ca' ? FR : ES);
  // Switch only on a clear signal, so short or mixed messages stay in the default language.
  return en >= 2 && en > other ? 'en' : fallback;
}

/** Bot settings exported with each order for the bot platform. */
export const botLanguageRules = (region) =>
  region === 'ca'
    ? { default: 'fr', switchTo: ['en'], rule: 'Reply in French. Switch to English only when the customer writes in English.' }
    : { default: 'es', switchTo: ['en'], rule: 'Reply in Spanish. Switch to English when the customer writes in English.' };
