import { test, expect, type Page } from '@playwright/test';

async function open(page: Page, path: string) {
  await page.goto(path);
  const consent = page.getByRole('button', { name: 'Essential only', exact: true });
  if (await consent.isVisible()) await consent.click();
}

const pages = [
  { path: '/es/whatsapp-autoreply/', lang: 'es', heading: 'Nunca vuelva a perder', price: 'MXN 1,500', terms: '/es/whatsapp-autoreply/terminos/' },
  { path: '/whatsapp-autoreply/', lang: 'en', heading: 'Never miss a customer', price: 'MXN 1,500', terms: '/whatsapp-autoreply/terms/' },
  { path: '/fr/whatsapp-autoreply/', lang: 'fr', heading: 'Ne manquez plus jamais', price: '129 $', terms: '/fr/whatsapp-autoreply/conditions/' },
  { path: '/ca/whatsapp-autoreply/', lang: 'en', heading: 'Never miss', price: '$129', terms: '/ca/whatsapp-autoreply/terms/' },
] as const;

for (const def of pages) {
  test(`auto-reply page renders at ${def.path}`, async ({ page }) => {
    await open(page, def.path);
    await expect(page.locator('html')).toHaveAttribute('lang', def.lang);
    await expect(page.locator('h1')).toContainText(def.heading);
    for (const lang of ['es-MX', 'en', 'fr-CA', 'en-CA', 'x-default']) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
    await expect(page.locator('#plans .b-pkg')).toHaveCount(3);
    await expect(page.locator('#plans .b-pkg.featured')).toHaveCount(1);
    await expect(page.locator('#plans')).toContainText(def.price.replace(' ', ' '));
    await expect(page.locator('form[data-checkout]').first()).toHaveAttribute('action', /\/api\/autoreply\/checkout$/);
    await expect(page.locator(`a[href="${def.terms}"]`).first()).toBeVisible();
    await expect(page.locator('#primary-nav a[aria-current="page"]')).toHaveAttribute('href', '/services/');
    const main = await page.locator('main').innerText();
    expect(main).not.toMatch(/[–—]/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test('Quebec pages list French first and show taxes', async ({ page }) => {
  await open(page, '/ca/whatsapp-autoreply/');
  await expect(page.locator('.ar-langs a').first()).toHaveText('Français');
  await expect(page.locator('#plans')).toContainText('plus applicable taxes');
  await open(page, '/fr/whatsapp-autoreply/');
  await expect(page.locator('#plans')).toContainText('plus taxes applicables');
  await expect(page.locator('#plans')).toContainText('1 500 $');
  await expect(page.locator('.ar-oxxo')).toHaveCount(0);
});

test('Mexico pages offer OXXO and the founding pilot', async ({ page }) => {
  await open(page, '/es/whatsapp-autoreply/');
  await expect(page.locator('.ar-oxxo')).toHaveCount(3);
  await expect(page.locator('.ar-pilot')).toContainText('Quedan 3 de 3 lugares');
});

test('onboarding without a session asks for the email link', async ({ page }) => {
  await open(page, '/es/whatsapp-autoreply/onboarding/');
  await expect(page.locator('[data-state]')).toContainText('enlace de su correo');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('auto-reply page fits a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ['/es/whatsapp-autoreply/', '/fr/whatsapp-autoreply/', '/es/whatsapp-autoreply/onboarding/']) {
    await open(page, path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
});
