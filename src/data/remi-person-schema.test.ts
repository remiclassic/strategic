import { describe, expect, it } from 'vitest';
import {
  remiPersonDescription,
  remiPersonSameAs,
  remiPersonSchema,
  remiProfileJsonLd,
} from './remi-person-schema';

const site = new URL('https://strategicsloth.com');

describe('Rémi Couture Person JSON-LD', () => {
  it('stringifies as valid JSON and describes a schema.org Person', () => {
    const graph = remiProfileJsonLd(site);
    const parsed = JSON.parse(JSON.stringify(graph));
    const person = parsed.find((node: { '@type': string }) => node['@type'] === 'Person');

    expect(person).toBeTruthy();
    expect(person['@type']).toBe('Person');
    expect(person['@id']).toBe('https://strategicsloth.com/remi-couture/#person');
    expect(person.name).toBe('Rémi Couture');
    expect(person.alternateName).toEqual([
      'Remi Couture',
      'Guillaume Couture',
      'Guillaume (Rémi) Couture',
    ]);
    expect(person.jobTitle).toEqual(['Game developer', 'Founder']);
    expect(person.description).toBe(remiPersonDescription);
    expect(person.url).toBe('https://strategicsloth.com/remi-couture/');
    expect(person.image).toBe('https://strategicsloth.com/studio-images/remi-founder-photo.jpg');
    expect(person.knowsAbout).toEqual([
      'Game UX/UI',
      'Game development',
      'Unreal Engine',
      'Three.js',
    ]);
    expect(person.sameAs).toEqual([...remiPersonSameAs]);
    expect(person.worksFor['@type']).toBe('Organization');
    expect(person.worksFor.name).toBe('Strategic Sloth');
    expect(person.worksFor.url).toBe('https://strategicsloth.com/');
    expect(person.worksFor.sameAs).toBe('https://www.wikidata.org/wiki/Q141820975');
    expect(person.worksFor.founder['@id']).toBe(person['@id']);
  });

  it('puts Wikidata on the organization and Sloth Jam, not on the person', () => {
    const person = remiPersonSchema(site);
    const blob = JSON.stringify(remiProfileJsonLd(site));
    const parsed = JSON.parse(blob);
    const slothJam = parsed.find((node: { name?: string }) => node.name === 'Sloth Jam');
    const clubPenguin = parsed.find((node: { name?: string }) => node.name === 'Club Penguin');

    expect(person.sameAs.join(' ')).not.toMatch(/wikidata\.org/);
    expect(slothJam.url).toBe('https://www.slothjam.com');
    expect(slothJam.sameAs).toBe('https://www.wikidata.org/wiki/Q141821011');
    expect(clubPenguin.contributor.roleName).toBe('Illustrator and animator');
    expect(clubPenguin.contributor.startDate).toBe('2006');
    expect(clubPenguin.contributor.endDate).toBe('2009');
    expect(blob).not.toMatch(/SliceForge|Circadence|Hooded Horse/);
    expect(blob).not.toMatch(/\u2014/);
  });
});
