// Copy for the 24/7 auto-reply offer. Five pages, three regions:
// Mexico (Playa del Carmen, Riviera Maya) in Spanish and English, priced in MXN;
// Canada in French (the Quebec version) and English, priced in CAD; the United States in English, priced in USD.
// Rules: short sentences, no em dashes, no client names, testimonials or invented stats.
import config from './autoreply.json';

export type AutoLocale = 'es' | 'en' | 'fr' | 'en-CA' | 'en-US';
export type AutoRegion = 'mx' | 'ca' | 'us';
export type PlanId = 'basic' | 'bookings' | 'complete';

export const autoLocales: AutoLocale[] = ['es', 'en', 'fr', 'en-CA', 'en-US'];
export const regionOf = (loc: AutoLocale): AutoRegion => (loc === 'fr' || loc === 'en-CA' ? 'ca' : loc === 'en-US' ? 'us' : 'mx');
export const htmlLang = (loc: AutoLocale) => (loc === 'en-CA' || loc === 'en-US' ? 'en' : loc);

const base: Record<AutoLocale, string> = {
  es: '/es/whatsapp-autoreply/',
  en: '/whatsapp-autoreply/',
  fr: '/fr/whatsapp-autoreply/',
  'en-CA': '/ca/whatsapp-autoreply/',
  'en-US': '/us/whatsapp-autoreply/',
};

export const autoPaths = (loc: AutoLocale) => ({
  page: base[loc],
  onboarding: `${base[loc]}onboarding/`,
  terms: `${base[loc]}${loc === 'es' ? 'terminos' : loc === 'fr' ? 'conditions' : 'terms'}/`,
  privacy: `${base[loc]}${loc === 'es' ? 'aviso-de-privacidad' : loc === 'fr' ? 'confidentialite' : 'privacy'}/`,
});

// Every page lists all five so search engines see the full set; the regions are different offers.
// Plain "en" (and so x-default) is the US page, the most general English version.
export const autoAlternates = [
  { lang: 'es-MX', href: base.es },
  { lang: 'en-MX', href: base.en },
  { lang: 'fr-CA', href: base.fr },
  { lang: 'en-CA', href: base['en-CA'] },
  { lang: 'en', href: base['en-US'] },
];

// Language links shown on each page. Quebec lists French first (Charter of the French Language).
// The US version is English only.
export const switcherFor = (loc: AutoLocale): { loc: AutoLocale; label: string }[] =>
  ({
    mx: [{ loc: 'es' as AutoLocale, label: 'Español' }, { loc: 'en' as AutoLocale, label: 'English' }],
    ca: [{ loc: 'fr' as AutoLocale, label: 'Français' }, { loc: 'en-CA' as AutoLocale, label: 'English' }],
    us: [{ loc: 'en-US' as AutoLocale, label: 'English' }],
  })[regionOf(loc)];

export const regionLinkFor = (loc: AutoLocale) =>
  ({
    es: { href: base.fr, label: '¿Negocio en Quebec? Versión en francés y CAD' },
    en: { href: base['en-CA'], label: 'Business in Quebec? Canadian version in CAD' },
    fr: { href: base.es, label: 'Entreprise au Mexique? Version en pesos (espagnol)' },
    'en-CA': { href: base['en-US'], label: 'Business in the US? Version in US dollars' },
    'en-US': { href: base['en-CA'], label: 'Business in Canada? Version in Canadian dollars' },
  })[loc];

export const regionConfig = (region: AutoRegion) => config.regions[region];

const NBSP = ' ';
const group = (n: number, sep: string) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);

/** "MXN 4,500", "1 500 $" (Quebec), "$1,500" (English Canada and the US). */
export function formatMoney(amount: number, loc: AutoLocale): string {
  if (regionOf(loc) === 'mx') return `MXN${NBSP}${group(amount, ',')}`;
  if (loc === 'fr') return `${group(amount, NBSP)}${NBSP}$`;
  return `$${group(amount, ',')}`;
}

/** Rough USD conversion for the Mexico pages, rounded to 5 so nobody reads it as a quote. */
export function approxUsd(mxn: number): string {
  const usd = Math.round((mxn * config.regions.mx.usdRate) / 5) * 5;
  return `USD${NBSP}${group(usd, ',')}`;
}

/** wa.me link from WHATSAPP_NUMBER (build-time env). Falls back to the contact form. */
export function whatsappHref(number: string | undefined, text: string): string {
  const digits = (number ?? '').replace(/\D/g, '');
  if (!digits) return '/contact/?engagement=local#enquiry';
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export const metaPricingHref = 'https://developers.facebook.com/docs/whatsapp/pricing';
export const twilioPricingHref = 'https://www.twilio.com/en-us/sms/pricing/ca';

type PlanCopy = { name: string; blurb: string; features: string[] };

export type AutoCopy = {
  title: string;
  description: string;
  serviceName: string;
  crumbHome: string;
  crumbSelf: string;
  eyebrow: string;
  h1: [string, string];
  lede: string;
  heroCta: string;
  whatsappCta: string;
  tryIt: string;
  tryItNote: string;
  whatsappText: string;
  channels: string[];
  facts: [string, string][];
  stepsEyebrow: string;
  stepsTitle: [string, string];
  stepsIntro: string;
  steps: [string, string, string][];
  whoEyebrow: string;
  whoTitle: [string, string];
  whoIntro: string;
  who: [string, string][];
  pricingEyebrow: string;
  pricingTitle: [string, string];
  pricingIntro: string;
  setupLabel: string;
  perMonth: string;
  thenLabel: string;
  approxLabel?: string;
  taxesNote?: string;
  popular: string;
  buyCta: string;
  oxxoCta?: string;
  oxxoNote?: string;
  checkoutNote: string;
  plans: Record<PlanId, PlanCopy>;
  pilotFlag: string;
  pilotTitle: string;
  pilotBody: string;
  pilotSpots: string; // {left} and {total}
  pilotCta: string;
  extraTitle: string;
  extra: string[];
  extraLinks: [string, string][];
  honestTitle: string;
  honest: [string, string][];
  faqEyebrow: string;
  faqTitle: string;
  faq: [string, string][];
  closeEyebrow: string;
  closeTitle: [string, string];
  closeBody: string;
  closeCta: string;
  legalTerms: string;
  legalPrivacy: string;
  checkoutError: string;
};

const es: AutoCopy = {
  title: 'Respuesta Automática 24/7 por WhatsApp para negocios | Playa del Carmen',
  description:
    'Su WhatsApp responde en segundos, 24/7, en español e inglés, solo con información que usted aprueba. Para tours, buceo, restaurantes, rentas y clínicas en la Riviera Maya.',
  serviceName: 'Respuesta Automática 24/7 por WhatsApp',
  crumbHome: 'Inicio',
  crumbSelf: 'Respuesta automática por WhatsApp',
  eyebrow: 'Respuesta Automática 24/7 por WhatsApp',
  h1: ['Nunca vuelva a perder', 'un cliente en WhatsApp.'],
  lede:
    'Su WhatsApp contesta en segundos, día y noche, en español y en inglés. Usa solo la información que usted aprueba. Lo que es delicado o raro, se lo pasa a una persona de su equipo.',
  heroCta: 'Ver planes y precios',
  whatsappCta: 'Preguntar por WhatsApp',
  tryIt: 'Pruébelo ahora en el chat',
  tryItNote: 'Es el mismo asistente automático que le configuramos, contestando por nosotros.',
  whatsappText: 'Hola, me interesa la respuesta automática 24/7 por WhatsApp para mi negocio.',
  channels: ['WhatsApp', 'Instagram DM', 'Español e inglés', 'Google Sheets'],
  facts: [
    ['Respuesta', 'En segundos, 24/7'],
    ['Idiomas', 'Español e inglés'],
    ['En línea', 'En 3 días hábiles'],
    ['Usted decide', 'Solo respuestas aprobadas'],
  ],
  stepsEyebrow: 'Cómo funciona',
  stepsTitle: ['Cuatro pasos.', 'Sin llamadas largas.'],
  stepsIntro: 'Todo se hace desde el celular. Usted aprueba cada respuesta antes de que salga.',
  steps: [
    ['Elija un plan y pague', 'Con tarjeta en línea, o el pago inicial en OXXO.', 'Dos minutos'],
    ['Conecte su WhatsApp', 'Un botón abre el registro oficial de Meta. Usted sigue siendo el dueño de la cuenta.', 'Unos 5 minutos'],
    ['Apruebe sus respuestas', 'Llene precios, horarios y políticas. Le mostramos ejemplos de respuestas y usted las aprueba.', 'Desde el celular'],
    ['Quedamos en línea', 'Probamos todo con usted y encendemos el asistente.', 'En 3 días hábiles'],
  ],
  whoEyebrow: 'Para quién es',
  whoTitle: ['Negocios que reciben', 'muchas preguntas iguales.'],
  whoIntro: 'Si su equipo contesta lo mismo diez veces al día, o se pierden mensajes de noche, esto es para usted.',
  who: [
    ['Tours y excursiones', 'Horarios, punto de encuentro, qué incluye, cómo apartar.'],
    ['Centros de buceo', 'Certificaciones, salidas del día, equipo, condiciones.'],
    ['Restaurantes', 'Horario, menú, reservaciones, estacionamiento.'],
    ['Rentas vacacionales', 'Disponibilidad, check-in, reglas de la casa, ubicación.'],
    ['Clínicas', 'Servicios, citas, formas de pago, cómo llegar.'],
    ['Salones y spas', 'Precios, citas, cancelaciones, promociones.'],
  ],
  pricingEyebrow: 'Planes',
  pricingTitle: ['Precios claros,', 'en pesos.'],
  pricingIntro: 'Un pago de configuración y una mensualidad de cuidado. Cancele la mensualidad cuando quiera, con 30 días de aviso.',
  setupLabel: 'configuración',
  perMonth: '/mes',
  thenLabel: 'después',
  approxLabel: 'aprox.',
  popular: 'El más elegido',
  buyCta: 'Elegir',
  oxxoCta: 'Pagar la configuración en OXXO',
  oxxoNote: 'Con OXXO paga la configuración en efectivo. La mensualidad se la enviamos por factura.',
  checkoutNote: 'Pago seguro con Stripe. Precios en pesos mexicanos. El dólar es solo una referencia.',
  plans: {
    basic: {
      name: 'Básico',
      blurb: 'Para dejar de perder mensajes.',
      features: [
        'Respuestas al instante en español e inglés, desde su FAQ aprobado',
        'Respuesta fuera de horario',
        'Datos del cliente en su Google Sheet y aviso al dueño',
        'Pasa a una persona lo que no puede resolver',
        '30 min al mes de cambios',
      ],
    },
    bookings: {
      name: 'Reservas',
      blurb: 'Para negocios que viven de reservaciones.',
      features: [
        'Todo lo de Básico',
        'Mensajes directos de Instagram',
        'Solicitudes de reserva o apartado (su equipo confirma)',
        'Recordatorios y confirmaciones',
        'Reporte mensual',
        '1 h al mes de cambios',
      ],
    },
    complete: {
      name: 'Completo',
      blurb: 'Para varios números o mucho volumen.',
      features: [
        'Todo lo de Reservas',
        'Hasta 2 números',
        'Mensaje automático cuando pierde una llamada',
        'Seguimiento al día siguiente',
        'Solicitud de reseñas',
        'Llamada mensual de revisión',
        '2 h al mes de cambios',
      ],
    },
  },
  pilotFlag: 'Lugares de fundador',
  pilotTitle: 'Primeros 3 negocios: Reservas con configuración de MXN 3,500 y el primer mes gratis.',
  pilotBody: 'A cambio, le pedimos comentarios honestos durante el primer mes.',
  pilotSpots: 'Quedan {left} de {total} lugares',
  pilotCta: 'Tomar un lugar de fundador',
  extraTitle: 'Lo que paga aparte',
  extra: [
    'Usted es dueño de su cuenta de WhatsApp Business y le paga a Meta directamente por los mensajes. Meta da 1,000 mensajes de servicio gratis al mes por número. Si responde menos que eso, Meta no le cobra por esas respuestas.',
    'Si su caso necesita una plataforma de chatbot, usted paga esa suscripción directamente. Se lo decimos antes de empezar.',
  ],
  extraLinks: [['Precios oficiales de Meta para WhatsApp', metaPricingHref]],
  honestTitle: 'Notas honestas',
  honest: [
    ['Meta verifica su negocio', 'Suele tardar unos días y no depende de nosotros. Le ayudamos con los pasos.'],
    ['Solo responde lo que usted aprueba', 'Si no sabe algo, no lo inventa. Se lo pasa a una persona.'],
    ['Nunca confirma lo que no puede revisar', 'Una reserva es una solicitud hasta que su equipo la confirma.'],
  ],
  faqEyebrow: 'Preguntas',
  faqTitle: 'Respuestas claras.',
  faq: [
    ['¿Necesito cambiar de número?', 'No. Usamos su número de WhatsApp Business. Si hoy usa la app de WhatsApp Business en ese número, le explicamos las opciones en la llamada corta o por mensaje.'],
    ['¿De quién es la cuenta?', 'De usted. La cuenta de WhatsApp Business, su página de Meta y su Google Sheet son suyas. Si se va, se lleva todo.'],
    ['¿Qué pasa si un cliente pregunta algo raro?', 'El asistente no inventa. Le dice al cliente que una persona le va a responder y le avisa a su equipo por WhatsApp.'],
    ['¿Puede tomar reservaciones?', 'En Reservas y Completo toma la solicitud con los datos que usted pida. Su equipo confirma. El asistente nunca promete un lugar que no puede revisar.'],
    ['¿Cuánto me cobra Meta?', 'Meta da 1,000 mensajes de servicio gratis al mes por número y cobra por mensaje después. Las tarifas son de Meta y usted las paga directo. Vea el enlace a sus precios oficiales arriba.'],
    ['¿En cuánto tiempo queda listo?', 'En 3 días hábiles después de conectar WhatsApp y aprobar sus respuestas. La verificación de Meta puede sumar unos días.'],
    ['¿Puedo cambiar las respuestas?', 'Sí. Cada plan incluye tiempo al mes para cambios: precios nuevos, horario de temporada, promociones.'],
    ['¿Cómo cancelo?', 'La mensualidad se cancela cuando quiera con 30 días de aviso por correo. Una vez que empieza la configuración, el 50% del pago de configuración no es reembolsable.'],
    ['¿Puedo pagar en OXXO?', 'Sí, el pago de configuración. La mensualidad se paga con tarjeta o por factura.'],
    ['¿Quién está detrás?', 'Strategic Sloth, el estudio de Rémi Couture. Él configura cada asistente en persona.'],
  ],
  closeEyebrow: '¿Dudas?',
  closeTitle: ['Escríbanos', 'por WhatsApp.'],
  closeBody: 'Le respondemos en persona. Si prefiere, elija un plan y empezamos hoy.',
  closeCta: 'Ver planes',
  legalTerms: 'Términos del servicio',
  legalPrivacy: 'Aviso de privacidad',
  checkoutError: 'No pudimos abrir el pago. Intente de nuevo o escríbanos por WhatsApp.',
};

const en: AutoCopy = {
  title: 'WhatsApp 24/7 Auto-Reply for Local Businesses | Playa del Carmen',
  description:
    'Your WhatsApp answers customers in seconds, 24/7, in Spanish and English, using only info you approve. For tours, dive shops, restaurants, rentals and clinics in the Riviera Maya.',
  serviceName: 'WhatsApp 24/7 Auto-Reply for Local Businesses',
  crumbHome: 'Home',
  crumbSelf: 'WhatsApp auto-reply',
  eyebrow: 'WhatsApp 24/7 Auto-Reply',
  h1: ['Never miss a customer', 'on WhatsApp again.'],
  lede:
    'Your WhatsApp answers customers in seconds, 24/7, in Spanish and English. It uses only the info you approve. Anything tricky goes to a real person on your team.',
  heroCta: 'See plans and prices',
  whatsappCta: 'Ask on WhatsApp',
  tryIt: 'Try it now in the chat',
  tryItNote: 'It is the same automatic assistant we set up for you, answering for us.',
  whatsappText: 'Hi, I am interested in the 24/7 WhatsApp auto-reply for my business.',
  channels: ['WhatsApp', 'Instagram DM', 'Spanish and English', 'Google Sheets'],
  facts: [
    ['Replies', 'In seconds, 24/7'],
    ['Languages', 'Spanish and English'],
    ['Live', 'Within 3 business days'],
    ['You decide', 'Approved answers only'],
  ],
  stepsEyebrow: 'How it works',
  stepsTitle: ['Four steps.', 'No long calls.'],
  stepsIntro: 'You can do it all from your phone. You approve every answer before it goes out.',
  steps: [
    ['Choose a plan and pay', 'By card online, or pay the setup at OXXO.', 'Two minutes'],
    ['Connect your WhatsApp', 'One button opens Meta’s official signup. You stay the owner of the account.', 'About 5 minutes'],
    ['Approve your answers', 'Fill in prices, hours and policies. We show you sample replies and you approve them.', 'From your phone'],
    ['Go live', 'We test it with you and switch the assistant on.', 'Within 3 business days'],
  ],
  whoEyebrow: 'Who it is for',
  whoTitle: ['Businesses that get', 'the same questions all day.'],
  whoIntro: 'If your team answers the same thing ten times a day, or messages get lost at night, this is for you.',
  who: [
    ['Tour operators', 'Times, meeting point, what is included, how to book.'],
    ['Dive shops', 'Certifications, daily trips, gear, conditions.'],
    ['Restaurants', 'Hours, menu, reservations, parking.'],
    ['Vacation rentals', 'Availability, check-in, house rules, location.'],
    ['Clinics', 'Services, appointments, payment methods, directions.'],
    ['Salons and spas', 'Prices, appointments, cancellations, offers.'],
  ],
  pricingEyebrow: 'Plans',
  pricingTitle: ['Clear prices,', 'in pesos.'],
  pricingIntro: 'One setup fee and a monthly care plan. Cancel the monthly plan any time with 30 days’ notice.',
  setupLabel: 'setup',
  perMonth: '/month',
  thenLabel: 'then',
  approxLabel: 'approx.',
  popular: 'Most popular',
  buyCta: 'Choose',
  oxxoCta: 'Pay the setup at OXXO',
  oxxoNote: 'With OXXO you pay the setup in cash. We send the monthly plan as an invoice.',
  checkoutNote: 'Secure payment with Stripe. Prices in Mexican pesos. USD is a rough guide only.',
  plans: {
    basic: {
      name: 'Básico',
      blurb: 'Stop losing messages.',
      features: [
        'Instant Spanish and English answers from your approved FAQ',
        'After-hours reply',
        'Lead capture to your Google Sheet, plus an owner alert',
        'Hands anything it cannot answer to a person',
        '30 min a month of updates',
      ],
    },
    bookings: {
      name: 'Reservas',
      blurb: 'For businesses that run on bookings.',
      features: [
        'Everything in Básico',
        'Instagram DM',
        'Booking or hold requests (your staff confirm)',
        'Reminder and confirmation messages',
        'Monthly report',
        '1 h a month of updates',
      ],
    },
    complete: {
      name: 'Completo',
      blurb: 'For two numbers or high volume.',
      features: [
        'Everything in Reservas',
        'Up to 2 numbers',
        'Missed-call text-back',
        'Next-day follow-up',
        'Review requests',
        'Monthly review call',
        '2 h a month of updates',
      ],
    },
  },
  pilotFlag: 'Founding spots',
  pilotTitle: 'First 3 businesses: Reservas for MXN 3,500 setup, first month free.',
  pilotBody: 'In return, we ask for honest feedback during the first month.',
  pilotSpots: '{left} of {total} spots left',
  pilotCta: 'Take a founding spot',
  extraTitle: 'What you pay separately',
  extra: [
    'You own your WhatsApp Business account and pay Meta’s message fees directly. Meta gives each business number 1,000 free service messages a month. If you send fewer replies than that, Meta does not charge you for them.',
    'If your setup needs a chatbot platform, you pay that subscription directly. We tell you before we start.',
  ],
  extraLinks: [['Meta’s official WhatsApp pricing', metaPricingHref]],
  honestTitle: 'Honest notes',
  honest: [
    ['Meta must verify your business', 'It usually takes a few days and is out of our hands. We help you through it.'],
    ['It only answers from info you approve', 'If it does not know, it does not guess. It hands the chat to a person.'],
    ['It never confirms what it cannot check', 'A booking is a request until your team confirms it.'],
  ],
  faqEyebrow: 'Questions',
  faqTitle: 'Straight answers.',
  faq: [
    ['Do I need a new number?', 'No. We use your WhatsApp Business number. If you use the WhatsApp Business app on that number today, we explain your options by message or on a short call.'],
    ['Who owns the account?', 'You do. Your WhatsApp Business account, Meta page and Google Sheet are yours. If you leave, you keep everything.'],
    ['What if a customer asks something unusual?', 'The assistant does not make things up. It tells the customer a person will reply and alerts your team on WhatsApp.'],
    ['Can it take bookings?', 'On Reservas and Completo it takes the request with the details you need. Your team confirms. It never promises a spot it cannot check.'],
    ['What does Meta charge?', 'Meta gives 1,000 free service messages a month per number and charges per message after that. Rates are Meta’s and you pay them directly. See the link to their official pricing above.'],
    ['How long until it is live?', 'Within 3 business days after you connect WhatsApp and approve your answers. Meta’s verification can add a few days.'],
    ['Can I change the answers?', 'Yes. Every plan includes monthly update time: new prices, seasonal hours, offers.'],
    ['How do I cancel?', 'Cancel the monthly plan any time with 30 days’ notice by email. Once setup starts, 50% of the setup fee is not refundable.'],
    ['Can I pay at OXXO?', 'Yes, for the setup fee. The monthly plan is paid by card or by invoice.'],
    ['Who is behind this?', 'Strategic Sloth, the studio of Rémi Couture. He sets up every assistant himself.'],
  ],
  closeEyebrow: 'Questions?',
  closeTitle: ['Message us', 'on WhatsApp.'],
  closeBody: 'You get a reply from a person. Or pick a plan and we start today.',
  closeCta: 'See plans',
  legalTerms: 'Terms of service',
  legalPrivacy: 'Privacy notice',
  checkoutError: 'We could not open checkout. Try again or message us on WhatsApp.',
};

const fr: AutoCopy = {
  title: 'Réponse automatique 24/7 sur Messenger et par texto | Entreprises du Québec',
  description:
    'Vos clients reçoivent une réponse en quelques secondes, 24/7, sur Messenger, par texto, Instagram ou WhatsApp. En français d’abord, avec seulement l’information que vous approuvez.',
  serviceName: 'Réponse automatique 24/7 pour entreprises locales',
  crumbHome: 'Accueil',
  crumbSelf: 'Réponse automatique',
  eyebrow: 'Messenger et texto, 24/7',
  h1: ['Ne manquez plus jamais', 'un client.'],
  lede:
    'Vos clients ont une réponse en quelques secondes, jour et nuit. En français d’abord, seulement avec l’information que vous approuvez. Les cas délicats vont à une vraie personne.',
  heroCta: 'Voir les forfaits',
  whatsappCta: 'Nous écrire',
  tryIt: 'Essayez-le dans le clavardage',
  tryItNote: 'C’est le même assistant automatique que nous configurons pour vous, qui répond pour nous.',
  whatsappText: 'Bonjour, la réponse automatique 24/7 m’intéresse pour mon entreprise.',
  channels: ['Messenger', 'Texto (appels manqués)', 'Instagram', 'WhatsApp'],
  facts: [
    ['Réponse', 'En quelques secondes'],
    ['Langue', 'Français d’abord'],
    ['En ligne', 'En 3 jours ouvrables'],
    ['Vous décidez', 'Réponses approuvées'],
  ],
  stepsEyebrow: 'Comment ça marche',
  stepsTitle: ['Quatre étapes.', 'Pas de longues réunions.'],
  stepsIntro: 'Tout se fait à partir de votre cellulaire. Vous approuvez chaque réponse avant qu’elle parte.',
  steps: [
    ['Choisissez un forfait et payez', 'Par carte, en ligne. Facture en français.', 'Deux minutes'],
    ['Branchez vos comptes', 'Votre page Facebook pour Messenger, votre Instagram, et WhatsApp par la fenêtre officielle de Meta. Les comptes restent à vous.', 'Environ 5 minutes'],
    ['Approuvez vos réponses', 'Prix, heures, politiques. On vous montre des exemples de réponses et vous les approuvez.', 'Sur votre cellulaire'],
    ['On passe en ligne', 'On teste avec vous, puis on active l’assistant.', 'En 3 jours ouvrables'],
  ],
  whoEyebrow: 'Pour qui',
  whoTitle: ['Les commerces qui reçoivent', 'les mêmes questions.'],
  whoIntro: 'Si votre équipe répond dix fois par jour à la même question, ou si des appels restent sans réponse pendant que vous êtes sur un chantier, c’est pour vous.',
  who: [
    ['Restaurants', 'Heures, menu, réservations, stationnement.'],
    ['Cliniques', 'Services, rendez-vous, modes de paiement, accès.'],
    ['Salons', 'Prix, rendez-vous, annulations, promos.'],
    ['Garages', 'Rendez-vous, pneus d’hiver, estimations, heures.'],
    ['Entrepreneurs', 'Plomberie, rénovation: zones desservies, soumissions, urgences.'],
    ['Boutiques', 'Heures, inventaire, retours, cueillette en magasin.'],
    ['Gîtes et chalets', 'Disponibilités, arrivée, règlements, accès.'],
  ],
  pricingEyebrow: 'Forfaits',
  pricingTitle: ['Des prix clairs,', 'en dollars canadiens.'],
  pricingIntro: 'Des frais de mise en place et un forfait mensuel d’entretien. Annulez le forfait mensuel quand vous voulez, avec un préavis de 30 jours.',
  setupLabel: 'mise en place',
  perMonth: '/mois',
  thenLabel: 'puis',
  taxesNote: 'plus taxes applicables',
  popular: 'Le plus populaire',
  buyCta: 'Choisir',
  checkoutNote: 'Paiement sécurisé par Stripe. Prix en dollars canadiens, plus taxes applicables. Facture en français.',
  plans: {
    basic: {
      name: 'Essentiel',
      blurb: 'Pour ne plus perdre de messages.',
      features: [
        'Réponses instantanées en français et en anglais, à partir de votre FAQ approuvée',
        'Un canal au choix: Messenger, Instagram ou WhatsApp',
        'Réponse en dehors des heures d’ouverture',
        'Coordonnées des clients dans votre Google Sheet et alerte au propriétaire',
        'Transfert à une vraie personne',
        '30 min de mises à jour par mois',
      ],
    },
    bookings: {
      name: 'Réservations',
      blurb: 'Pour les commerces qui vivent de rendez-vous.',
      features: [
        'Tout l’Essentiel',
        'Messenger, Instagram et WhatsApp',
        'Texto automatique après un appel manqué',
        'Demandes de réservation ou de rendez-vous (votre équipe confirme)',
        'Rappels et confirmations',
        'Rapport mensuel',
        '1 h de mises à jour par mois',
      ],
    },
    complete: {
      name: 'Complet',
      blurb: 'Pour deux numéros, deux succursales ou beaucoup de volume.',
      features: [
        'Tout Réservations',
        'Jusqu’à 2 numéros',
        'Suivi le lendemain',
        'Demandes d’avis',
        'Appel mensuel de suivi',
        '2 h de mises à jour par mois',
      ],
    },
  },
  pilotFlag: 'Places fondatrices',
  pilotTitle: '3 premières entreprises: Réservations à 350 $, premier mois gratuit.',
  pilotBody: 'En échange, on vous demande des commentaires francs pendant le premier mois.',
  pilotSpots: 'Il reste {left} places sur {total}',
  pilotCta: 'Prendre une place fondatrice',
  extraTitle: 'Ce que vous payez à part',
  extra: [
    'Les comptes Messenger, Instagram et WhatsApp Business restent à vous. Pour WhatsApp, vous payez les frais de messages directement à Meta. Meta donne 1 000 messages de service gratuits par mois par numéro. Sous ce seuil, Meta ne vous facture pas ces réponses.',
    'Le texto après un appel manqué passe par un numéro Twilio à votre nom. Twilio facture chaque texto et un petit montant mensuel pour le numéro. Vous payez Twilio directement.',
    'Si votre cas demande une plateforme de chatbot, vous payez cet abonnement directement. On vous le dit avant de commencer.',
  ],
  extraLinks: [
    ['Tarifs officiels de Meta pour WhatsApp', metaPricingHref],
    ['Tarifs de Twilio pour le Canada', twilioPricingHref],
  ],
  honestTitle: 'Franchement',
  honest: [
    ['Meta doit vérifier votre entreprise', 'Ça prend habituellement quelques jours et ça ne dépend pas de nous. On vous guide.'],
    ['L’assistant répond seulement avec ce que vous approuvez', 'S’il ne sait pas, il n’invente rien. Il passe la conversation à une personne.'],
    ['Il ne confirme jamais ce qu’il ne peut pas vérifier', 'Une réservation reste une demande tant que votre équipe ne l’a pas confirmée.'],
    ['Le français d’abord', 'L’assistant répond en français. Il passe à l’anglais seulement si le client écrit en anglais.'],
  ],
  faqEyebrow: 'Questions',
  faqTitle: 'Des réponses franches.',
  faq: [
    ['Est-ce que mes clients doivent avoir WhatsApp?', 'Non. Au Québec, la plupart écrivent sur Messenger ou par texto. On branche les canaux que vos clients utilisent déjà.'],
    ['Comment marche le texto après un appel manqué?', 'Quand un appel reste sans réponse, le client reçoit un texto qui lui demande ce dont il a besoin. L’assistant prend le relais et vous alerte. Inclus dans Réservations et Complet.'],
    ['À qui appartiennent les comptes?', 'À vous. Votre page Facebook, Instagram, WhatsApp Business, le numéro Twilio et votre Google Sheet. Si vous partez, vous gardez tout.'],
    ['Et si un client pose une question inhabituelle?', 'L’assistant n’invente rien. Il dit au client qu’une personne va lui répondre et alerte votre équipe.'],
    ['Peut-il prendre des rendez-vous?', 'Dans Réservations et Complet, il prend la demande avec les détails dont vous avez besoin. Votre équipe confirme. Il ne promet jamais une place qu’il ne peut pas vérifier.'],
    ['Est-ce que l’assistant parle anglais?', 'Oui. Il répond en français par défaut et passe à l’anglais seulement si le client écrit en anglais.'],
    ['C’est prêt en combien de temps?', 'En 3 jours ouvrables après le branchement des comptes et l’approbation de vos réponses. La vérification de Meta peut ajouter quelques jours.'],
    ['Les taxes sont-elles incluses?', 'Non. Les prix sont avant taxes. Les taxes applicables s’ajoutent sur la facture.'],
    ['Comment j’annule?', 'Le forfait mensuel s’annule quand vous voulez, avec un préavis de 30 jours par courriel. Une fois la mise en place commencée, 50 % des frais de mise en place ne sont pas remboursables.'],
    ['Qui est derrière ça?', 'Strategic Sloth, le studio de Rémi Couture. Il configure chaque assistant lui-même.'],
  ],
  closeEyebrow: 'Une question?',
  closeTitle: ['Écrivez-nous.', 'Une personne vous répond.'],
  closeBody: 'Ou choisissez un forfait et on commence aujourd’hui.',
  closeCta: 'Voir les forfaits',
  legalTerms: 'Conditions du service',
  legalPrivacy: 'Politique de confidentialité',
  checkoutError: 'Le paiement n’a pas pu s’ouvrir. Réessayez ou écrivez-nous.',
};

const enCA: AutoCopy = {
  title: '24/7 Auto-Reply on Messenger and Text for Canadian Businesses',
  description:
    'Customers get an answer in seconds, 24/7, on Messenger, text, Instagram or WhatsApp, in English or French. Only info you approve. Prices in Canadian dollars.',
  serviceName: '24/7 Auto-Reply for Local Businesses (Canada)',
  crumbHome: 'Home',
  crumbSelf: 'Auto-reply (Canada)',
  eyebrow: 'Messenger and text, 24/7',
  h1: ['Never miss', 'a customer again.'],
  lede:
    'Your customers get an answer in seconds, day and night, in English or French, using only the info you approve. Anything tricky goes to a real person.',
  heroCta: 'See plans',
  whatsappCta: 'Message us',
  tryIt: 'Try it now in the chat',
  tryItNote: 'It is the same automatic assistant we set up for you, answering for us.',
  whatsappText: 'Hi, I am interested in the 24/7 auto-reply for my business.',
  channels: ['Messenger', 'Missed-call text', 'Instagram', 'WhatsApp'],
  facts: [
    ['Replies', 'In seconds, 24/7'],
    ['Languages', 'English and French'],
    ['Live', 'Within 3 business days'],
    ['You decide', 'Approved answers only'],
  ],
  stepsEyebrow: 'How it works',
  stepsTitle: ['Four steps.', 'No long meetings.'],
  stepsIntro: 'You can do it all from your phone. You approve every answer before it goes out.',
  steps: [
    ['Choose a plan and pay', 'By card, online. Invoices in English or French.', 'Two minutes'],
    ['Connect your accounts', 'Your Facebook Page for Messenger, your Instagram, and WhatsApp through Meta’s official window. The accounts stay yours.', 'About 5 minutes'],
    ['Approve your answers', 'Prices, hours, policies. We show you sample replies and you approve them.', 'From your phone'],
    ['Go live', 'We test it with you and switch the assistant on.', 'Within 3 business days'],
  ],
  whoEyebrow: 'Who it is for',
  whoTitle: ['Businesses that get', 'the same questions.'],
  whoIntro: 'If your team answers the same question ten times a day, or calls go unanswered while you are on a job site, this is for you.',
  who: [
    ['Restaurants', 'Hours, menu, reservations, parking.'],
    ['Clinics', 'Services, appointments, payment methods, access.'],
    ['Salons', 'Prices, appointments, cancellations, offers.'],
    ['Garages', 'Appointments, winter tires, estimates, hours.'],
    ['Contractors', 'Plumbing, renovation: service areas, quotes, emergencies.'],
    ['Shops', 'Hours, stock, returns, in-store pickup.'],
    ['Inns and cottages', 'Availability, check-in, rules, directions.'],
  ],
  pricingEyebrow: 'Plans',
  pricingTitle: ['Clear prices,', 'in Canadian dollars.'],
  pricingIntro: 'One setup fee and a monthly care plan. Cancel the monthly plan any time with 30 days’ notice.',
  setupLabel: 'setup',
  perMonth: '/month',
  thenLabel: 'then',
  taxesNote: 'plus applicable taxes',
  popular: 'Most popular',
  buyCta: 'Choose',
  checkoutNote: 'Secure payment with Stripe. Prices in Canadian dollars, plus applicable taxes.',
  plans: {
    basic: {
      name: 'Essentiel',
      blurb: 'Stop losing messages.',
      features: [
        'Instant English and French answers from your approved FAQ',
        'One channel of your choice: Messenger, Instagram or WhatsApp',
        'After-hours reply',
        'Lead capture to your Google Sheet, plus an owner alert',
        'Hands off to a real person',
        '30 min a month of updates',
      ],
    },
    bookings: {
      name: 'Réservations',
      blurb: 'For businesses that run on appointments.',
      features: [
        'Everything in Essentiel',
        'Messenger, Instagram and WhatsApp',
        'Missed-call text-back',
        'Booking or appointment requests (your staff confirm)',
        'Reminders and confirmations',
        'Monthly report',
        '1 h a month of updates',
      ],
    },
    complete: {
      name: 'Complet',
      blurb: 'For two numbers, two locations or high volume.',
      features: [
        'Everything in Réservations',
        'Up to 2 numbers',
        'Next-day follow-up',
        'Review requests',
        'Monthly review call',
        '2 h a month of updates',
      ],
    },
  },
  pilotFlag: 'Founding spots',
  pilotTitle: 'First 3 businesses: Réservations for $350 setup, first month free.',
  pilotBody: 'In return, we ask for honest feedback during the first month.',
  pilotSpots: '{left} of {total} spots left',
  pilotCta: 'Take a founding spot',
  extraTitle: 'What you pay separately',
  extra: [
    'Your Messenger, Instagram and WhatsApp Business accounts stay yours. For WhatsApp, you pay Meta’s message fees directly. Meta gives each business number 1,000 free service messages a month. Below that, Meta does not charge you for those replies.',
    'Missed-call text-back runs on a Twilio number in your name. Twilio charges per text plus a small monthly fee for the number. You pay Twilio directly.',
    'If your setup needs a chatbot platform, you pay that subscription directly. We tell you before we start.',
  ],
  extraLinks: [
    ['Meta’s official WhatsApp pricing', metaPricingHref],
    ['Twilio pricing for Canada', twilioPricingHref],
  ],
  honestTitle: 'Honest notes',
  honest: [
    ['Meta must verify your business', 'It usually takes a few days and is out of our hands. We help you through it.'],
    ['It only answers from info you approve', 'If it does not know, it does not guess. It hands the chat to a person.'],
    ['It never confirms what it cannot check', 'A booking is a request until your team confirms it.'],
    ['English and French', 'The assistant replies in English and switches to French when the customer writes in French. Businesses in Quebec get French first, as the law requires.'],
  ],
  faqEyebrow: 'Questions',
  faqTitle: 'Straight answers.',
  faq: [
    ['Do my customers need WhatsApp?', 'No. In Canada, most people write on Messenger or by text. We connect the channels your customers already use.'],
    ['How does missed-call text-back work?', 'When a call goes unanswered, the caller gets a text asking what they need. The assistant takes it from there and alerts you. Included in Réservations and Complet.'],
    ['Who owns the accounts?', 'You do. Your Facebook Page, Instagram, WhatsApp Business, the Twilio number and your Google Sheet. If you leave, you keep everything.'],
    ['What if a customer asks something unusual?', 'The assistant does not make things up. It tells the customer a person will reply and alerts your team.'],
    ['Can it take bookings?', 'On Réservations and Complet it takes the request with the details you need. Your team confirms. It never promises a spot it cannot check.'],
    ['Does it speak French?', 'Yes. It replies in English by default and switches to French when the customer writes in French. For businesses in Quebec it answers in French first; see the French version of this page.'],
    ['How long until it is live?', 'Within 3 business days after you connect your accounts and approve your answers. Meta’s verification can add a few days.'],
    ['Are taxes included?', 'No. Prices are before tax. Applicable taxes are added on the invoice.'],
    ['How do I cancel?', 'Cancel the monthly plan any time with 30 days’ notice by email. Once setup starts, 50% of the setup fee is not refundable.'],
    ['Who is behind this?', 'Strategic Sloth, the studio of Rémi Couture. He sets up every assistant himself.'],
  ],
  closeEyebrow: 'Questions?',
  closeTitle: ['Message us.', 'A person replies.'],
  closeBody: 'Or pick a plan and we start today.',
  closeCta: 'See plans',
  legalTerms: 'Terms of service',
  legalPrivacy: 'Privacy policy',
  checkoutError: 'We could not open checkout. Try again or message us.',
};

const enUS: AutoCopy = {
  ...enCA,
  title: '24/7 Auto-Reply on Text and Messenger for US Local Businesses',
  description:
    'Customers get an answer in seconds, 24/7, by text, Messenger, Instagram or WhatsApp, in English or Spanish. Only info you approve. Prices in US dollars.',
  serviceName: '24/7 Auto-Reply for Local Businesses (US)',
  crumbSelf: 'Auto-reply (US)',
  eyebrow: 'Text and Messenger, 24/7',
  lede:
    'Your customers get an answer in seconds, day and night, in English or Spanish, using only the info you approve. Anything tricky goes to a real person.',
  channels: ['Text (missed calls)', 'Messenger', 'Instagram', 'WhatsApp'],
  facts: [
    ['Replies', 'In seconds, 24/7'],
    ['Languages', 'English and Spanish'],
    ['Live', 'Within 3 business days'],
    ['You decide', 'Approved answers only'],
  ],
  steps: [
    ['Choose a plan and pay', 'By card, online. Takes two minutes.', 'Two minutes'],
    enCA.steps[1],
    enCA.steps[2],
    ['Go live', 'We test it with you and switch the assistant on. Texting goes live once US carriers approve it.', 'Within 3 business days'],
  ],
  who: [
    ['Restaurants', 'Hours, menu, reservations, parking.'],
    ['Clinics', 'Services, appointments, payment methods, directions.'],
    ['Salons and spas', 'Prices, appointments, cancellations, offers.'],
    ['Auto shops', 'Appointments, estimates, hours.'],
    ['Contractors', 'Plumbing, HVAC, remodeling: service areas, quotes, emergencies.'],
    ['Shops', 'Hours, stock, returns, in-store pickup.'],
    ['Vacation rentals', 'Availability, check-in, house rules, directions.'],
  ],
  pricingTitle: ['Clear prices,', 'in US dollars.'],
  checkoutNote: 'Secure payment with Stripe. Prices in US dollars, plus applicable taxes.',
  plans: {
    basic: {
      name: 'Essential',
      blurb: 'Stop losing messages.',
      features: [
        'Instant English and Spanish answers from your approved FAQ',
        'One channel of your choice: Messenger, Instagram or WhatsApp',
        'After-hours reply',
        'Lead capture to your Google Sheet, plus an owner alert',
        'Hands off to a real person',
        '30 min a month of updates',
      ],
    },
    bookings: {
      name: 'Bookings',
      blurb: 'For businesses that run on appointments.',
      features: [
        'Everything in Essential',
        'Messenger, Instagram and WhatsApp',
        'Missed-call text-back',
        'Booking or appointment requests (your staff confirm)',
        'Reminders and confirmations',
        'Monthly report',
        '1 h a month of updates',
      ],
    },
    complete: {
      name: 'Complete',
      blurb: 'For two numbers, two locations or high volume.',
      features: [
        'Everything in Bookings',
        'Up to 2 numbers',
        'Next-day follow-up',
        'Review requests',
        'Monthly review call',
        '2 h a month of updates',
      ],
    },
  },
  pilotTitle: 'First 3 businesses: Bookings for $350 setup, first month free.',
  extra: [
    'Your Messenger, Instagram and WhatsApp Business accounts stay yours. For WhatsApp, you pay Meta’s message fees directly. Meta gives each business number 1,000 free service messages a month. Below that, Meta does not charge you for those replies.',
    'Missed-call text-back runs on a Twilio number in your name. Twilio charges per text plus a monthly fee for the number. US carriers also require business texting to be registered (A2P 10DLC), which has its own fees. You pay Twilio directly.',
    'If your setup needs a chatbot platform, you pay that subscription directly. We tell you before we start.',
  ],
  extraLinks: [
    ['Meta’s official WhatsApp pricing', metaPricingHref],
    ['Twilio pricing for the US', 'https://www.twilio.com/en-us/sms/pricing/us'],
  ],
  honest: [
    ['Meta must verify your business', 'It usually takes a few days and is out of our hands. We help you through it.'],
    ['Business texting must be registered', 'US carriers approve business texting before it can go live. It can take some time. We guide you through it.'],
    ['It only answers from info you approve', 'If it does not know, it does not guess. It hands the chat to a person.'],
    ['It never confirms what it cannot check', 'A booking is a request until your team confirms it.'],
  ],
  faq: [
    ['Do my customers need WhatsApp?', 'No. In the US, most people text or use Messenger. We connect the channels your customers already use.'],
    ['How does missed-call text-back work?', 'When a call goes unanswered, the caller gets a text asking what they need. The assistant takes it from there and alerts you. Included in Bookings and Complete.'],
    ['Who owns the accounts?', 'You do. Your Facebook Page, Instagram, WhatsApp Business, the Twilio number and your Google Sheet. If you leave, you keep everything.'],
    ['What if a customer asks something unusual?', 'The assistant does not make things up. It tells the customer a person will reply and alerts your team.'],
    ['Can it take bookings?', 'On Bookings and Complete it takes the request with the details you need. Your team confirms. It never promises a spot it cannot check.'],
    ['Does it speak Spanish?', 'Yes. It replies in English by default and switches to Spanish when the customer writes in Spanish.'],
    ['How long until it is live?', 'Within 3 business days after you connect your accounts and approve your answers. Meta’s verification and texting registration can add time.'],
    ['Are taxes included?', 'No. Prices are before tax. Applicable taxes are added on the invoice.'],
    ['How do I cancel?', 'Cancel the monthly plan any time with 30 days’ notice by email. Once setup starts, 50% of the setup fee is not refundable.'],
    ['Who is behind this?', 'Strategic Sloth, the studio of Rémi Couture. He sets up every assistant himself.'],
  ],
};

export const autoCopy: Record<AutoLocale, AutoCopy> = { es, en, fr, 'en-CA': enCA, 'en-US': enUS };
