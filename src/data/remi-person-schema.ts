// JSON-LD for /remi-couture/. Keep facts limited to this file and remi-profile.ts.
// TODO: add the person's own Wikidata Q-id to Person.sameAs when it exists. Do not invent one.

const STUDIO_WIKIDATA = 'https://www.wikidata.org/wiki/Q141820975';
const SLOTH_JAM_WIKIDATA = 'https://www.wikidata.org/wiki/Q141821011';
const SLOTH_JAM_URL = 'https://www.slothjam.com';
const PERSON_IMAGE = '/studio-images/remi-founder-photo.jpg';
const PERSON_PATH = '/remi-couture/';
const PERSON_ID_PATH = '/remi-couture/#person';
const STUDIO_ID_PATH = '/#studio';

const CBC =
  'https://www.cbc.ca/listen/live-radio/1-110-daybreak-south/clip/16244668-former-kelowna-game-designer-back-free-game-kids';

export const remiPersonDescription =
  'Rémi Couture is a game developer and founder of Strategic Sloth. Also written Remi Couture, he is a game UX/UI designer, creator of Sloth Jam, and a Club Penguin illustrator and animator (2006 to 2009).';

export const remiPersonSameAs = [
  'https://www.linkedin.com/in/remicouture/',
  'https://remiclassic.github.io/remiresume/',
  'https://medium.com/@rcouture_37711',
  'https://www.slothjam.com',
] as const;

const href = (site: URL, path: string) => new URL(path, site).href;

export function remiPersonSchema(site: URL) {
  const personId = href(site, PERSON_ID_PATH);
  const studioId = href(site, STUDIO_ID_PATH);

  return {
    '@type': 'Person',
    '@id': personId,
    name: 'Rémi Couture',
    alternateName: ['Remi Couture', 'Guillaume Couture', 'Guillaume (Rémi) Couture'],
    jobTitle: ['Game developer', 'Founder'],
    description: remiPersonDescription,
    url: href(site, PERSON_PATH),
    image: href(site, PERSON_IMAGE),
    knowsAbout: ['Game UX/UI', 'Game development', 'Unreal Engine', 'Three.js'],
    worksFor: {
      '@type': 'Organization',
      '@id': studioId,
      name: 'Strategic Sloth',
      url: href(site, '/'),
      sameAs: STUDIO_WIKIDATA,
      founder: { '@id': personId },
    },
    sameAs: [...remiPersonSameAs],
    subjectOf: {
      '@type': 'RadioEpisode',
      name: 'Former Kelowna game designer is back with a new free game for kids',
      url: CBC,
      publisher: { '@type': 'Organization', name: 'CBC Radio One, Daybreak South' },
    },
  };
}

export function remiNotableWorks(site: URL, personId: string) {
  return [
    {
      '@type': 'VideoGame',
      '@id': `${SLOTH_JAM_URL}/#game`,
      name: 'Sloth Jam',
      url: SLOTH_JAM_URL,
      sameAs: SLOTH_JAM_WIKIDATA,
      author: { '@id': personId },
      creator: { '@id': personId },
    },
    {
      '@type': 'VideoGame',
      '@id': href(site, '/remi-couture/#club-penguin-game'),
      name: 'Club Penguin',
      contributor: {
        '@type': 'Role',
        roleName: 'Illustrator and animator',
        startDate: '2006',
        endDate: '2009',
        contributor: { '@id': personId },
      },
    },
  ];
}

export function remiProfileJsonLd(site: URL) {
  const person = remiPersonSchema(site);
  return [person, ...remiNotableWorks(site, person['@id'])];
}
