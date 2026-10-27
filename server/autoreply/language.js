// Which language the assistant answers in, by market:
// Quebec (French page): French by default, English only when the customer writes in English (Charter of the French Language).
// Canada (English page): English by default, French when the customer writes in French.
// Mexico: Spanish by default, English when the customer writes in English.
// United States: English by default, Spanish when the customer writes in Spanish.

const EN = /\b(the|and|you|your|is|are|do|does|can|what|when|where|how|much|price|book|booking|open|hours|hello|hi|thanks|please|available|tomorrow|today|want|need|have|with|for|yes|i)\b/gi;
const FR = /\b(le|la|les|et|vous|votre|est|sont|quand|où|comment|combien|prix|réserver|réservation|ouvert|heures|bonjour|salut|merci|svp|disponible|demain|aujourd'hui|je|tu|une|des|veux|voudrais|pour|avec|oui|ça)\b/gi;
const ES = /\b(el|la|los|las|y|usted|su|es|son|cuándo|dónde|cómo|cuánto|cuanto|precio|reservar|reservación|abierto|horario|hola|gracias|por favor|disponible|mañana|hoy|yo|una|unos|quiero|necesito|para|con|tienen)\b/gi;

const score = (text, re) => (text.match(re) ?? []).length;

const PATTERNS = { en: EN, fr: FR, es: ES };

/** [default language, the one it switches to] for an order's region and page locale. */
export function marketLanguages(region, locale) {
  if (region === 'us') return ['en', 'es'];
  if (region === 'ca') return locale === 'en-CA' ? ['en', 'fr'] : ['fr', 'en'];
  return ['es', 'en'];
}

/** @returns {'fr'|'en'|'es'} */
export function replyLanguage(region, text = '', locale) {
  const [fallback, other] = marketLanguages(region, locale);
  const otherScore = score(text, PATTERNS[other]);
  // Switch only on a clear signal, so short or mixed messages stay in the default language.
  return otherScore >= 2 && otherScore > score(text, PATTERNS[fallback]) ? other : fallback;
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

const NAMES = { en: 'English', fr: 'French', es: 'Spanish' };

/** Bot settings exported with each order for the bot platform. */
export function botLanguageRules(region, locale) {
  const [d, o] = marketLanguages(region, locale);
  return { default: d, switchTo: [o], rule: `Reply in ${NAMES[d]}. Switch to ${NAMES[o]} only when the customer writes in ${NAMES[o]}.` };
}
