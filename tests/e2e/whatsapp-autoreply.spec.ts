import { test, expect, type Page } from '@playwright/test';

// Saves an essential-only privacy choice before load: clicking the banner reloads the page, which races with assertions.
async function open(page: Page, path: string) {
  await page.addInitScript(() => localStorage.setItem('strategicSlothPrivacyV1', JSON.stringify({ analytics: false, marketing: false, updated: Date.now() - 1000 })));
  await page.goto(path);
}

const pages = [
  { path: '/es/whatsapp-autoreply/', lang: 'es', heading: 'Nunca vuelva a perder', price: 'MXN 1,500', terms: '/es/whatsapp-autoreply/terminos/', video: 'es' },
  { path: '/whatsapp-autoreply/', lang: 'en', heading: 'Never miss a customer', price: 'MXN 1,500', terms: '/whatsapp-autoreply/terms/', video: 'en' },
  { path: '/fr/whatsapp-autoreply/', lang: 'fr', heading: 'Ne manquez plus jamais', price: '129 $', terms: '/fr/whatsapp-autoreply/conditions/', video: 'fr' },
  { path: '/ca/whatsapp-autoreply/', lang: 'en', heading: 'Never miss', price: '$129', terms: '/ca/whatsapp-autoreply/terms/', video: 'en-ca' },
] as const;

for (const def of pages) {
  test(`auto-reply page renders at ${def.path}`, async ({ page }) => {
    await open(page, def.path);
    await expect(page.locator('html')).toHaveAttribute('lang', def.lang);
    await expect(page.locator('h1')).toContainText(def.heading);
    for (const lang of ['es-MX', 'en', 'fr-CA', 'en-CA', 'x-default']) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
    await expect(page.locator('#plans .p-plan')).toHaveCount(3);
    await expect(page.locator('#plans .p-plan.featured')).toHaveCount(1);
    await expect(page.locator('#plans')).toContainText(def.price.replace(' ', ' '));
    await expect(page.locator('form[data-checkout]').first()).toHaveAttribute('action', /\/api\/autoreply\/checkout$/);
    await expect(page.locator(`a[href="${def.terms}"]`).first()).toBeVisible();
    // Product header with the language and region menu, the explainer video in the page language, and the consent button.
    await expect(page.locator('.p-header .p-lang a[aria-current="page"]')).toHaveCount(1);
    await expect(page.locator('#video video source')).toHaveAttribute('src', `/media/autoreply/explainer-${def.video}.mp4`);
    await expect(page.locator('.p-footer [data-privacy-settings]')).toHaveCount(1);
    await expect(page.locator('#primary-nav')).toHaveCount(0);
    const main = await page.locator('main').innerText();
    expect(main).not.toMatch(/[–—]/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test('Quebec pages list French first and show taxes', async ({ page }) => {
  await open(page, '/ca/whatsapp-autoreply/');
  const choices = page.locator('.p-lang li a');
  await expect(choices.nth(2)).toContainText('Français');
  await expect(choices.nth(3)).toContainText('English');
  await expect(page.locator('#plans')).toContainText('plus applicable taxes');
  await open(page, '/fr/whatsapp-autoreply/');
  await expect(page.locator('#plans')).toContainText('plus taxes applicables');
  await expect(page.locator('#plans')).toContainText('1 500 $');
  await expect(page.locator('.p-oxxo')).toHaveCount(0);
});

test('Mexico pages offer OXXO and the founding pilot', async ({ page }) => {
  await open(page, '/es/whatsapp-autoreply/');
  await expect(page.locator('.p-oxxo')).toHaveCount(3);
  await expect(page.locator('.p-pilot')).toContainText('Quedan 3 de 3 lugares');
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

test('the language menu links all four versions and the footer has one auto-reply entry', async ({ page }) => {
  await open(page, '/es/whatsapp-autoreply/');
  await page.locator('.p-lang summary').click();
  for (const href of ['/es/whatsapp-autoreply/', '/whatsapp-autoreply/', '/fr/whatsapp-autoreply/', '/ca/whatsapp-autoreply/']) {
    await expect(page.locator(`.p-lang a[href="${href}"]`)).toBeVisible();
  }
  await open(page, '/');
  await expect(page.locator('.site-footer a[href*="whatsapp-autoreply"]')).toHaveCount(1);
  await open(page, '/es/local-business/');
  await expect(page.locator('.site-footer a[href="/es/whatsapp-autoreply/"]')).toHaveCount(1);
});
