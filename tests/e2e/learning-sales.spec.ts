import { expect, test } from '@playwright/test';
import { books, bundles } from '../../src/data/catalog-data';

test.beforeEach(async ({page}) => { await page.addInitScript(()=>localStorage.setItem('strategicSlothPrivacyV1',JSON.stringify({analytics:false,marketing:false,updated:Date.now()}))); });

test('bundle savings use the prices of the actual included books', async ({ page }) => {
  await page.goto('/books/');
  for (const bundle of bundles) {
    const total = bundle.bookIds.reduce((sum, id) => sum + books.find(book => book.id === id)!.price, 0);
    const card = page.locator(`#bundle-${bundle.id}`);
    await expect(card.locator('.bundle-value')).toContainText(`$${total} if purchased individually`);
    await expect(card.locator('.bundle-value')).toContainText(`Save $${total - bundle.price}`);
    await expect(card.locator('[data-track="checkout_click"]')).toHaveAttribute('data-track-price', String(bundle.price));
  }
});

test('mobile reader exposes a real chapter, readable transcript, and matching purchase', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/samples/dont-do-anything/');
  await expect(page.locator('h1')).toHaveText('Finding Your Winning Topic');
  await expect(page.locator('.sample-reader figure')).toHaveCount(6);
  await page.locator('.sample-reader summary').first().click();
  await expect(page.locator('.sample-transcript').first()).toBeVisible();
  await expect(page.locator('.sample-transcript').first()).toContainText('The PUAPS Filter');
  await expect(page.locator('[data-track-location="sample-dont-do-anything-bottom"]')).toHaveAttribute('data-track-price', '5');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test('related article directs readers to the relevant sample and book', async ({ page }) => {
  await page.goto('/blog/sell-without-an-audience/');
  const offer = page.locator('.article-offer');
  await expect(offer).toContainText('Sell Without an Audience');
  await offer.getByRole('link', { name: 'Read a real chapter' }).click();
  await expect(page).toHaveURL(/\/samples\/sell-without-an-audience\//);
  await expect(page.locator('.sample-reader figure')).toHaveCount(3);
  await expect(page.locator('.sample-close [data-track="checkout_click"]')).toHaveAttribute('data-track-product', 'sell-no-audience');
});

test('revised financial article distinguishes the editorial update from publication', async ({ page }) => {
  await page.goto('/blog/estonia-e-residency-review/');
  await expect(page.locator('.reading-article')).toContainText('Editorial update September 21, 2026');
  await expect(page.locator('.reading-prose')).toContainText('22/78');
  await expect(page.locator('.reading-prose a[href^="https://www.emta.ee/"]')).toHaveCount(1);
});
