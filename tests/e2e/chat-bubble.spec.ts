import { test, expect, type Page } from '@playwright/test';

async function open(page: Page, path: string) {
  await page.goto(path);
  const consent = page.getByRole('button', { name: 'Essential only', exact: true });
  if (await consent.isVisible()) await consent.click();
}

test('chat bubble answers through the API and is labelled as automatic', async ({ page }) => {
  let sent: any = null;
  await page.route('**/api/autoreply/chat', async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ json: { reply: 'Elija un plan en la página de la oferta.', action: 'answer', language: 'es' } });
  });
  await open(page, '/es/whatsapp-autoreply/');
  const toggle = page.getByRole('button', { name: 'Chatear con nuestro asistente' });
  await expect(toggle).toBeVisible();
  await toggle.click();
  const dialog = page.getByRole('dialog', { name: 'Asistente de Strategic Sloth' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Asistente automático');
  await expect(dialog.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', /wa\.me|\/contact\//);
  await page.getByLabel('Su mensaje').fill('¿Cómo empiezo?');
  await page.keyboard.press('Enter');
  await expect(dialog.locator('.cb-msg.bot').last()).toContainText('Elija un plan');
  expect(sent).toMatchObject({ message: '¿Cómo empiezo?', locale: 'es' });
  expect(sent.session).toMatch(/^[0-9a-f]{24}$/);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('the "try it" link on the offer page opens the chat, in French on the Quebec page', async ({ page }) => {
  await open(page, '/fr/whatsapp-autoreply/');
  await page.getByRole('button', { name: /Essayez-le dans le clavardage/ }).click();
  await expect(page.getByRole('dialog', { name: 'Assistant Strategic Sloth' })).toBeVisible();
  await expect(page.getByLabel('Votre message')).toBeFocused();
});

test('chat shows a fallback when the assistant is unreachable', async ({ page }) => {
  await page.route('**/api/autoreply/chat', (route) => route.fulfill({ status: 500, json: { error: 'server_error' } }));
  await open(page, '/');
  await page.getByRole('button', { name: 'Chat with our assistant' }).click();
  await page.getByLabel('Your message').fill('Hello');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.locator('.cb-msg.error')).toContainText('Message us on WhatsApp');
});

test('no chat on private pages, and it fits a phone', async ({ page }) => {
  await open(page, '/es/whatsapp-autoreply/onboarding/');
  await expect(page.locator('[data-chat]')).toHaveCount(0);
  await page.setViewportSize({ width: 375, height: 812 });
  await open(page, '/es/whatsapp-autoreply/');
  await page.getByRole('button', { name: 'Chatear con nuestro asistente' }).click();
  const box = await page.getByRole('dialog').boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
