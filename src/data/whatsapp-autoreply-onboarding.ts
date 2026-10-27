// Onboarding form strings. 'en-CA' (Canada) and 'en-US' reuse English with their own channel wording.
// The sample replies in `samples` are templates filled with the owner's own answers; {x} marks a field.
import type { AutoLocale } from './whatsapp-autoreply';

type Field = { label: string; hint?: string; placeholder?: string };

export type OnboardingCopy = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  switchLabel: string;
  stepOf: string; // {n} {total}
  steps: { business: string; whatsapp: string; answers: string; booking: string; review: string };
  saved: string;
  saving: string;
  saveError: string;
  back: string;
  next: string;
  submit: string;
  required: string;
  states: { noSession: string; loading: string; notFound: string; awaiting: string; live: string; error: string };
  thanksTitle: string;
  thanksBody: string;
  editAgain: string;
  planLabel: string;
  business: {
    name: Field; type: Field; types: string[]; address: Field; maps: Field; website: Field; instagram: Field;
    hours: Field; languages: Field; languageOptions: string[]; phone: Field;
  };
  whatsapp: {
    intro: string; connect: string; connecting: string; connected: string; connectError: string; unavailable: string;
    number: Field; callInstead: string; channels?: Field; channelOptions?: string[]; facebook?: Field;
  };
  sms?: { title: string; intro: string; number: Field; text: Field };
  answers: {
    intro: string; prices: Field; included: Field; howToBook: Field; payment: Field; paymentOptions: string[];
    cancellation: Field; location: Field; other: Field; customTitle: string; question: string; answer: string;
    addQuestion: string; remove: string;
  };
  booking: { intro: string; rules: Field; capacity: Field; leadTime: Field; confirms: Field; staffWhatsapp: Field };
  review: {
    intro: string; samplesTitle: string; customer: string; assistant: string; missing: string;
    consent: string; privacyLink: string; approve: string; edit: string;
  };
  samples: {
    price: [string, string]; book: [string, string]; where: [string, string]; pay: [string, string];
    cancel: [string, string]; afterHours: [string, string]; unknown: [string, string]; booking: [string, string];
    english?: [string, string];
  };
};

const es: OnboardingCopy = {
  title: 'Configure su asistente | Respuesta Automática 24/7 por WhatsApp',
  description: 'Formulario de alta para su asistente de WhatsApp.',
  h1: 'Configure su asistente',
  intro: 'Unos 15 minutos desde el celular. Su avance se guarda solo; puede volver con el mismo enlace.',
  switchLabel: 'English',
  stepOf: 'Paso {n} de {total}',
  steps: { business: 'Su negocio', whatsapp: 'WhatsApp', answers: 'Respuestas', booking: 'Reservas', review: 'Revisar y aprobar' },
  saved: 'Guardado',
  saving: 'Guardando…',
  saveError: 'No se pudo guardar en línea. Su avance sigue guardado en este teléfono.',
  back: 'Atrás',
  next: 'Siguiente',
  submit: 'Enviar para configurar',
  required: 'Llene este campo.',
  states: {
    noSession: 'Abra esta página con el enlace de su correo de pago.',
    loading: 'Cargando su pedido…',
    notFound: 'No encontramos este pedido. Revise el enlace de su correo o escríbanos.',
    awaiting: 'Estamos esperando la confirmación de su pago en OXXO. Le avisamos por correo cuando llegue. Puede llenar el formulario mientras tanto.',
    live: 'Su asistente ya está en línea. Para cambios, escríbanos.',
    error: 'Algo falló. Intente de nuevo en un momento.',
  },
  thanksTitle: '¡Gracias! Estamos configurando su asistente.',
  thanksBody: 'Le escribimos en un día hábil o menos.',
  editAgain: 'Corregir algo',
  planLabel: 'Plan',
  business: {
    name: { label: 'Nombre del negocio' },
    type: { label: 'Tipo de negocio' },
    types: ['Tour o excursión', 'Centro de buceo', 'Restaurante', 'Renta vacacional', 'Clínica', 'Salón o spa', 'Otro'],
    address: { label: 'Dirección' },
    maps: { label: 'Enlace de Google Maps', placeholder: 'https://maps.app.goo.gl/…' },
    website: { label: 'Sitio web', hint: 'Opcional' },
    instagram: { label: 'Instagram', placeholder: '@sunegocio', hint: 'Opcional' },
    hours: { label: 'Horario', placeholder: 'Lun a sáb 9:00 a 18:00. Domingo cerrado.' },
    languages: { label: 'Idiomas de sus clientes' },
    languageOptions: ['Español', 'Inglés', 'Francés', 'Italiano', 'Alemán'],
    phone: { label: 'Su WhatsApp personal, para avisos', hint: 'Con código de país, por ejemplo +52 984 000 0000' },
  },
  whatsapp: {
    intro: 'Conecte el número de WhatsApp Business que usan sus clientes. Se abre la ventana oficial de Meta. Usted sigue siendo el dueño.',
    connect: 'Conectar WhatsApp',
    connecting: 'Abriendo Meta…',
    connected: 'WhatsApp conectado',
    connectError: 'No se completó la conexión. Puede intentar de nuevo o elegir la llamada corta.',
    unavailable: 'La conexión directa todavía no está activa. Déjenos su número y lo conectamos con usted en una llamada corta.',
    number: { label: 'Número de WhatsApp del negocio', hint: 'Con código de país' },
    callInstead: 'Lo conecto en una llamada corta con ustedes',
  },
  answers: {
    intro: 'El asistente solo usa lo que escriba aquí. Escriba como le hablaría a un cliente.',
    prices: { label: 'Precios', placeholder: 'Snorkel en cenote: MXN 900 por persona. Niños menores de 6: gratis.' },
    included: { label: 'Qué incluye', placeholder: 'Transporte desde Playa, equipo, guía bilingüe, agua.' },
    howToBook: { label: 'Cómo reservar o apartar', placeholder: 'Mande fecha, número de personas y hotel. Pedimos 50% para apartar.' },
    payment: { label: 'Formas de pago' },
    paymentOptions: ['Efectivo', 'Tarjeta', 'Transferencia', 'OXXO', 'PayPal', 'Dólares'],
    cancellation: { label: 'Política de cancelación', placeholder: 'Cancelación gratis hasta 24 h antes.' },
    location: { label: 'Ubicación y estacionamiento', placeholder: 'Calle 10 con 5a Avenida. Estacionamiento público a una cuadra.' },
    other: { label: 'Otras cosas que sus clientes preguntan seguido', placeholder: 'Escriba preguntas y respuestas libres.' },
    customTitle: 'Sus preguntas',
    question: 'Pregunta',
    answer: 'Respuesta',
    addQuestion: 'Agregar una pregunta',
    remove: 'Quitar',
  },
  booking: {
    intro: 'El asistente toma la solicitud. Su equipo confirma. Nunca promete un lugar.',
    rules: { label: 'Reglas de reserva', placeholder: 'Mínimo 2 personas. Salidas a las 8:00 y 13:00.' },
    capacity: { label: 'Capacidad', placeholder: '12 personas por salida' },
    leadTime: { label: 'Anticipación mínima', placeholder: 'Un día antes, hasta las 18:00' },
    confirms: { label: '¿Quién confirma las reservas?', placeholder: 'Ana, en recepción' },
    staffWhatsapp: { label: 'WhatsApp del equipo para avisos', hint: 'Con código de país' },
  },
  review: {
    intro: 'Así contestaría su asistente con lo que escribió. Si algo no le gusta, regrese y cámbielo.',
    samplesTitle: 'Ejemplos de respuestas',
    customer: 'Cliente',
    assistant: 'Asistente',
    missing: '(falta esta respuesta: el asistente pasará la pregunta a su equipo)',
    consent: 'Acepto el aviso de privacidad y el uso de estos datos para configurar mi asistente.',
    privacyLink: 'Leer el aviso de privacidad',
    approve: 'Apruebo estas respuestas.',
    edit: 'Editar',
  },
  samples: {
    price: ['¿Cuánto cuesta?', 'Con gusto. {prices} {included}'],
    book: ['¿Cómo reservo?', '{howToBook}'],
    where: ['¿Dónde están? ¿Hay estacionamiento?', '{location}'],
    pay: ['¿Aceptan tarjeta?', 'Aceptamos: {payment}.'],
    cancel: ['¿Y si necesito cancelar?', '{cancellation}'],
    afterHours: ['Hola, ¿están abiertos? (11:40 p. m.)', 'Hola, gracias por escribir. Nuestro horario es: {hours}. Le respondo aquí sus dudas ahora, y si necesita a alguien del equipo, le escriben en cuanto abramos.'],
    unknown: ['¿Puedo llevar a mi perro?', 'Buena pregunta. Déjeme confirmarlo con el equipo: una persona le responde aquí muy pronto.'],
    booking: ['¿Hay lugar para 4 mañana?', 'Le tomo la solicitud para 4 personas mañana. {confirms} la confirma por aquí. Todavía no está confirmada.'],
  },
};

const en: OnboardingCopy = {
  ...es,
  title: 'Set up your assistant | WhatsApp 24/7 Auto-Reply',
  description: 'Setup form for your WhatsApp assistant.',
  h1: 'Set up your assistant',
  intro: 'About 15 minutes from your phone. Progress saves automatically; come back with the same link.',
  switchLabel: 'Español',
  stepOf: 'Step {n} of {total}',
  steps: { business: 'Your business', whatsapp: 'WhatsApp', answers: 'Answers', booking: 'Bookings', review: 'Review and approve' },
  saved: 'Saved',
  saving: 'Saving…',
  saveError: 'Could not save online. Your progress is still saved on this phone.',
  back: 'Back',
  next: 'Next',
  submit: 'Send for setup',
  required: 'Please fill this in.',
  states: {
    noSession: 'Open this page with the link in your payment email.',
    loading: 'Loading your order…',
    notFound: 'We could not find this order. Check the link in your email or message us.',
    awaiting: 'We are waiting for your OXXO payment to clear. We will email you when it does. You can fill in the form meanwhile.',
    live: 'Your assistant is live. Message us for changes.',
    error: 'Something went wrong. Please try again in a moment.',
  },
  thanksTitle: 'Thanks! We are setting up your assistant.',
  thanksBody: 'You will hear from us within 1 business day.',
  editAgain: 'Fix something',
  planLabel: 'Plan',
  business: {
    name: { label: 'Business name' },
    type: { label: 'Type of business' },
    types: ['Tour operator', 'Dive shop', 'Restaurant', 'Vacation rental', 'Clinic', 'Salon or spa', 'Other'],
    address: { label: 'Address' },
    maps: { label: 'Google Maps link', placeholder: 'https://maps.app.goo.gl/…' },
    website: { label: 'Website', hint: 'Optional' },
    instagram: { label: 'Instagram', placeholder: '@yourbusiness', hint: 'Optional' },
    hours: { label: 'Opening hours', placeholder: 'Mon to Sat 9:00 to 18:00. Closed Sunday.' },
    languages: { label: 'Languages your customers speak' },
    languageOptions: ['Spanish', 'English', 'French', 'Italian', 'German'],
    phone: { label: 'Your personal WhatsApp, for alerts', hint: 'With country code, for example +52 984 000 0000' },
  },
  whatsapp: {
    intro: 'Connect the WhatsApp Business number your customers use. Meta’s official window opens. You stay the owner.',
    connect: 'Connect WhatsApp',
    connecting: 'Opening Meta…',
    connected: 'WhatsApp connected',
    connectError: 'The connection did not finish. Try again, or choose the short call.',
    unavailable: 'Direct connection is not switched on yet. Leave your number and we will connect it with you on a short call.',
    number: { label: 'Business WhatsApp number', hint: 'With country code' },
    callInstead: 'I’ll connect it on a short call',
  },
  answers: {
    intro: 'The assistant only uses what you write here. Write it the way you would tell a customer.',
    prices: { label: 'Prices', placeholder: 'Cenote snorkel: MXN 900 per person. Kids under 6: free.' },
    included: { label: 'What is included', placeholder: 'Pickup from Playa, gear, bilingual guide, water.' },
    howToBook: { label: 'How to book or hold a spot', placeholder: 'Send date, group size and hotel. We ask 50% to hold.' },
    payment: { label: 'Payment methods' },
    paymentOptions: ['Cash', 'Card', 'Bank transfer', 'OXXO', 'PayPal', 'US dollars'],
    cancellation: { label: 'Cancellation policy', placeholder: 'Free cancellation up to 24 h before.' },
    location: { label: 'Location and parking', placeholder: 'Calle 10 and 5th Avenue. Public parking one block away.' },
    other: { label: 'Anything customers often ask', placeholder: 'Free-form questions and answers.' },
    customTitle: 'Your questions',
    question: 'Question',
    answer: 'Answer',
    addQuestion: 'Add a question',
    remove: 'Remove',
  },
  booking: {
    intro: 'The assistant takes the request. Your team confirms. It never promises a spot.',
    rules: { label: 'Booking rules', placeholder: 'Minimum 2 people. Departures at 8:00 and 13:00.' },
    capacity: { label: 'Capacity', placeholder: '12 people per trip' },
    leadTime: { label: 'Minimum notice', placeholder: 'The day before, until 18:00' },
    confirms: { label: 'Who confirms bookings?', placeholder: 'Ana, at the front desk' },
    staffWhatsapp: { label: 'Staff WhatsApp for alerts', hint: 'With country code' },
  },
  review: {
    intro: 'This is how your assistant would reply with what you wrote. If something is off, go back and change it.',
    samplesTitle: 'Sample replies',
    customer: 'Customer',
    assistant: 'Assistant',
    missing: '(no answer yet: the assistant will hand this question to your team)',
    consent: 'I accept the privacy notice and the use of this information to set up my assistant.',
    privacyLink: 'Read the privacy notice',
    approve: 'I approve these answers.',
    edit: 'Edit',
  },
  samples: {
    price: ['How much is it?', 'Happy to help. {prices} {included}'],
    book: ['How do I book?', '{howToBook}'],
    where: ['Where are you? Is there parking?', '{location}'],
    pay: ['Do you take cards?', 'We accept: {payment}.'],
    cancel: ['What if I need to cancel?', '{cancellation}'],
    afterHours: ['Hi, are you open? (11:40 pm)', 'Hi, thanks for writing. Our hours are: {hours}. I can answer your questions here now, and if you need someone from the team, they will write as soon as we open.'],
    unknown: ['Can I bring my dog?', 'Good question. Let me check with the team: a person will reply here very soon.'],
    booking: ['Do you have room for 4 tomorrow?', 'I am taking your request for 4 people tomorrow. {confirms} will confirm here. It is not confirmed yet.'],
  },
};

const fr: OnboardingCopy = {
  title: 'Configurez votre assistant | Réponse automatique 24/7',
  description: 'Formulaire de mise en place de votre assistant.',
  h1: 'Configurez votre assistant',
  intro: 'Environ 15 minutes sur votre cellulaire. Tout s’enregistre automatiquement; revenez avec le même lien.',
  switchLabel: 'English',
  stepOf: 'Étape {n} sur {total}',
  steps: { business: 'Votre entreprise', whatsapp: 'Canaux', answers: 'Réponses', booking: 'Réservations', review: 'Vérifier et approuver' },
  saved: 'Enregistré',
  saving: 'Enregistrement…',
  saveError: 'Impossible d’enregistrer en ligne. Vos réponses restent enregistrées sur ce cellulaire.',
  back: 'Retour',
  next: 'Suivant',
  submit: 'Envoyer pour la mise en place',
  required: 'Veuillez remplir ce champ.',
  states: {
    noSession: 'Ouvrez cette page avec le lien de votre courriel de paiement.',
    loading: 'Chargement de votre commande…',
    notFound: 'Commande introuvable. Vérifiez le lien dans votre courriel ou écrivez-nous.',
    awaiting: 'Nous attendons la confirmation de votre paiement. Vous pouvez remplir le formulaire en attendant.',
    live: 'Votre assistant est en ligne. Écrivez-nous pour tout changement.',
    error: 'Un problème est survenu. Réessayez dans un instant.',
  },
  thanksTitle: 'Merci! Nous configurons votre assistant.',
  thanksBody: 'Vous aurez de nos nouvelles d’ici 1 jour ouvrable.',
  editAgain: 'Corriger quelque chose',
  planLabel: 'Forfait',
  business: {
    name: { label: 'Nom de l’entreprise' },
    type: { label: 'Type d’entreprise' },
    types: ['Restaurant', 'Clinique', 'Salon', 'Garage', 'Entrepreneur (plomberie, rénovation)', 'Boutique', 'Gîte ou chalet', 'Autre'],
    address: { label: 'Adresse' },
    maps: { label: 'Lien Google Maps', placeholder: 'https://maps.app.goo.gl/…' },
    website: { label: 'Site Web', hint: 'Facultatif' },
    instagram: { label: 'Instagram', placeholder: '@votreentreprise', hint: 'Facultatif' },
    hours: { label: 'Heures d’ouverture', placeholder: 'Lun au ven 8 h à 17 h. Sam 9 h à 12 h.' },
    languages: { label: 'Langues de vos clients' },
    languageOptions: ['Français', 'Anglais', 'Espagnol'],
    phone: { label: 'Votre cellulaire, pour les alertes', hint: 'Par exemple +1 514 000 0000' },
  },
  whatsapp: {
    intro: 'Choisissez les canaux de vos clients. Pour WhatsApp, la fenêtre officielle de Meta s’ouvre. Messenger et Instagram se branchent pendant la mise en place, avec un accès que vous approuvez. Les comptes restent à vous.',
    connect: 'Brancher WhatsApp',
    connecting: 'Ouverture de Meta…',
    connected: 'Compte branché',
    connectError: 'Le branchement n’a pas abouti. Réessayez ou choisissez le court appel.',
    unavailable: 'Le branchement direct n’est pas encore activé. Laissez-nous votre numéro et on le branche avec vous lors d’un court appel.',
    number: { label: 'Numéro WhatsApp de l’entreprise', hint: 'Si vous utilisez WhatsApp' },
    callInstead: 'Je préfère brancher ça lors d’un court appel',
    channels: { label: 'Canaux à brancher' },
    channelOptions: ['Messenger', 'Instagram', 'WhatsApp', 'Texto (appels manqués)'],
    facebook: { label: 'Lien de votre page Facebook', placeholder: 'https://facebook.com/…' },
  },
  sms: {
    title: 'Texto après un appel manqué',
    intro: 'On vous fournit un numéro Twilio à votre nom, ou on transfère votre numéro actuel. On en discute lors de la mise en place.',
    number: { label: 'Numéro où vos clients appellent', hint: 'Par exemple +1 514 000 0000' },
    text: { label: 'Texto envoyé après un appel manqué', hint: 'Facultatif. Sinon, on utilise un message court en français.', placeholder: 'Bonjour! Désolé d’avoir manqué votre appel. Répondez à ce texto avec votre question et on vous revient rapidement.' },
  },
  answers: {
    intro: 'L’assistant utilise seulement ce que vous écrivez ici. Écrivez comme vous parleriez à un client.',
    prices: { label: 'Prix', placeholder: 'Coupe homme: 35 $. Coloration à partir de 90 $. Plus taxes.' },
    included: { label: 'Ce qui est inclus', placeholder: 'Lavage et coiffage inclus.' },
    howToBook: { label: 'Comment réserver', placeholder: 'Envoyez la journée et l’heure qui vous conviennent. On confirme par texto.' },
    payment: { label: 'Modes de paiement' },
    paymentOptions: ['Comptant', 'Débit', 'Crédit', 'Virement Interac', 'Chèque'],
    cancellation: { label: 'Politique d’annulation', placeholder: 'Annulation gratuite jusqu’à 24 h avant.' },
    location: { label: 'Adresse et stationnement', placeholder: 'Coin Saint-Denis et Rachel. Stationnement dans la rue.' },
    other: { label: 'Autres questions fréquentes', placeholder: 'Questions et réponses libres.' },
    customTitle: 'Vos questions',
    question: 'Question',
    answer: 'Réponse',
    addQuestion: 'Ajouter une question',
    remove: 'Retirer',
  },
  booking: {
    intro: 'L’assistant prend la demande. Votre équipe confirme. Il ne promet jamais une place.',
    rules: { label: 'Règles de réservation', placeholder: 'Rendez-vous de 30 ou 60 minutes. Pas de rendez-vous le dimanche.' },
    capacity: { label: 'Capacité', placeholder: '2 coiffeuses en même temps' },
    leadTime: { label: 'Délai minimum', placeholder: 'La veille avant 17 h' },
    confirms: { label: 'Qui confirme les réservations?', placeholder: 'Julie, à l’accueil' },
    staffWhatsapp: { label: 'Cellulaire de l’équipe pour les alertes', hint: 'Par texto, WhatsApp ou Messenger' },
  },
  review: {
    intro: 'Voici comment votre assistant répondrait avec vos réponses. Si quelque chose cloche, revenez en arrière pour le changer.',
    samplesTitle: 'Exemples de réponses',
    customer: 'Client',
    assistant: 'Assistant',
    missing: '(réponse manquante: l’assistant transférera la question à votre équipe)',
    consent: 'J’ai lu la politique de confidentialité et je consens à ce que ces renseignements servent à configurer mon assistant.',
    privacyLink: 'Lire la politique de confidentialité',
    approve: 'J’approuve ces réponses.',
    edit: 'Modifier',
  },
  samples: {
    price: ['C’est combien?', 'Avec plaisir. {prices} {included}'],
    book: ['Comment je réserve?', '{howToBook}'],
    where: ['Vous êtes où? Y a-t-il du stationnement?', '{location}'],
    pay: ['Acceptez-vous le débit?', 'Nous acceptons: {payment}.'],
    cancel: ['Et si je dois annuler?', '{cancellation}'],
    afterHours: ['Bonjour, êtes-vous ouverts? (23 h 40)', 'Bonjour, merci de nous écrire. Nos heures: {hours}. Je peux répondre à vos questions ici dès maintenant, et quelqu’un de l’équipe vous écrira à l’ouverture si besoin.'],
    unknown: ['Est-ce que je peux venir avec mon chien?', 'Bonne question. Je vérifie avec l’équipe: une personne vous répond ici très bientôt.'],
    booking: ['Avez-vous de la place demain pour 2?', 'Je prends votre demande pour 2 personnes demain. {confirms} va la confirmer ici. Ce n’est pas encore confirmé.'],
    english: ['Hi, do you have parking?', '(Le client écrit en anglais: l’assistant passe à l’anglais et traduit votre réponse.) {location}'],
  },
};

const enCA: OnboardingCopy = {
  ...en,
  title: 'Set up your assistant | 24/7 Auto-Reply (Canada)',
  switchLabel: 'Français',
  steps: { ...en.steps, whatsapp: 'Channels' },
  business: {
    ...en.business,
    types: ['Restaurant', 'Clinic', 'Salon', 'Garage', 'Contractor (plumbing, renovation)', 'Shop', 'Inn or cottage', 'Other'],
    hours: { label: 'Opening hours', placeholder: 'Mon to Fri 8 am to 5 pm. Sat 9 am to noon.' },
    languageOptions: ['English', 'French', 'Spanish'],
    phone: { label: 'Your cell, for alerts', hint: 'For example +1 416 000 0000' },
  },
  whatsapp: {
    ...en.whatsapp,
    intro: 'Pick the channels your customers use. For WhatsApp, Meta’s official window opens. Messenger and Instagram are connected during setup, with access you approve. The accounts stay yours.',
    connect: 'Connect WhatsApp',
    connected: 'Account connected',
    number: { label: 'Business WhatsApp number', hint: 'If you use WhatsApp' },
    channels: { label: 'Channels to connect' },
    channelOptions: ['Messenger', 'Instagram', 'WhatsApp', 'Text (missed calls)'],
    facebook: { label: 'Your Facebook Page link', placeholder: 'https://facebook.com/…' },
  },
  sms: {
    title: 'Missed-call text-back',
    intro: 'We set up a Twilio number in your name, or forward your current number. We sort this out during setup.',
    number: { label: 'Number your customers call', hint: 'For example +1 416 000 0000' },
    text: { label: 'Text sent after a missed call', hint: 'Optional. Write it in your customers’ language; businesses in Quebec should write it in French.', placeholder: 'Hi! Sorry we missed your call. Reply to this text with your question and we will get back to you soon.' },
  },
  answers: {
    ...en.answers,
    prices: { label: 'Prices', placeholder: 'Men’s cut: $35. Colour from $90. Plus tax.' },
    paymentOptions: ['Cash', 'Debit', 'Credit', 'Interac e-Transfer', 'Cheque'],
    location: { label: 'Location and parking', placeholder: 'Corner of Saint-Denis and Rachel. Street parking.' },
  },
  review: {
    ...en.review,
    intro: 'Here is how the assistant would reply with what you wrote. It answers in English, and in French when the customer writes in French (French first for businesses in Quebec). We show you the French version before going live.',
    consent: 'I have read the privacy policy and consent to this information being used to set up my assistant.',
    privacyLink: 'Read the privacy policy',
  },
  samples: en.samples,
};

const enUS: OnboardingCopy = {
  ...enCA,
  title: 'Set up your assistant | 24/7 Auto-Reply (US)',
  switchLabel: '',
  business: {
    ...enCA.business,
    types: ['Restaurant', 'Clinic', 'Salon or spa', 'Auto shop', 'Contractor (plumbing, HVAC, remodeling)', 'Shop', 'Vacation rental', 'Other'],
    languageOptions: ['English', 'Spanish', 'French'],
    phone: { label: 'Your cell, for alerts', hint: 'For example +1 212 555 0100' },
  },
  sms: {
    ...enCA.sms!,
    intro: 'We set up a Twilio number in your name, or forward your current number, and register it for business texting with US carriers. We sort this out during setup.',
    number: { label: 'Number your customers call', hint: 'For example +1 212 555 0100' },
    text: { label: 'Text sent after a missed call', hint: 'Optional. Otherwise we use a short message in English.', placeholder: 'Hi! Sorry we missed your call. Reply to this text with your question and we will get back to you soon.' },
  },
  answers: {
    ...enCA.answers,
    prices: { label: 'Prices', placeholder: 'Haircut: $35. Color from $90. Plus tax.' },
    paymentOptions: ['Cash', 'Card', 'Zelle', 'Venmo', 'Check'],
    location: { label: 'Location and parking', placeholder: 'Main St and 3rd Ave. Free parking behind the building.' },
  },
  review: {
    ...enCA.review,
    intro: 'Here is how the assistant would reply with what you wrote. It answers in English, and in Spanish when the customer writes in Spanish. We show you the Spanish version before going live.',
  },
};

export const onboardingCopy: Record<AutoLocale, OnboardingCopy> = { es, en, fr, 'en-CA': enCA, 'en-US': enUS };
