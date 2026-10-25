import { describe, expect, it } from 'vitest';
import config from './autoreply.json';
import { autoCopy, autoLocales, autoPaths, approxUsd, formatMoney, whatsappHref } from './whatsapp-autoreply';
import { onboardingCopy } from './whatsapp-autoreply-onboarding';
import { autoreplyLegal } from './whatsapp-autoreply-legal';

describe('auto-reply copy', () => {
  it('has no em or en dashes and no forbidden names', () => {
    const blob = JSON.stringify([autoCopy, onboardingCopy, autoreplyLegal]);
    expect(blob).not.toMatch(/[–—]/);
    expect(blob).not.toMatch(/Focusrail|Nickelodeon|Circadence|\bAres\b/);
  });

  it('every locale has the same plan ids, an 8 to 10 question FAQ and both legal docs', () => {
    for (const loc of autoLocales) {
      expect(Object.keys(autoCopy[loc].plans)).toEqual(['basic', 'bookings', 'complete']);
      expect(autoCopy[loc].faq.length).toBeGreaterThanOrEqual(8);
      expect(autoCopy[loc].faq.length).toBeLessThanOrEqual(10);
      expect(autoreplyLegal.terms[loc].sections.length).toBeGreaterThan(3);
      expect(autoreplyLegal.privacy[loc].sections.length).toBeGreaterThan(3);
    }
  });

  it('pilot banner matches the JSON config', () => {
    expect(autoCopy.es.pilotTitle).toContain(`MXN ${config.regions.mx.pilot.setup.toLocaleString('en-US')}`);
    expect(autoCopy.fr.pilotTitle).toContain(`${config.regions.ca.pilot.setup} $`);
  });

  it('formats money the Mexican and Quebec ways', () => {
    expect(formatMoney(4500, 'es')).toBe('MXN 4,500');
    expect(formatMoney(1500, 'fr')).toBe('1 500 $');
    expect(formatMoney(79, 'fr')).toBe('79 $');
    expect(formatMoney(1500, 'en-CA')).toBe('$1,500');
    expect(approxUsd(4500)).toMatch(/^USD \d+$/);
  });

  it('Quebec French copy leads with Messenger and texto and states taxes', () => {
    expect(autoCopy.fr.eyebrow).toMatch(/Messenger et texto/);
    expect(autoCopy.fr.taxesNote).toBe('plus taxes applicables');
    expect(autoCopy.fr.lede).toMatch(/français d’abord/i);
  });

  it('builds WhatsApp links from the env number, else falls back to contact', () => {
    expect(whatsappHref('+52 984 123 4567', 'Hola')).toBe('https://wa.me/529841234567?text=Hola');
    expect(whatsappHref(undefined, 'Hola')).toMatch(/^\/contact\//);
  });

  it('keeps the requested routes', () => {
    expect(autoPaths('es').page).toBe('/es/whatsapp-autoreply/');
    expect(autoPaths('fr').onboarding).toBe('/fr/whatsapp-autoreply/onboarding/');
    expect(autoPaths('en-CA').page).toBe('/ca/whatsapp-autoreply/');
    expect(autoPaths('es').privacy).toBe('/es/whatsapp-autoreply/aviso-de-privacidad/');
  });
});
