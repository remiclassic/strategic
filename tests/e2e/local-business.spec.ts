import { test, expect, type Page } from '@playwright/test';

async function open(page: Page, path: string) {
  await page.goto(path);
  const consent = page.getByRole('button', { name: 'Essential only', exact: true });
  if (await consent.isVisible()) await consent.click();
}

const pages = [
  { path: '/local-business/', lang: 'en', heading: 'A site that works', cta: 'Get a free quote' },
  { path: '/fr/local-business/', lang: 'fr', heading: 'Un site à la mesure', cta: 'Demander un devis gratuit' },
  { path: '/es/local-business/', lang: 'es', heading: 'Un sitio que sí le sirve', cta: 'Pedir una cotización gratis' },
] as const;

for (const pageDef of pages) {
  test(`local business page renders in ${pageDef.lang}`, async ({ page }) => {
    await open(page, pageDef.path);
    await expect(page.locator('html')).toHaveAttribute('lang', pageDef.lang);
    await expect(page.locator('h1')).toContainText(pageDef.heading);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
    const heroCta = page.locator('.lb-hero a.button').first();
    await expect(heroCta).toHaveText(new RegExp(pageDef.cta));
    await expect(heroCta).toHaveAttribute('href', '/contact/?engagement=local#enquiry');
    await expect(page.locator('#primary-nav a[aria-current="page"]')).toHaveAttribute('href', pageDef.path);
    const main = await page.locator('main').innerText();
    expect(main).not.toMatch(/\u2014/);
    expect(main).not.toMatch(/Focusrail|Nickelodeon|Circadence|\$\d/i);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test('Spanish hub points to the local business offer', async ({ page }) => {
  await open(page, '/es/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('h1')).toContainText('Sitios y apps');
  await expect(page.locator('main a[href="/es/local-business/"]')).toBeVisible();
});

test('services hub and contact form include the local business offer', async ({ page }) => {
  await open(page, '/services/');
  await expect(page.locator('a[href="/local-business/"]', { hasText: 'Local business sites' })).toBeVisible();
  await open(page, '/contact/?engagement=local#enquiry');
  await expect(page.locator('select[name="projectType"]')).toHaveValue('Local business website or app');
});

test('local business page fits a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, '/es/local-business/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.lb-hero a.button').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
