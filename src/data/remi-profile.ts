// Copy for the About Rémi Couture page, in English and French. Career facts match services-credits.ts
// and the résumé; keep them in step if those change. Years are written out ("2009 to 2013") on purpose.
const RESUME = 'https://remiclassic.github.io/remiresume/';
const CBC = 'https://www.cbc.ca/listen/live-radio/1-110-daybreak-south/clip/16244668-former-kelowna-game-designer-back-free-game-kids';
const GLOBAL = 'https://globalnews.ca/news/4496492/end-of-the-road-for-kelownas-club-penguin/';

const links = (resume: string, credits: string): [string, string, string][] => [
  [resume, 'remiclassic.github.io/remiresume', RESUME],
  ['LinkedIn', 'in/remicouture', 'https://www.linkedin.com/in/remicouture/'],
  ['X', '@remicouture', 'https://x.com/remicouture'],
  ['ArtStation', 'remicouture', 'https://www.artstation.com/remicouture'],
  ['Behance', 'RemiCouture', 'https://www.behance.net/RemiCouture'],
  ['MobyGames', credits, 'https://www.mobygames.com/person/867552/remi-couture/'],
  ['GitHub', 'remiclassic', 'https://github.com/remiclassic'],
];

const games = (copy: [string, string][]) => [
  { name: 'Sloth Jam', href: 'https://slothjam.com/', img: '/media/studio/sloth-jam.jpg', pos: '50% 50%' },
  { name: 'Tropic Tumble', href: `${RESUME}tropictumble/`, img: '/media/tropic-tumble/trailer-poster.webp', pos: '50% 50%' },
  { name: 'SliceForge', href: 'https://www.sliceforge.io/', img: '/studio-images/sf-compose.webp', pos: '50% 50%' },
  { name: 'Norman Ascension', href: 'https://normanascension.com/', img: '/media/studio/norman-battle.jpg', pos: '40% 50%' },
].map((game, i) => ({ ...game, tag: copy[i][0], body: copy[i][1] }));

const clients = ['Disney', 'Sony', 'Riot Games', 'AppLovin', 'Tencent', 'Phoenix Labs', 'Universal', 'Hasbro'];

export const remiCopy = {
  en: {
    switchLabel: 'Français', switchHref: '/fr/remi-couture/',
    eyebrow: 'About · Game UX/UI designer',
    portraitTop: ['Founder, Strategic Sloth', 'Montreal, QC'], portraitAlt: 'Portrait of Rémi Couture',
    lede: '<strong>Guillaume "Rémi" Couture</strong> (also written Remi Couture or Remy Couture) is a game UX/UI designer and developer based in Greater Montreal, Canada, and the founder of <a href="/">Strategic Sloth LLC</a>.',
    disambiguation: 'Not to be confused with other people who share the name, including the Montreal special effects makeup artist Rémy Couture.',
    ctaPrimary: 'Work with Rémi', resume: 'Resume and portfolio',
    facts: [['20 years', 'in game UI, UX and product design'], ['12 studios', 'from Club Penguin to Offworld'], ['9 studios', 'directed at once as UX Director'], ['EN · FR', 'Greater Montreal, working worldwide']],

    originEyebrow: '01 · Where it started', originTitle: ['Club Penguin at Disney', '2006 to 2009'],
    origin: 'Rémi started his career at Club Penguin, the kids\' virtual world acquired by The Walt Disney Company in 2007. He began in customer support and moved into the art department, where he worked as an illustrator and animator, creating Flash illustration and 3D assets.',
    path: [['Start', 'Customer support'], ['Then', 'Art department'], ['Role', 'Illustrator and animator']],
    originCaption: 'Gary, Rockhopper and Aunt Arctic: Club Penguin character art drawn by Rémi. © Disney.',
    originAlt: 'Club Penguin characters Gary, Rockhopper and Aunt Arctic standing on the Club Penguin logo',
    disclaimer: 'Club Penguin artwork and trademarks belong to Disney. Nothing on this page is affiliated with or endorsed by Disney.',

    careerEyebrow: '02 · 2009 to 2025', careerTitle: ['Career in game UI.', 'Eleven studios.'],
    careerIntro: 'From hidden-object games and kids\' apps to MechWarrior 5, Dauntless and Squad.',
    career: [
      { years: '2009 to 2013', studio: 'Gogii Games', role: 'UX/UI designer and illustrator', note: '27 shipped games.' },
      { years: '2013 to 2014', studio: 'Cupcake Digital', role: 'UX/UI designer', note: 'Kids\' apps for iOS and Android.' },
      { years: '2014 to 2015', studio: 'DeNA', role: 'UX/UI designer', note: 'Mobile game UI in Unity.' },
      { years: '2015 to 2016', studio: 'Hothead Games', role: 'Senior UX/UI designer', note: 'Mobile games in Unity.' },
      { years: '2016 to 2018', studio: 'Piranha Games', role: 'UX/UI designer', work: 'MechWarrior 5' },
      { years: '2018', studio: 'Phoenix Labs', role: 'UX/UI designer', work: 'Dauntless' },
      { years: 'June to August 2018', studio: 'Sprung Studios', role: 'UX/UI and VR Art Director (contract)', note: 'Vancouver. Directed client-facing UI projects, led stakeholder reviews and mentored junior designers.', id: 'sprung-studios' },
      { years: '2019 to 2020', studio: 'Frima Studio', role: 'Lead UX/UI designer', note: 'Unity and Unreal Engine projects.' },
      { years: '2020 to 2021', studio: 'UX Magicians', role: 'Senior UX/UI product designer', note: 'Client work across Unity and Unreal pipelines.' },
      { years: '2021 to 2022', studio: 'AppLovin', role: 'UX Director, Central Creative', note: 'Set UX standards across nine mobile game studios.' },
      { years: '2022 to 2025', studio: 'Offworld', role: 'Senior UX/UI designer', work: 'Squad' },
    ],
    now: { years: '2025 to now', studio: 'Strategic Sloth', role: 'Founder', note: 'Game UI, apps and original games.' },
    clientsLabel: 'Teams and clients he has worked with', clients,
    quoteRelation: 'Hired and managed Rémi · AppLovin',

    studioEyebrow: '03 · Now', studioTitle: ['Strategic Sloth', 'and his own games.'],
    studioIntro: 'Through Strategic Sloth, Rémi designs and builds game UI, apps and games for studios, and makes original titles.',
    studioLink: 'Meet the studio',
    games: games([
      ['Free · in the browser', 'A free social party game for kids and families, playable in the browser. Online play is parent-gated and off by default.'],
      ['Live on Google Play', 'A sticker merge puzzle on Google Play, designed and built end to end.'],
      ['Game UI tool', 'A game UI production tool: from a visual reference to editable screens and exportable UI kits.'],
      ['In development', 'A medieval dynasty RPG in development.'],
    ]),

    pressEyebrow: '04 · Press', pressTitle: 'Press',
    press: [
      { outlet: 'CBC Radio One · Daybreak South', date: 'October 2026', title: 'Former Kelowna game designer is back with a new free game for kids', href: CBC, action: 'Listen to the clip' },
      { outlet: 'Global News', date: 'September 2018', title: 'End of the road for Kelowna’s Club Penguin', href: GLOBAL, action: 'Read the article', note: 'Lead image: Club Penguin character art Rémi drew. © Disney.' },
    ],
    pressKit: 'Press kit',
    onlineEyebrow: '05 · Elsewhere', onlineTitle: 'Find Rémi Couture online',
    links: links('Resume and portfolio', 'Game credits'),

    ctaEyebrow: 'Work with Rémi', ctaTitle: ['Building a game?', 'Rémi leads every project.'],
    cta: 'Tell him what you are building, your engine and your dates. He replies personally within one business day, with a suggested first step and a price.',
    ctaButton: 'Start a project', ctaSecondary: 'See the studio',
  },
  fr: {
    switchLabel: 'English', switchHref: '/remi-couture/',
    eyebrow: 'À propos · Designer UX/UI de jeux',
    portraitTop: ['Fondateur, Strategic Sloth', 'Montréal, QC'], portraitAlt: 'Portrait de Rémi Couture',
    lede: '<strong>Guillaume « Rémi » Couture</strong> (aussi écrit Remi Couture ou Remy Couture) est designer et développeur UX/UI de jeux vidéo établi dans le Grand Montréal, et le fondateur de <a href="/">Strategic Sloth LLC</a>.',
    disambiguation: 'À ne pas confondre avec l’artiste maquilleur d’effets spéciaux montréalais Rémy Couture.',
    ctaPrimary: 'Travailler avec Rémi', resume: 'CV et portfolio',
    facts: [['20 ans', 'en UI, UX et design de produits de jeux'], ['12 studios', 'de Club Penguin à Offworld'], ['9 studios', 'dirigés à la fois comme directeur UX'], ['FR · EN', 'Grand Montréal, partout dans le monde']],

    originEyebrow: '01 · Les débuts', originTitle: ['Club Penguin chez Disney', '2006 à 2009'],
    origin: 'Rémi a commencé sa carrière à Club Penguin, le monde virtuel pour enfants acquis par The Walt Disney Company en 2007. Il a d’abord travaillé au soutien à la clientèle, puis a rejoint l’équipe artistique comme illustrateur et animateur, créant des illustrations Flash et des éléments 3D.',
    path: [['Début', 'Soutien à la clientèle'], ['Ensuite', 'Équipe artistique'], ['Rôle', 'Illustrateur et animateur']],
    originCaption: 'Gary, Rockhopper et Tante Arctic : personnages Club Penguin dessinés par Rémi. © Disney.',
    originAlt: 'Les personnages Club Penguin Gary, Rockhopper et Tante Arctic debout sur le logo Club Penguin',
    disclaimer: 'Les œuvres et marques de Club Penguin appartiennent à Disney. Cette page n’est affiliée ni approuvée par Disney.',

    careerEyebrow: '02 · 2009 à 2025', careerTitle: ['Parcours en UI de jeux.', 'Onze studios.'],
    careerIntro: 'Des jeux d’objets cachés et des applications pour enfants jusqu’à MechWarrior 5, Dauntless et Squad.',
    career: [
      { years: '2009 à 2013', studio: 'Gogii Games', role: 'Designer UX/UI et illustrateur', note: '27 jeux lancés.' },
      { years: '2013 à 2014', studio: 'Cupcake Digital', role: 'Designer UX/UI', note: 'Applications pour enfants sur iOS et Android.' },
      { years: '2014 à 2015', studio: 'DeNA', role: 'Designer UX/UI', note: 'Interfaces de jeux mobiles en Unity.' },
      { years: '2015 à 2016', studio: 'Hothead Games', role: 'Designer UX/UI senior', note: 'Jeux mobiles en Unity.' },
      { years: '2016 à 2018', studio: 'Piranha Games', role: 'Designer UX/UI', work: 'MechWarrior 5' },
      { years: '2018', studio: 'Phoenix Labs', role: 'Designer UX/UI', work: 'Dauntless' },
      { years: 'Juin à août 2018', studio: 'Sprung Studios', role: 'Directeur artistique UX/UI et VR (contrat)', note: 'Vancouver. Direction de projets clients, revues avec parties prenantes et mentorat de designers juniors.', id: 'sprung-studios' },
      { years: '2019 à 2020', studio: 'Frima Studio', role: 'Lead UX/UI', note: 'Projets Unity et Unreal Engine.' },
      { years: '2020 à 2021', studio: 'UX Magicians', role: 'Designer produit UX/UI senior', note: 'Projets clients en Unity et Unreal.' },
      { years: '2021 à 2022', studio: 'AppLovin', role: 'Directeur UX, Central Creative', note: 'Normalisation UX pour neuf studios mobiles.' },
      { years: '2022 à 2025', studio: 'Offworld', role: 'Designer UX/UI senior', work: 'Squad' },
    ],
    now: { years: '2025 à aujourd’hui', studio: 'Strategic Sloth', role: 'Fondateur', note: 'UI de jeux, applications et jeux originaux.' },
    clientsLabel: 'Équipes et clients', clients,
    quoteRelation: 'A embauché et dirigé Rémi · AppLovin',

    studioEyebrow: '03 · Aujourd’hui', studioTitle: ['Strategic Sloth', 'et ses propres jeux.'],
    studioIntro: 'Avec Strategic Sloth, Rémi conçoit et développe des interfaces de jeux, des applications et des jeux complets pour des studios, et crée des titres originaux.',
    studioLink: 'Découvrir le studio',
    games: games([
      ['Gratuit · navigateur', 'Jeu social gratuit pour enfants et familles, jouable dans le navigateur. Le jeu en ligne est protégé par un contrôle parental et désactivé par défaut.'],
      ['Sur Google Play', 'Casse-tête « merge » à autocollants sur Google Play, conçu et développé de A à Z.'],
      ['Outil d’UI de jeux', 'Outil de production d’UI de jeux : d’une référence visuelle à des écrans modifiables et des kits d’UI exportables.'],
      ['En développement', 'RPG dynastique médiéval en développement.'],
    ]),

    pressEyebrow: '04 · Presse', pressTitle: 'Presse',
    press: [
      { outlet: 'CBC Radio One · Daybreak South', date: 'Octobre 2026', title: 'Former Kelowna game designer is back with a new free game for kids', href: CBC, action: 'Écouter l’extrait' },
      { outlet: 'Global News', date: 'Septembre 2018', title: 'End of the road for Kelowna’s Club Penguin', href: GLOBAL, action: 'Lire l’article', note: 'Image de tête : personnages Club Penguin dessinés par Rémi. © Disney.' },
    ],
    pressKit: 'Dossier de presse',
    onlineEyebrow: '05 · Ailleurs', onlineTitle: 'Présence en ligne',
    links: links('CV et portfolio', 'Crédits de jeux'),

    ctaEyebrow: 'Travailler avec Rémi', ctaTitle: ['Vous développez un jeu ?', 'Rémi dirige chaque projet.'],
    cta: 'Décrivez votre projet, votre moteur et vos échéances. Rémi répond personnellement en un jour ouvrable, avec une première étape et un prix.',
    ctaButton: 'Démarrer un projet', ctaSecondary: 'Découvrir le studio',
  },
};

export type RemiLang = keyof typeof remiCopy;
