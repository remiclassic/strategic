// Copy for the product site design of the auto-reply offer: navigation, the hero chat demo,
// feature cards and the explainer video captions. Pricing, FAQ and legal copy stay in whatsapp-autoreply.ts.
// Demo chats show a sample business; they are labelled as examples on the page.
import type { AutoLocale } from './whatsapp-autoreply';

export type ChatLine = { from: 'customer' | 'bot' | 'note'; text: string; time?: string };
export type Feature = { kind: 'instant' | 'language' | 'sheet' | 'handoff' | 'booking' | 'approve' | 'missed'; title: string; body: string };

export type SiteCopy = {
  product: string;
  by: string;
  nav: { how: string; demo: string; features: string; pricing: string; faq: string; cta: string; menu: string; lang: string };
  regionLabel: string;
  demo: { channel: string; business: string; status: string; example: string; lines: ChatLine[]; callouts: string[] };
  videoEyebrow: string;
  videoTitle: string;
  videoBody: string;
  videoLabel: string;
  transcript: string;
  featuresEyebrow: string;
  featuresTitle: string;
  features: Feature[];
  sheetHeaders: [string, string, string];
  sheetRows: [string, string, string][];
  alertTitle: string;
  alertBody: string;
  approveItems: string[];
  bookingCard: [string, string, string];
  footerTag: string;
  otherRegion: string;
  /** One caption per video scene, in order. */
  video: { captions: string[]; clock: string; unread: string; approved: string[]; handoff: [string, string]; steps: string[]; endTitle: string; endPrice: string; endUrl: string };
};

const es: SiteCopy = {
  product: 'Respuesta 24/7',
  by: 'por Strategic Sloth',
  nav: { how: 'Cómo funciona', demo: 'Video', features: 'Funciones', pricing: 'Precios', faq: 'Preguntas', cta: 'Ver planes', menu: 'Menú', lang: 'Idioma y región' },
  regionLabel: 'México',
  demo: {
    channel: 'WhatsApp', business: 'Su negocio', status: 'Responde al instante', example: 'Ejemplo',
    lines: [
      { from: 'customer', text: 'Hola, ¿tienen lugar para 4 mañana a las 9?', time: '11:42 p. m.' },
      { from: 'bot', text: '¡Hola! Sí hay salida a las 9:00. Le tomo la solicitud para 4 personas y una persona del equipo se la confirma por aquí.', time: '11:42 p. m.' },
      { from: 'customer', text: '¿Y aceptan tarjeta?', time: '11:43 p. m.' },
      { from: 'bot', text: 'Sí: efectivo, tarjeta y transferencia.', time: '11:43 p. m.' },
      { from: 'note', text: 'Solicitud enviada al equipo' },
    ],
    callouts: ['Contesta en segundos, 24/7', 'Solo usa información aprobada', 'Lo delicado pasa a una persona', 'Nunca confirma lo que no puede revisar'],
  },
  videoEyebrow: 'Video de 36 segundos',
  videoTitle: 'Así trabaja su asistente.',
  videoBody: 'Del primer mensaje a la noche hasta su equipo, sin perder un cliente.',
  videoLabel: 'Video explicativo: cómo funciona la respuesta automática 24/7',
  transcript: 'Leer el texto del video',
  featuresEyebrow: 'Funciones',
  featuresTitle: 'Todo lo que hace por usted.',
  features: [
    { kind: 'instant', title: 'Respuestas al instante', body: 'Horarios, precios, ubicación, cómo reservar. A cualquier hora, en segundos.' },
    { kind: 'language', title: 'Español e inglés', body: 'Contesta en el idioma del cliente. Turistas y gente de aquí, bien atendidos.' },
    { kind: 'sheet', title: 'Clientes en su Google Sheet', body: 'Nombre, número y lo que buscan, guardado solo. Usted decide a quién llamar.' },
    { kind: 'handoff', title: 'Una persona cuando hace falta', body: 'Quejas, reembolsos o algo raro: le avisa a su equipo por WhatsApp.' },
    { kind: 'booking', title: 'Solicitudes de reserva', body: 'Toma fecha y personas. Su equipo confirma. Nunca promete un lugar.' },
    { kind: 'approve', title: 'Usted aprueba todo', body: 'Cada respuesta sale de lo que usted escribió y aprobó. Nada inventado.' },
  ],
  sheetHeaders: ['Nombre', 'WhatsApp', 'Busca'],
  sheetRows: [['Ana', '+52 984 …', 'Tour 4 pers.'], ['Mark', '+1 312 …', 'Buceo'], ['Lucía', '+52 998 …', 'Precios']],
  alertTitle: 'Necesita a una persona',
  alertBody: 'Cliente pide un reembolso. Conversación adjunta.',
  approveItems: ['Precios', 'Horario', 'Cómo reservar', 'Cancelaciones'],
  bookingCard: ['Solicitud', 'Mañana 9:00 · 4 personas', 'Por confirmar'],
  footerTag: 'Un servicio de Strategic Sloth LLC. Configurado por Rémi Couture.',
  otherRegion: 'Otras versiones',
  video: {
    captions: [
      'Sus clientes escriben a cualquier hora.',
      'Su asistente contesta en segundos, en su idioma.',
      'Solo usa respuestas que usted aprueba.',
      'Lo delicado pasa a una persona de su equipo.',
      'Elija un plan, conecte WhatsApp, apruebe. Listo en 3 días hábiles.',
      'Nunca vuelva a perder un cliente en WhatsApp.',
    ],
    clock: '11:42 p. m.', unread: '3 mensajes sin leer',
    approved: ['Precios', 'Horario', 'Cómo reservar', 'Política de cancelación'],
    handoff: ['Quiero un reembolso', 'Aviso enviado a su equipo'],
    steps: ['Elija un plan', 'Conecte WhatsApp', 'Apruebe sus respuestas', 'En línea'],
    endTitle: 'Respuesta Automática 24/7', endPrice: 'Desde MXN 1,000 al mes', endUrl: 'strategicsloth.com/es/whatsapp-autoreply',
  },
};

const en: SiteCopy = {
  product: 'Auto-Reply 24/7',
  by: 'by Strategic Sloth',
  nav: { how: 'How it works', demo: 'Video', features: 'Features', pricing: 'Pricing', faq: 'FAQ', cta: 'See plans', menu: 'Menu', lang: 'Language and region' },
  regionLabel: 'Mexico',
  demo: {
    channel: 'WhatsApp', business: 'Your business', status: 'Replies instantly', example: 'Example',
    lines: [
      { from: 'customer', text: 'Hi! Do you have room for 4 tomorrow at 9?', time: '11:42 pm' },
      { from: 'bot', text: 'Hi! Yes, there is a 9:00 departure. I am taking your request for 4 people, and a person on the team will confirm it here.', time: '11:42 pm' },
      { from: 'customer', text: 'Do you take cards?', time: '11:43 pm' },
      { from: 'bot', text: 'Yes: cash, card and bank transfer.', time: '11:43 pm' },
      { from: 'note', text: 'Request sent to the team' },
    ],
    callouts: ['Answers in seconds, 24/7', 'Uses approved info only', 'Tricky chats go to a person', 'Never confirms what it cannot check'],
  },
  videoEyebrow: '36-second video',
  videoTitle: 'How your assistant works.',
  videoBody: 'From a late-night message to your team, without losing a customer.',
  videoLabel: 'Explainer video: how the 24/7 auto-reply works',
  transcript: 'Read the video text',
  featuresEyebrow: 'Features',
  featuresTitle: 'Everything it does for you.',
  features: [
    { kind: 'instant', title: 'Instant answers', body: 'Hours, prices, location, how to book. Any time, in seconds.' },
    { kind: 'language', title: 'Spanish and English', body: 'Replies in the customer’s language. Tourists and locals both looked after.' },
    { kind: 'sheet', title: 'Leads in your Google Sheet', body: 'Name, number and what they want, saved for you. You choose who to call.' },
    { kind: 'handoff', title: 'A person when it matters', body: 'Complaints, refunds or anything unusual: your team gets a WhatsApp alert.' },
    { kind: 'booking', title: 'Booking requests', body: 'Takes the date and group size. Your team confirms. It never promises a spot.' },
    { kind: 'approve', title: 'You approve everything', body: 'Every reply comes from what you wrote and approved. Nothing made up.' },
  ],
  sheetHeaders: ['Name', 'WhatsApp', 'Wants'],
  sheetRows: [['Ana', '+52 984 …', 'Tour for 4'], ['Mark', '+1 312 …', 'Dive trip'], ['Lucía', '+52 998 …', 'Prices']],
  alertTitle: 'Needs a person',
  alertBody: 'Customer asks for a refund. Conversation attached.',
  approveItems: ['Prices', 'Hours', 'How to book', 'Cancellations'],
  bookingCard: ['Request', 'Tomorrow 9:00 · 4 people', 'To confirm'],
  footerTag: 'A Strategic Sloth LLC service. Set up by Rémi Couture.',
  otherRegion: 'Other versions',
  video: {
    captions: [
      'Your customers write at all hours.',
      'Your assistant answers in seconds, in their language.',
      'It only uses answers you approve.',
      'Anything tricky goes to a person on your team.',
      'Pick a plan, connect WhatsApp, approve. Live in 3 business days.',
      'Never miss a customer on WhatsApp again.',
    ],
    clock: '11:42 pm', unread: '3 unread messages',
    approved: ['Prices', 'Hours', 'How to book', 'Cancellation policy'],
    handoff: ['I want a refund', 'Alert sent to your team'],
    steps: ['Pick a plan', 'Connect WhatsApp', 'Approve your answers', 'Live'],
    endTitle: 'WhatsApp 24/7 Auto-Reply', endPrice: 'From MXN 1,000 a month', endUrl: 'strategicsloth.com/whatsapp-autoreply',
  },
};

const fr: SiteCopy = {
  product: 'Réponse 24/7',
  by: 'par Strategic Sloth',
  nav: { how: 'Fonctionnement', demo: 'Vidéo', features: 'Fonctions', pricing: 'Forfaits', faq: 'Questions', cta: 'Voir les forfaits', menu: 'Menu', lang: 'Langue et région' },
  regionLabel: 'Québec',
  demo: {
    channel: 'Messenger', business: 'Votre entreprise', status: 'Répond tout de suite', example: 'Exemple',
    lines: [
      { from: 'customer', text: 'Bonjour, êtes-vous ouverts samedi?', time: '23 h 42' },
      { from: 'bot', text: 'Bonjour! Oui, samedi de 9 h à midi. Voulez-vous que je prenne une demande de rendez-vous?', time: '23 h 42' },
      { from: 'customer', text: 'Oui, pour un changement de pneus.', time: '23 h 43' },
      { from: 'bot', text: 'Parfait. Je note la demande, et l’équipe vous confirme l’heure par texto.', time: '23 h 43' },
      { from: 'note', text: 'Demande transmise à l’équipe' },
    ],
    callouts: ['Répond en quelques secondes, 24/7', 'Seulement l’information approuvée', 'Les cas délicats vont à une personne', 'Ne confirme jamais ce qu’il ne peut vérifier'],
  },
  videoEyebrow: 'Vidéo de 36 secondes',
  videoTitle: 'Votre assistant, en action.',
  videoBody: 'Du message de fin de soirée jusqu’à votre équipe, sans perdre un client.',
  videoLabel: 'Vidéo explicative: comment fonctionne la réponse automatique 24/7',
  transcript: 'Lire le texte de la vidéo',
  featuresEyebrow: 'Fonctions',
  featuresTitle: 'Tout ce qu’il fait pour vous.',
  features: [
    { kind: 'instant', title: 'Réponses instantanées', body: 'Heures, prix, adresse, rendez-vous. À toute heure, en quelques secondes.' },
    { kind: 'missed', title: 'Texto après un appel manqué', body: 'Vous êtes sur un chantier? Le client reçoit un texto et l’assistant prend le relais.' },
    { kind: 'language', title: 'Le français d’abord', body: 'Répond en français. Passe à l’anglais seulement si le client écrit en anglais.' },
    { kind: 'sheet', title: 'Clients dans votre Google Sheet', body: 'Nom, numéro et besoin, notés pour vous. Vous choisissez qui rappeler.' },
    { kind: 'handoff', title: 'Une personne quand il le faut', body: 'Plainte, remboursement ou question inhabituelle: votre équipe est alertée.' },
    { kind: 'booking', title: 'Demandes de rendez-vous', body: 'Prend le jour et le besoin. Votre équipe confirme. Aucune promesse.' },
  ],
  sheetHeaders: ['Nom', 'Téléphone', 'Besoin'],
  sheetRows: [['Julie', '+1 418 …', 'Pneus'], ['Marc', '+1 514 …', 'Estimation'], ['Sophie', '+1 819 …', 'Heures']],
  alertTitle: 'Une personne doit répondre',
  alertBody: 'Le client demande un remboursement. Conversation jointe.',
  approveItems: ['Prix', 'Heures', 'Rendez-vous', 'Annulations'],
  bookingCard: ['Demande', 'Samedi matin · pneus', 'À confirmer'],
  footerTag: 'Un service de Strategic Sloth LLC. Configuré par Rémi Couture.',
  otherRegion: 'Autres versions',
  video: {
    captions: [
      'Vos clients écrivent à toute heure.',
      'Votre assistant répond en quelques secondes, en français d’abord.',
      'Il utilise seulement les réponses que vous approuvez.',
      'Les cas délicats vont à une personne de votre équipe.',
      'Choisissez un forfait, branchez vos comptes, approuvez. En ligne en 3 jours ouvrables.',
      'Ne manquez plus jamais un client.',
    ],
    clock: '23 h 42', unread: '3 messages non lus',
    approved: ['Prix', 'Heures d’ouverture', 'Prise de rendez-vous', 'Politique d’annulation'],
    handoff: ['Je veux un remboursement', 'Alerte envoyée à votre équipe'],
    steps: ['Choisissez un forfait', 'Branchez vos comptes', 'Approuvez vos réponses', 'En ligne'],
    endTitle: 'Réponse automatique 24/7', endPrice: 'À partir de 79 $ par mois, plus taxes', endUrl: 'strategicsloth.com/fr/whatsapp-autoreply',
  },
};

const enCA: SiteCopy = {
  ...en,
  regionLabel: 'Quebec',
  demo: {
    channel: 'Messenger', business: 'Your business', status: 'Replies instantly', example: 'Example',
    lines: [
      { from: 'customer', text: 'Hi, are you open Saturday?', time: '11:42 pm' },
      { from: 'bot', text: 'Hi! Yes, Saturday from 9 am to noon. Would you like me to take an appointment request?', time: '11:42 pm' },
      { from: 'customer', text: 'Yes, for a tire change.', time: '11:43 pm' },
      { from: 'bot', text: 'Great. I am noting the request, and the team will confirm the time by text.', time: '11:43 pm' },
      { from: 'note', text: 'Request sent to the team' },
    ],
    callouts: en.demo.callouts,
  },
  features: [
    { kind: 'instant', title: 'Instant answers', body: 'Hours, prices, address, appointments. Any time, in seconds.' },
    { kind: 'missed', title: 'Missed-call text-back', body: 'On a job site? The caller gets a text and the assistant takes it from there.' },
    { kind: 'language', title: 'French first', body: 'Replies in French. Switches to English only when the customer writes in English.' },
    { kind: 'sheet', title: 'Leads in your Google Sheet', body: 'Name, number and need, saved for you. You choose who to call back.' },
    { kind: 'handoff', title: 'A person when it matters', body: 'Complaints, refunds or anything unusual: your team gets an alert.' },
    { kind: 'booking', title: 'Appointment requests', body: 'Takes the day and the need. Your team confirms. No promises.' },
  ],
  sheetHeaders: ['Name', 'Phone', 'Needs'],
  sheetRows: [['Julie', '+1 418 …', 'Tires'], ['Marc', '+1 514 …', 'Estimate'], ['Sophie', '+1 819 …', 'Hours']],
  bookingCard: ['Request', 'Saturday morning · tires', 'To confirm'],
  video: {
    ...en.video,
    captions: [
      'Your customers write at all hours.',
      'Your assistant answers in seconds: French first, English when the customer writes in English.',
      'It only uses answers you approve.',
      'Anything tricky goes to a person on your team.',
      'Pick a plan, connect your accounts, approve. Live in 3 business days.',
      'Never miss a customer again.',
    ],
    steps: ['Pick a plan', 'Connect your accounts', 'Approve your answers', 'Live'],
    endTitle: '24/7 Auto-Reply', endPrice: 'From $79 a month, plus taxes', endUrl: 'strategicsloth.com/ca/whatsapp-autoreply',
  },
};

export const siteCopy: Record<AutoLocale, SiteCopy> = { es, en, fr, 'en-CA': enCA };

/** Region and language picker entries, French listed before English for Quebec. */
export const localeChoices: { loc: AutoLocale; label: string; region: string; lang: string }[] = [
  { loc: 'es', label: 'Español', region: 'México', lang: 'es' },
  { loc: 'en', label: 'English', region: 'Mexico', lang: 'en' },
  { loc: 'fr', label: 'Français', region: 'Québec', lang: 'fr' },
  { loc: 'en-CA', label: 'English', region: 'Quebec', lang: 'en' },
];
