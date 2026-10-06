import { test, expect, type Page } from '@playwright/test';

async function open(page: Page, path: string) {
  await page.goto(path);
  const consent = page.getByRole('button', { name: 'Essential only', exact: true });
  if (await consent.isVisible()) await consent.click();
}

test('services hub: the live interface responds to keyboard, skins and actions', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await open(page, '/services/');
  const lab = page.locator('[data-lab]');
  const stage = lab.locator('.lab-stage');
  await expect(lab).toHaveAttribute('data-view', 'hud');

  await page.getByRole('button', { name: 'Take a hit', exact: true }).click();
  await expect.poll(async () => Number(await lab.locator('[data-hp-text]').textContent())).toBeLessThan(120);

  // Escape opens the pause menu; Settings remembers where focus came from.
  await stage.focus();
  await page.keyboard.press('Escape');
  await expect(lab).toHaveAttribute('data-view', 'menu');
  await expect(page.getByRole('button', { name: 'Resume', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(lab.locator('[data-setting="volume"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeFocused();
  await expect(lab).toHaveAttribute('data-input', 'kb');

  await lab.getByRole('button', { name: 'Inventory', exact: true }).first().click();
  await expect(lab).toHaveAttribute('data-view', 'inventory');
  await expect(lab.locator('button.slot')).toHaveCount(12);
  await lab.getByRole('button', { name: 'Signal', exact: true }).click();
  await expect(lab).toHaveAttribute('data-skin', 'signal');
  expect(errors).toEqual([]);
});

test('services hub: engine tabs switch the code sample and nothing overflows', async ({ page }) => {
  await open(page, '/services/');
  await page.getByRole('tab', { name: /Godot/ }).click();
  await expect(page.locator('#panel-godot')).toBeVisible();
  await expect(page.locator('#panel-godot pre')).toContainText('func set_health');
  await expect(page.locator('#panel-unreal')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('#primary-nav a[href="/services/"]')).toBeVisible();
  await expect(page.locator('[data-case]')).toHaveCount(14);
  await expect(page.locator('#audit .in-col li')).toHaveCount(14);
  await expect(page.locator('#talks .in-principles li')).toHaveCount(10);
  await expect(page.locator('.cr-numbers-grid > div')).toHaveCount(8);
  await expect(page.locator('#figma-deep [data-fd]')).toHaveCount(7);
  const nzm = page.locator('#figma-deep [data-fd]').first();
  await nzm.locator('[data-fd-thumb]').nth(1).click();
  await expect(nzm.locator('[data-fd-title]')).toHaveText('UI kit, per screen');
  await nzm.locator('[data-fd-open]').click();
  const fdView = page.locator('[data-fd-view]');
  await expect(fdView.locator('[data-fv-title]')).toHaveText('UI kit, per screen');
  await fdView.locator('[data-fv-zoom]').click();
  await expect(fdView).toHaveClass(/is-zoomed/);
  await fdView.locator('[data-fv-next]').click();
  await expect(fdView.locator('[data-fv-title]')).toHaveText('Flow map and wireframes');
  await fdView.locator('[data-fv-close]').click();
  await expect(page.locator('#figma-files .ff')).toHaveCount(21);
  await page.locator('[data-ff="UX teardown"]').click();
  await expect(page.locator('#figma-files .ff:visible')).toHaveCount(4);
  await page.locator('[data-ff="All"]').click();
  await page.locator('.cr-numbers').scrollIntoViewIfNeeded();
  await expect(page.locator('.cr-numbers [data-count="3990"]')).toHaveText('3,990');
  await expect(page.locator('.cr-numbers-grid small').first()).not.toBeEmpty();
  await page.locator('[data-case]').first().locator('[data-thumb]').nth(1).click();
  await expect(page.locator('[data-case]').first().locator('[data-main]')).toHaveAttribute('src', /mw5-mission/);
  await page.locator('[data-case]').first().locator('[data-zoom]').click();
  await expect(page.locator('[data-lightbox]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-lightbox]')).toBeHidden();
});

for (const slug of ['unreal', 'unity', 'godot', 'playcanvas', 'web']) {
  test(`services/${slug} renders its implementation page`, async ({ page }) => {
    await open(page, `/services/${slug}/`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.sv-code pre')).not.toBeEmpty();
    await expect(page.locator('.sv-check li')).toHaveCount(6);
    await expect(page.locator('.sv-others a')).toHaveCount(4);
  });
}

test('vanguard case study renders and loads the prototype on request', async ({ page }) => {
  await open(page, '/services/case/vanguard/');
  await expect(page.locator('h1')).toContainText('Choose your role');
  await expect(page.locator('.cs-flow li')).toHaveCount(4);
  await expect(page.locator('.cs-screen')).toHaveCount(3);
  await expect(page.locator('[data-proto] iframe')).toHaveCount(0);
  await page.locator('[data-proto-start]').click();
  await expect(page.locator('[data-proto] iframe')).toHaveAttribute('src', /vanguard\.html/);
});

test('team section shows roles and no placeholder text in a production build', async ({ page }) => {
  await open(page, '/services/');
  await expect(page.locator('#team .tm-group')).toHaveCount(3);
  await expect(page.locator('#team .tm-group li')).toHaveCount(13);
  await expect(page.locator('#team .tm-name')).toHaveCount(6);
  await expect(page.locator('#team .tm-group li').first()).toContainText('Omar Rosario');
  await expect(page.locator('#team')).not.toContainText(/to be added|placeholder|draft:/i);
});

test('component tiles open the real, working React components', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await open(page, '/services/');
  await expect(page.locator('html')).toHaveAttribute('data-player-ready', 'true');
  await page.locator('[data-play="health-bar"]').click();
  const stage = page.locator('[data-live-component="health-bar"]');
  await expect(stage).toBeVisible();
  // the component's own demo buttons change its state
  const before = await stage.innerText();
  await stage.getByRole('button', { name: /hit/i }).first().click({ force: true });
  await expect.poll(() => stage.innerText()).not.toBe(before);
  await page.getByRole('button', { name: 'Next →' }).click();
  await expect(page.locator('.cp-head h3')).toHaveText('Cooldown Ring');
  await expect(page.locator('[data-live-component="cooldown-ring"] button').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.cp')).toBeHidden();
  for (const slug of ['radial-menu', 'skill-tree', 'inventory-grid', 'settings-panel', 'sniper-scope', 'kill-feed']) {
    await page.locator(`[data-play="${slug}"]`).click();
    await expect(page.locator(`[data-live-component="${slug}"] .cp-inner > *`).first()).toBeVisible();
    await page.keyboard.press('Escape');
  }
  expect(errors).toEqual([]);
});

test('credit tiles open a local gallery instead of leaving the site', async ({ page }) => {
  await open(page, '/services/');
  await expect(page.locator('[data-credit]')).toHaveCount(31);
  await expect(page.locator('#credits a[href*="artstation.com/artwork"]')).toHaveCount(0);
  await page.locator('[data-credit]', { hasText: 'TRANSFORMERS: Battle Tactics' }).click();
  const view = page.locator('[data-credit-view]');
  await expect(view).toBeVisible();
  await expect(view.locator('[data-cv-title]')).toHaveText('TRANSFORMERS: Battle Tactics');
  await expect(view.locator('[data-cv-studio]')).toContainText(/DeNA · 2014–15 · \d+ years ago/);
  await expect(page.locator('.cr-era')).toHaveCount(13);
  await expect(view.locator('[data-cv-image]')).toHaveAttribute('src', /credits\/full\/transformers-battle-tactics-1\.webp/);
  await expect.poll(() => view.locator('[data-cv-image]').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await page.keyboard.press('ArrowRight');
  await expect(view.locator('[data-cv-image]')).toHaveAttribute('src', /-2\.webp/);
  await page.keyboard.press('ArrowDown');
  await expect(view.locator('[data-cv-title]')).toHaveText('Super Battle Tactics');
  await page.keyboard.press('Escape');
  await expect(view).toBeHidden();
});

test('services pages do not name the training client', async ({ page }) => {
  for (const path of ['/services/', '/services/web/', '/services/unreal/', '/services/case/vanguard/']) {
    await page.goto(path);
    const html = await page.content();
    expect(html).not.toMatch(/circadence|project ares|\bares\b/i);
  }
});
