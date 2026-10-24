import { describe, expect, it } from 'vitest';
import { localCopy, localAlternates, slothJamHref } from './local-business';

describe('local business copy', () => {
  it('has no em dashes, prices or forbidden client names', () => {
    const blob = JSON.stringify(localCopy);
    expect(blob).not.toMatch(/\u2014/);
    expect(blob).not.toMatch(/Focusrail|Nickelodeon|Circadence/i);
    expect(blob).not.toMatch(/\$\d/);
  });

  it('keeps the three language routes and the Sloth Jam proof link', () => {
    expect(localAlternates.map(a => a.lang)).toEqual(['en', 'fr', 'es']);
    expect(slothJamHref).toBe('https://www.slothjam.com');
    expect(localCopy.es.lede).toMatch(/Playa del Carmen/);
    expect(localCopy.es.lede).toMatch(/Riviera Maya/);
    expect(localCopy.es.cta).toMatch(/cotización gratis/i);
  });
});
