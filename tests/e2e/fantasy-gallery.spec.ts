import { test, expect } from '@playwright/test';

for (const [slug, count] of [['fantasy-adventurer', 22], ['modern-essentials', 24], ['orbital-command', 29], ['duskbound-raiders', 24], ['neon-breach', 24], ['havenworks', 24], ['ashfall-outpost', 24], ['clover-and-clay', 24], ['fieldline', 24], ['brass-and-tide', 24]] as const) {
test(`${slug} mockups load, navigate, enlarge, and restore focus`, async ({ page }) => {
  await page.goto(`/game-ui/${slug}/`);
  const consent = page.getByRole('button', { name: 'Essential only', exact: true });
  if (await consent.isVisible()) await consent.click();
  const thumbs = page.locator('[data-gallery-index]');
  await expect(thumbs).toHaveCount(count);
  await expect(page.locator('[data-fantasy-gallery]')).toHaveAttribute('data-ready', 'true');
  for (let i = 0; i < count; i++) {
    await thumbs.nth(i).click();
    await expect(thumbs.nth(i)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-featured]')).toHaveJSProperty('complete', true);
    await expect.poll(() => page.locator('[data-featured]').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  }
  await page.getByRole('button', { name: 'Next mockup', exact: true }).click();
  await expect(page.locator('[data-counter]')).toHaveText(`01 / ${count}`);
  expect(await page.locator('.thumbnails').evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
  const opener = page.locator('[data-enlarge]');
  await opener.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-lightbox-title]')).toHaveText((await thumbs.nth(1).getAttribute('data-title'))!);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(opener).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

}
