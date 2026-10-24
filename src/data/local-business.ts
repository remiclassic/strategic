// Copy for the local-business offer, in English, French and Mexican Spanish.
// Keep sentences short. Do not add client names, testimonials, prices or stats.

export type LocalLang = 'en' | 'fr' | 'es';

export const localPaths: Record<LocalLang, string> = {
  en: '/local-business/',
  fr: '/fr/local-business/',
  es: '/es/local-business/',
};

export const localAlternates = [
  { lang: 'en' as const, href: localPaths.en },
  { lang: 'fr' as const, href: localPaths.fr },
  { lang: 'es' as const, href: localPaths.es },
];

export const localContactHref = '/contact/?engagement=local#enquiry';
export const slothJamHref = 'https://www.slothjam.com';

type LocalCopy = {
  path: string;
  title: string;
  description: string;
  langLabel: string;
  eyebrow: string;
  h1: [string, string];
  lede: string;
  cta: string;
  formNote?: string;
  audiences: string[];
  facts: [string, string][];
  servicesEyebrow: string;
  servicesTitle: [string, string];
  servicesIntro: string;
  services: [string, string][];
  whyEyebrow: string;
  whyTitle: [string, string];
  why: string[];
  whyPortraitAlt: string;
  proofTitle: string;
  proofBody: string;
  proofCta: string;
  stepsEyebrow: string;
  stepsTitle: [string, string];
  stepsIntro: string;
  steps: [string, string, string][];
  faqEyebrow: string;
  faqTitle: string;
  faq: [string, string][];
  closeEyebrow: string;
  closeTitle: [string, string];
  closeBody: string;
  closeCta: string;
};

export const localCopy: Record<LocalLang, LocalCopy> = {
  en: {
    path: localPaths.en,
    title: 'Custom Websites and Apps for Local Businesses | Strategic Sloth',
    description:
      'Websites and custom apps for restaurants, shops, tours, clinics, gyms and hotels. Mobile-friendly, fast and ready for Google. Free quote. Fixed price.',
    langLabel: 'English',
    eyebrow: 'For local businesses',
    h1: ['A site that works', 'for your business.'],
    lede:
      'For restaurants, shops, tour operators, clinics, gyms and hotels. Built to look good on a phone, load fast and show up on Google. English, Spanish or French when you need them.',
    cta: 'Get a free quote',
    audiences: ['Restaurants', 'Shops', 'Tour operators', 'Clinics', 'Gyms', 'Hotels'],
    facts: [
      ['Free quote', 'No charge to ask'],
      ['Fixed price', 'Agreed in writing'],
      ['EN · ES · FR', 'One language or two'],
      ['In person or remote', 'Wherever you are'],
    ],
    servicesEyebrow: 'What we make',
    servicesTitle: ['Four ways', 'we can help.'],
    servicesIntro: 'Pick one, or combine them. We keep the scope small and clear.',
    services: [
      [
        'Business websites',
        'A site that is easy on a phone, loads fast and is ready for Google. Bilingual English, Spanish or French when your customers need it.',
      ],
      [
        'Custom web and mobile apps',
        'Booking, ordering, loyalty and simple tools for your team. Built for daily use, not for a demo.',
      ],
      [
        'Refresh or fix a current site',
        'Keep what already works. Replace what does not. No need to start over if the bones are good.',
      ],
      [
        'Ongoing care',
        'Updates, small changes and someone to call when something breaks. You are not left alone after launch.',
      ],
    ],
    whyEyebrow: 'Why this studio',
    whyTitle: ['Twenty years of UX and UI.', 'His own products, too.'],
    why: [
      'Rémi Couture has spent about 20 years designing games and apps for large studios. He leads the work himself.',
      'He also ships his own products, so he knows what it takes to finish and hand something over.',
      'You talk to him directly. Quotes are free. Every project has a fixed price before work starts.',
    ],
    whyPortraitAlt: 'Rémi Couture, founder of Strategic Sloth',
    proofTitle: 'Sloth Jam',
    proofBody:
      'A family party game he designed, built and released. You can play it in the browser. It is one example of work he ships under his own name.',
    proofCta: 'Play Sloth Jam',
    stepsEyebrow: 'How it works',
    stepsTitle: ['Four short steps.', 'No surprises.'],
    stepsIntro: 'A simple path from the first note to a site or app you own.',
    steps: [
      ['Tell us what you need', 'A short note about your business and what you want. A link to your current site helps.', 'A first reply within one business day'],
      ['Get a free quote', 'You receive a written scope and a fixed price. The quote is free. No hourly surprises later.', 'A price you can say yes or no to'],
      ['We design and build', 'You review along the way. Pages stay short. The next action stays clear.', 'Something you can look at each week'],
      ['You own it', 'Files, accounts and code are yours at handover. We can stay on for care if you want.', 'A site or app that is yours'],
    ],
    faqEyebrow: 'Questions',
    faqTitle: 'A few useful answers.',
    faq: [
      [
        'How long does it take?',
        'A typical website takes a few weeks. An app takes longer. The quote includes a date you can plan around.',
      ],
      [
        'What languages can the site be in?',
        'English, Spanish and French. Many businesses use two, so visitors and locals both feel at home.',
      ],
      [
        'Can you fix the site I already have?',
        'Yes. We can refresh it, speed it up or rebuild the parts that hold you back. We will say which path fits before you pay.',
      ],
      [
        'Who owns the site or the app?',
        'You do. Files, accounts and the code are yours when we hand the work over.',
      ],
      [
        'What does it cost?',
        'Quotes are free. Every project has a fixed price, agreed in writing before work starts. We do not publish a price list for this work because each business is different.',
      ],
    ],
    closeEyebrow: 'Ready when you are',
    closeTitle: ['Tell us about', 'your business.'],
    closeBody: 'Send a short note. You will get a free quote and a fixed price. Rémi replies personally.',
    closeCta: 'Get a free quote',
  },
  fr: {
    path: localPaths.fr,
    title: 'Sites et apps pour commerces locaux | Strategic Sloth',
    description:
      'Sites et apps pour restaurants, boutiques, excursions, cliniques, gyms et hôtels. Clairs sur téléphone, rapides, prêts pour Google. Devis gratuit. Prix fixe.',
    langLabel: 'Français',
    eyebrow: 'Pour les commerces locaux',
    h1: ['Un site à la mesure', 'de votre commerce.'],
    lede:
      'Pour restaurants, boutiques, voyagistes, cliniques, gyms et hôtels. Clair sur téléphone, rapide à charger, facile à trouver sur Google. En français, anglais ou espagnol si vos clients en ont besoin.',
    cta: 'Demander un devis gratuit',
    formNote: 'Le formulaire est en anglais. Écrivez-nous en français, sans souci.',
    audiences: ['Restaurants', 'Boutiques', 'Voyagistes', 'Cliniques', 'Gyms', 'Hôtels'],
    facts: [
      ['Devis gratuit', 'Demander ne coûte rien'],
      ['Prix fixe', 'Écrit avant de commencer'],
      ['FR · EN · ES', 'Une langue ou deux'],
      ['Sur place ou à distance', 'Selon ce qui vous convient'],
    ],
    servicesEyebrow: 'Ce que nous faisons',
    servicesTitle: ['Quatre façons', 'de vous aider.'],
    servicesIntro: 'Choisissez-en une, ou combinez-les. On garde le périmètre petit et clair.',
    services: [
      [
        'Sites pour votre commerce',
        'Un site agréable sur téléphone, rapide et prêt pour Google. Bilingue français, anglais ou espagnol quand vos clients en ont besoin.',
      ],
      [
        'Apps web et mobiles sur mesure',
        'Réservation, commandes, fidélité et petits outils pour votre équipe. Pensés pour le quotidien, pas pour une démo.',
      ],
      [
        'Revoir ou réparer le site actuel',
        'On garde ce qui marche. On remplace ce qui bloque. Pas besoin de tout refaire si la base est saine.',
      ],
      [
        'Suivi après le lancement',
        'Mises à jour, petits changements et quelqu’un à joindre si ça casse. Vous n’êtes pas seuls après la mise en ligne.',
      ],
    ],
    whyEyebrow: 'Pourquoi ce studio',
    whyTitle: ['Vingt ans d’UX et d’UI.', 'Et ses propres produits.'],
    why: [
      'Rémi Couture conçoit des jeux et des apps depuis environ vingt ans, pour de grands studios. Il mène le travail lui-même.',
      'Il publie aussi ses propres produits. Il sait ce que ça demande de finir et de transmettre.',
      'Vous lui parlez directement. Le devis est gratuit. Chaque projet a un prix fixe avant le début des travaux.',
    ],
    whyPortraitAlt: 'Rémi Couture, fondateur de Strategic Sloth',
    proofTitle: 'Sloth Jam',
    proofBody:
      'Un jeu de fête en famille qu’il a conçu, construit et publié. On y joue dans le navigateur. C’est un exemple de travail qu’il sort sous son nom.',
    proofCta: 'Jouer à Sloth Jam',
    stepsEyebrow: 'Comment ça se passe',
    stepsTitle: ['Quatre étapes courtes.', 'Sans surprise.'],
    stepsIntro: 'Un chemin simple, du premier mot jusqu’à un site ou une app qui vous appartient.',
    steps: [
      ['Dites-nous ce qu’il vous faut', 'Un court mot sur votre commerce et ce que vous voulez. Un lien vers le site actuel aide.', 'Une première réponse en un jour ouvrable'],
      ['Recevez un devis gratuit', 'Vous recevez un périmètre écrit et un prix fixe. Le devis ne coûte rien. Pas de tarif à l’heure plus tard.', 'Un prix auquel dire oui ou non'],
      ['On conçoit et on construit', 'Vous revoyez le travail en cours de route. Les pages restent courtes. L’action suivante reste claire.', 'Quelque chose à regarder chaque semaine'],
      ['C’est à vous', 'Fichiers, comptes et code vous appartiennent à la remise. On peut rester pour le suivi si vous le voulez.', 'Un site ou une app qui est le vôtre'],
    ],
    faqEyebrow: 'Questions',
    faqTitle: 'Quelques réponses utiles.',
    faq: [
      [
        'Combien de temps ça prend ?',
        'Un site typique prend quelques semaines. Une app prend plus longtemps. Le devis inclut une date sur laquelle vous pouvez compter.',
      ],
      [
        'Dans quelles langues le site peut-il être ?',
        'Français, anglais et espagnol. Beaucoup de commerces en utilisent deux, pour les visiteurs et pour le quartier.',
      ],
      [
        'Pouvez-vous réparer le site que j’ai déjà ?',
        'Oui. On peut le rafraîchir, l’accélérer ou reconstruire ce qui vous retient. On dit quel chemin convient avant que vous payiez.',
      ],
      [
        'Qui possède le site ou l’app ?',
        'Vous. Les fichiers, les comptes et le code sont à vous quand on remet le travail.',
      ],
      [
        'Combien ça coûte ?',
        'Le devis est gratuit. Chaque projet a un prix fixe, convenu par écrit avant de commencer. Nous ne publions pas de grille pour ce travail, parce que chaque commerce est différent.',
      ],
    ],
    closeEyebrow: 'Quand vous voulez',
    closeTitle: ['Parlez-nous', 'de votre commerce.'],
    closeBody: 'Envoyez un court mot. Vous recevrez un devis gratuit et un prix fixe. Rémi répond personnellement.',
    closeCta: 'Demander un devis gratuit',
  },
  es: {
    path: localPaths.es,
    title: 'Sitios web y apps a la medida para negocios locales | Strategic Sloth',
    description:
      'Sitios y apps para restaurantes, tiendas, tours, clínicas, gimnasios y hoteles en Playa del Carmen y la Riviera Maya. Cotización gratis. Precio fijo.',
    langLabel: 'Español',
    eyebrow: 'Para negocios locales',
    h1: ['Un sitio que sí le sirve', 'a su negocio.'],
    lede:
      'Trabajo con restaurantes, tiendas, tours, clínicas, gimnasios y hoteles en Playa del Carmen y la Riviera Maya. En persona o a distancia. El sitio puede ser bilingüe, en español e inglés, para turistas y para la comunidad.',
    cta: 'Pedir una cotización gratis',
    formNote: 'El formulario está en inglés. Puede escribirnos en español, sin problema.',
    audiences: ['Restaurantes', 'Tiendas', 'Tours', 'Clínicas', 'Gimnasios', 'Hoteles'],
    facts: [
      ['Cotización gratis', 'Preguntar no cuesta'],
      ['Precio fijo', 'Por escrito, antes de empezar'],
      ['ES · EN', 'Uno o los dos idiomas'],
      ['En persona o a distancia', 'Playa del Carmen y más'],
    ],
    servicesEyebrow: 'Qué hacemos',
    servicesTitle: ['Cuatro formas', 'de ayudar.'],
    servicesIntro: 'Elija una, o júntelas. El alcance se queda chico y claro.',
    services: [
      [
        'Sitios para su negocio',
        'Un sitio cómodo en el celular, rápido y listo para Google. Bilingüe en español e inglés cuando sus clientes lo necesitan, o también en francés.',
      ],
      [
        'Apps web y móviles a la medida',
        'Reservaciones, pedidos, lealtad y herramientas simples para su equipo. Hechas para el día a día, no para una demo.',
      ],
      [
        'Renovar o arreglar el sitio actual',
        'Se queda lo que ya funciona. Se cambia lo que estorba. No hay que empezar de cero si la base está bien.',
      ],
      [
        'Cuidado después del lanzamiento',
        'Actualizaciones, cambios chicos y alguien a quien llamar si algo falla. No se queda solo cuando el sitio ya está en línea.',
      ],
    ],
    whyEyebrow: 'Por qué este estudio',
    whyTitle: ['Veinte años de UX y UI.', 'Y productos propios.'],
    why: [
      'Rémi Couture lleva cerca de 20 años diseñando juegos y apps para grandes estudios. Él lleva el trabajo él mismo.',
      'También publica sus propios productos, así que sabe lo que cuesta terminar y entregar.',
      'Usted habla con él. La cotización es gratis. Cada proyecto tiene un precio fijo antes de empezar.',
    ],
    whyPortraitAlt: 'Rémi Couture, fundador de Strategic Sloth',
    proofTitle: 'Sloth Jam',
    proofBody:
      'Un juego familiar que él diseñó, construyó y publicó. Se puede jugar en el navegador. Es un ejemplo de trabajo que saca con su propio nombre.',
    proofCta: 'Jugar Sloth Jam',
    stepsEyebrow: 'Cómo funciona',
    stepsTitle: ['Cuatro pasos cortos.', 'Sin sorpresas.'],
    stepsIntro: 'Un camino simple, del primer mensaje a un sitio o una app que es suya.',
    steps: [
      ['Cuéntenos qué necesita', 'Una nota corta sobre su negocio y lo que busca. El enlace a su sitio actual ayuda.', 'Una primera respuesta en un día hábil'],
      ['Reciba una cotización gratis', 'Le llega un alcance por escrito y un precio fijo. La cotización no tiene costo. Luego no hay cobros por hora.', 'Un precio para decir que sí o que no'],
      ['Diseñamos y construimos', 'Usted va viendo el avance. Las páginas se quedan cortas. La siguiente acción se entiende.', 'Algo que revisar cada semana'],
      ['Es suyo', 'Archivos, cuentas y código quedan en sus manos al entregar. Podemos seguir cuidándolo si usted quiere.', 'Un sitio o una app que le pertenece'],
    ],
    faqEyebrow: 'Preguntas',
    faqTitle: 'Algunas respuestas útiles.',
    faq: [
      [
        '¿Cuánto tarda?',
        'Un sitio típico toma unas semanas. Una app toma más. La cotización incluye una fecha con la que puede contar.',
      ],
      [
        '¿En qué idiomas puede estar el sitio?',
        'Español, inglés y francés. Muchos negocios en la Riviera Maya usan español e inglés, para turistas y para la gente de aquí.',
      ],
      [
        '¿Pueden arreglar el sitio que ya tengo?',
        'Sí. Lo podemos renovar, hacerlo más rápido o reconstruir lo que lo frena. Le decimos qué camino conviene antes de que pague.',
      ],
      [
        '¿De quién es el sitio o la app?',
        'De usted. Los archivos, las cuentas y el código son suyos cuando entregamos el trabajo.',
      ],
      [
        '¿Cuánto cuesta?',
        'La cotización es gratis. Cada proyecto tiene un precio fijo, acordado por escrito antes de empezar. No publicamos una lista de precios para este trabajo porque cada negocio es distinto.',
      ],
    ],
    closeEyebrow: 'Cuando usted quiera',
    closeTitle: ['Cuéntenos de', 'su negocio.'],
    closeBody: 'Mande una nota corta. Recibirá una cotización gratis y un precio fijo. Rémi le responde él mismo.',
    closeCta: 'Pedir una cotización gratis',
  },
};
