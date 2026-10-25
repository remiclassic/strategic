// Which language the assistant answers in.
// Quebec: French by default, English only when the customer writes in English (Charter of the French Language).
// Mexico: Spanish by default, English when the customer writes in English.

const EN = /\b(the|and|you|your|is|are|do|does|can|what|when|where|how|much|price|book|booking|open|hours|hello|hi|thanks|please|available|tomorrow|today|want|need|have|with|for|yes|i)\b/gi;
const FR = /\b(le|la|les|et|vous|votre|est|sont|quand|où|comment|combien|prix|réserver|réservation|ouvert|heures|bonjour|salut|merci|svp|disponible|demain|aujourd'hui|je|tu|une|des|veux|voudrais|pour|avec|oui|ça)\b/gi;
const ES = /\b(el|la|los|las|y|usted|su|es|son|cuándo|dónde|cómo|cuánto|cuanto|precio|reservar|reservación|abierto|horario|hola|gracias|por favor|disponible|mañana|hoy|yo|una|unos|quiero|necesito|para|con|tienen)\b/gi;

const score = (text, re) => (text.match(re) ?? []).length;

/** @returns {'fr'|'en'|'es'} */
export function replyLanguage(region, text = '') {
  const fallback = region === 'ca' ? 'fr' : 'es';
  const en = score(text, EN);
  const other = score(text, region === 'ca' ? FR : ES);
  // Switch only on a clear signal, so short or mixed messages stay in the default language.
  return en >= 2 && en > other ? 'en' : fallback;
}

/**
 * For a bot that serves both regions (Strategic Sloth itself): pick es, en or fr from the message,
 * keeping `fallback` (the page or last-used language) unless another language clearly wins.
 * @returns {'fr'|'en'|'es'}
 */
export function detectLanguage(text = '', fallback = 'es') {
  const scores = { en: score(text, EN), fr: score(text, FR), es: score(text, ES) };
  // Accents are a strong hint on short messages.
  if (/[¿¡ñ]/i.test(text)) scores.es += 2;
  if (/[çèêàù]|\b(c'est|j'ai|qu'|d'|l')/i.test(text)) scores.fr += 2;
  const [[best, top], [, second]] = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  // Switch on two clear words, or on one word when nothing points elsewhere ("How much?").
  const clear = top >= 2 || (top === 1 && second === 0);
  return clear && top > scores[fallback] ? best : fallback;
}

/** Bot settings exported with each order for the bot platform. */
export const botLanguageRules = (region) =>
  region === 'ca'
    ? { default: 'fr', switchTo: ['en'], rule: 'Reply in French. Switch to English only when the customer writes in English.' }
    : { default: 'es', switchTo: ['en'], rule: 'Reply in Spanish. Switch to English when the customer writes in English.' };
